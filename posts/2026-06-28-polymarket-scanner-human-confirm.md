# Scanner Computes, Human Confirms: Polymarket AI Phase 1–2

**Date:** June 28, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Polymarket AI](https://github.com/xingaiapp/xingai-polymarket-ai)  
**Tags:** `polymarket` `human-in-the-loop` `kelly` `prediction-markets` `audit`  
**Also available:** [中文](2026-06-28-polymarket-scanner-human-confirm.zh.md)

---

Polymarket AI scans prediction markets, estimates edge, and sizes positions with fractional Kelly. The tempting failure mode: wire a cron job to the CLOB and let edge > 5% auto-trade.

We ship the opposite — documented in [ADR-002](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/002-decision-boundary-human-approval.md) and [ADR-004](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/004-telegram-notify-vs-confirm.md).

## Worker computes; human approves

```text
Scanner/Worker  →  edge + Kelly + risk gates  →  SQLite cache + audit log
CLI             →  ConfirmationHandler y/n/q  →  approved list only
Execution       →  not in Phase 1–2
```

| Layer | May do | Must not |
|-------|--------|----------|
| `DecisionMaker` | Compute `TradeDecision`, write audit | Place orders |
| `ConfirmationHandler` | Present EXECUTE list; collect approval | Auto-approve in production |
| `scan.py --dry-run` | Filter stats | Prompt or execute |

`auto_approve=True` is **backtest and paper replay only**.

## Risk gates before the human sees anything

Thresholds live in `config/strategy.yml` — no magic numbers in Python:

- Minimum edge (default 5%)
- Max single bet % of bankroll
- Daily loss stop
- Correlation dedup in `OpportunityRanker`

The operator approves among **pre-filtered** decisions — not raw market noise.

## Telegram: notify ≠ confirm

Phase 2 optional stub sends a Telegram alert when `TELEGRAM_BOT_TOKEN` is set. It **does not wait for a reply**. Approval stays on the CLI.

[ADR-004](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/004-telegram-notify-vs-confirm.md) defines Phase 3 reply confirm (`YES <trace_id>`) before any mobile path can substitute for terminal approval. [ADR-003](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/003-live-clob-execution-gates.md) adds G1–G7 for live CLOB writes in Phase 4+.

## Same brand line as Invest AI

Decision Engine [ADR-003](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/003-human-in-the-loop.md) and Invest AI [ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md) use the same pattern: **decision assistant, not auto-trader.**

## What we said no to

- Full auto-trader on edge threshold — liability and brand.
- LLM sizing at request time — breaks audit and reproducibility.
- Telegram delivery as approval — ADR-004 blocks that confusion early.

**Further reading:** [MCP architecture best practices](2026-06-03-mcp-architecture-best-practices.md) · [Claims supervisor POC](2026-06-25-claims-multiagent-rag-supervisor-poc.md)
