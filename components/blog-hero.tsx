import Image from "next/image";
import Link from "next/link";
import { BookOpen, GitBranch, Languages } from "lucide-react";
import type { Locale } from "lib/site";
import { GITHUB_REPO, localizePath } from "lib/site";
import { messages } from "lib/i18n";

export function BlogHero({ locale }: { locale: Locale }) {
  const m = messages[locale];
  const features = [
    { icon: Languages, title: m.hero.feat1Title, body: m.hero.feat1Body },
    { icon: GitBranch, title: m.hero.feat2Title, body: m.hero.feat2Body },
    { icon: BookOpen, title: m.hero.feat3Title, body: m.hero.feat3Body },
  ];

  return (
    <section className="hero-enter overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative grid lg:grid-cols-[minmax(0,1fr)_minmax(14rem,40%)]">
        <div className="flex flex-col justify-between gap-6 p-5 sm:p-6 lg:p-8">
          <div className="space-y-4">
            <span className="inline-flex min-h-8 items-center rounded-full border border-primary/30 bg-primary/10 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              {m.hero.badge}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.45rem] lg:leading-[1.08]">
              <span className="block">{m.hero.headline}</span>
              <span className="mt-1 block text-primary">{m.hero.accent}</span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{m.hero.sub}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={localizePath(locale, "/posts")} className="btn btn-primary">
              {m.hero.ctaPrimary}
            </Link>
            <a href={GITHUB_REPO} className="btn btn-secondary" rel="noreferrer">
              {m.hero.ctaSecondary}
            </a>
          </div>
          <ul className="grid gap-2 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl border border-border bg-background/70 p-3">
                <div className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold">{title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative hidden min-h-[14rem] lg:block" aria-hidden>
          <Image
            src="/brand/hero-bg-light-visual.png"
            alt=""
            fill
            priority
            sizes="420px"
            className="object-cover object-center dark:hidden"
          />
          <Image
            src="/brand/hero-bg-visual.png"
            alt=""
            fill
            priority
            sizes="420px"
            className="hidden object-cover object-center dark:block"
          />
        </div>
      </div>
      <div className="relative mx-4 mb-4 mt-1 h-36 overflow-hidden rounded-2xl border border-border sm:mx-5 sm:h-40 lg:hidden">
        <Image
          src="/brand/hero-bg-light-visual.png"
          alt={m.hero.visualAlt}
          fill
          sizes="100vw"
          className="object-cover object-[70%_center] dark:hidden"
        />
        <Image
          src="/brand/hero-bg-visual.png"
          alt={m.hero.visualAlt}
          fill
          sizes="100vw"
          className="hidden object-cover object-[70%_center] dark:block"
        />
      </div>
    </section>
  );
}
