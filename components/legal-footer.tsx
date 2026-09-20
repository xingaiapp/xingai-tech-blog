"use client";

import Link from "next/link";
import { messages } from "lib/i18n";
import { localizePath, type Locale } from "lib/site";

export function LegalFooter({ locale }: { locale: Locale }) {
  const m = messages[locale];
  const links = [
    { href: "/legal/privacy", label: m.legal.privacy },
    { href: "/legal/terms", label: m.legal.terms },
    { href: "/legal/disclaimer", label: m.legal.disclaimer },
  ];
  return (
    <footer className="mt-12 border-t border-border pt-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="Legal">
        {links.map((link) => (
          <Link key={link.href} href={localizePath(locale, link.href)} className="text-muted-foreground hover:text-foreground">
            {link.label}
          </Link>
        ))}
        <a href="https://xingai.app" className="text-muted-foreground hover:text-foreground">
          xingai.app
        </a>
      </nav>
      <p className="mt-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()} XingAI. {m.legal.footerNote}
      </p>
    </footer>
  );
}
