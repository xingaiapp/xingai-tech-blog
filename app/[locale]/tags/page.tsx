import type { Metadata } from "next";
import Link from "next/link";
import { messages } from "lib/i18n";
import { listTags } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { localizePath, parseLocale } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  return pageMetadata(locale, "/tags", m.meta.tagsTitle, m.meta.tagsDescription);
}

export default async function TagsPage({ params }: Props) {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  const tags = listTags();
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-tight">{m.tags.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{m.tags.lead}</p>
      <ul className="list-enter mt-6 flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={localizePath(locale, `/tags/${tag}`)}
              className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-3 text-sm font-semibold"
            >
              {tag}
              <span className="ml-2 text-xs text-muted-foreground">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
