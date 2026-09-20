import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalDoc, LEGAL_IDS, type LegalDocId } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { LOCALES, parseLocale } from "@/lib/site";

type Props = { params: Promise<{ locale: string; doc: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LEGAL_IDS.map((doc) => ({ locale, doc })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, doc } = await params;
  const locale = parseLocale(raw);
  if (!LEGAL_IDS.includes(doc as LegalDocId)) return {};
  const legal = getLegalDoc(locale, doc as LegalDocId);
  return pageMetadata(locale, `/legal/${doc}`, legal.title, legal.description);
}

export default async function LegalPage({ params }: Props) {
  const { locale: raw, doc } = await params;
  const locale = parseLocale(raw);
  if (!LEGAL_IDS.includes(doc as LegalDocId)) notFound();
  const legal = getLegalDoc(locale, doc as LegalDocId);
  return (
    <article className="prose-blog">
      <h1 className="text-3xl font-extrabold tracking-tight">{legal.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{legal.updated}</p>
      {legal.sections.map((section) => (
        <section key={section.heading} className="mt-6">
          <h2>{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
