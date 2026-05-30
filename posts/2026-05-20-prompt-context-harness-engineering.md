# Prompt Engineer vs Context Engineer vs Harness Engineer

**Date:** May 20, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** XingAI Platform
**Tags:** `ai-engineering` `prompt-engineering` `context-engineering` `harness-engineering` `llm-systems`  
**Languages:** English · [中文 ↓](#中文)

---

![AI Product Stack: Behavior, Reality, Decision, Trust](../assets/ai-product-stack-decision-layer-v2.png)

## The Job Title Is Changing Because the Work Changed

In 2023, a lot of AI engineering looked like prompt writing. You opened a chat box, tuned a system prompt, added examples, and tried to make the model answer better.

That skill still matters. But once an AI feature becomes a product, the hard part is rarely the sentence you put at the top of the prompt. The hard part is everything around it:

- Which user state should the model see?
- Which database rows are safe to include?
- Which tool calls are allowed?
- How do we replay a bad answer?
- How do we know a model upgrade did not break the workflow?

This is why I now separate three roles:

1. **Prompt Engineer**: shapes the instruction.
2. **Context Engineer**: shapes the information environment.
3. **Harness Engineer**: shapes the execution and evaluation system.

They overlap, but they are not the same job.

## The Short Version

| Role | Core Question | Main Artifact | Failure Mode |
|------|---------------|---------------|--------------|
| Prompt Engineer | "How should the model think and respond?" | System prompt, examples, output schema | The model misunderstands the task |
| Context Engineer | "What should the model know right now?" | Retrieval, memory, state packing, tool context | The model sees the wrong facts |
| Harness Engineer | "How do we run, test, and trust this repeatedly?" | Eval harness, replay logs, tool sandbox, CI checks | The product cannot be debugged or shipped safely |

A simple demo can survive with prompt engineering. A real AI product needs all three.

## Prompt Engineering: The Instruction Layer

Prompt engineering is the most visible layer because it is closest to language.

The prompt engineer writes instructions that define:

- The assistant's role and boundaries
- The task decomposition
- Output format
- Tone and audience
- Examples of good and bad answers
- Refusal or escalation behavior

For example, a prompt engineer working on an investment assistant might write:

```text
You are an investment research assistant.
Summarize the latest market setup in plain English.
Do not provide personalized financial advice.
Return JSON with: direction, confidence, risks, rationale.
```

That is useful. It gives the model a shape.

But it does not answer the most important production question: **what exact evidence should the model use?**

If the prompt says "latest market setup" but the model receives stale data, duplicated news, missing holdings, and no timestamp, better wording will not save the system.

Prompt engineering optimizes the model's behavior inside the context it receives. It does not, by itself, make that context correct.

## Context Engineering: The Information Layer

Context engineering is the discipline of deciding what enters the model window.

This includes:

- Retrieval from vector search, SQL, cache, APIs, and files
- Memory selection
- User profile and preference packing
- Tool result summarization
- Token budgeting
- Freshness and timestamp labeling
- Conflict handling
- Source priority
- Redaction and privacy filtering

The context engineer asks:

- Does the model need raw data, a summary, or both?
- Which fields matter for this decision?
- Is this data fresh enough?
- Should we include historical examples?
- How do we prevent irrelevant context from crowding out the real signal?

In our XingAI products, this distinction shows up everywhere.

For **Invest AI**, the model should not receive a random pile of tickers. It needs a structured decision context: market regime, macro radar, engine votes, confidence, risk budget, and freshness metadata.

For **Meal Coach**, the model should not receive every prior meal forever. It needs the current food image, user goal, diet constraints, portion uncertainty, and recent pattern summaries.

For **Travel AI**, the model should not simply get "plan a trip." It needs dates, budget, weather, constraints, traveler style, saved places, and trade-offs.

The prompt can say "be helpful." Context engineering decides whether the model is helpful with the right facts.

## Harness Engineering: The Execution Layer

Harness engineering is the least glamorous layer and often the one that determines whether the product can ship.

The harness is the system around the model:

- Request builders
- Tool-call routers
- Sandboxes and permissions
- JSON schema validation
- Retry and fallback logic
- Snapshot and replay logs
- Evaluation suites
- Regression tests
- Cost and latency tracking
- Red-team cases
- CI checks before deployment

The harness engineer asks:

- Can we replay this exact model run tomorrow?
- Can we compare model A vs model B on the same inputs?
- What happens if a tool call fails halfway through?
- Can the model return malformed JSON?
- Do we have fixtures for the top 20 failure modes?
- How do we know a prompt edit improved quality instead of just changing vibes?

This is where AI engineering starts to look like systems engineering again.

Without a harness, every AI bug becomes folklore:

```text
"It gave a weird answer yesterday, but I cannot reproduce it."
```

With a harness, the bug becomes an artifact:

```text
input snapshot + prompt version + model version + tool outputs + expected behavior
```

That is the difference between experimenting with AI and operating an AI product.

## A Concrete Example: AI Investment Decision

Imagine an AI investment dashboard that produces a daily recommendation.

### Prompt Engineer View

The prompt engineer writes:

```text
Analyze the market data.
Return a recommendation: BUY, HOLD, or REDUCE.
Explain the top three reasons.
Do not provide personalized investment advice.
```

Useful, but incomplete.

### Context Engineer View

The context engineer defines the payload:

```json
{
  "as_of": "2026-05-20T09:30:00-04:00",
  "market_regime": "Risk-Off",
  "macro_radar": {
    "scenario": "Scenario C",
    "risk_budget_cap": 3,
    "long_signal_discount": 0.12,
    "decision_factors": ["credit stress", "safe-haven failure"]
  },
  "engine_votes": [
    { "name": "trend", "score": 61, "signal": "Neutral" },
    { "name": "volatility", "score": 28, "signal": "Risk-Off" }
  ],
  "top_signals": [
    { "symbol": "CLSK", "rating": "Buy", "confidence": 100 }
  ],
  "freshness": "today"
}
```

Now the model has the right world state.

### Harness Engineer View

The harness engineer makes it reliable:

```text
Fixture: risk_off_macro_with_high_stock_signal
Expected:
- recommendation should not ignore macro risk cap
- rationale must mention macro radar or risk budget
- output must match DecisionResult schema
- no personalized financial advice language
- response must complete under 2 seconds from cache
```

Now the system can be tested.

The prompt makes the model respond. The context makes the response grounded. The harness makes the behavior repeatable.

## Why "Context Engineer" Became a Real Role

LLMs are sensitive to what they see. Two prompts with the same wording can produce opposite results if the context changes.

Context engineering matters because the model window is not just storage. It is the model's temporary reality.

Bad context creates failure patterns that look like model problems:

- Hallucination because source data was missing
- Confident wrong answer because stale data was unlabeled
- Overly generic answer because user state was not included
- Contradictory answer because retrieved chunks disagreed
- Expensive answer because raw documents were included when summaries would do

Many teams try to fix these with more prompt text:

```text
Be accurate. Use the latest data. Do not hallucinate.
```

But the better fix is usually structural:

- include timestamps
- rank sources
- deduplicate chunks
- compress old context
- separate facts from instructions
- add "unknown" states
- make freshness visible to the model and the UI

That is context engineering.

## Why "Harness Engineer" Became a Real Role

AI products fail differently from normal apps.

A normal app often fails with an exception, a 500, or a broken UI state. An AI app can fail while looking successful. It returns fluent text, valid JSON, and a confident recommendation that is subtly wrong.

That means we need more than unit tests.

A good AI harness includes:

### 1. Golden Fixtures

Known inputs with expected behavior.

```text
Case: stale market data
Expected: assistant must say data is stale and avoid strong claims
```

### 2. Schema Gates

The model must return valid structured output.

```text
DecisionResult.action in ["BUY", "HOLD", "REDUCE"]
confidence between 0 and 100
rationale length <= 800 characters
```

### 3. Tool Sandboxing

The model can only call approved tools with approved arguments.

```text
Allowed: read cached quote, read macro radar
Blocked: place broker order, access unrelated user data
```

### 4. Replay Logs

Every important model run can be reconstructed.

```text
prompt_version
context_snapshot_id
model
tool_outputs
final_response
latency
cost
```

### 5. Regression Evals

Before changing a prompt, context packer, model, or tool, run the same cases again.

The goal is not to make AI deterministic. The goal is to make changes observable.

## The Three Roles in One Workflow

Here is how the work splits in a real feature:

```mermaid
flowchart LR
    U["User request"] --> C["Context Engineer<br/>selects state, memory, retrieval, tools"]
    C --> P["Prompt Engineer<br/>frames task, rules, output contract"]
    P --> M["Model run"]
    M --> H["Harness Engineer<br/>validates, logs, tests, replays"]
    H --> UX["Product response"]
    H --> EVAL["Regression evals"]
```

The same person can do all three, especially in a small team. But the mental models are different:

- Prompt engineering is about **instruction quality**.
- Context engineering is about **information quality**.
- Harness engineering is about **operational quality**.

## How to Tell Which Problem You Have

When an AI feature behaves badly, ask which layer failed.

| Symptom | Likely Layer | Fix |
|---------|--------------|-----|
| Output format is inconsistent | Prompt / Harness | Tighten schema, add examples, validate output |
| Answer ignores user preference | Context | Include preference in packed state |
| Answer uses old data | Context / Harness | Add freshness labels and stale-data tests |
| Tool call uses wrong argument | Prompt / Harness | Improve tool instructions and argument validation |
| Quality drops after model upgrade | Harness | Add regression evals before upgrade |
| Model gives generic advice | Context | Retrieve more specific evidence |
| Model is verbose or off-tone | Prompt | Adjust style rules and examples |
| Cannot reproduce bug | Harness | Log prompt, context, tool outputs, model version |

The fastest teams debug AI systems by locating the layer first.

## What This Means for Builders

If you are building AI products, do not stop at prompt writing.

A practical roadmap:

1. Start with prompt engineering to define the behavior.
2. Add context engineering when the feature needs real user state, data, or tools.
3. Add harness engineering before you trust the output in production.

For a weekend prototype, a good prompt may be enough.

For a product people rely on, you need:

- a prompt contract
- a context contract
- an execution contract
- an evaluation contract

That is the real stack.

## The Takeaway

"Prompt engineer" was the first name we gave to a new kind of work. It captured the moment when language became an interface to software.

But the deeper discipline is broader.

AI product engineering is now about designing the full loop:

```text
instructions + context + tools + validation + replay + evaluation
```

Prompt engineering tells the model what to do.

Context engineering gives the model the right world.

Harness engineering makes the system safe enough to ship.

The future belongs to teams that can do all three.

---

# 中文 · 提示工程师、上下文工程师与 Harness 工程师

**语言：** [English ↑](#prompt-engineer-vs-context-engineer-vs-harness-engineer) · 中文

---

![AI 产品栈：行为、现实、决策、信任](../assets/ai-product-stack-decision-layer-v2.png)

## 职位在变，因为工作在变

2023 年很多 AI 工程像「写提示词」：调 system prompt、加 few-shot，让模型答得更好。这技能仍重要；但一旦 AI 变成产品，难点很少是提示词里那几句话，而是周围一切：

- 模型该看到哪些用户状态？
- 哪些数据库行可以进上下文？
- 允许哪些 tool call？
- 坏答案如何回放？
- 模型升级有没有悄悄弄坏工作流？

因此我区分三个角色：**提示工程师**塑指令；**上下文工程师**塑信息环境；**Harness 工程师**塑执行与评测系统。有重叠，不是同一工种。

## 速览

| 角色 | 核心问题 | 主要产物 | 典型失败 |
|------|----------|----------|----------|
| 提示工程师 | 模型该怎么想、怎么答？ | System prompt、样例、输出 schema | 误解任务 |
| 上下文工程师 | 模型此刻该知道什么？ | 检索、记忆、状态打包、工具上下文 | 看到错误事实 |
| Harness 工程师 | 如何可重复地跑、测、信任？ | Eval、回放日志、工具沙箱、CI | 无法调试、不敢上线 |

Demo 可以只靠提示；真产品需要三者。

## 提示工程：指令层

定义角色边界、任务分解、输出格式、语气、好坏样例、拒绝/升级行为。例如投资助手：

```text
你是投资研究助手。用白话总结最新市场结构。
不要给个性化投资建议。
返回 JSON：direction, confidence, risks, rationale。
```

有用，但没回答生产关键问题：**模型该用哪份证据？** 若 prompt 写「最新市场」却喂陈旧、重复、缺持仓、无时间戳的数据，措辞再好也救不了。提示工程优化的是**给定上下文内的行为**，不保证上下文正确。

## 上下文工程：信息层

决定什么进入模型窗口：向量/SQL/缓存/API/文件检索、记忆选取、用户画像打包、工具结果摘要、token 预算、新鲜度标签、冲突处理、来源优先级、脱敏过滤。

上下文工程师问：要原始数据还是摘要？哪些字段服务本次决策？够新吗？无关上下文是否在挤掉信号？

在 XingAI：**Invest AI** 不该收到随机 ticker 堆，而要结构化决策上下文（宏观雷达、引擎票、风险预算、新鲜度元数据）。**Meal Coach** 不该永久塞满历史餐次，而要当前图、目标、约束、份量不确定性与近期模式摘要。**Travel AI** 需要日期、预算、天气、约束、风格、收藏点与权衡 — 不是一句「规划行程」。

Prompt 可以说「要有帮助」；上下文工程决定是不是**用对事实**有帮助。

## Harness 工程：执行层

最不炫，往往决定能不能 ship：请求构建、工具路由、沙箱权限、JSON schema 校验、重试/fallback、快照回放、评测集、回归测试、成本延迟追踪、红队、部署前 CI。

没有 harness，每个 AI bug 都是传说：「昨天答案怪，复现不了。」有了 harness，bug 是工件：`输入快照 + prompt 版本 + 模型版本 + 工具输出 + 期望行为`。这是「玩 AI」和「运营 AI 产品」的分水岭。

## 投资决策例子（三层各看什么）

- **提示**：分析市场数据，返回 BUY/HOLD/REDUCE 与三条理由 — 有用但不完整  
- **上下文**：打包 `as_of`、regime、macro_radar、engine_votes、top_signals、freshness — 模型才有正确世界状态  
- **Harness**：fixture 期望不无视宏观风险上限、符合 schema、无个性化建议措辞、缓存路径 <2s — 才可测

Prompt 让模型回答；上下文让回答有根据；Harness 让行为可重复。

## 为何「上下文工程师」成岗

LLM 对所见极敏感；同 prompt 不同上下文可相反。坏上下文像模型问题：缺源幻觉、未标陈旧却自信、缺用户状态而泛化、检索块矛盾、塞全文而贵。加「别幻觉」往往不如结构修复：时间戳、来源排序、去重、压缩旧上下文、事实与指令分离、显式 unknown、UI 也显示新鲜度。

## 为何「Harness 工程师」成岗

AI 产品常「看起来成功」地失败 — 流利 JSON、自信但 subtly 错。需要 golden fixture、schema 门、工具沙箱、回放日志（prompt_version、context_snapshot_id、model、tool_outputs、latency、cost）、改 prompt/上下文/模型前的回归 eval。目标不是确定性，而是**变更可观测**。

## 一条工作流里的分工

```mermaid
flowchart LR
    U["用户请求"] --> C["上下文工程师<br/>状态、记忆、检索、工具"]
    C --> P["提示工程师<br/>任务、规则、输出契约"]
    P --> M["模型运行"]
    M --> H["Harness 工程师<br/>校验、日志、测试、回放"]
    H --> UX["产品响应"]
    H --> EVAL["回归评测"]
```

小团队可一人三包，但心智模型不同：指令质量 / 信息质量 / 运营质量。

## 排障：哪一层坏了？

| 现象 | 可能层 | 方向 |
|------|--------|------|
| 输出格式乱 | 提示 / Harness | 收紧 schema、校验 |
| 忽略用户偏好 | 上下文 | 打包偏好 |
| 用旧数据 | 上下文 / Harness | 新鲜度标签 + stale 测试 |
| 工具参数错 | 提示 / Harness | 工具说明 + 参数校验 |
| 换模型后变差 | Harness | 升级前回归 |
| 建议很泛 | 上下文 | 检索更具体证据 |
| 冗长跑调 | 提示 | 风格规则与样例 |
| 无法复现 | Harness | 记 prompt、上下文、工具、模型版本 |

## 对建设者的含义

别停在写 prompt。路线图：先提示定行为 → 要真实状态/数据/工具时加上下文 → 生产信任前加 harness。周末原型好 prompt 可能够；人要依赖的产品需要 prompt 契约、上下文契约、执行契约、评测契约 — 这才是完整栈。

## 一句话

「提示工程师」是我们给新工种的第一名字；更深的是整环：

```text
instructions + context + tools + validation + replay + evaluation
```

提示告诉模型做什么；上下文给对的世界；Harness 让系统够安全可以 ship。能三者兼修的团队会赢。

---

*Part of the [XingAI Tech Blog](https://github.com/xingaiapp/xingai-tech-blog). We build focused AI decision systems for everyday life.*

**Links:** [XingAI](https://xingai.app) · [GitHub](https://github.com/xingaiapp) · [LinkedIn](https://www.linkedin.com/in/xingaiapp/) · [X/Twitter](https://x.com/XingAIApp)
