# After Fail-Closed: Robinhood MCP Gates, Freshness, Step-Up, and Why It Still Does Not Autotrade

**Date:** July 18, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** XingAI Robinhood MCP + Invest AI  
**Tags:** `mcp` `robinhood` `execution-gates` `step-up-auth` `data-freshness` `decision-boundary` `adr`  
**Also available:** [中文](2026-07-18-robinhood-mcp-gates-after-fail-closed.zh.md)

---

On July 11, the Robinhood MCP gateway story was simple: the gateway blocked every write order on purpose. G1, G6, and G7 were real code. G2 through G5 were named, explicit fail-closed gates.

That was the right first version, but it became stale almost immediately.

By the end of that same day, two of the originally unwired gates were no longer placeholders:

- **G3 data freshness** now calls Invest AI's worker freshness endpoint and fails closed if market data is stale or unreachable.
- **G2 step-up auth** now reuses Invest AI's existing admin Email OTP session check for larger or unknown-value actions in the current single-operator deployment.

The headline did not change:

```text
The gateway still does not autotrade.
```

What changed is more precise and more important:

```text
It no longer blocks because every dependency is missing.
It blocks because the remaining execution-grade evidence is not ready.
```

## The Gate State After the First Follow-Up

[Invest AI ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md) defines seven gates before any Robinhood write tool can be forwarded.

The gateway's current state is:

| Gate | Meaning | Current state |
|---|---|---|
| G1 | Human confirms the write | Wired |
| G2 | Step-up auth for higher-risk actions | Wired for single-operator mode |
| G3 | Invest AI worker data is fresh | Wired |
| G4 | Structural-risk checklist is green | Still blocks |
| G5 | Order cites cached decision evidence | Still blocks until citation inputs are complete |
| G6 | Agentic account only | Wired |
| G7 | Audit ledger | Wired |

That is a different system from the July 11 morning version. It is not "seven boxes on a diagram." Five gates now have code behind them. Two gates still stop execution.

That distinction matters because fail-closed is only useful if the failure reason keeps getting more specific. "Everything blocks because nothing is wired" is a bootstrap state. "This blocks because the decision evidence is not execution-grade" is a product boundary.

## G3: Freshness Has to Be Checked at Decision Time

The gateway did not need Invest AI to build a new freshness endpoint. It already existed:

```text
GET /api/v2/system/data-freshness
```

That endpoint reports the worker heartbeat, stale state, provider errors, symbol count, and calculation mode. The gateway now fetches it during write evaluation and treats any failure as a denial:

- stale data: deny
- endpoint unreachable: deny
- malformed response: deny
- fresh data: pass G3

The subtle part is timing. G3 is checked after the human approval wait, not before it. A person can take minutes to approve an order. If freshness were fetched before G1, the user could approve against a snapshot that went stale during the approval window.

So G3 asks:

```text
Is the decision system fresh now, at the moment this write would move forward?
```

That one word, "now," is the difference between a dashboard check and an execution gate.

## G2: Step-Up Auth Is Scoped, Not Pretend-General

The gateway did not build a new multi-user auth system. It reused Invest AI's existing admin Email OTP session check.

That is intentionally narrow. Today this is a single-operator gateway. It is not a general consumer brokerage product, and the auth design should not pretend otherwise.

For the current deployment:

- low-value actions can rely on G1 human confirmation
- higher-value orders require a valid step-up session
- unknown-value actions, such as cancel requests where the gateway does not know the dollar amount, require step-up
- any failed or unreachable session check denies the write

This is not the final auth model for a multi-user product. It is the correct model for the current operator surface. A shared or remote deployment would need user-scoped step-up, secret storage, account ownership checks, and a different threat model.

## G4 and G5 Still Stop the Trade

The remaining blockers are the ones that should remain blockers.

**G4 asks:** are the structural-risk mitigations green?

That includes things like data-source resilience, confidence language that does not imply probability of profit, explanation consistency, and execution readiness. Invest AI has made progress here, but not enough to call the product execution-grade.

**G5 asks:** can the order cite a cached decision snapshot instead of a live LLM invention?

This is the same boundary that runs through Invest AI's worker/cache architecture: the worker computes, the API reads, the frontend renders. A trade ticket must cite cached evidence that already exists in the decision system. It must not be invented inside the gateway or patched together from a live prompt.

That is why the newer Today Intelligence work matters. Invest AI now has a worker-owned daily synthesis contract:

```text
GET /api/v2/intelligence/today
```

It combines earnings, macro, news flow, market state, portfolio risk readiness, watch items, and decision events into a cached payload. It is explicitly **research-ready, not execution-ready** when live earnings, provider-backed news, or real broker portfolio risk are missing.

That is the right direction for G5. Not "the AI said buy." A citation should look more like:

```text
decision_snapshot_id
data_freshness
readiness
risk_budget
source_refs
watch_item_reason
```

Until those fields are complete enough for an order draft, G5 should keep blocking.

## The Product Lesson: Do Not Commercialize the Bot Fantasy First

The engineering boundary and the product boundary now point in the same direction.

Invest AI's near-term value is not autonomous execution. It is daily decision intelligence:

- what changed
- what matters
- what risk changed
- what sources are fresh
- what is missing
- what should be watched

The gateway can eventually draft orders, but it should only do that after the intelligence layer can explain why the action is even being considered and why it is safe to show as an execution-adjacent workflow.

That is slower than a demo where an agent says "buy 10 shares" and calls a tool. It is also much more likely to survive contact with real money, real users, and real compliance review.

## A Better Stale Narrative

The stale version of the story was:

```text
We built a gateway that blocks every order because most gates are not wired.
```

The updated version is:

```text
We built a gateway where read tools pass through, write tools cross real gates, and the remaining blockers are the exact evidence gaps that should prevent execution.
```

That is a healthier architecture. The goal is not to make every gate green as quickly as possible. The goal is to make each gate tell the truth.

## Related

- [Invest AI ADR-028: Robinhood MCP Execution Gates](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md)
- [Invest AI ADR-012: Decision Cache Boundary](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.md)
- [Invest AI ADR-034: Today Intelligence Cache Contract](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/034-today-intelligence-cache-contract.md)
- [Robinhood MCP ADR-001: MCP Gateway Proxy](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/001-mcp-gateway-proxy.md)
- [Robinhood MCP ADR-002: G3 Data Freshness Wired](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/002-g3-data-freshness-wired.md)
- [Robinhood MCP ADR-003: G2 Step-Up Wired for Single-User Operation](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/003-g2-step-up-wired-single-user.md)
- Earlier post: [A Trading Gateway That Blocks Every Order (On Purpose)](2026-07-11-robinhood-mcp-gateway-fail-closed.md)
- Follow-up: [The Trading UI Still Does Not Trade](2026-07-14-robinhood-control-plane-http-api.md)

