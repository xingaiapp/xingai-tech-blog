# Staged SSE Without Spoilers: Research AI Wait UX

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `sse` `streaming` `ux` `nextjs` `worker`  
**Also available:** [中文](2026-06-07-research-ai-sse-streaming-wait-ux.zh.md)

---

Cache miss means queue + worker. Users wait. A spinner alone feels broken; streaming half a verdict would **lie**.

## What we stream

Four **stage labels** over SSE:

```txt
thinking → scoring → sourcing → synthesizing → done
```

`done` carries the full cached JSON — same shape as a cache hit. Stages are cosmetic progress, not partial decisions.

## Where it runs

- `/result` — single topic  
- `/compare` — two parallel EventSources  
- Next.js `/api/research/stream` proxies Fly when configured  

On stream failure, client falls back to POST `/api/research`.

## Rule

If the UI shows a verdict before `done`, we broke ADR-002. Progress UI is allowed; decision UI waits for the worker row.

**Further reading:** ADR-008 in `xingai-research-ai/docs/adr/`
