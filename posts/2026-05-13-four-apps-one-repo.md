# Four Runtimes, One Repo: Why We Skipped Nx (For Now)

**Date:** May 13, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `monorepo` `nextjs` `fastapi` `developer-experience` `solo-dev`

---

## What lives in the repo

Invest AI is not one app — it is **four** top-level packages:

| Package | Role | Typical host |
|--------|------|----------------|
| `stock-ai-front-end` | Next.js dashboard | Vercel |
| `stock-ai-back-end` | FastAPI API | Fly.io |
| `stock-ai-worker` | Python refresh loop | Fly.io (same machine as API) |
| `stock-ai-monitor` | Internal ops Next.js | Localhost |

Plus `docs/` for ADRs, bug writeups, and legal strategy notes.

## Why one repo

- **One PR for cross-cutting changes** — e.g. rate limits touched backend, frontend, monitor, and docs together.
- **One clone for onboarding** — `git clone` + monitor `setup:stack` script → full stack.
- **API contract visibility** — frontend and backend diffs live in the same review.

## Why no Turborepo / Nx (yet)

We have **four** packages and two languages. The heavy monorepo tools shine when you have dozens of packages, shared TS types, and CI builds measured in tens of minutes. Today, `cd stock-ai-front-end && npm test` is fine.

Principle: **add tooling when pain is real**, not when blogs say you should.

## Rules that keep the layout sane

- Each folder owns its own `package.json` or `requirements.txt`.
- No cross-language imports — only HTTP between TS and Python.
- No shared library until the **third** time we copy the same logic and regret it.
- Commit prefixes: `frontend:`, `backend:`, `worker:`, `monitor:`, `docs:`.

## When we would split

Separate repos make sense when a different team owns a service, when a package becomes a **public SDK**, or when compliance demands isolated access. None of those are true on day one.

## Takeaway

A **folder-per-runtime monorepo** without meta-build tooling is underrated for solo and small teams. You get most of the coordination wins with almost none of the Nx learning curve — and you can always adopt tooling the day CI actually hurts.

**Further reading:** ADR-009 (`docs/adr/009-monorepo-layout.md`).
