import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  creator: "XingAI",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    images: [{ url: "/og-image.png", width: 1376, height: 768, alt: SITE_NAME }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4faf4" },
    { media: "(prefers-color-scheme: dark)", color: "#142019" },
  ],
};

const initScript = `(function(){try{var t=localStorage.getItem("theme");var dark=t==="dark"||((t!=="light")&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");var p=location.pathname,l="en";if(p.indexOf("/zh")===0)l="zh";else if(p.indexOf("/ko")===0)l="ko";document.documentElement.lang=l==="zh"?"zh-CN":l;document.cookie="xingai.locale="+l+";path=/;max-age=31536000;SameSite=Lax"}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={font.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
