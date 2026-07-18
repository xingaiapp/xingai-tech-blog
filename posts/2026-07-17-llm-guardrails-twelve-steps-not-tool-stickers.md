# Twelve Steps Are Not Twelve Tool Logos

**Date:** July 17, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Enterprise AI POCs — LLM Guardrails & Monitoring](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/llm-guardrails-monitoring-poc)
**Tags:** `guardrails` `monitoring` `mcp` `rag` `governance` `education` `poc`
**Also available:** [中文](2026-07-17-llm-guardrails-twelve-steps-not-tool-stickers.zh.md)

---

Public posters love a clean ladder: Plan → Build → Validate → Operate, twelve boxes, each with a **Tools** row. LangChain here, LangSmith there, Docker at the end. Fine as a checklist. Terrible as an architecture.

We shipped a runnable POC that walks **all twelve steps** and refuses to treat those logos as the control plane.

## The pattern

```text
Plan     → use case + risk/policy before model choice
Build    → evidence RAG, prompt contract, input walls, MCP two-wall tools
Validate → output gates, Agent Run trace, eval / red-team flags
Operate  → continuous identity posture + Decision Ledger iterate
```

Invariant: **fail closed**. If input injection or a risky tool hits a wall, later steps are `skipped` — we do not pretend Deploy still “secured” the request.

## What we built

Path: `pocs/llm-guardrails-monitoring-poc/backend/pipeline.py`

- Deterministic mock model (no API key required for the classroom demo)
- Keyword RAG over two policy docs with an **evidence sufficiency** flag
- Input scan over **user + RAG + tool description** text (not jailbreak-only)
- Step 7 blocks `transfer_funds` via a simulated **MCP scope wall**
- Step 9 emits an Agent Run-shaped trace (goal → steps → model → outcome)
- Step 12 writes a ledger action: `ship_answer` or `escalate_human`

UI on port **8020** with four probes: happy path, injection, risky tool, weak evidence.

## What we did not do

- Live LLM providers or real vector DBs
- Real Entra / APIM / OAuth (see [claims-mcp-oauth-poc](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) for that)
- Durable workflow runtime for long MCP tools
- Production eval suites in CI

Those belong in later phases. This POC proves the **sequence**, not the cloud shopping list.

## Corrections vs the poster

| Poster habit | XingAI correction in the POC |
|---|---|
| Tools column = architecture | Walls and contracts; tools fill slots |
| Input guard = user jailbreak | All untrusted observations |
| Tool control = agent SDK logos | Scope wall + policy wall |
| Monitor = latency/cost only | Agent Run trace |
| Deploy last = security done | Auth posture from Plan; Deploy is continuous |

## Links

- POC: https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/llm-guardrails-monitoring-poc
- ADR-010: https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/010-llm-guardrails-monitoring-poc.md
- Design article: https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-17-llm-app-guardrails-plan-build-validate-operate.md
- Wiki critique: https://github.com/xingaiapp/xingai-ai-learning-wiki/blob/main/wiki/syntheses/llm-guardrails-monitoring-vs-xingai.md

## Disclaimer

Educational POC and post. Not production software, legal advice, or a security certification.
