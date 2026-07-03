# Research-to-Startup Agent: Four-Artifact Pipeline

**Date:** July 3, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [XingAI Research-to-Startup Agent](https://github.com/xingaiapp/xingai-research-startup-agent)
**Tags:** `research-ai` `startup` `gpt-4o` `worker-cache` `pipeline` `prd`
**Also available:** [中文](2026-07-03-research-startup-agent-four-artifact-pipeline.zh.md)

---

Reading AI papers is easy. Knowing what to build from them is hard.

The Research-to-Startup Agent takes one URL — a paper, a blog post, an announcement — and produces four artifacts: a technical insight summary, a startup idea, a full PRD, and a Cursor/Lovable build prompt. One input, four outputs, ready to build.

## The Pipeline

```
URL
  ↓  fetch_url_content()      — HTTP GET, strip HTML, first 8k chars
  ↓  call_openai(insight)     — extract 3–5 bullet technical contribution
  ↓  call_openai(idea)        — one startup idea that commercializes this tech
  ↓  call_openai(prd)         — Problem / Solution / Metrics / MVP / Risk
  ↓  call_openai(build_prompt)— one-paragraph Cursor/Lovable/Bolt prompt
  ↓  write_cache()            — SQLite WAL, keyed by SHA-256(url)[:16]
```

Four sequential LLM calls. Total: 15–40 seconds on first run. Instant on repeat visits.

## Why Sequential, Not Parallel

Each artifact depends on the previous one:

- The startup **idea** is grounded in the **insight** — otherwise the LLM might generate a generic startup unrelated to the paper's actual contribution.
- The **PRD** is grounded in the **idea** — it fleshes out the specific product, not a generic use of the technology.
- The **build prompt** is grounded in the **PRD** — it tells the AI coding assistant to build *this* MVP, not something generic.

Parallel calls would produce four independent artifacts that don't reference each other. The chain is the feature.

## The Cache Pattern

Same as Invest AI (ADR-008) and Meal AI (ADR-001): worker writes, FastAPI reads.

```
POST /api/startup/generate  →  worker runs pipeline → status="ready"
GET  /api/startup?url=...   →  FastAPI reads cache  → returns artifacts
```

Cache key: `SHA-256(url)[:16]`. No TTL — a paper's technical contribution doesn't change. Manual bust via `POST /api/startup/regenerate` (admin only).

SQLite WAL mode. Single writer (worker process). FastAPI reads concurrently without blocking. Exact same PRAGMA setup as `db_init.py` in Invest AI:

```python
conn.execute("PRAGMA journal_mode = WAL")
conn.execute("PRAGMA busy_timeout = 5000")
conn.execute("PRAGMA synchronous = NORMAL")
```

## Decision Ledger (ADR-003)

Every generated startup plan writes a decision row:

```json
{
  "product": "research-startup-agent",
  "domain": "startup-plan/paper",
  "question": "What startup can I build from: https://arxiv.org/...",
  "recommendation": "<first 500 chars of the idea>",
  "confidence": 0.65,
  "action_taken": null
}
```

`confidence: 0.65` is a flat base — startup ideas from papers are speculative. It rises when `action_taken` gets updated ("I'm building this"). That update is what the Feedback Loop Engine will eventually learn from.

## What Makes This Different from Research AI

| | Research AI | Research-to-Startup |
|---|---|---|
| Input | Topic | Specific URL |
| Output | Learning path | 4 startup artifacts |
| User intent | Learn a technology | Build something from it |
| LLM calls | 1–2 (topic summary) | 4 (chained pipeline) |
| Cache key | user + topic | URL hash |

Same XingAI architecture pattern. Different product.

## Running It

```bash
# Generate from a paper URL
OPENAI_API_KEY=sk-... python worker/worker.py \
  --url "https://anthropic.com/news/claude-science-ai-workbench"

# Run as FastAPI server
python worker/worker.py --serve
# POST /api/startup/generate  {"url": "..."}
# GET  /api/startup?url=...
```

**Further reading:** [ADR-001 Repo Boundary](https://github.com/xingaiapp/xingai-research-startup-agent/blob/main/docs/adr/001-repo-boundary.md) · [ADR-002 Worker Cache](https://github.com/xingaiapp/xingai-research-startup-agent/blob/main/docs/adr/002-worker-cache.md) · [ADR-003 Decision Ledger](https://github.com/xingaiapp/xingai-research-startup-agent/blob/main/docs/adr/003-decision-ledger.md)
