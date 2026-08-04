# Human Overlay Cache: Review Writes That Survive Re-Verify

**Date:** August 4, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** XingAI Engineering System · Evidence Engine  
**Tags:** `patterns` `worker-cache` `human-in-the-loop` `evidence` `decision-boundary`  
**Also available:** [中文](2026-08-04-human-overlay-cache-pattern.zh.md)

---

## The bug that looks like a feature

You ship a verifier. Dashboard gets Accept / Reject. Engineer patches the verify JSON with `review=accepted`. Next CLI run overwrites the cache. Human work vanishes. Trust evaporates.

## The rule

Keep human decisions in **separate cache keys** from worker payloads.

```txt
Worker writes   →  v1:verify:{id}
Human writes    →  v1:review:{id}
GET merge       →  read both, overlay onto response
Re-run worker   →  overwrites verify; review key survives
```

API may write review / skill approve-rollback / auth metadata. API must not fetch URLs, call LLMs, or rewrite gated metrics.

Validated by Evidence Engine ADR-009. Pattern file: `xingai-engineering-system/patterns/human-overlay-cache.md`.

## Common mistakes

- PATCH verify in place
- Show Accept on a static demo that cannot write
- Auto-promote approved skills into extraction code
- Fold overlay fields into EEE denominators

## Takeaway

Human review is product state, not a verify field. Separate keys keep Principle 1 and audit trails intact.

**Further reading:** Evidence Engine ADR-009 · engineering-system pattern `human-overlay-cache`.
