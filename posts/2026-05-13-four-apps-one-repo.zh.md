# 中文 · 四套运行时、一个仓库：为何暂不用 Nx

**日期：** May 13, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)
**标签：** `monorepo` `nextjs` `fastapi` `developer-experience` `solo-dev`
**语言：** [English](2026-05-13-four-apps-one-repo.md) · 中文

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
