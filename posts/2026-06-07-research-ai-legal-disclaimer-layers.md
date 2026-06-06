# Four Layers of “Not Professional Advice” for a Learning AI

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `legal` `disclaimers` `product` `compliance` `i18n`  
**Also available:** [中文](2026-06-07-research-ai-legal-disclaimer-layers.zh.md)

---

Research AI tells you whether a topic is worth learning. It can still sound like career or financial guidance if we are careless.

We are **not** lawyers. This is engineering practice — get counsel before paid launch.

## Four layers (MVP)

1. **Footer chrome** — Privacy, Terms, Disclaimer on every surface (mobile drawer + desktop).  
2. **Inline `LegalNotice`** — on result, compare, portfolio, and topic pages next to AI output.  
3. **Submit line** — home form: researching a topic means you accept Terms + Privacy.  
4. **Full legal docs** — en, zh, **ko** on `/legal/*`.

Email share appends a one-line disclaimer. FAQ and `llms.txt` repeat the same substance.

## What we skipped for now

First-visit modal (Invest layer 2) — adds friction while we validate core flow. API `disclaimer` field on JSON — next FastAPI pass.

## Why stack layers

One footer link is easy to miss when you are staring at a **Learn Now** badge. Decision products need the warning where the decision appears.

**Further reading:** ADR-009 · Invest’s [five-layer post](2026-05-13-legal-disclaimers-five-layers.md)
