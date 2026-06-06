# Shipping Research AI: Vercel for UI, Fly for Worker + SQLite

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `fly-io` `vercel` `deployment` `sqlite` `worker`  
**Also available:** [中文](2026-06-06-research-ai-fly-vercel-ship.zh.md)

---

Research AI reuses the Invest AI deployment shape:

| Layer | Where |
|-------|--------|
| Next.js | Vercel — repo root, auto-deploy on `main` |
| FastAPI + worker | Fly.io — `xingai-research-ai-api` |
| Cache + rate limits | Fly volume `researchai_data` → `/data` |

One Docker image starts both processes via `scripts/fly-start.sh`. GitHub Actions deploys when backend paths change.

## Wiring the frontend

Vercel sets:

```txt
RESEARCH_API_URL=https://xingai-research-ai-api.fly.dev
NEXT_PUBLIC_SITE_URL=https://research.xingai.app
```

Next.js `/api/research*` routes proxy to Fly. Trending chips hit `/api/trending` with timeout fallback to static seeds.

## What we skipped

- Separate worker machine — colocated for MVP cost  
- Redis — SQLite KV is enough at current scale (ADR-003)  

## Ops checklist

- Fly secrets: `OPENAI_API_KEY`  
- Health: `/api/v2/health`  
- Volume attached before first deploy  

Same playbook as [production runbook for Invest AI](2026-05-13-production-runbook-fly-vercel.md), different app name and cache keys.

**Further reading:** `xingai-research-ai/docs/deploy/fly-io.md`
