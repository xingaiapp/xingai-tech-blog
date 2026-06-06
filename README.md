# XingAI Tech Blog

Technical deep dives, architecture decisions, and engineering notes from the [XingAI](https://xingai.app) team.

> We build focused AI decision systems for everyday life. This repo documents **how** we build them.

**Bilingual posts:** Each article is **English** (`.md`) + **中文** (`.zh.md`) — [convention](docs/BILINGUAL-POSTS.md).

## Posts

| Date | Title | Project | Tags |
|------|-------|---------|------|
| 2026-06-07 | [Shipping SEO and AEO on Research AI (Single URL, Three Locales)](posts/2026-06-07-research-ai-seo-aeo-ship.md) · [中文](posts/2026-06-07-research-ai-seo-aeo-ship.zh.md) | Research AI | `seo` `aeo` `llms-txt` `json-ld` `nextjs` |
| 2026-06-07 | [Four Layers of “Not Professional Advice” for a Learning AI](posts/2026-06-07-research-ai-legal-disclaimer-layers.md) · [中文](posts/2026-06-07-research-ai-legal-disclaimer-layers.zh.md) | Research AI | `legal` `disclaimers` `product` `compliance` `i18n` |
| 2026-06-07 | [Staged SSE Without Spoilers: Research AI Wait UX](posts/2026-06-07-research-ai-sse-streaming-wait-ux.md) · [中文](posts/2026-06-07-research-ai-sse-streaming-wait-ux.zh.md) | Research AI | `sse` `streaming` `ux` `nextjs` `worker` |
| 2026-06-07 | [Three Live Runs a Day: Research AI Free Tier on Top of Cache](posts/2026-06-07-research-ai-free-tier-three-live-runs.md) · [中文](posts/2026-06-07-research-ai-free-tier-three-live-runs.zh.md) | Research AI | `rate-limiting` `sqlite` `cost-control` `product` `cache` |
| 2026-06-07 | [SQLite CQRS for Research AI: Same Keys, Same Fly Volume](posts/2026-06-07-research-ai-sqlite-cqrs-cache.md) · [中文](posts/2026-06-07-research-ai-sqlite-cqrs-cache.zh.md) | Research AI | `cqrs` `sqlite` `worker` `cache` `fly-io` |
| 2026-06-07 | [Decision Board, Not Chatbot: Why Research AI Ships One Verdict](posts/2026-06-07-research-ai-decision-board-not-chatbot.md) · [中文](posts/2026-06-07-research-ai-decision-board-not-chatbot.zh.md) | Research AI | `decision-system` `product` `learning` `ux` `architecture` |
| 2026-06-06 | [Google OAuth for Research AI: How the Sign-In Loop Actually Works](posts/2026-06-06-research-ai-google-oauth-setup.md) · [中文](posts/2026-06-06-research-ai-google-oauth-setup.zh.md) | Research AI | `oauth` `google-cloud` `next-auth` `vercel` `auth` `runbook` |
| 2026-06-06 | [The Learning Decision Boundary: Worker Owns Research AI Verdicts](posts/2026-06-06-research-ai-decision-cache-boundary.md) · [中文](posts/2026-06-06-research-ai-decision-cache-boundary.zh.md) | Research AI | `decision-cache` `worker` `fastapi` `learning` `cqrs` |
| 2026-06-06 | [One Pipeline, One ROI Number: How Research AI Scores a Topic](posts/2026-06-06-research-ai-learning-roi-pipeline.md) · [中文](posts/2026-06-06-research-ai-learning-roi-pipeline.zh.md) | Research AI | `openai` `worker` `roi` `decision-system` `json` |
| 2026-06-06 | [Shipping Research AI: Vercel for UI, Fly for Worker + SQLite](posts/2026-06-06-research-ai-fly-vercel-ship.md) · [中文](posts/2026-06-06-research-ai-fly-vercel-ship.zh.md) | Research AI | `fly-io` `vercel` `deployment` `sqlite` `worker` |
| 2026-06-03 | [MCP Architecture: Connection Patterns and Auth That Hold Up in Production](posts/2026-06-03-mcp-architecture-best-practices.md) · [中文](posts/2026-06-03-mcp-architecture-best-practices.zh.md) | XingAI Platform | `mcp` `architecture` `auth` `oauth` `zero-trust` `agents` |
| 2026-06-02 | [Prompt Rules That Stop the Model From Guessing Tickers on Blurry Screenshots](posts/2026-06-02-t-today-prompt-honesty-screenshot-vision.md) · [中文](posts/2026-06-02-t-today-prompt-honesty-screenshot-vision.zh.md) | T Today | `openai` `prompt-engineering` `vision` `json` `honesty` |
| 2026-06-01 | [Two Safety Nets Before Push: Husky pre-push and `npm run check`](posts/2026-06-01-t-today-husky-pre-push-and-check.md) · [中文](posts/2026-06-01-t-today-husky-pre-push-and-check.zh.md) | T Today | `husky` `git-hooks` `typescript` `developer-experience` |
| 2026-05-31 | [One Foundation Rule for Every XingAI Product: Mobile Chrome, i18n, Legal, SEO, and AEO](posts/2026-05-31-xingai-foundation-mobile-i18n-seo-aeo.md) · [中文](posts/2026-05-31-xingai-foundation-mobile-i18n-seo-aeo.zh.md) | XingAI Platform | `platform` `mobile-first` `i18n` `seo` `aeo` `legal` `cursor` |
| 2026-05-30 | [Rules First, AI Second: T Today’s Two-Layer Decision Engine](posts/2026-05-30-t-today-risk-decision-engine.md) · [中文](posts/2026-05-30-t-today-risk-decision-engine.zh.md) | T Today | `architecture` `decision-system` `paper-trading` `openai` `adr` |
| 2026-05-30 | [When Bilingual JSON Looks Fine in the Network Tab but Empty in the UI](posts/2026-05-30-t-today-bilingual-advisory-json.md) · [中文](posts/2026-05-30-t-today-bilingual-advisory-json.zh.md) | T Today | `openai` `json` `i18n` `bugfix` `vision` |
| 2026-05-30 | [Opening T Today to Guests — Three Free AI Runs, No Login Wall](posts/2026-05-30-t-today-guest-access-and-ai-quotas.md) · [中文](posts/2026-05-30-t-today-guest-access-and-ai-quotas.zh.md) | T Today | `auth` `rate-limiting` `nextjs` `product` |
| 2026-05-20 | [Prompt Engineer vs Context Engineer vs Harness Engineer](posts/2026-05-20-prompt-context-harness-engineering.md) · [中文](posts/2026-05-20-prompt-context-harness-engineering.zh.md) | XingAI Platform | `ai-engineering` `prompt-engineering` `context-engineering` `harness-engineering` |
| 2026-05-15 | [InvestSim Becomes a Live Paper Engine](posts/2026-05-15-investsim-live-paper-engine.md) · [中文](posts/2026-05-15-investsim-live-paper-engine.zh.md) | InvestSim | `paper-trading` `turso` `vercel-cron` `invest-ai` `simulation` `adr` |
| 2026-05-14 | [Splitting the Paper Lab: Why InvestSim Lives in Its Own Repo](posts/2026-05-14-invest-performance-sim-paper-lab-own-repo.md) · [中文](posts/2026-05-14-invest-performance-sim-paper-lab-own-repo.zh.md) | InvestSim | `nextjs` `prisma` `sqlite` `paper-trading` `invest-ai` `architecture` `vercel` |
| 2026-05-14 | [Vercel Git Auto-Deploy Is Not Limited to Public Repositories](posts/2026-05-14-vercel-private-repos-git-auto-deploy.md) · [中文](posts/2026-05-14-vercel-private-repos-git-auto-deploy.zh.md) | Platform | `vercel` `github` `deployment` `private-repository` `devops` |
| 2026-05-13 | [Shipping Invest AI V1: Runbook Thinking for Fly.io + Vercel](posts/2026-05-13-production-runbook-fly-vercel.md) · [中文](posts/2026-05-13-production-runbook-fly-vercel.zh.md) | Invest AI | `deployment` `fly-io` `vercel` `devops` `runbook` |
| 2026-05-13 | [Treating LLM Output Like Cache Rows (Planned): Worker-Owned Inference](posts/2026-05-13-llm-cached-resource-planned.md) · [中文](posts/2026-05-13-llm-cached-resource-planned.zh.md) | Invest AI | `architecture` `worker` `sqlite` `openai` `roadmap` |
| 2026-05-13 | [Four Runtimes, One Repo: Why We Skipped Nx (For Now)](posts/2026-05-13-four-apps-one-repo.md) · [中文](posts/2026-05-13-four-apps-one-repo.zh.md) | Invest AI | `monorepo` `nextjs` `fastapi` `developer-experience` |
| 2026-05-13 | [CQRS with SQLite: One Writer, Many Readers, No Drama](posts/2026-05-13-cqrs-sqlite-worker-writes.md) · [中文](posts/2026-05-13-cqrs-sqlite-worker-writes.zh.md) | Invest AI | `cqrs` `sqlite` `worker` `fastapi` `cache` |
| 2026-05-13 | [Why We Flipped V1 Routing to OpenAI-First (and What Comes Next)](posts/2026-05-13-openai-first-llm-routing.md) · [中文](posts/2026-05-13-openai-first-llm-routing.zh.md) | Invest AI | `llm` `openai` `gemini` `ollama` `routing` |
| 2026-05-13 | [Capping Free-Tier AI Calls Without Slowing Down Development](posts/2026-05-13-free-tier-ai-rate-limits.md) · [中文](posts/2026-05-13-free-tier-ai-rate-limits.zh.md) | Invest AI | `rate-limiting` `sqlite` `cost-control` `openai` |
| 2026-05-13 | [Five Layers of “Not Investment Advice” for an AI Finance Product](posts/2026-05-13-legal-disclaimers-five-layers.md) · [中文](posts/2026-05-13-legal-disclaimers-five-layers.zh.md) | Invest AI | `legal` `disclaimers` `product` `compliance` |
| 2026-05-12 | [Hosting an AI Side Project for $0: How We Picked Fly.io for Invest AI V1](posts/2026-05-12-v1-hosting-fly-io.md) · [中文](posts/2026-05-12-v1-hosting-fly-io.zh.md) | Invest AI | `deployment` `fly-io` `vercel` `cost-optimization` |
| 2026-05-12 | [The Monitor That Wouldn't Stop Refreshing — A React Effect Loop Postmortem](posts/2026-05-12-monitor-render-loop.md) · [中文](posts/2026-05-12-monitor-render-loop.zh.md) | Invest AI | `react` `hooks` `useeffect` `bugfix` `postmortem` |
| 2026-05-12 | [Three-Layer AI Architecture for Investment Decisions](posts/2026-05-12-three-layer-ai-architecture.md) · [中文](posts/2026-05-12-three-layer-ai-architecture.zh.md) | Invest AI | `architecture` `gemini` `openai` `hybrid-ai` |
| 2026-05-12 | [Why We Chose a Hybrid LLM Pipeline](posts/2026-05-12-hybrid-llm-pipeline.md) · [中文](posts/2026-05-12-hybrid-llm-pipeline.zh.md) | Invest AI | `llm` `pipeline` `gemini` `openai` `cost` |
| 2026-05-12 | [MCP Phased Rollout: From Dashboard to Autonomous Trading](posts/2026-05-12-mcp-phased-rollout.md) · [中文](posts/2026-05-12-mcp-phased-rollout.zh.md) | Invest AI | `mcp` `broker` `architecture` `roadmap` |

## Backlog (posts & ADRs not yet written)

Invest AI has broad **May 2026** coverage for ADRs **001–011**. The living **gap matrix** (missing ADR-012, blog placeholders for Meal Coach / dot-app / ops-status, backend ADR-0017, etc.) is maintained in the Invest AI repo: **[`xingai-invest-ai/docs/content-backlog.md`](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/content-backlog.md)** (clone path: `../xingai-invest-ai/docs/content-backlog.md`).

**Still open for future posts:** Meal Coach AI, xingai-dot-app, xingai-ops-status, and other products in the diagram — plus “shipped” stories when **ADR-002 / 003 / 010** move from planned to implemented. **T Today (`invest-t-advisor`):** ADRs 0001–0004 + May 2026 posts (guest access, bilingual JSON, decision engine). **InvestSim:** split-repo (2026-05-14) + live paper engine (2026-05-15). Next posts: multi-strategy lab, Turso bootstrap ops story.

**Positioning guide:** [docs/POSITIONING.md](docs/POSITIONING.md) — flagship **Invest AI** vs **InvestSim** paper lab; avoid “AI stock analyzer / trading tool”.

## XingAI Products

These posts cover engineering across all XingAI products:

```mermaid
graph LR
    BLOG["XingAI Tech Blog"]
    BLOG --> RESEARCH["Research AI<br/>Learning decisions"]
    BLOG --> INVEST["Invest AI<br/>Flagship · Decision system"]
    BLOG --> INVESTSIM["InvestSim<br/>Paper lab · Not flagship"]
    BLOG --> MEAL["Meal Coach<br/>Health AI · Nutrition"]
    BLOG --> COOK["Cook AI<br/>Recipe Generation"]
    BLOG --> OUTFIT["Outfit AI<br/>Style Decisions"]
    BLOG --> ROUTINE["Routine AI<br/>Habit Building"]
    BLOG --> PARENT["Parent AI<br/>Family Support"]
    BLOG --> TRAVEL["Travel AI<br/>Trip Planning"]
    BLOG --> TTODAY["T Today<br/>Screenshot 做T coach"]
    INVESTSIM -.->|"HTTPS ingest"| INVEST
    TTODAY -.->|"chart quotes optional"| INVEST
```

## About

XingAI builds AI products that help people make better decisions — in health, finance, style, and daily life. Each product is a focused tool, not a chatbot.

**Investment vertical:** XingAI is an **AI-powered investment decision system**. **Flagship product:** Invest AI. **InvestSim** is the **AI paper trading lab** (simulation only). See [docs/POSITIONING.md](docs/POSITIONING.md).

We publish technical writing here to share what we learn: architecture trade-offs, model selection, cost optimization, and the engineering behind real AI products.

**Links:**
- [xingai.app](https://xingai.app)
- [GitHub](https://github.com/xingaiapp)
- [LinkedIn](https://www.linkedin.com/in/xingaiapp/)
- [X/Twitter](https://x.com/XingAIApp)

## License

Content is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You're free to share and adapt with attribution.
