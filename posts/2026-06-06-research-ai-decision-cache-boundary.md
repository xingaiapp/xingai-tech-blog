# The Learning Decision Boundary: Worker Owns Research AI Verdicts

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `decision-cache` `worker` `fastapi` `learning` `cqrs`  
**Also available:** [中文](2026-06-06-research-ai-decision-cache-boundary.zh.md)

---

Research AI answers a different question than Google:

> *Should I spend time on this topic tonight?*

That answer — **Learn Now**, **Learn Later**, **Skip**, or **Delegate** — must not drift between layers.

## The rule

```txt
research-ai-worker     → run_pipeline(), write v2:research:{hash}
research-ai-back-end   → cache_get, enqueue, rate limits
research.xingai.app    → render cached fields
```

We copied the lesson from Invest AI (ADR-012): **one decision engine, one cache row.**

## What stays in the worker

- Verdict and one-sentence summary  
- Sub-scores and **Learning ROI** (deterministic formula — see sibling post)  
- 30-minute route, takeaways, ranked sources  
- Discussions + knowledge graph enrichments  
- Trending topic warm list  

## What FastAPI may do

Read SQLite KV, validate JSON, attach freshness metadata, enforce **3 live runs/day** for anonymous users, sync saved library rows.

It does **not** call OpenAI to “fix” a cache miss on the request thread.

## Why it matters for learning products

Without the boundary, a compare page could rank topic A above topic B using frontend math while the result page says the opposite. Share links would lie.

Users are allocating **attention**, not money — but the trust problem is the same.

**Further reading:** `xingai-research-ai/docs/adr/002-decision-cache-boundary.md`
