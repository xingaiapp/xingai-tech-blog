# Why We Flipped V1 Routing to OpenAI-First (and What Comes Next)

**Date:** May 13, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**Tags:** `llm` `openai` `gemini` `ollama` `routing` `latency` `architecture`  
**Languages:** English · [中文 ↓](#中文)

---

## The old default: “free first”

Early V1 tried providers in **`Ollama → Gemini → OpenAI`** order. The idea: avoid cloud cost until you must.

In practice:

1. **Most users do not run Ollama.** Every request still probed local inference first — hundreds of milliseconds of dead latency before falling through.
2. **Local quality was uneven.** Output often failed our light sanity checks, so we paid the Ollama tax *and* still called the cloud.
3. **Production reality.** We do not ship a local model on Fly; the “free first” path optimized a scenario that did not exist in prod.

## The new default: OpenAI-first resilience

V1 now routes **`OpenAI → Gemini → Ollama → safe defaults`**.

```mermaid
flowchart TD
    REQ["/api/v1/analyze"]
    O{"OPENAI_API_KEY set?"}
    OAI["OpenAI"]
    GAI["Gemini"]
    LL["Ollama"]
    SAFE["provider: none + error"]

    REQ --> O
    O -- yes --> OAI
    OAI -->|usable| OUT["Return result"]
    OAI -->|fail / unusable| GAI
    O -- no --> GAI
    GAI -->|usable| OUT
    GAI -->|fail / unusable| LL
    LL -->|usable| OUT
    LL -->|fail| SAFE
```

**OpenAI** — best structured JSON for our schema, fast cold start in the cloud.  
**Gemini** — strong fallback when OpenAI rate-limits or errors; also the natural **Stage 1** model in our planned V2 hybrid pipeline (compress raw data cheaply).  
**Ollama** — dev / air-gapped / last resort.  
**Safe defaults** — explicit `{ provider: "none", error: "..." }` so the UI can degrade gracefully instead of hanging.

Routing is **implicit from env**: whichever API keys are set determines the chain. No extra “router mode” flag to misconfigure.

## Relationship to V2

This ADR is **V1 routing**. [Hybrid LLM pipeline](2026-05-12-hybrid-llm-pipeline.md) is **V2**: Gemini screens and summarizes; OpenAI decides. When V2 lands, the fallback chain shape may change again — but the lesson stays: **optimize for the path users and production actually take.**

## Takeaway

“Cheapest provider first” is not always cheapest *overall* once you count latency, retries, and failed parses. For our product, **OpenAI-first** was the honest default; Gemini stays the safety net and the bridge to V2.

**Further reading:** ADR-007 (`docs/adr/007-v1-llm-routing.md`).

---

# 中文 · 为何 V1 路由改成 OpenAI 优先（以及下一步）

**语言：** [English ↑](#why-we-flipped-v1-routing-to-openai-first-and-what-comes-next) · 中文

---

## 旧默认：「免费优先」

早期 V1 按 **`Ollama → Gemini → OpenAI`** 试。想法：能不用云就不用。

实际上：

1. **多数用户不跑 Ollama。** 每次请求仍先探本地 — 几百毫秒死延迟再 fallback
2. **本地质量不稳。** 常过不了轻量校验，付了 Ollama 税**仍**要打云
3. **生产现实。** Fly 上不 ship 本地模型；「免费优先」优化了 prod 不存在的路径

## 新默认：OpenAI 优先的韧性链

V1 现为 **`OpenAI → Gemini → Ollama → 安全默认`**。

```mermaid
flowchart TD
    REQ["/api/v1/analyze"]
    O{"配置了 OPENAI_API_KEY?"}
    OAI["OpenAI"]
    GAI["Gemini"]
    LL["Ollama"]
    SAFE["provider: none + error"]

    REQ --> O
    O -- 是 --> OAI
    OAI -->|可用| OUT["返回结果"]
    OAI -->|失败/不可用| GAI
    O -- 否 --> GAI
    GAI -->|可用| OUT
    GAI -->|失败/不可用| LL
    LL -->|可用| OUT
    LL -->|失败| SAFE
```

**OpenAI** — 结构化 JSON 最好、云上冷启动快。  
**Gemini** — OpenAI 限流/报错时的强后备；也是规划 V2 混合管道自然的 **Stage 1**（便宜压缩原始数据）。  
**Ollama** — 开发 / 离线 / 最后手段。  
**安全默认** — 显式 `{ provider: "none", error: "..." }`，UI 可优雅降级而非挂死。

路由**由环境隐式决定**：配了哪些 key 就走哪条链，少一个易配错的「路由模式」开关。

## 与 V2 的关系

本篇是 **V1 路由**。[混合 LLM 管道](2026-05-12-hybrid-llm-pipeline.md) 是 **V2**：Gemini 筛与摘要，OpenAI 决策。V2 落地后 fallback 形状可能再变 — 教训不变：**优化用户与生产实际走的路径。**

## 一句话

「最便宜模型优先」算上延迟、重试、解析失败，总成本未必最低。对我们产品，**OpenAI 优先**是诚实默认；Gemini 仍是安全网与通往 V2 的桥。

**延伸阅读：** ADR-007（`docs/adr/007-v1-llm-routing.md`）。
