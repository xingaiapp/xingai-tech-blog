# Structural Risks in AI Investing Products

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `risk` `ai-safety` `market-data` `llm` `invest-ai`  
**Also available:** [中文](2026-06-06-invest-ai-structural-risk-mitigations.zh.md)

---

The dangerous part of an AI investing product is not only a bad answer. It is a confident answer built on fragile structure.

Invest AI tracks three structural risks before execution-grade flows:

1. Single market-data source.
2. Confidence that measures correlated agreement, not calibrated accuracy.
3. LLM explanation drift.

## Data source risk

If every engine reads the same stale quote cache, the system can look internally consistent while being externally wrong.

The mitigation is not "just fetch live data in the API." That breaks the decision boundary. The mitigation is freshness gates, provider checks, heartbeat monitoring, and explicit degraded states.

## Confidence semantics

Engine agreement is useful. It is not the same as probability of profit.

If six engines are algebraic transforms of the same input family, high agreement mostly says the inputs point in one direction. It does not prove correctness.

## Explanation drift

LLM prose can sound better than the structured decision. That is exactly why it is risky.

For Invest AI, user-visible prose should either be template-first or pass a consistency check against the cached decision payload.

## Takeaway

Before adding broker sync or agentic workflows, name the structural risks. Then turn them into gates.

**Further reading:** ADR-014 (`docs/adr/014-structural-risk-mitigations.md`).
