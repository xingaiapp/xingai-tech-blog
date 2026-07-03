# Personal Memory Engine：一个画像，跨越所有 XingAI 产品

**日期：** 2026 年 7 月 1 日
**作者：** Xing @ [XingAI](https://xingai.app)
**标签：** `xingai` `记忆引擎` `跨产品` `supabase` `隐私` `架构`
**English:** [English](2026-07-01-personal-memory-engine-cross-product.md)

---

建多个 AI 产品的麻烦在于：每一个都从零开始。

你告诉 Invest AI 你 55 岁，保守型风险承受能力。你告诉 Meal AI 你有脂肪肝。你告诉 SAT AI 你女儿想当医生。每个产品听你说一次，然后当另一个产品询问时就忘了。

Personal Memory Engine（[Engineering System ADR-001](https://github.com/xingaiapp/xingai-engineering-system/blob/main/docs/adr/001-personal-memory-engine.md)）就是解决方案。

## 存储什么

Supabase 里每个用户一行 `user_memory`：

```
age, goals, constraints, health_conditions,
financial_profile, family_members, preferences,
decision_style, language
```

就这些。Schema 刻意保持扁平。每个产品继续维护自己丰富的领域专属表（投资组合持仓、膳食记录、SAT 分数）。Memory 只存对*其他产品*有用的内容。

规则：**另一个产品会受益于知道这件事，就放进 memory；只有一个产品需要，就留在本地。**

## 为什么选 Supabase 而不是新服务

XingAI 其他所有部分都遵循"每产品本地数据库"规则。Memory 是唯一的例外。

三个原因：

1. **Auth 已经在那里。** `user_memory` 本质上是 Supabase auth 用户的扩展——同样的 `user_id`，同样的 RLS 策略。这不是新依赖，是已有依赖的延伸。
2. **访问永远是主键查找。** `SELECT * FROM user_memory WHERE user_id = $1`——无跨用户 JOIN，无聚合。性能特征与键值存储相同。
3. **替代方案更糟。** 如果每个产品存储自己的记忆切片，跨产品推荐（"基于你的健康画像 AND 你的投资画像"）就需要产品 A 在请求时调用产品 B 的 API。随着产品增长，这会形成 O(N²) 依赖图，代价是只读取几个字段。

## 如何注入 LLM

Worker（不是 FastAPI 层）读取 `user_memory` 并将其注入 LLM system prompt：

```python
system_prompt = build_system_prompt(
    product="invest-ai",
    user_memory=load_user_memory(user_id),
    domain_context=portfolio_context,
)
```

Memory 不单独缓存——记忆变化频率低，但膳食计划或投资推荐的过期 prompt 会显著降低体验，代价远超额外 5ms 的查询开销。

## Worker 推断的记忆更新

部分记忆更新来自用户显式操作（编辑个人资料）。其他的由系统从行为中推断。

例子：用户连续忽略 3 个高钠膳食计划。Meal AI worker 注意到这个模式，并将一个 `pending_memory_update` 加入队列：

```json
{
  "field": "constraints",
  "add": "low_sodium",
  "reason": "连续忽略 3 个高钠计划（8月1日–15日）",
  "confidence": 0.8
}
```

写入之前，用户会看到一个确认界面："我们注意到您倾向于低钠饮食。将此加入您的个人资料吗？"可以确认、编辑或忽略。

这是反馈循环引擎在记忆层的工作——不只是改善推荐，而是改善生成所有未来推荐的*上下文*。

## 隐私是不可妥协的

`user_memory` 包含健康状况和财务数据。两个不可选的要求：

1. **Supabase RLS：** 所有操作都要求 `user_id = auth.uid()`。用户只能读写自己的行。
2. **删除权：** `DELETE /api/memory` 硬删除该行，并触发各产品 decision ledger 的级联删除。用户可以在任何 XingAI 产品的设置页面导出或删除所有数据。

`health_conditions` 和 `financial_profile` 在应用日志中绝不以明文记录——包括开发环境。

## 这能做什么

Personal Memory Engine 上线后，一条推荐可以这样说：

> "鉴于您保守的风险承受能力、脂肪肝状况，以及您女儿将在 3 年内备考医学院，这里是一个调整方案：在维持流动性以备学费的同时，在当前宏观环境下保持防御性持仓。"

没有聊天机器人能说出这句话。不是因为它缺乏 LLM 能力——而是因为它不知道跨场景的你是谁。

记忆就是护城河。

**延伸阅读：** [Engineering System ADR-001：Personal Memory Engine](https://github.com/xingaiapp/xingai-engineering-system/blob/main/docs/adr/001-personal-memory-engine.md)
