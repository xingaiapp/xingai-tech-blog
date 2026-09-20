import { BlogHero } from "@/components/blog-hero";
import { FaqBlock } from "@/components/faq-block";
import { PostCard } from "@/components/post-card";
import { messages, tCount } from "lib/i18n";
import { listPosts } from "@/lib/posts";
import { homeJsonLd } from "@/lib/seo";
import { localizePath, parseLocale } from "@/lib/site";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  const posts = listPosts();
  const latest = posts.slice(0, 8);
  const jsonLd = homeJsonLd(locale);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHero locale={locale} />
      <section className="mt-8">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight">{m.home.latest}</h2>
          <Link href={localizePath(locale, "/posts")} className="text-sm font-semibold text-primary">
            {m.home.allPosts} →
          </Link>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{tCount(m.posts.count, posts.length)}</p>
        {latest.length ? (
          <div className="list-enter grid gap-3">
            {latest.map((post) => (
              <PostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        ) : (
          <p>{m.home.empty}</p>
        )}
      </section>
      <FaqBlock locale={locale} />
    </>
  );
}
