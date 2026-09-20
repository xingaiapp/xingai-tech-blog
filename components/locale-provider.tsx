"use client";

import { createContext, useContext, type ReactNode } from "react";
import { messages, type Messages } from "lib/i18n";
import { localizePath, type Locale } from "lib/site";

type LocaleContextValue = {
  locale: Locale;
  m: Messages;
  href: (path: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value: LocaleContextValue = {
    locale,
    m: messages[locale],
    href: (path: string) => localizePath(locale, path),
  };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
