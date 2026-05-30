# Four Runtimes, One Repo: Why We Skipped Nx (For Now)

**Date:** May 13, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `monorepo` `nextjs` `fastapi` `developer-experience` `solo-dev`  
**Languages:** English · [中文 ↓](#中文)

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

---

# 中文 · 四套运行时、一个仓库：为何暂不用 Nx

**语言：** [English ↑](#four-runtimes-one-repo-why-we-skipped-nx-for-now) · 中文

---

## 仓库里有什么

Invest AI 不是单个应用，而是**四个**顶层包：

| 包 | 角色 | 常见托管 |
|----|------|----------|
| `stock-ai-front-end` | Next.js 仪表盘 | Vercel |
| `stock-ai-back-end` | FastAPI API | Fly.io |
| `stock-ai-worker` | Python 刷新循环 | Fly.io（与 API 同机） |
| `stock-ai-monitor` | 内部运维 Next.js | localhost |

另有 `docs/` 放 ADR、bug 记录、法律策略。

## 为什么一个仓库

- **跨切面改动一个 PR** — 例如限额同时动 backend、frontend、monitor、文档
- **onboarding 一次 clone** — `git clone` + monitor `setup:stack` → 全栈
- **API 契约同屏 review** — 前后端 diff 在一起

## 为什么暂不用 Turborepo / Nx

我们只有**四个**包、两种语言。重型 monorepo 工具在「几十个包、共享 TS 类型、CI 要跑几十分钟」时发光。今天 `cd stock-ai-front-end && npm test` 就够。

原则：**痛到了再加工具**，不是博客说该加就加。

## 保持目录清醒的规则

- 每目录自己的 `package.json` 或 `requirements.txt`
- **禁止跨语言 import** — TS 与 Python 只走 HTTP
- 同一逻辑抄到**第三次**再考虑共享库
- commit 前缀：`frontend:`、`backend:`、`worker:`、`monitor:`、`docs:`

## 何时拆仓

不同团队拥有服务、包要变**公开 SDK**、合规要求隔离访问 — 第一天都不成立。

## 一句话

对 solo / 小团队，**按运行时分子目录、不上 meta-build 的 monorepo** 被低估：协调收益大，几乎无 Nx 学习成本；等 CI 真疼了再引工具。

**延伸阅读：** ADR-009（`docs/adr/009-monorepo-layout.md`）。
