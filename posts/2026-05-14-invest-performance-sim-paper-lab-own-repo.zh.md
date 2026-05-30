# 中文 · 纸面实验室为何单独成仓

**日期：** May 14, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [InvestSim / invest-performance-sim](https://github.com/xingaiapp/invest-performance-sim) (private)
**标签：** `nextjs` `prisma` `sqlite` `paper-trading` `invest-ai` `architecture` `vercel` `decision-ui`
**语言：** [English](2026-05-14-invest-performance-sim-paper-lab-own-repo.md) · 中文

---

## 产品问题

[Invest AI](https://xingai.app/apps/invest-ai) 回答「今天市场长什么样？」—— 信号、仪表盘上下文，以及后续更丰富的决策面。

旁边还有一个不同问题：

> 若用**固定规则**、**固定本金**、**可审计成交账本**，机械执行「每日高光想法」，**权益曲线**长什么样？

这是**研究与教育**，不是经纪业务。它需要**独立部署面**：**InvestSim**（`invest-performance-sim`）。

## 为何不塞进 Invest AI monorepo

Invest AI 仓库已是**四套**运行时（见 [*Four Runtimes, One Repo*](2026-05-13-four-apps-one-repo.zh.md)）。再加第五包会：

- 把消费级仪表盘与**模拟实验室**绑在同一发布节奏
- 容易误引 Python-only 路径或 worker 环境假设
- 模糊开源/私有边界（sim 可能更久保持私有）

因此 InvestSim 是**独立** Next.js + Prisma 应用，仅通过 HTTPS 调 Invest AI（v0：`GET /api/v2/signals/top`）。

## 技术选型（故意无聊）

| 层 | 选择 | 原因 |
|----|------|------|
| UI | Next.js App Router | 单一部署；仪表盘用 server components 读数 |
| 数据 | Prisma + SQLite（本地） | 本地循环快；生产是**部署**问题（Turso / Postgres） |
| 图表 | Recharts | 够画可信度曲线；不做交易终端幻想 |
| Auth（v0） | 单共享 token + httpOnly cookie | 内部仪表盘；若对外再换 OAuth |

## 决策优先 UI

优化 **3 秒看懂**：

1. **今日 AI 选股说什么？**（标的、置信度、动作语言）
2. **模拟仓位赢了吗？**（P&amp;L 主视觉）
3. **系统长期可信吗？**（权益曲线 + 成交）

规格在 `docs/UI-MOCK-FIGMA-LEVEL.md`、`docs/UX-LAYOUT.md`。

## 诚实限制（v0）

- **引擎**（自动开平、轮换、止损）尚未上线 — seed + 手动 ingest 先验证脊柱
- **Vercel 上的 SQLite** 没有 libSQL/Postgres 谈不上持久
- **非投资建议** — 与 Invest AI 相同披露，UI 重复展示

## 早拆仓的收获

- **私有仓 + Vercel** 适合内部实验室；见 [*Vercel Git Auto-Deploy…*](2026-05-14-vercel-private-repos-git-auto-deploy.zh.md)
- **Cron + bearer secret** 让 ingest 便宜且明确；仪表盘用户看不到 cron 密钥

## 下一章工程

1. **规则引擎** + 版本化快照 + 幂等日任务
2. **托管 SQL** + 迁移纪律
3. **Invest AI JSON 契约测试**（CI fixture）

---

**License:** This post follows the [XingAI Tech Blog](../README.md) **CC BY 4.0** policy.
