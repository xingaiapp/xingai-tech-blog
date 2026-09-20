import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { messages, tCount } from "lib/i18n";
import { listPosts } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { parseLocale } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  return pageMetadata(locale, "/posts", m.meta.postsTitle, m.meta.postsDescription);
}

export default async function PostsPage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  const posts = listPosts();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{m.posts.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{m.posts.lead}</p>
      <p className="mt-2 text-sm text-muted-foreground">{tCount(m.posts.count, posts.length)}</p>
      {locale === "ko" ? <p className="mt-3 rounded-2xl border border-border bg-card p-3 text-sm">{m.posts.koNote}</p> : null}
      <div className="list-enter mt-6 grid gap-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </>
  );
}
