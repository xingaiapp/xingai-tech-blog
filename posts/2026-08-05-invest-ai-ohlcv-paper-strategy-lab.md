# From Signal Events to Strategy Lab: Worker-Owned Paper Inside Invest AI

**Date:** August 5, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `invest-ai` `paper-trading` `ohlcv` `strategy-lab` `eee` `cqrs` `adr`  
**Also available:** [中文](2026-08-05-invest-ai-ohlcv-paper-strategy-lab.zh.md)

---

## The chain

```txt
ADR-035 position-signal events
  → ADR-036 worker OHLCV bars (Yahoo behind worker only)
  → ADR-037 paper trading ledger + /execution-log
  → ADR-038 strategy-lab backtests over cached bars
  → ADR-039 EEE export into shared eval registry
```

Before 036, chart-lab and InvestSim could each pull Yahoo and diverge. Programmatic consumers now fail closed on cache miss (`503`) instead of turning FastAPI into a fetch proxy.

Paper ledger is real audit-shaped state — still far from broker risk. Strategy lab compares policies on the same bars and must not mutate the paper ledger on request. EEE export makes regressions visible outside the dashboard JSON.

## Boundary

Worker writes. FastAPI reads. Strategy evaluation is historical math on cache, not a second live decision engine.

## Takeaway

Paper and backtests belong next to the signal cache that already owns truth — not in a sibling Yahoo client.

**Further reading:** ADR-035–039 · loop post `2026-08-05-three-repos-one-paper-to-draft-loop.md`.
