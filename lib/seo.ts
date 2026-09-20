import type { Locale } from "./site";
import { hreflangAlternates, openGraphLocale, publicUrl, SITE_NAME } from "./site";
import { messages } from "./i18n";

export function pageMetadata(
  locale: Locale,
  path: string,
  title: string,
  description: string,
) {
  const url = publicUrl(locale, path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} · ${SITE_NAME}`;
  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: openGraphLocale(locale),
      type: "website" as const,
      images: [{ url: "/og-image.png", width: 1376, height: 768, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: fullTitle,
      description,
      images: ["/og-image.png"],
    },
  };
}

export function homeJsonLd(locale: Locale) {
  const m = messages[locale];
  return [
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: SITE_NAME,
      url: publicUrl(locale, "/"),
      inLanguage: locale === "zh" ? "zh-CN" : locale,
      description: m.meta.homeDescription,
      publisher: {
        "@type": "Organization",
        name: "XingAI",
        url: "https://xingai.app",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: m.faq.items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

export function articleJsonLd(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  date: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.date,
    inLanguage: opts.locale === "zh" ? "zh-CN" : "en",
    url: publicUrl(opts.locale, opts.path),
    author: { "@type": "Organization", name: "XingAI", url: "https://xingai.app" },
    publisher: { "@type": "Organization", name: "XingAI", url: "https://xingai.app" },
  };
}
