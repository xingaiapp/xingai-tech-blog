# The Decision Cache Boundary: Worker Computes, API Reads

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `decision-cache` `worker` `fastapi` `cqrs` `ai-safety`  
**Also available:** [中文](2026-06-06-invest-ai-decision-cache-boundary.zh.md)

---

The most important Invest AI architecture rule is simple:

```txt
Worker/core computes decisions.
FastAPI reads cache.
Frontend renders.
```

It exists because financial UX can quietly become dangerous when every layer starts "helpfully" filling gaps. A dashboard route might recompute a rank. A React component might infer risk from raw quotes. A notification job might build its own action label.

Each of those creates a second decision engine.

## What belongs in the worker

Anything that changes investment interpretation:

- Macro state.
- FRED factors.
- Engine scores.
- Consensus.
- Risk budget.
- Allocation.
- Top-signal ranking.
- Symbol overlays.
- Decision events.
- Stale/degraded semantics.

The worker writes those fields into `v2:dashboard:today`.

## What belongs in FastAPI

FastAPI can:

- Read SQLite/cache rows.
- Select a precomputed scope.
- Validate and serialize payloads.
- Attach `cache_meta` and freshness metadata.
- Enforce auth and rate limits.
- Return explicit cache-miss or stale-data errors.

It does not repair missing decision fields by fetching live market data.

## Why it matters

This makes the system easier to test, easier to explain, and safer to operate. If the dashboard, email, and PDF all say the same thing, it is because they read the same cached decision package.

That is the point.

**Further reading:** ADR-012 (`docs/adr/012-decision-cache-boundary.md`).
