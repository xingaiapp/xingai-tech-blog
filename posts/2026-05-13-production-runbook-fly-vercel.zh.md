# 中文 · 发布 Invest AI V1：Fly.io + Vercel 的运行手册思维

**日期：** May 13, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)
**标签：** `deployment` `fly-io` `vercel` `devops` `runbook` `production`
**语言：** [English](2026-05-13-production-runbook-fly-vercel.md) · 中文

---

## 为什么要有 runbook，而不只写 ADR

[ADR-004](2026-05-12-v1-hosting-fly-io.zh.md) 解释 Python 侧选 Fly.io、Next.js 选 Vercel 的**原因**。它替代不了**可复制命令**、项目名、冒烟测试和「别部署到这里」的警告。

第一次上生产时，我们差点把 Invest AI 前端指到**错误的 Vercel 项目** — 架构图拦不住人手滑。操作文档应**放在仓库里**，贴着代码。

## 我们标准化的内容

- **Fly.io 应用**：API + worker 同机，共享持久卷存 SQLite
- **独立 Vercel 项目** 给 Invest AI — **不要**和主站营销项目混用
- **canonical runbook**：monorepo 内 `docs/deploy/release-runbook.md`（命令级步骤、回滚、冒烟）

## 拓扑一览

```mermaid
flowchart LR
    BROWSER["浏览器"]
    VERCEL["Vercel · Invest AI 前端"]
    FLY["Fly.io · API + worker + 卷"]

    BROWSER --> VERCEL
    VERCEL -->|"rewrites /api"| FLY
```

心智模型：**Vercel 管 HTML 与静态资源；Fly 管 Python、worker、数据库文件。**

## 「发布完成」至少包括

在干净笔记本上：

1. 健康检查 200
2. tickers 对已知标的集有数据
3. `POST /api/v1/analyze` 在密钥配置时返回 `provider: openai` 的结构化 payload — 证明主机上的密钥与路由

runbook 里写死 URL、区域、卷名，下次部署才会无聊。

## 明确跟踪的后续

- 团队需要时再接 GitHub → Fly / Vercel 自动部署
- 定期更新 runbook 里的示例部署 ID，避免「当前状态」变成「错误历史」

## 一句话

用 ADR 选主机；用 **runbook 真正发版**。一页带 guardrail 的命令，比发布前夜十张架构图更省时间。

**延伸阅读：** Invest AI 仓库 ADR-011（`docs/adr/011-production-release-runbook.md`）、`docs/deploy/release-runbook.md`。
