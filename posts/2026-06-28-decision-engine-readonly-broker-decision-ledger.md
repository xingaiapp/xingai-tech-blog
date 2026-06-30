# Read-Only Broker, Writable Ledger: Decision Engine ADR-014 and ADR-015

**Date:** June 28, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest Decision Engine](https://github.com/xingaiapp/xingai-invest-decision-engine)  
**Tags:** `decision-engine` `robinhood` `mcp` `audit` `decision-ledger` `human-in-the-loop`  
**Also available:** [中文](2026-06-28-decision-engine-readonly-broker-decision-ledger.zh.md)

---

Robinhood [Agentic Trading](https://robinhood.com/us/en/support/articles/agentic-trading-overview/) lets connected agents read portfolios and place trades — including **auto-execute without per-trade confirmation** if the user configures it that way.

XingAI Decision Engine takes the opposite posture in two new ADRs:

- **[ADR-014](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/014-robinhood-mcp-readonly.md)** — Robinhood MCP **read-only** in this repo; no order-placement functions in code.
- **[ADR-015](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/015-decision-ledger.md)** — every recommendation shown in the daily brief gets a row in a local **decision ledger** matching the [cross-product schema](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md).

Invest AI's execution gates live in [ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md). Decision Engine stays the **recommendation producer**, not the auto-trader.

## ADR-014: read-only connector

`broker/robinhood_client.py` may fetch account summary, positions, balances, and transaction history. It **must not** expose `place_*` helpers — not behind a flag, not for "dev only."

Why now, before the scoring engine ships?

- Verify the Agentic account is funded and isolated.
- Demo portfolio state without depending on `daily_scores.v1.json`.
- Keep broker wiring separate from unfinished Modules 2–11.

Daily brief ([`reports/daily_brief.py`](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/reports/daily_brief.py)) renders Buy/Hold/Sell for humans to act on **inside Robinhood's UI** — the renderer never calls a broker write API.

## ADR-015: decision ledger as first adopter

The engineering-system pattern is thin on purpose:

```text
one row per recommendation → local SQLite per product → no central DB
```

Decision Engine writes via `record_decisions()` — **explicit**, separate from `render_markdown()`. Preview a brief without logging? Possible. Tests stay simple.

`action_taken` and `outcome` start `null`. No broker write-back yet ([ADR-003 human-in-the-loop](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/003-human-in-the-loop.md)). That's expected, not a bug.

## How the pieces fit

```text
Decision Engine scoring (future) → daily_scores.v1.json
        ↓
daily_brief.render_markdown()     → human-readable brief
daily_brief.record_decisions()    → decisions.sqlite ledger row
broker.robinhood_client (read)    → optional account context
        ↓
Invest AI import (ADR-026)        → macro overlay only — no execution
```

## What we said no to

- Order path gated by config default-off — policy control, not structural; capability shouldn't exist until a dedicated execution ADR.
- Fusing ledger writes into the renderer — forces every preview to hit SQLite.
- Central decision database — violates per-product boundary discipline.

**Further reading:** [ADR-026 score contract](2026-06-25-two-repos-one-score-contract-adr-026.md) · [ADR-028 execution gates](2026-06-25-robinhood-mcp-execution-gates-adr-028.md)
