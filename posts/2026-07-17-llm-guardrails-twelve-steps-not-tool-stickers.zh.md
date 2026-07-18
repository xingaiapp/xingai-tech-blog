# 十二步不是十二个工具 Logo

**日期：** 2026 年 7 月 17 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Enterprise AI POCs — LLM 护栏与监控](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/llm-guardrails-monitoring-poc)
**标签：** `guardrails` `monitoring` `mcp` `rag` `governance` `education` `poc`
**English:** [2026-07-17-llm-guardrails-twelve-steps-not-tool-stickers.md](2026-07-17-llm-guardrails-twelve-steps-not-tool-stickers.md)

---

公开海报喜欢干净的阶梯：Plan → Build → Validate → Operate，十二个盒子，每个下面一排 **Tools**。这边 LangChain，那边 LangSmith，最后 Docker。当检查清单可以。当架构不行。

我们做了一个可运行的 POC：**走完十二步**，但拒绝把那些 logo 当成控制平面。

## 模式

```text
Plan     → 先用例与风险/策略，再选模型
Build    → 证据 RAG、Prompt 契约、输入墙、MCP 双墙工具
Validate → 输出闸门、Agent Run 追踪、评测 / 红队标记
Operate  → 持续身份姿态 + Decision Ledger 迭代
```

不变量：**失败即关闭**。输入注入或高风险工具撞墙后，后续步骤标记为 `skipped`——不会假装 Deploy 还把请求“保护”了一遍。

## 我们做了什么

路径：`pocs/llm-guardrails-monitoring-poc/backend/pipeline.py`

- 确定性 mock 模型（课堂演示无需 API Key）
- 两篇政策文档上的关键词 RAG，带 **证据充分性** 标志
- 输入扫描覆盖 **用户 + RAG + 工具描述**（不只防越狱）
- 第 7 步用模拟的 **MCP scope 墙** 拦截 `transfer_funds`
- 第 9 步发出 Agent Run 形态追踪（目标 → 步骤 → 模型 → 结果）
- 第 12 步写 ledger 动作：`ship_answer` 或 `escalate_human`

UI 在 **8020** 端口，四个探针：正常路径、注入、高风险工具、弱证据。

## 我们没做什么

- 真实 LLM 或向量库
- 真实 Entra / APIM / OAuth（见 [claims-mcp-oauth-poc](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)）
- 长任务 MCP 的持久工作流运行时
- CI 里的生产级评测套件

那些留给后续阶段。本 POC 证明的是**控制顺序**，不是云厂商购物清单。

## 相对海报的纠正

| 海报习惯 | POC 中的 XingAI 纠正 |
|---|---|
| Tools 栏 = 架构 | 墙与契约；工具只填槽位 |
| 输入护栏 = 用户越狱 | 所有不可信观测 |
| 工具控制 = Agent SDK logo | Scope 墙 + 策略墙 |
| 监控 = 仅延迟/成本 | Agent Run 追踪 |
| 最后部署 = 安全做完 | 认证姿态从 Plan 开始；Deploy 是持续控制 |

## 链接

- POC: https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/llm-guardrails-monitoring-poc
- ADR-010: https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/010-llm-guardrails-monitoring-poc.md
- 设计文: https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-17-llm-app-guardrails-plan-build-validate-operate.zh.md
- Wiki 批判: https://github.com/xingaiapp/xingai-ai-learning-wiki/blob/main/wiki/syntheses/llm-guardrails-monitoring-vs-xingai.zh.md

## 免责声明

教育向 POC 与博文。不是生产软件、法律意见或安全认证。
