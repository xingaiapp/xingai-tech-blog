# 中文 · Today Intelligence 与留在 Invest AI 内的报告面

**日期：** 2026-08-05  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `invest-ai` `reporting` `worker` `cache` `adr` `intelligence`  
**语言：** [English](2026-08-05-invest-ai-today-intelligence-report-surfaces.md) · 中文

---

## 规格 vs 产品

一份「Daily Stock Market Intelligence」草稿看起来像新的 FastAPI + Alembic + Next。Invest AI 已有 Resend 摘要、报告触发、宏观雷达和报告目录。

ADR-032 选择扩展。ADR-033 把 AI 基础设施机会图谱并进同一观察列表/报告面。ADR-034 冻住 **Today Intelligence** 缓存契约，让 FastAPI 只读 Worker 载荷。

## 表面

| ADR | 表面 |
|-----|------|
| 032 | Daily Stock Market Intelligence HTML 报告类型 |
| 033 | AI Infrastructure Opportunity Map（扩展 watchlist，不开新宇宙） |
| 034 | `GET /api/v2/intelligence/today` — 只读缓存 |
| 040 | 每日投资智报（另文） |

Worker 计算。目录列出。仪表盘渲染。API 里不藏第二套决策引擎。

## 要点

新报告格式是包装。为包装再开后端，monorepo 就会烂。

**延伸阅读：** ADR-032 / 033 / 034。
