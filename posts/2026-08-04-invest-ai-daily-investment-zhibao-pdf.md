# 每日投资智报: Extend Invest AI, Do Not Spin Another Report Product

**Date:** August 4, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `invest-ai` `pdf` `resend` `worker` `reporting` `adr` `yfinance`  
**Also available:** [中文](2026-08-04-invest-ai-daily-investment-zhibao-pdf.zh.md)

---

## The temptation

A dense Chinese A4 PDF framed around a $200K FI portfolio looks like a new product. New domain. New worker. New Resend project. Maybe a cute `investment-report.xingai.app`.

ADR-032 already rejected that path for Daily Stock Market Intelligence. ADR-040 applies the same rule to **每日投资智报**.

Ship it inside Invest AI. Keep Premium Daily Brief, pre-market / after-close PDFs, and ADR-032 HTML reports alone.

## What shipped

Package path:

```txt
stock-ai-worker/market_cache_worker/investment_zhibao/
config/investment_zhibao/{user.yaml,portfolio.csv,policy.yaml}
```

CLI:

```bash
python -m market_cache_worker.investment_zhibao validate-data|generate|send|run-daily
```

Catalog entry: `daily-investment-zhibao` (ADR-025 report types).

Live mode reads Yahoo bars in batch, stamps `market_as_of` from real bar dates, and prints day-change %. CAPE / Forward P/E stay `N/A` until we have an honest source. Missing data stays blank. Fake precision is a product bug.

Email reuses existing Resend env keys (`RESEND_API_KEY` / `INVEST_AI_RESEND_API_KEY`). Dry-run is the default path until secrets exist in the environment.

## Boundaries that matter

| Surface | Owns |
|---------|------|
| Worker package | Snapshot, calc, risk buckets, reco, PDF, email |
| FastAPI | Report type metadata only — no recomputation |
| XNP | Future transport only — not in the hot path today |

Same decision cache boundary as Premium Daily Brief: worker owns semantics; delivery formats ride on that payload.

## What is still open

- Scheduler / cron hook for `run-daily`
- Live CAPE / fuller fundamentals without inventing numbers
- PDF denser toward the ~8-page reference layout
- One live send once Resend keys are on the worker host

## Takeaway

Matching a reference PDF is a packaging problem, not a greenfield product. Extending Invest AI kept Resend, the reports catalog, and the worker/cache rule in one place.

**Further reading:** [ADR-040](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/040-daily-investment-zhibao-pdf.md) · system design article in `xingai-enterprise-ai-design`.
