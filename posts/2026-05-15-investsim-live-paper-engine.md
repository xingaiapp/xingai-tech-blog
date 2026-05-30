# InvestSim Becomes a Live Paper Engine

**Date:** May 15, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [InvestSim / invest-performance-sim](https://github.com/xingaiapp/invest-performance-sim) (private)  
**Tags:** `paper-trading` `nextjs` `turso` `vercel-cron` `invest-ai` `simulation` `adr`  
**Also available:** [中文](2026-05-15-investsim-live-paper-engine.zh.md)
---

## What changed

InvestSim started as a dashboard that could show a daily AI pick. Today it became a small, deterministic paper-trading engine.

The live source is Invest AI on Fly.io:

```text
https://xingai-invest-ai-api.fly.dev
```

The app now reads:

- `GET /api/v2/signals/top` for the current AI pick.
- `GET /api/v1/tickers?symbols=...` for delayed/normalized quote prices.

## The V1 rules

The engine is intentionally simple:

1. Start with `$10,000`.
2. Hold at most one symbol.
3. If flat, buy the latest AI pick.
4. If holding, sell by priority:
   - `STOP` at `-5%`.
   - `TIME_EXIT` after 2 calendar days.
   - `ROTATE` if the AI pick changes.
5. Use fractional shares rounded down to 4 decimals.
6. Skip if an engine fill already exists for the New York trading day.

This is not a broker and not investment advice. It is a reproducible simulation.

## Why one cron

The daily Vercel Cron route is:

```text
/api/cron/daily-run
```

It does two things in order:

1. Ingest the current AI pick.
2. Apply the paper-trade rules.

One route is easier to reason about than coordinating separate ingest and trade jobs.

## ADRs added

InvestSim now has its own ADR index:

```text
docs/adr/README.md
docs/adr/0001-turso-bootstrap-runtime.md
docs/adr/0002-v1-paper-trade-engine.md
```

The first ADR captures why Turso schema bootstrap happens inside a protected Vercel runtime endpoint. The second locks the V1 trading rules.

## What is still deliberately limited

- Prices are backend quote snapshots, not exchange executions.
- Calendar days are used for V1 hold duration; true exchange-session calendars can come later.
- Slippage is currently `0`.
- There is no live brokerage connection.

That restraint is the point: a paper lab should be transparent before it tries to look sophisticated.
