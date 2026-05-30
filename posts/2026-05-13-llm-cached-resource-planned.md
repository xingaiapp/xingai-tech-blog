# Treating LLM Output Like Cache Rows (Planned): Worker-Owned Inference

**Date:** May 13, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `architecture` `worker` `sqlite` `openai` `cost-optimization` `roadmap`  
**Also available:** [中文](2026-05-13-llm-cached-resource-planned.zh.md)
---

## Status: planned (not shipped in V1)

This post documents a **decision we accepted**, not something already running in production. It belongs in the same story as our CQRS market cache: **derived data should have one writer.**

Today, the FastAPI backend still calls OpenAI / Gemini / Ollama inside the request lifecycle (see [OpenAI-first routing](2026-05-13-openai-first-llm-routing.md)). That works for V1, but it creates five pressures as traffic grows:

1. **Duplicate spend** — ten users asking about the same symbol in one minute can mean ten identical model calls.
2. **Coupled failures** — upstream 429s surface as user-visible errors instead of stale-but-usable cache.
3. **Secrets on the hot path** — API keys live on the public-facing service.
4. **Heavier cold starts** — more imports on the API process.
5. **Half-applied CQRS** — market data already follows “worker writes, backend reads”; LLM results do not yet.

## The direction

**Move all LLM calls into the worker.** Persist analyses in SQLite like any other derived artifact. The backend becomes a **reader**: cache hit returns immediately; cache miss **enqueues** a job and returns a small “queued” envelope (with polling URL). Free-tier quotas stay enforced at the gateway — abuse should not enqueue a thousand jobs.

We plan **two phases**:

- **Phase A** — Non-streaming analyze path moves to enqueue + poll; streaming can follow a dedicated plan.
- **Phase B** — After the V2 hybrid pipeline (Gemini compress → OpenAI decide), streaming and multi-stage work naturally live in the worker anyway.

SQLite **WAL mode** + a bounded job table with **dedupe on `prompt_hash`** keeps concurrent reads cheap while the worker writes results.

## Why bother?

- **Cost** — dedupe and pre-warm hot symbols (watchlist, top signals) collapse redundant calls.
- **Resilience** — serve last good analysis with a `stale` flag when upstream is unhappy.
- **Security posture** — API keys migrate to the worker process only.

## Takeaway

“LLM as a service call inside the controller” is the fastest way to V1. “**LLM as cached rows with a single writer**” is the shape that survives real traffic and aligns with how we already treat market data.

**Further reading:** ADR-010 (`docs/adr/010-llm-as-cached-resource.md`).
