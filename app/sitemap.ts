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
  const postPaths = listPosts().map((p) => `/posts/${p.slug}`);
  const paths = [...staticPaths, ...postPaths];

  return SITEMAP_LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: publicUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: path.startsWith("/posts/") ? ("monthly" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path.startsWith("/posts/") ? 0.8 : 0.5,
    })),
  );
}
