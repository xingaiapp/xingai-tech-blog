import Link from "next/link";
import type { Locale } from "lib/site";
import { localizePath } from "lib/site";
import { displayExcerpt, displayProject, displayTitle, type PostSummary } from "lib/posts";
import { messages } from "lib/i18n";

export function PostCard({ post, locale }: { post: PostSummary; locale: Locale }) {
  const m = messages[locale];
  const href = localizePath(locale, `/posts/${post.slug}`);
  return (
    <article className="rounded-2xl border border-border bg-card p-4 transition-transform duration-150 hover:-translate-y-0.5">
      <p className="text-xs font-medium text-muted-foreground">
        <time dateTime={post.date}>{post.date}</time>
        {post.project ? ` · ${displayProject(post, locale)}` : null}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">
        <Link href={href} className="hover:text-primary">
          {displayTitle(post, locale)}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{displayExcerpt(post, locale)}</p>
      {post.tags.length ? (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              <Link
                href={localizePath(locale, `/tags/${tag}`)}
                className="inline-flex min-h-8 items-center rounded-full bg-muted px-2.5 text-[11px] font-semibold text-foreground"
              >
                {tag}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3">
        <Link href={href} className="text-sm font-semibold text-primary">
          {m.posts.read} →
        </Link>
      </p>
    </article>
  );
}
