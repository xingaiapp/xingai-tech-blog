# When Bilingual JSON Looks Fine in the Network Tab but Empty in the UI

**Date:** May 30, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [T Today / invest-t-advisor](https://t.xingai.app)  
**Tags:** `openai` `json` `i18n` `bugfix` `nextjs` `vision` `adr`  
**Also available:** [中文](2026-05-30-t-today-bilingual-advisory-json.zh.md)
---

## Symptom

T Today’s holdings coach uses OpenAI with `response_format: { type: "json_object" }`. The model returns a big JSON blob with `zh` and `en` blocks. Users switched language — still empty cards. DevTools showed JSON with content. The app acted like analysis failed.

Classic “parser lied” bug.

## The contract we want

One top-level object:

```json
{
  "v": 1,
  "zh": { "summary": "…", "tDecision": { … }, "positions": [ … ] },
  "en": { "summary": "…", "tDecision": { … }, "positions": [ … ] }
}
```

Human-readable strings differ per locale. **`extractedPortfolio` must match** in both leaves (symbols, share counts, cash).

The system prompt now states this loudly: numeric `v: 1`, no leaf fields at the top level.

## What went wrong in code

`parseBilingualAdvisory()` had two paths:

1. If `v === 1` and `zh`/`en` exist → parse children. ✅  
2. Else → treat the **whole object** as a single leaf.

When the model returned `{ "v": 1, "zh": {…}, "en": {…} }` but `v` was missing or not exactly `1`, we fell into path 2. The wrapper has no `summary` at the top — only nested under `zh`/`en`. `parseRiskAdvisoryStructured` “succeeded” with **empty strings** and we duplicated that emptiness to both locales.

Users saw blank UI. No thrown error. Worse than a 500.

## The fix

Parser rules now:

1. **If `zh` and `en` are present** → always parse those objects (ignore `v`).
2. **Never** run legacy leaf parsing on a wrapper that still has `zh`/`en` keys.
3. Legacy path only when the object **looks like a leaf** (`summary`, `positions`, etc.) with no bilingual keys.
4. Salvage: if one locale parses, copy to the other.

Regression checks live in `scripts/advisory-bilingual-smoke.ts`.

## Why bilingual at all

T Today targets EN and CN (plus Korean UI copy with English AI body for now). Re-running vision on every language toggle would be slow and expensive. We pay once, store `{ zh, en }`, and `pickLocalizedStructured()` selects the right leaf.

Korean (`ko`) UI reads the English leaf until we add a third leaf — same pattern Invest AI uses for structured cards.

## Takeaway

With JSON-mode LLMs, **the schema in the prompt and the parser must agree**. If you nest locales under `zh`/`en`, never parse the parent as if it were a leaf. One bad fall-through looks like “AI is broken” when the model did its job.

**Further reading:** [ADR-0002](https://github.com/xingaiapp/invest-t-advisor/blob/main/docs/adr/0002-bilingual-advisory-json.md), [T-TODAY-USER-FLOW.md](https://github.com/xingaiapp/invest-t-advisor/blob/main/docs/T-TODAY-USER-FLOW.md).
