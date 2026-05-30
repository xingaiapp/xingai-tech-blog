# 中文 · 投资决策的三层 AI 架构

**日期：** May 12, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)
**标签：** `architecture` `gemini` `openai` `hybrid-ai` `invest-ai`
**语言：** [English](2026-05-12-three-layer-ai-architecture.md) · 中文

---

## 单模型的局限

多数 AI 投资工具：把市场数据倒进一个 LLM，拿一个答案。简单，也错。

没有单一模型样样最强。让 GPT 同时读 50 页财报、算风险、给买卖决策，像一个人兼研究员、分析师、基金经理 — 都能做，做不好。

## 2026 行业方向：混合管道

XingAI 投资平台围绕三层智能：

1. **数据智能（Gemini）** — 超大上下文，把财报/新闻/价格**压缩**成结构化 `MarketBrief`，不负责最终买卖
2. **决策智能（OpenAI o1/o5）** — 吃 1K–3K token brief，做 BUY/SELL/HOLD、置信度、白话理由
3. **AI UX（前端）** — 如何展示不确定性（72% HOLD ≠ 95% BUY），渐进披露

## 为何不只用一家

| 做法 | 问题 |
|------|------|
| 全 OpenAI | 10 万+ token 进 o1 又慢又贵 |
| 全 Gemini | 摘要强，多步推理与校准弱 |
| 本地 Ollama | 免费私密，准确度不够实盘决策 |

混合 = **Gemini 的成本 + OpenAI 的推理质量**。

## 我们在建什么

- **V1（已 ship）** — 简单 fallback 链，同输入同任务
- **V2（进行中）** — worker 批量 Gemini brief，OpenAI 按需决策；接 Finnhub 给 Gemini 文本
- **V3（未来）** — MCP 组合/日历/券商，**数月纸面准确后再谈执行**

全市场 250 标的 screening 约 **$3/天** 量级（见英文成本表）。

**ADR：** [001 三层架构](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/001-three-layer-ai-architecture.md)、[002 混合管道](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/002-hybrid-llm-pipeline.md)、[003 MCP 分阶段](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/003-mcp-phased-rollout.md)。

---

*XingAI builds focused AI decision systems for everyday life. Invest AI is our finance product — helping you invest smarter with AI that knows its limits.*

**Links:** [XingAI](https://xingai.app) · [Invest AI](https://xingai.app/apps/invest-ai) · [GitHub](https://github.com/xingaiapp) · [LinkedIn](https://www.linkedin.com/in/xingaiapp/) · [X/Twitter](https://x.com/XingAIApp)
