# Agentic Does Not Mean Autonomous Trading

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `agentic-ai` `mcp` `product-boundary` `invest-ai` `safety`  
**Also available:** [中文](2026-06-06-invest-ai-v4-agentic-platform-boundary.zh.md)

---

"Agentic" is an overloaded word. In an investing product, it needs a boundary.

For Invest AI V4, agentic means:

```txt
Observe -> trigger -> draft -> explain -> user approves
```

It does not mean:

```txt
AI places trades
```

## The product direction

V4 is the planned shift from reactive analysis to proactive assistance:

- Watch rules.
- Portfolio context.
- Triggered recommendations.
- Push/email notifications.
- Audit logs.
- Paid accounts.

That is a real product step. It is also a real risk step.

## The boundary

The platform may watch and suggest. The user decides.

Broker integrations are read-only by default. Every recommendation is auditable. Legal review is a launch gate. Structural risk mitigations are a platform gate.

## Why write this before code

Without a boundary ADR, "agentic" becomes a vibe. With a boundary ADR, it becomes a contract.

The contract keeps the team from accidentally crossing into trade execution, custody, tax advice, or fiduciary positioning.

## Takeaway

In finance, agentic product design starts with what the agent is not allowed to do.

**Further reading:** ADR-015 (`docs/adr/015-v4-agentic-platform.md`).
