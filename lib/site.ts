export const LOCALES = ["en", "zh", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.xingai.app";
export const SITE_NAME = "XingAI Tech Blog";
export const GITHUB_REPO = "https://github.com/xingaiapp/xingai-tech-blog";
export const XINGAI_HOME = "https://xingai.app";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "zh" || value === "ko";
}

export function parseLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : "en";
}

export function localizePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(zh|ko|en)(\/.*)?$/);
  if (!match) return pathname || "/";
  return match[2] || "/";
}

export function publicUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localizePath(locale, path)}`;
}

export function switchLocalePath(pathname: string, next: Locale): string {
  return localizePath(next, stripLocale(pathname));
}

export function hreflangAlternates(path: string): Record<string, string> {
  return {
    en: publicUrl("en", path),
    "zh-CN": publicUrl("zh", path),
    ko: publicUrl("ko", path),
    "x-default": publicUrl("en", path),
  };
}

export function openGraphLocale(locale: Locale): string {
  if (locale === "zh") return "zh_CN";
  if (locale === "ko") return "ko_KR";
  return "en_US";
}

export function htmlLang(locale: Locale): string {
  if (locale === "zh") return "zh-CN";
  if (locale === "ko") return "ko";
  return "en";
}
