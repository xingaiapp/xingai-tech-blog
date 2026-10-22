import type { MetadataRoute } from "next";
import { listPosts } from "@/lib/posts";
import { LOCALES, publicUrl, type Locale } from "@/lib/site";

// Sitemap scope (SEO slimming, 2026-10-21):
// GSC showed 283 "discovered – not indexed" URLs domain-wide, the bulk of
// them this blog's /ko translations and per-tag pages queuing for crawl
// budget that the product sites need. The sitemap therefore submits only
// en + zh post URLs and core pages. Ko posts and tag pages stay live and
// internally linked, and every post's hreflang alternates still advertise
// all locales — they are simply no longer pushed via the sitemap.
const SITEMAP_LOCALES: Locale[] = LOCALES.filter((l) => l !== "ko");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/posts", "/legal/privacy", "/legal/terms", "/legal/disclaimer"];
  const posts = listPosts();
  const latestPostDate = posts.reduce((max, p) => (p.date > max ? p.date : max), posts[0]?.date ?? "");
  // lastModified = real editorial dates, never new Date(): stamping every
  // URL as changed on every fetch teaches Google to distrust the sitemap
  // (same fix the main site shipped in its PR #39). Posts carry their true
  // publish date (from listPosts); listing/static pages use the newest post.
  const entries: { path: string; lastModified: string }[] = [
    ...staticPaths.map((path) => ({ path, lastModified: latestPostDate })),
    ...posts.map((p) => ({ path: `/posts/${p.slug}`, lastModified: p.date })),
  ];

  return SITEMAP_LOCALES.flatMap((locale) =>
    entries.map(({ path, lastModified }) => ({
      url: publicUrl(locale, path),
      lastModified: new Date(`${lastModified}T00:00:00Z`),
      changeFrequency: path.startsWith("/posts/") ? ("monthly" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path.startsWith("/posts/") ? 0.8 : 0.5,
    })),
  );
}
