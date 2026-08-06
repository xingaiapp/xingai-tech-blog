# Today Intelligence and the Report Surfaces That Stay Inside Invest AI

**Date:** August 5, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `invest-ai` `reporting` `worker` `cache` `adr` `intelligence`  
**Also available:** [中文](2026-08-05-invest-ai-today-intelligence-report-surfaces.zh.md)

---

## Spec vs product

A draft "Daily Stock Market Intelligence" stack looked like a new FastAPI + Alembic + Next app. Invest AI already had Resend digests, report triggers, macro radar, and a reports catalog.

ADR-032 chose extend. ADR-033 folded the AI infrastructure opportunity map into the same watchlist/report surface. ADR-034 froze the **Today Intelligence** cache contract so FastAPI only reads worker-owned payload.

## Surfaces

| ADR | Surface |
|-----|---------|
| 032 | Daily Stock Market Intelligence HTML report type |
| 033 | AI Infrastructure Opportunity Map (extend watchlist, not new universe) |
| 034 | `GET /api/v2/intelligence/today` — cache-read only |
| 040 | 每日投资智报 Chinese PDF (separate post) |

Worker computes. Catalog lists. Dashboard renders. No second decision engine in the API.

## Takeaway

New report formats are packaging. New backends for packaging are how monorepos rot.

**Further reading:** ADR-032 / 033 / 034.
