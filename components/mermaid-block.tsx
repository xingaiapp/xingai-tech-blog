"use client";

import { useEffect, useRef } from "react";

export function MermaidBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;

    // Mermaid measures label text when it renders. Wait for web fonts first, otherwise labels are
    // measured in a fallback font and clipped once the real font is applied.
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.all([import("mermaid"), fontsReady]).then(([mod]) => {
      if (cancelled) return;
      const mermaid = mod.default;
      const dark = document.documentElement.classList.contains("dark");
      mermaid.initialize({
        startOnLoad: false,
        theme: dark ? "dark" : "neutral",
        securityLevel: "strict",
      });
      const id = `mmd-${Math.random().toString(36).slice(2)}`;
      mermaid
        .render(id, chart)
        .then(({ svg }) => {
          if (!cancelled && ref.current) ref.current.innerHTML = svg;
        })
        .catch(() => {
          if (!cancelled && ref.current) {
            ref.current.innerHTML = `<pre>${chart.replace(/</g, "&lt;")}</pre>`;
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div className="mermaid-wrap" role="img">
      <div ref={ref} />
      <pre className="sr-only">{chart}</pre>
    </div>
  );
}
