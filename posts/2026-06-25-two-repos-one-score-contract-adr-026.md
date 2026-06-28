# Two Repos, One Score Contract: Decision Engine ADR-011 and Invest AI ADR-026

**Date:** June 25, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Invest AI](https://xingai.app/apps/invest-ai) + [Decision Engine](https://github.com/xingaiapp/xingai-invest-decision-engine)  
**Tags:** `architecture` `decision-engine` `integration` `cqrs` `adr`  
**Also available:** [中文](2026-06-25-two-repos-one-score-contract-adr-026.zh.md)

---

Invest AI ships a production dashboard with macro consensus. Decision Engine owns multi-timeframe technical scoring and backtests. **Two repos on purpose** — [ADR-002 on the Decision Engine side](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/002-sibling-invest-ai.md), [project comparison on Invest AI](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/project-comparison-invest-ai-vs-decision-engine.md).

Integration needs a contract both sides can enforce. That contract is **`daily_scores.v1.json`**.

## Layer 1 vs Layer 2

| Layer | Owner | Job |
|-------|-------|-----|
| **Layer 1 — Technical** | Decision Engine | M/W/D/K composite, hard gates, StockType caps, regime block |
| **Layer 2 — Macro overlay** | Invest AI | FRED, event calendar, combo modifiers, narrative |

Decision Engine must not import FRED or LLM explanation layers. Invest AI must not reimplement scoring formulas once import is enabled ([ADR-026](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/026-decision-engine-integration.md)).

## Export contract (Decision Engine ADR-011)

Canonical artifact: **`daily_scores.v1.json`**

Key fields:

- `version`, `rules_version`, `as_of_date` (≤ T−1 for day T)
- `regime.level` — technical regime
- `scores[]` — per-ticker composite, setup, action, confidence

**Production gate:** export does not flow to Invest AI production cache until [ADR-009](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/009-backtest-integrity.md) four-regime backtests pass for the referenced `rules_version`.

## Import pipeline (Invest AI ADR-026)

```text
Decision Engine
  → daily_scores.v1.json
       ↓
stock-ai-worker (decision_engine_importer.py)
  → validate schema + rules_version + as_of_date
  → merge into build_payload()
  → macro_radar overlay (caps/discounts only)
  → SQLite v2:dashboard:today
       ↓
FastAPI (read only — ADR-012 unchanged)
```

Hard rules:

1. FastAPI never fetches Decision Engine at request time.
2. Worker does not recompute composite from raw OHLCV once import is on.
3. Import failure → keep last good cache; set `decision_engine_import.status: degraded`.

## Regime mapping

| Decision Engine `regime.level` | Invest AI `macro_radar.regime_gate` |
|-------------------------------|--------------------------------------|
| `RISK_ON` | `risk_on` |
| `NORMAL` | `neutral` |
| `CAUTION` | `caution` |
| `DEFENSIVE` | `defensive` |

Technical regime is informational in payload field `decision_engine.regime`. Macro gate remains authoritative for combo modifiers.

## Phase 2 boundaries (Decision Engine ADR-012)

Before coding indicators and scoring modules:

- `engine/` writes export; `scheduler/` runs 4:30pm ET job.
- `api/` is read-only — no on-demand scoring over HTTP.
- See [ADR-012](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/012-phase2-scoring-scheduler-api.md).

## Why not merge repos?

- Different release cadence (quant rules vs product UX).
- Backtest gate blocks bad math before users see it.
- Invest AI cache boundary ([ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.md)) stays intact.

**Status today:** Phase 1 data layer in Decision Engine; ADRs and schema defined; worker import path planned in ADR-026 implementation checklist.
