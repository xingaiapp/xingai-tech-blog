import type { Metadata } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteChrome } from "@/components/site-chrome";
import { messages } from "lib/i18n";
import { LOCALES, htmlLang, parseLocale, type Locale } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  return pageMetadata(locale, "/", m.meta.homeTitle, m.meta.homeDescription);
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = parseLocale((await params).locale);
  return (
    <LocaleProvider locale={locale as Locale}>
      <div lang={htmlLang(locale)}>
        <SiteChrome>{children}</SiteChrome>
      </div>
    </LocaleProvider>
  );
}
