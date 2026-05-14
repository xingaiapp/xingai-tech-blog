# Shipping Invest AI V1: Runbook Thinking for Fly.io + Vercel

**Date:** May 13, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `deployment` `fly-io` `vercel` `devops` `runbook` `production`

---

## Why a runbook, not just an ADR

[ADR-004](2026-05-12-v1-hosting-fly-io.md) explains **why** we picked Fly.io for the Python side and Vercel for the Next.js side. It does not replace **copy-pasteable commands**, project names, smoke tests, and “do not deploy here” warnings.

During the first production push we almost pointed the Invest AI frontend at the **wrong Vercel project** — a reminder that architecture diagrams do not stop human mistakes. Operational docs belong **in the repo**, next to the code.

## What we standardized

- **Fly.io app** for API + worker on one machine, shared persistent volume for SQLite.
- **Vercel project** dedicated to Invest AI — explicitly **not** the same project that serves the main marketing site.
- **Canonical runbook path** in the monorepo: `docs/deploy/release-runbook.md` (command-level steps, rollback, smoke tests).

## Topology at a glance

```mermaid
flowchart LR
    BROWSER["Browser"]
    VERCEL["Vercel · Invest AI frontend"]
    FLY["Fly.io · API + worker + volume"]

    BROWSER --> VERCEL
    VERCEL -->|"rewrites /api to backend"| FLY
```

The mental model: **Vercel owns HTML and assets; Fly owns Python, the worker, and the database file.**

## What “done” looks like for a release

At minimum, from a clean laptop:

1. Health endpoints return 200.
2. Tickers endpoint returns data for a known symbol set.
3. `POST /api/v1/analyze` returns a structured payload with `provider: openai` when keys are configured — proving secrets and routing on the host.

Document the exact URLs, regions, and volume names in the runbook so the next deploy is boring.

## Follow-ups we track explicitly

- GitHub → Fly / Vercel auto-deploy when the team wants less CLI friction.
- Rotating example deployment IDs in the runbook so “current state” does not rot into “false history.”

## Takeaway

Pick your hosts with an ADR; **ship** with a runbook. One page of guarded commands saves more time than ten architecture diagrams the night before launch.

**Further reading:** ADR-011 (`docs/adr/011-production-release-runbook.md`) and `docs/deploy/release-runbook.md` in the Invest AI repository.
