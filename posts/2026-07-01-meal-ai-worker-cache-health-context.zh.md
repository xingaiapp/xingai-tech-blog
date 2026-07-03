# Meal AI：面向健康场景的 Worker + Cache 膳食规划架构

**日期：** 2026 年 7 月 1 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Meal Coach AI](https://github.com/xingaiapp/xingai-meal-coach-ai)
**标签：** `meal-ai` `worker-cache` `cqrs` `health-ai` `营养` `fastapi` `sqlite`
**English:** [English](2026-07-01-meal-ai-worker-cache-health-context.md)

---

Meal AI 是 XingAI 的健康领域——营养规划、膳食推荐，以及为有特定健康状况的家庭成员提供照料者支持。

三个新 ADR 定义了它的架构。以下是各部分如何组合在一起的。

## 核心问题

每次页面加载都调用 LLM 生成膳食计划是错误的：

- **延迟：** GPT-4o 膳食计划请求需要 3–8 秒
- **成本：** 每次请求 $0.01–0.03 × 大量用户 = 不可控
- **一致性：** 即使什么都没变，每次加载计划都不一样

解决方案和 Invest AI 用的一样（[ADR-008](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/008-cqrs-cache-pattern.md)）：后台 worker 定时生成计划，FastAPI 读缓存，前端轮询直到就绪。

## ADR-001：Worker + Cache

```
Worker（后台进程，Python）
  → 加载用户画像
  → 调用 LLM（GPT-4o → Claude 备选）
  → Nutritionix API 数据补充
  → 安全验证
  → 写入 meal_cache（SQLite）

FastAPI（请求路径，只读）
  → 读取 meal_cache
  → 返回 { status: "ready", plan: {...} }
     或 { status: "generating" }

前端（Next.js）
  → 轮询 /api/meal?user_id=<id>
  → 显示加载状态 → 渲染计划
```

缓存 TTL：标准计划 24 小时 / 时令计划 1 小时。

不用 Redis。SQLite 足够了——worker 是单个后台进程，是唯一的写入者。

## ADR-002：健康状况感知

与通用聊天机器人的核心差异：worker 在调用 LLM 之前，将已知健康状况映射到 prompt 指令。

| 状况 | Prompt 补充内容 |
|------|---------------|
| `fatty_liver`（脂肪肝） | 避免油炸食品、高脂肪食物、酒精 |
| `diabetes`（糖尿病） | 低升糖指数，限制精制碳水 |
| `high_blood_pressure`（高血压） | 减少钠摄入，增加含钾食物 |
| `cancer_recovery`（癌症康复） | 高蛋白、抗炎、不含加工食品 |

未知状况以自由文本形式传入 prompt——LLM 会妥善处理。

Worker 在写入缓存前还会运行基于规则的 `validate_safety()` 检查，标记与健康状况冲突的食材。这是一道安全把关——不具备医学认证，但总比没有好。

每个计划都包含不可隐藏的免责声明："本膳食计划仅供参考，不构成医疗或饮食建议。如有疾病，在做出重大饮食改变前请咨询医疗专业人士。"

## ADR-003：Decision Ledger

Meal AI 是第二个采用[跨产品 Decision Ledger schema](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md) 的 XingAI 产品。

每个生成的计划写入一条 ledger 记录：

```json
{
  "product": "meal-ai",
  "domain": "meal-plan/condition/fatty_liver",
  "question": "为我有脂肪肝的妈妈制定每周膳食计划",
  "recommendation": "7 天低脂高纤维膳食计划",
  "confidence": 0.82,
  "action_taken": null,
  "outcome": null
}
```

`confidence` 是 Meal AI 特有的复合值：
- 基础分 `0.4`
- 安全验证通过 `+0.2`
- Nutritionix 数据补充成功 `+0.2`
- 用户画像完整 `+0.2`

`action_taken` 初始为 null。当用户在 UI 中点击"我执行了这个计划"时更新为 `"followed"`。这是反馈循环引擎的输入数据。

Ledger 行和缓存条目是分开写入的——显式调用，不融合。只预览计划而不记录？可以。测试保持简单。

## 如何契合 XingAI 模式

Meal AI 的 worker + cache 架构与 Invest AI 完全相同。健康状况映射是 Meal AI 特有的。Decision Ledger 行是跨产品标准。

这就是 XingAI 架构纪律在实践中的体现：决策能够跨产品复利，是因为所有产品都写入同一个 schema，尽管每个产品的内部逻辑完全不同。

**延伸阅读：** [ADR-001 Worker Cache](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/001-cqrs-worker-cache.zh.md) · [ADR-002 营养流水线](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/002-nutrition-worker-pipeline.zh.md) · [ADR-003 Decision Ledger](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.zh.md)

---

*Meal AI 膳食计划仅供参考，不构成医疗或饮食建议。*
