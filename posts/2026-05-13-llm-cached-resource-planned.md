# Treating LLM Output Like Cache Rows (Planned): Worker-Owned Inference

**Date:** May 13, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `architecture` `worker` `sqlite` `openai` `cost-optimization` `roadmap`  
**Languages:** English · [中文 ↓](#中文)

---

## Status: planned (not shipped in V1)

This post documents a **decision we accepted**, not something already running in production. It belongs in the same story as our CQRS market cache: **derived data should have one writer.**

Today, the FastAPI backend still calls OpenAI / Gemini / Ollama inside the request lifecycle (see [OpenAI-first routing](2026-05-13-openai-first-llm-routing.md)). That works for V1, but it creates five pressures as traffic grows:

1. **Duplicate spend** — ten users asking about the same symbol in one minute can mean ten identical model calls.
2. **Coupled failures** — upstream 429s surface as user-visible errors instead of stale-but-usable cache.
3. **Secrets on the hot path** — API keys live on the public-facing service.
4. **Heavier cold starts** — more imports on the API process.
5. **Half-applied CQRS** — market data already follows “worker writes, backend reads”; LLM results do not yet.

## The direction

**Move all LLM calls into the worker.** Persist analyses in SQLite like any other derived artifact. The backend becomes a **reader**: cache hit returns immediately; cache miss **enqueues** a job and returns a small “queued” envelope (with polling URL). Free-tier quotas stay enforced at the gateway — abuse should not enqueue a thousand jobs.

We plan **two phases**:

- **Phase A** — Non-streaming analyze path moves to enqueue + poll; streaming can follow a dedicated plan.
- **Phase B** — After the V2 hybrid pipeline (Gemini compress → OpenAI decide), streaming and multi-stage work naturally live in the worker anyway.

SQLite **WAL mode** + a bounded job table with **dedupe on `prompt_hash`** keeps concurrent reads cheap while the worker writes results.

## Why bother?

- **Cost** — dedupe and pre-warm hot symbols (watchlist, top signals) collapse redundant calls.
- **Resilience** — serve last good analysis with a `stale` flag when upstream is unhappy.
- **Security posture** — API keys migrate to the worker process only.

## Takeaway

“LLM as a service call inside the controller” is the fastest way to V1. “**LLM as cached rows with a single writer**” is the shape that survives real traffic and aligns with how we already treat market data.

**Further reading:** ADR-010 (`docs/adr/010-llm-as-cached-resource.md`).

---

# 中文 · 把 LLM 输出当缓存行（规划中）：推理归 worker

**语言：** [English ↑](#treating-llm-output-like-cache-rows-planned-worker-owned-inference) · 中文

---

## 状态：规划中（V1 未上线）

本文记录**已接受的决策**，不是已在生产跑通的能力。与 CQRS 市场缓存同一故事：**衍生数据应只有一个写入方。**

今天 FastAPI 仍在请求路径里调 OpenAI / Gemini / Ollama（见 [OpenAI-first 路由](2026-05-13-openai-first-llm-routing.md)）。V1 够用，但流量上来会有五类压力：

1. **重复花费** — 一分钟内十人问同一标的，可能十次相同模型调用
2. **故障耦合** — 上游 429 直接变成用户可见错误，而不是「略旧但可用」的缓存
3. **密钥在热路径** — API key 挂在对外服务上
4. **冷启动更重** — API 进程 import 更多
5. **CQRS 只做了一半** — 市场数据已是 worker 写、backend 读；LLM 结果还不是

## 方向

**所有 LLM 调用迁到 worker。** 分析结果像其他衍生物一样写入 SQLite。backend 变**读者**：命中缓存立即返回；未命中**入队**任务并返回小的「已排队」信封（含轮询 URL）。免费额度仍在网关 enforce — 滥用不应能排队一千个 job。

计划**两阶段**：

- **阶段 A** — 非流式 analyze 走入队 + 轮询；流式另案
- **阶段 B** — V2 混合管道（Gemini 压缩 → OpenAI 决策）后，流式与多阶段自然也在 worker

SQLite **WAL** + 有界 job 表 + **`prompt_hash` 去重**，读并发便宜，worker 写结果。

## 为什么值得做

- **成本** — 去重与预热热门标的（自选、top signals）消灭冗余调用
- **韧性** — 上游不爽时仍可提供上次好结果，并标 `stale`
- **安全** — API key 只留在 worker 进程

## 一句话

「在 controller 里当场调 LLM」是到 V1 最快的路。「**LLM 当缓存行、单写入方**」才扛得住真实流量，也与市场数据的处理方式一致。

**延伸阅读：** ADR-010（`docs/adr/010-llm-as-cached-resource.md`）。
