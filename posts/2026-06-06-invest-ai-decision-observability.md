# Decision Observability: Making AI Signals Auditable

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `observability` `decision-events` `macro-radar` `invest-ai`  
**Also available:** [中文](2026-06-06-invest-ai-decision-observability.zh.md)

---

An AI investment dashboard should not only show an answer. It should show why the answer changed.

That is why Invest AI added decision observability: decision events, macro radar factors, cache freshness, and worker-owned explanations that can be traced back to structured fields.

## The problem

Without observability, a user sees:

```txt
Protect Capital
13 / 100
```

But they do not know whether that came from volatility, macro stress, weak breadth, stale data, or engine disagreement.

## The shape

Decision observability turns the payload into a timeline of causes:

- Consensus events.
- Macro radar events.
- Engine events.
- Signal candidates.
- Stale/degraded state.

These events are generated in the worker cache, not invented in the frontend.

## The UX rule

The top of the product stays decision-first. Details are progressive:

1. Header and hero card say what to do.
2. Event feed explains what changed.
3. Macro radar shows the factor layer.
4. Dashboard lets users inspect the full state.

## Takeaway

Observability is not only for operators. In decision products, observability is part of user trust.

**Further reading:** ADR-013 (`docs/adr/013-v11-decision-observability.md`).
