# Read-First MCP: Robinhood Agentic Trading and ADR-028 Execution Gates

**Date:** June 25, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `mcp` `robinhood` `human-in-the-loop` `execution-gates` `agents` `risk`  
**Also available:** [中文](2026-06-25-robinhood-mcp-execution-gates-adr-028.zh.md)

---

Robinhood's [Agentic Trading MCP](https://robinhood.com/us/en/support/articles/agentic-trading-overview/) lets third-party agents read portfolio data and place trades in a dedicated **Agentic account**. Users can even configure **auto-execute without per-trade confirmation**.

XingAI's position is the opposite: **read-first MCP, write only after human approval.** That is not marketing — it is [ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md).

## Why an ADR for a wiki page?

We already document the tool catalog in the [Robinhood MCP wiki](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/wiki/robinhood-agentic-trading-mcp.md). Wiki explains *what* the tools do. ADR-028 defines *when Invest AI may call them* — enforceable in code review.

Related: [ADR-003 MCP phased rollout](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/003-mcp-phased-rollout.md), [ADR-014 structural risk mitigations](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/014-structural-risk-mitigations.md), Decision Engine [ADR-003 human-in-the-loop](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/003-human-in-the-loop.md).

## Phase 1: read-only

| Allowed now | Blocked until gates pass |
|-------------|--------------------------|
| `get_portfolio`, quotes, watchlists | `place_equity_order`, `place_option_order` |
| Dev sandbox / engineering skills | Production one-click trade |
| Display-only enrichment | Auto-exec without user confirm |

MCP read tools must **not** alter cached decision scores ([ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.md)).

## Gates G1–G7 (all required for write tools)

| Gate | Requirement |
|------|-------------|
| **G1** | User explicitly confirms each order in UI |
| **G2** | Step-up auth (extend [ADR-024](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/024-admin-email-otp-step-up.md) OTP pattern) |
| **G3** | Worker data freshness green — no trade if degraded |
| **G4** | ADR-014 structural risk checklist |
| **G5** | Order ticket cites cached `v2:dashboard:today` — not live LLM invention |
| **G6** | Agentic account only (Robinhood policy) |
| **G7** | Audit log: user, timestamp, tool, params hash, decision snapshot id |

Skip any gate → **rejected** for production write tools.

## Phased rollout R0–R3

| Phase | Capability | Invest AI surface |
|-------|------------|-------------------|
| **R0** | Read tools in dev | No trade button |
| **R1** | Read portfolio in settings | Holdings overlay |
| **R2** | Draft order from cached recommendation | User confirms in modal |
| **R3** | MCP place order after G1–G7 | Logged execution + receipt |

Cursor skills: `rh-mcp-read-*` allowed; `rh-mcp-trade-*` gated until R2. Env `XINGAI_MCP_TRADE_ENABLED=true` never defaults on.

## Decision Engine stays out of execution

Decision Engine **never** calls Robinhood MCP. It outputs recommendations only. Execution lives in Invest AI (or the user's agent environment) with audit.

## What we said no to

- Full auto-trader via MCP — liability and brand mismatch.
- MCP inside FastAPI request path — breaks cache boundary and audit.
- Wiki-only guidance — insufficient for enforcement.

**Further reading:** [June 24 Opportunity Radar](2026-06-24-xingai-opportunity-radar-agent-stack.md) · [MCP architecture best practices](2026-06-03-mcp-architecture-best-practices.md)
