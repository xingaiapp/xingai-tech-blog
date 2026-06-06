# SQLite CQRS for Research AI: Same Keys, Same Fly Volume

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `cqrs` `sqlite` `worker` `cache` `fly-io`  
**Also available:** [中文](2026-06-07-research-ai-sqlite-cqrs-cache.zh.md)

---

We did not invent a new cache story for Research AI. We copied Invest AI’s **one writer, many readers** SQLite pattern and renamed the keys.

## Key layout

| Key | Writer | Reader |
|-----|--------|--------|
| `v2:research:{hash}` | worker pipeline | FastAPI, Next proxy |
| `v2:research:trending` | cache warmer | `/api/trending` |
| `research:pending:queue` | API enqueue | worker drain |
| `worker:research_cache:heartbeat` | worker | ops |
| `user:v1:library:{token}` | account sync | API |

File lives on Fly volume `researchai_data` → `/data/research.db`. WAL mode. ~24h TTL on research rows.

## Why not Redis for MVP

Extra service, extra bill, extra thing to debug at 2 a.m. SQLite on a volume worked for Invest; it works here until QPS forces a migration (documented in ADR-003).

## Rate limits get their own DB

Usage metering uses `usage_limits.db` — same lesson as Invest: don’t mix high-churn quota writes with cache reads on one file.

**Further reading:** ADR-003 + [CQRS with SQLite (Invest post)](2026-05-13-cqrs-sqlite-worker-writes.md)
