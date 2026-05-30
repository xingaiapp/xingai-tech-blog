# Splitting the Paper Lab: Why InvestSim Lives in Its Own Repo

**Date:** May 14, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [InvestSim / invest-performance-sim](https://github.com/xingaiapp/invest-performance-sim) (private)  
**Tags:** `nextjs` `prisma` `sqlite` `paper-trading` `invest-ai` `architecture` `vercel` `decision-ui`  
**Also available:** [中文](2026-05-14-invest-performance-sim-paper-lab-own-repo.zh.md)
---

## The product question

[Invest AI](https://xingai.app/apps/invest-ai) answers “what does today look like?” — signals, dashboard context, and (eventually) richer decision surfaces. A **different** question sits next to it:

> If we **mechanically** applied a small set of rules to a **daily highlighted idea**, with **fixed** starting capital and an **auditable** fill ledger, what does the **equity curve** look like?

That is **research and education**, not brokerage. It deserves its **own** deployable surface area: **InvestSim** (`invest-performance-sim`).

## Why not nest inside Invest AI’s monorepo

Invest AI’s repo is already **four** runtimes (see [*Four Runtimes, One Repo*](./2026-05-13-four-apps-one-repo.md)). Adding a fifth package would:

- Couple **release cadence** of a consumer dashboard to a **simulation lab**.
- Invite accidental imports of Python-only paths or worker env assumptions.
- Make “open source / private boundary” blur (sim may stay private longer).

Instead, InvestSim is a **standalone** Next.js + Prisma app that talks to Invest AI **only over HTTPS** (`GET /api/v2/signals/top` for v0 ingest).

## Stack choices (boring on purpose)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| UI | Next.js App Router | One deploy target; server components for dashboard reads. |
| Data | Prisma + SQLite (local) | Fast local loop; production is a **deployment** problem (Turso / Postgres), not a philosophy problem. |
| Chart | Recharts | Good enough for a credibility curve; no trading terminal fantasy. |
| Auth (v0) | Single shared token + httpOnly cookie | Internal dashboard; swap for OAuth when/if this goes wider. |

## Decision-first UI

We optimized for **three seconds of comprehension**:

1. **What does the AI pick say today?** (symbol, confidence, action language)  
2. **Am I winning on the simulated position?** (P&amp;L hero)  
3. **Is the system credible over time?** (equity + fills)

Specs live beside the code in `docs/UI-MOCK-FIGMA-LEVEL.md` and `docs/UX-LAYOUT.md`.

## Honest limitations (v0)

- **Engine** (auto open/close, rotates, stops) is **not** shipped yet — seed + manual ingest prove the spine.
- **SQLite on Vercel** is not a durability story without **libSQL / Postgres**.
- **Not investment advice** — same disclosure posture as Invest AI, duplicated in UI.

## What we learned shipping the split early

- **Private repo + Vercel** is a comfortable default for an internal lab; see [*Vercel Git Auto-Deploy…*](./2026-05-14-vercel-private-repos-git-auto-deploy.md).
- **Cron + bearer secret** keeps ingest cheap and explicit; dashboard users never see cron keys.

## Next engineering chapters

1. **Rules engine** with versioned snapshots + idempotent day jobs.  
2. **Hosted SQL** + migration discipline.  
3. **Contract tests** for Invest AI JSON drift (fixtures in CI).
