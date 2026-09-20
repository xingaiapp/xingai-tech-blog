import { messages } from "lib/i18n";
import type { Locale } from "lib/site";

export function FaqBlock({ locale }: { locale: Locale }) {
  const m = messages[locale];
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold tracking-tight">{m.faq.heading}</h2>
      <dl className="mt-4 space-y-3">
        {m.faq.items.map((item) => (
          <div key={item.q} className="rounded-2xl border border-border bg-card p-4">
            <dt className="font-semibold">{item.q}</dt>
            <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
