# A Trading Gateway That Blocks Every Order (On Purpose)

**Date:** July 11, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** XingAI Robinhood MCP
**Tags:** `mcp` `robinhood` `agent-security` `human-in-the-loop` `governance` `adr`
**Also available:** [中文](2026-07-11-robinhood-mcp-gateway-fail-closed.zh.md)

---

[Invest AI ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md) defined seven gates (G1–G7) a trade order must clear before it reaches Robinhood's Agentic Trading MCP. Until this pass, none of them were code. The only thing standing between an agent and a live order was [`common-prompts.md`](2026-06-25-robinhood-mcp-execution-gates-adr-028.md) — a set of copy-paste prompt conventions asking the agent nicely to review before it places. That's a request, not a gate.

## Why a hook doesn't work here

`xingai-agent-firewall` gates tool calls with a Claude Code `PreToolUse` hook. Robinhood's Agentic Trading MCP is used from Cursor, Claude Desktop, ChatGPT, Codex, and Grok, per Robinhood's own docs — none of which share Claude Code's hook contract. A harness-specific interception point means N adapters for N harnesses. [ADR-001](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/001-mcp-gateway-proxy.md) moves the interception point instead: a local **MCP gateway proxy** the client connects to in place of `agent.robinhood.com` directly. Point any MCP-capable client at the gateway and the gate applies, regardless of which harness is asking.

## Reads pass through. Writes don't — not yet, not for anyone.

```
get_accounts, get_portfolio, review_equity_order   → straight to upstream, never gated
place_equity_order, cancel_equity_order            → G1-G7, then maybe upstream
```

Of the seven gates, three are self-contained enough to build without touching another repo:

- **G1** (human confirm) — a pending-approval queue, same shape as Agent Firewall's: the call blocks until a human runs `cli.py approve` or `deny`, or a timeout resolves it to deny.
- **G6** (Agentic account only) — the gateway checks the order's account against upstream's own `agentic_allowed` flag before forwarding, independent of whatever Robinhood enforces server-side.
- **G7** (audit ledger) — one row per write attempt, written before the forwarding decision, in the same schema Agent Firewall and Founder already use.

The other four — step-up auth, data freshness, the structural-risk checklist, and citing a cached decision snapshot instead of live LLM invention — need infrastructure that lives in `xingai-invest-ai`. This pass doesn't fake them. Each one rejects by name: `"G3 data freshness not wired — fail-closed"`. A write order only forwards if all seven pass, and four of them can't yet, by construction.

**That means no trade can succeed through this gateway today.** That's not a bug to rush past — it's the correct default for a tool sitting in front of a real brokerage account. The alternative — stubbing G2–G5 to "pass" so the checklist looks done — would have shipped a gate that's decoration, the exact failure this whole line of work exists to avoid.

## A bug the async/await model almost hid

The first draft reused Agent Firewall's `wait_for_resolution` — a blocking `time.sleep` poll loop — inside the gateway's `async def place_equity_order`. That blocks the entire event loop for the duration of the wait, serializing every other concurrent MCP request behind one pending approval. Fixed with an `asyncio.sleep`-based async variant used only by the gateway; the CLI keeps the sync version since it isn't inside an event loop. Both got tests, including one that resolves the approval from a concurrent coroutine mid-wait to prove the loop doesn't stall.

## Testing boundary

Every test — 24 of them — runs against `gateway/mock_upstream.py`, a fake Robinhood MCP server with fake accounts and fake orders, started as a real subprocess for the integration tests. Nothing in this repo's test suite has ever pointed at `https://agent.robinhood.com` or touched a real OAuth credential. Pointing the gateway at the real endpoint is a deliberate, separate action for whoever operates it — not something exercised or implied as safe here.

## Related

- [ADR-001: MCP Gateway Proxy](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/001-mcp-gateway-proxy.md)
- [Invest AI ADR-028: Robinhood MCP Execution Gates](2026-06-25-robinhood-mcp-execution-gates-adr-028.md)
- [Agent Firewall ADR-003: Approval Workflow + Decision Ledger](2026-07-05-agent-firewall-helpfulness-attack-surface.md)
- Pattern: [`agent-execution-gate`](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/agent-execution-gate.md)
- Enterprise: [Agent Governance Reference Architecture](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-05-agent-governance-reference-architecture.md)
