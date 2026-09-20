import type { MetadataRoute } from "next";
import { listPosts, listTags } from "@/lib/posts";
import { LOCALES, publicUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/posts", "/tags", "/legal/privacy", "/legal/terms", "/legal/disclaimer"];
  const postPaths = listPosts().map((p) => `/posts/${p.slug}`);
  const tagPaths = listTags().map((t) => `/tags/${t.tag}`);
  const paths = [...staticPaths, ...postPaths, ...tagPaths];

  return LOCALES.flatMap((locale) =>
    paths.map((path) => ({
      url: publicUrl(locale, path),
      lastModified: new Date(),
      changeFrequency: path.startsWith("/posts/") ? ("monthly" as const) : ("weekly" as const),
      priority: path === "/" ? 1 : path.startsWith("/posts/") ? 0.8 : 0.5,
    })),
  );
}
