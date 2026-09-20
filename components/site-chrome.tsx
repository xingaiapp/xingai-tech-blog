"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, ChevronLeft, ChevronRight, Hash, House, Menu, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { XINGAI_HOME, stripLocale } from "@/lib/site";
import { cn } from "@/lib/utils";
import { BlogLogo } from "./blog-logo";
import { LegalFooter } from "./legal-footer";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useLocale } from "./locale-provider";

const NAV = [
  { path: "/", key: "home" as const, icon: House },
  { path: "/posts", key: "posts" as const, icon: BookMarked },
  { path: "/tags", key: "tags" as const, icon: Hash },
];

function isActive(pathname: string, path: string) {
  const base = stripLocale(pathname);
  if (path === "/") return base === "/";
  return base === path || base.startsWith(`${path}/`);
}

function DesktopSidebar() {
  const pathname = usePathname() || "/";
  const { m, href } = useLocale();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (window.localStorage.getItem("blog-desktop-sidebar-expanded") === "false") {
      setExpanded(false);
    }
  }, []);

  function toggle() {
    setExpanded((cur) => {
      const next = !cur;
      window.localStorage.setItem("blog-desktop-sidebar-expanded", String(next));
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 lg:flex",
        expanded ? "w-56 xl:w-64" : "w-20",
      )}
    >
      <div className={cn("flex min-h-16 items-center gap-2 border-b border-border px-4", !expanded && "justify-center px-2")}>
        <BlogLogo className="h-8 w-8 shrink-0" />
        {expanded ? <span className="truncate text-sm font-semibold">{m.brand}</span> : null}
      </div>
      <nav className={cn("flex-1 space-y-1 p-3", !expanded && "px-2")} aria-label="Primary">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.path);
          return (
            <Link
              key={item.path}
              href={href(item.path)}
              title={!expanded ? m.nav[item.key] : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-xl text-sm transition-colors",
                expanded ? "gap-3 px-3" : "justify-center px-2",
                active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className={expanded ? "h-4 w-4" : "h-5 w-5"} aria-hidden />
              {expanded ? m.nav[item.key] : <span className="sr-only">{m.nav[item.key]}</span>}
            </Link>
          );
        })}
        <a
          href={XINGAI_HOME}
          title={!expanded ? m.nav.products : undefined}
          className={cn(
            "flex min-h-11 items-center rounded-xl text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            expanded ? "gap-3 px-3" : "justify-center px-2",
          )}
        >
          <BlogLogo className="h-4 w-4" />
          {expanded ? m.nav.products : <span className="sr-only">{m.nav.products}</span>}
        </a>
      </nav>
      <button
        type="button"
        className="absolute -right-5 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-lg"
        aria-label={expanded ? m.chrome.collapseSidebar : m.chrome.expandSidebar}
        aria-expanded={expanded}
        onClick={toggle}
      >
        {expanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>
    </aside>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const { locale, m, href } = useLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="hidden min-h-screen lg:flex">
        <DesktopSidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-end gap-2 border-b border-border bg-[var(--header-bg)] px-6 pt-[max(0px,env(safe-area-inset-top))] backdrop-blur-md">
            <LocaleSwitcher />
            <ThemeToggle />
          </header>
          <div className="mx-auto max-w-4xl px-6 py-8">
            {children}
            <LegalFooter locale={locale} />
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <header className="sticky top-0 z-50 border-b border-border bg-[var(--header-bg)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex h-14 items-center gap-2 px-3">
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border"
              aria-label={open ? m.chrome.closeNav : m.chrome.openNav}
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <BlogLogo className="h-7 w-7 shrink-0" />
              <span className="truncate text-sm font-semibold">{m.brandShort}</span>
            </div>
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        {open ? (
          <div className="fixed inset-0 z-[70]">
            <button type="button" className="absolute inset-0 bg-black/40" aria-label={m.chrome.closeNav} onClick={() => setOpen(false)} />
            <aside
              id="app-nav-sheet"
              className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-border bg-background pt-[env(safe-area-inset-top)]"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-semibold">{m.chrome.sheetTitle}</p>
                <button
                  type="button"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border"
                  aria-label={m.chrome.closeNav}
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-3">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.path);
                  return (
                    <Link
                      key={item.path}
                      href={href(item.path)}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm",
                        active ? "bg-primary/10 font-medium text-primary" : "text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {m.nav[item.key]}
                    </Link>
                  );
                })}
                <a href={XINGAI_HOME} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm">
                  {m.nav.products}
                </a>
              </nav>
              <div className="space-y-3 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="flex gap-2">
                  <LocaleSwitcher />
                  <ThemeToggle />
                </div>
                <LegalFooter locale={locale} />
              </div>
            </aside>
          </div>
        ) : null}

        <main className="px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4">
          {children}
          <LegalFooter locale={locale} />
        </main>

        <nav
          aria-label="Primary"
          className="fixed bottom-0 left-0 right-0 z-[55] border-t border-border bg-[var(--header-bg)] pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-xl items-stretch justify-between px-1 py-1.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.path);
              return (
                <Link
                  key={item.path}
                  href={href(item.path)}
                  className={cn(
                    "flex min-h-11 min-w-[3.125rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-center",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-[1.15rem] w-[1.15rem]" />
                  <span className="text-[0.65rem] font-semibold leading-none">{m.nav[item.key]}</span>
                </Link>
              );
            })}
            <a
              href={XINGAI_HOME}
              className="flex min-h-11 min-w-[3.125rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-muted-foreground"
            >
              <BlogLogo className="h-[1.15rem] w-[1.15rem]" />
              <span className="text-[0.65rem] font-semibold leading-none">{m.nav.products}</span>
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
