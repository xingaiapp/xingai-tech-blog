# Research Plane vs Decision Plane (ADR-055)

**Date:** September 29, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** Invest AI  
**Tags:** `invest-ai` `evidence` `adr` `cqrs` `agentic-ai` `governance`  
**Also available:** [中文](2026-09-29-research-decision-plane-evidence-contract.zh.md)

---

## The demo that refused to lie

Prep for an Invest walkthrough wanted Map → Micron → 13F holdings. The Micron snapshot had no verifiable 13F citation. The run disclosed the gap and used NVIDIA for holdings instead.

That is the product rule in action: **No Citation, No Claim.** Evidence for one ticker cannot underwrite another.

## The architecture gap

[ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.md) already says the worker computes and the API only reads. It does not name the softer split:

- **Research Plane:** what does the evidence support?
- **Decision Plane:** what should we do given objectives and constraints?

Wanting a recommendation does not strengthen weak evidence. A cited holding does not by itself mean “this user should buy.”

## Evidence Contract (planned)

[ADR-055](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/055-research-decision-plane-evidence-contract.md) accepts the pattern and marks it **planned**. Research should hand Decision a package: claim, source passage, dates, reported/derived/inferred, verification status, unresolved gaps — and **preserve** missing fields.

What is **not** claimed: a deployed contract schema, an enforced Research→Decision gate, lineage metrics, or accuracy gains.

Live cousins: public `/ai-map` citations, ADR-054 hiding unsourced landing cards, Growth Engine facts-only + human gate (ADR-050).

Longer teaching write-up: [enterprise design article](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-09-29-research-decision-plane-evidence-contract.md).

## Takeaway

Keep the CQRS line. Add an evidence handoff that can reject. When the source stops, show where — don’t narrate past it.
