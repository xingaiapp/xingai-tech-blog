import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/theme-provider";
import { messages } from "lib/i18n";
import { LOCALES, SITE_NAME, SITE_URL, htmlLang, parseLocale, type Locale } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import "../globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Unknown first segments (e.g. /foo.txt) must 404 instead of rendering a locale page. */
export const dynamicParams = false;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4faf4" },
    { media: "(prefers-color-scheme: dark)", color: "#142019" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  const m = messages[locale];
  const page = pageMetadata(locale, "/", m.meta.homeTitle, m.meta.homeDescription);
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    creator: "XingAI",
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    ...page,
    // The template applies to child pages; the home page keeps its own full title.
    title: { default: page.title.absolute, template: `%s · ${SITE_NAME}` },
  };
}

/** Theme only: the language comes from the server-rendered <html lang>, not from a script. */
const initScript = `(function(){try{var t=localStorage.getItem("theme");var dark=t==="dark"||((t!=="light")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");var p=location.pathname,l="en";if(p.indexOf("/zh")===0)l="zh";else if(p.indexOf("/ko")===0)l="ko";document.cookie="xingai.locale="+l+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}})()`;

export default async function LocaleLayout({ children, params }: Props) {
  const locale = parseLocale((await params).locale);
  return (
    <html lang={htmlLang(locale)} suppressHydrationWarning className={font.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LocaleProvider locale={locale as Locale}>
            <SiteChrome>{children}</SiteChrome>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
