import fs from "node:fs";
import path from "node:path";
import type { Locale } from "./site";

const POSTS_DIR = path.join(process.cwd(), "posts");

export type PostSummary = {
  slug: string;
  date: string;
  title: string;
  titleZh: string;
  project: string;
  projectZh: string;
  tags: string[];
  excerpt: string;
  excerptZh: string;
  hasZh: boolean;
};

export type PostBody = PostSummary & {
  locale: "en" | "zh";
  body: string;
  author: string;
};

type ParsedFile = {
  title: string;
  dateLabel: string;
  author: string;
  project: string;
  tags: string[];
  body: string;
};

function readUtf8(file: string): string {
  return fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
}

function field(source: string, names: string[]): string {
  for (const name of names) {
    const re = new RegExp(`\\*\\*${name}[：:]?\\*\\*[：:]?\\s*(.+)`, "i");
    const match = source.match(re);
    if (match?.[1]) return match[1].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
  }
  return "";
}

function parseTags(raw: string): string[] {
  const ticks = [...raw.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim().toLowerCase());
  if (ticks.length) return [...new Set(ticks)];
  return raw
    .split(/[,，]/)
    .map((t) => t.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);
}

function stripTitlePrefix(title: string): string {
  return title.replace(/^中文\s*·\s*/, "").trim();
}

function excerptFrom(body: string): string {
  const lines = body.split(/\n+/);
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith("#") || t.startsWith("```") || t.startsWith("![") || t.startsWith("|")) continue;
    if (t.startsWith("- ") || t.startsWith("* ") || t.startsWith(">")) continue;
    const clean = t.replace(/[*_`]/g, "");
    if (clean.length < 24) continue;
    return clean.length > 180 ? `${clean.slice(0, 177)}…` : clean;
  }
  return "";
}

function parseMarkdownFile(raw: string): ParsedFile {
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = stripTitlePrefix(titleMatch?.[1] ?? "Untitled");
  const split = raw.split(/\n---\n/);
  const header = split[0] ?? raw;
  const body = (split.length > 1 ? split.slice(1).join("\n---\n") : raw.replace(/^#.*\n+/, "")).trim();
  return {
    title,
    dateLabel: field(header, ["Date", "日期"]),
    author: field(header, ["Author", "作者"]) || "Xing @ XingAI",
    project: field(header, ["Project", "项目", "項目"]),
    tags: parseTags(field(header, ["Tags", "标签", "標籤"])),
    body,
  };
}

function rewriteBody(body: string, locale: Locale): string {
  return body
    .replace(/\]\(\.\.\/assets\/([^)]+?)\)/g, (_m, file: string) => `](/assets/${file})`)
    .replace(/\]\(\.\/([^)]+?)\.zh\.md\)/g, (_m, file: string) => {
      const href = locale === "en" ? `/zh/posts/${file}` : `/posts/${file}`;
      return `](${href})`;
    })
    .replace(/\]\(\.\/([^)]+?)\.md\)/g, (_m, file: string) => `](/posts/${file})`)
    .replace(/\]\(([^)]+?)\.zh\.md\)/g, (_m, file: string) => {
      const slug = file.split("/").pop() ?? file;
      return `](/zh/posts/${slug})`;
    })
    .replace(/\]\(([^)/]+?)\.md\)/g, (_m, file: string) => `](/posts/${file})`);
}

function listPairFiles(): { slug: string; date: string; enFile: string; zhFile: string | null }[] {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const enFiles = files.filter((f) => !f.endsWith(".zh.md"));
  return enFiles
    .map((enFile) => {
      const slug = enFile.replace(/\.md$/, "");
      const date = slug.slice(0, 10);
      const zhFile = files.includes(`${slug}.zh.md`) ? `${slug}.zh.md` : null;
      return { slug, date, enFile, zhFile };
    })
    .sort((a, b) => b.slug.localeCompare(a.slug));
}

let cache: PostSummary[] | null = null;
const bodyCache = new Map<string, PostBody>();

export function listPosts(): PostSummary[] {
  if (cache) return cache;
  cache = listPairFiles().map(({ slug, date, enFile, zhFile }) => {
    const en = parseMarkdownFile(readUtf8(enFile));
    const zh = zhFile ? parseMarkdownFile(readUtf8(zhFile)) : null;
    return {
      slug,
      date,
      title: en.title,
      titleZh: zh?.title || en.title,
      project: en.project,
      projectZh: zh?.project || en.project,
      tags: en.tags.length ? en.tags : zh?.tags ?? [],
      excerpt: excerptFrom(en.body),
      excerptZh: zh ? excerptFrom(zh.body) : excerptFrom(en.body),
      hasZh: Boolean(zhFile),
    };
  });
  return cache;
}

export function getPost(slug: string, locale: Locale): PostBody | null {
  const key = `${locale}:${slug}`;
  const hit = bodyCache.get(key);
  if (hit) return hit;
  const pair = listPairFiles().find((p) => p.slug === slug);
  if (!pair) return null;
  const useZh = locale === "zh" && pair.zhFile;
  const parsed = parseMarkdownFile(readUtf8(useZh ? pair.zhFile! : pair.enFile));
  const summary = listPosts().find((p) => p.slug === slug);
  if (!summary) return null;
  const post: PostBody = {
    ...summary,
    locale: useZh ? "zh" : "en",
    author: parsed.author,
    body: rewriteBody(parsed.body, locale),
  };
  bodyCache.set(key, post);
  return post;
}

export function displayTitle(post: PostSummary, locale: Locale): string {
  return locale === "zh" ? post.titleZh : post.title;
}

export function displayExcerpt(post: PostSummary, locale: Locale): string {
  return locale === "zh" ? post.excerptZh : post.excerpt;
}

export function displayProject(post: PostSummary, locale: Locale): string {
  return locale === "zh" ? post.projectZh : post.project;
}

export function listTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of listPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function postsForTag(tag: string): PostSummary[] {
  const needle = tag.toLowerCase();
  return listPosts().filter((p) => p.tags.includes(needle));
}

export function uniqueProjects(): string[] {
  return [...new Set(listPosts().map((p) => p.project).filter(Boolean))];
}
