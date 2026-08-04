# Three Honesty Fixes After Citation Verification Shipped

**Date:** August 4, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Evidence Engine](https://github.com/xingaiapp/xingai-evidence-engine)  
**Tags:** `evidence` `citation-verification` `pdf` `human-in-the-loop` `adr` `provenance`  
**Also available:** [中文](2026-08-04-evidence-honesty-overlay-pdf-refs-citation-dates.zh.md)

---

## The problem after "verify" works

Once Evidence Engine could score markdown citations, three product lies showed up fast:

1. Humans needed Accept / Reject / Edit — but Principle 1 said the API does not compute.
2. Well-cited PDFs scored 0% because we refused to invent coverage without a bibliography parse (ADR-008) — then users needed *some* PDF path that still refused fake links.
3. A radar called a three-month-old arXiv signal "today's most important news" because the blog date was yesterday.

ADRs 009–011 close those holes without inventing provenance.

## ADR-009 — Human overlays, not mutated verify cache

Worker writes `v1:verify:{id}`. Humans write `v1:review:{id}` (and skill / run / experience keys). `GET` merges. Re-verify overwrites verify; review survives.

Counter-evidence is advisory and local (refuting stance + token overlap). It never flips a verdict. Approved skills do not auto-merge into `extract.py` — that stays a human PR.

This is the **human-overlay-cache** pattern in the engineering system.

## ADR-010 — Numeric PDF refs only when URL/DOI exists

Parse the bibliography. Resolve `[12]` only if the entry has a URL or DOI. Author-year stays unresolved. Coverage stays `n/a` when nothing resolves — still no invented 0%.

## ADR-011 — Report citation dates; refuse to invent "first public"

Ship `page_date` from page metadata and `first_public` only for arXiv URLs. Do **not** auto-link an announcement to the paper it announces. Three cheap approaches all produced confidently wrong lags on real pages (missing links, wrong arXiv cite, 2002 title collision). Bibliographic resolution (OpenAlex / Semantic Scholar) is deferred with evidence, not papered over.

## Takeaway

Verification compute is not the same as honesty product work. Overlays, PDF bibliography floors, and dated citations are separate decisions — and each one is mostly about what **not** to ship.

**Further reading:** [ADR-009](https://github.com/xingaiapp/xingai-evidence-engine/blob/main/docs/adr/009-workspace-regression-counter.md) · [ADR-010](https://github.com/xingaiapp/xingai-evidence-engine/blob/main/docs/adr/010-pdf-numeric-references.md) · [ADR-011](https://github.com/xingaiapp/xingai-evidence-engine/blob/main/docs/adr/011-citation-dates.md).
