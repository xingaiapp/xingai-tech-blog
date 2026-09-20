import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownBody } from "@/components/markdown-body";
import { messages } from "lib/i18n";
import { displayProject, displayTitle, getPost, listPosts } from "@/lib/posts";
import { articleJsonLd, pageMetadata } from "@/lib/seo";
import { localizePath, parseLocale } from "@/lib/site";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  const slugs = listPosts().map((p) => p.slug);
  return ["en", "zh", "ko"].flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const post = getPost(slug, locale);
  if (!post) return {};
  const title = displayTitle(post, locale);
  const description = locale === "zh" ? post.excerptZh : post.excerpt;
  return {
    ...pageMetadata(locale, `/posts/${slug}`, title, description || title),
    openGraph: {
      ...pageMetadata(locale, `/posts/${slug}`, title, description || title).openGraph,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale = parseLocale(raw);
  const m = messages[locale];
  const post = getPost(slug, locale);
  if (!post) notFound();

  const title = displayTitle(post, locale);
  const path = `/posts/${slug}`;
  const jsonLd = articleJsonLd({
    locale: post.locale,
    path,
    title,
    description: locale === "zh" ? post.excerptZh : post.excerpt,
    date: post.date,
  });

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="text-sm">
        <Link href={localizePath(locale, "/posts")} className="font-semibold text-primary">
          ← {m.posts.back}
        </Link>
      </p>
      <p className="mt-4 text-xs font-medium text-muted-foreground">
        <time dateTime={post.date}>{post.date}</time>
        {post.project ? ` · ${displayProject(post, locale)}` : null}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1>
      {locale === "ko" ? <p className="mt-3 rounded-2xl border border-border bg-card p-3 text-sm">{m.posts.koNote}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {post.hasZh ? (
          <>
            <Link href={localizePath("en", path)} className="text-primary">
              {m.posts.alsoEn}
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href={localizePath("zh", path)} className="text-primary">
              {m.posts.alsoZh}
            </Link>
          </>
        ) : null}
      </div>
      {post.tags.length ? (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link
                href={localizePath(locale, `/tags/${tag}`)}
                className="inline-flex min-h-8 items-center rounded-full bg-muted px-2.5 text-[11px] font-semibold"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-8">
        <MarkdownBody source={post.body} />
      </div>
    </article>
  );
}
