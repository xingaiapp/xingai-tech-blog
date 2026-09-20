"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, switchLocalePath, type Locale } from "lib/site";
import { useLocale } from "./locale-provider";

const LABELS: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
  ko: "한국어",
};

export function LocaleSwitcher() {
  const pathname = usePathname() || "/";
  const { locale, m } = useLocale();

  return (
    <div className="inline-flex h-11 items-center rounded-xl border border-border bg-card p-0.5" role="group" aria-label={m.chrome.language}>
      {LOCALES.map((item) => {
        const active = item === locale;
        return (
          <Link
            key={item}
            href={switchLocalePath(pathname, item)}
            hrefLang={item === "zh" ? "zh-CN" : item}
            className={`inline-flex h-10 min-w-10 items-center justify-center rounded-[0.7rem] px-2 text-[0.75rem] font-semibold leading-none transition-colors ${
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {LABELS[item]}
          </Link>
        );
      })}
    </div>
  );
}
