# 中文 · 混合 LLM 管道：Gemini 筛，OpenAI 决策

**日期：** May 12, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)
**标签：** `llm` `pipeline` `gemini` `openai` `cost-optimization` `invest-ai`
**语言：** [English](2026-05-12-hybrid-llm-pipeline.md) · 中文

---

## 从 fallback 链到管道

V1 是 Ollama → Gemini → OpenAI，谁先响谁赢 — 韧但三个模型干同一件事、吃同一份输入，像雇三个厨师做同一道菜。

V2 改成**管道**：各模型做自己最强的阶段。

## 两阶段

**阶段 1 · Gemini（worker 批量）** — 吃进 60 日行情、新闻、情绪等 5K–20K token，输出约 1.5K 的 `MarketBrief` JSON，写入 SQLite（如 `brief:NVDA:2026-05-12`）。

**阶段 2 · OpenAI（按请求或预热）** — 只吃压缩 brief，输出 `DecisionResult`（action、confidence、rationale）。

## 为何有效

- **成本**：全 OpenAI 约 $11.25/天/250 标的；混合约 $1.75（~84% 省）
- **延迟**：裸数据 5–10s → brief 1–2s；缓存命中 <50ms
- **质量**：长上下文摘要 Gemini 更强；结构化推理 OpenAI 更强

## 数据缺口要先补

V1 只有 yfinance 价格，没什么可「摘要」。先接 [Finnhub](https://finnhub.io/) 新闻/情绪，Gemini 才有文本可压。

## 缓存

Brief TTL ~15 分钟（worker）；Decision TTL ~1 小时。多数 API 响应 = **零 LLM 调用**，只读 SQLite。

## 故障

Gemini 挂 → OpenAI 吃原始数据（贵但可用）；OpenAI 挂 → Gemini  standalone 低置信；Finnhub 挂 → 仅价格 brief；双挂 → 旧决策 + `is_stale`。

**延伸阅读：** [ADR-002](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/002-hybrid-llm-pipeline.md)。

---

*Part of the [XingAI Tech Blog](https://github.com/xingaiapp/xingai-tech-blog). We build AI decision systems for everyday life.*

**Links:** [XingAI](https://xingai.app) · [Invest AI](https://xingai.app/apps/invest-ai) · [GitHub](https://github.com/xingaiapp) · [LinkedIn](https://www.linkedin.com/in/xingaiapp/) · [X/Twitter](https://x.com/XingAIApp)
