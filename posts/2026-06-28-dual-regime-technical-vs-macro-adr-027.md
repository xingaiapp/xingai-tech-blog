# Two Regimes, One Dashboard: Technical vs Macro (ADR-027)

**Date:** June 28, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `macro-radar` `decision-engine` `regime` `integration` `adr`  
**Also available:** [中文](2026-06-28-dual-regime-technical-vs-macro-adr-027.zh.md)

---

After [ADR-026](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/026-decision-engine-integration.md), Invest AI can show **two different regime signals** on the same dashboard:

1. **Technical regime** — imported from Decision Engine `daily_scores.v1.json` (QQQ trend, VIX, portfolio hints).
2. **Macro regime gate** — computed in Invest AI `macro_radar.py` (`risk_on` | `neutral` | `caution` | `defensive`).

Without explicit semantics, UI copy and MCP trade gates could treat them as one number — wrong caps, contradictory messaging, or stale technical data driving macro combo modifiers.

[ADR-027](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/027-dual-regime-semantics.md) draws the line.

## Two layers — never merge into one field

| Concept | Source | Authoritative for |
|---------|--------|-------------------|
| Technical regime | Decision Engine import | Symbol `action`, `composite`, setup labels |
| Macro regime gate | `macro_radar.regime_gate` | Combo modifiers, `long_signal_discount`, `risk_budget_cap`, event downgrades |

**Rule:** Macro gate **never** overwrites Decision Engine `composite` or `action`. It may cap size and discount signals only — [Decision Engine ADR-011 Layer 2](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/011-score-export-contract.md).

## When they disagree

If technical regime reads `DEFENSIVE` but macro gate is `neutral`, **macro gate wins** for combo modifiers. UI shows **both** with distinct labels — not a blended badge.

Mapping tables in the ADR are **informational** for comparison; they do not replace `regime_gate`.

## Degraded import

| `decision_engine.import_status` | UI behavior |
|--------------------------------|-------------|
| `ok` | Show imported technical regime; prefer `symbol_scores` ranking |
| `degraded` / missing | Hide or badge "Technical scores unavailable"; macro gate unchanged |
| Stale `as_of_date` | Stale badge on technical block only |

Do not refresh macro from technical when import is stale.

## Why this matters for MCP gates

[ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md) gate **G5** cites cached `v2:dashboard:today` — that snapshot must keep technical and macro fields separate so trade tickets do not cite the wrong regime for sizing context.

## What we said no to

- Single `regime` field in cache JSON — hides layer boundaries.
- Macro rewriting technical `action` — breaks export contract.
- Wiki-only guidance — insufficient for UI + worker reviewers.

**Further reading:** [ADR-026 two-repo score contract](2026-06-25-two-repos-one-score-contract-adr-026.md) · [V2 macro radar ADR-019](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/019-v2-macro-radar.md)
