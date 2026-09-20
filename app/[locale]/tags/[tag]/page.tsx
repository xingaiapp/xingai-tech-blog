import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { messages } from "lib/i18n";
import { listTags, postsForTag } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, parseLocale } from "@/lib/site";

type Props = { params: Promise<{ locale: string; tag: string }> };

export function generateStaticParams() {
  const tags = listTags().map((t) => t.tag);
  return LOCALES.flatMap((locale) => tags.map((tag) => ({ locale, tag })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, tag } = await params;
  const locale = parseLocale(raw);
  const decoded = decodeURIComponent(tag);
  return pageMetadata(locale, `/tags/${decoded}`, `${decoded} · XingAI Tech Blog`, `Posts tagged ${decoded}.`);
}

export default async function TagPage({ params }: Props) {
  const { locale: raw, tag } = await params;
  const locale = parseLocale(raw);
  const decoded = decodeURIComponent(tag);
  const m = messages[locale];
  const posts = postsForTag(decoded);
  if (!posts.length) notFound();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{decoded}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{m.tags.lead}</p>
      <div className="list-enter mt-6 grid gap-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </>
  );
}
