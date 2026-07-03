# XingAI 不是聊天机器人，是决策引擎

**日期：** 2026 年 7 月 1 日
**作者：** Xing @ [XingAI](https://xingai.app)
**标签：** `xingai` `产品` `决策引擎` `ai架构` `个人决策智能`
**English:** [English](2026-07-01-xingai-decision-engine-not-chatbot.md)

---

现在所有人用 AI 做的事，都是在做聊天机器人。

你输入一个问题，得到一个答案，关掉标签页，然后忘掉它。

XingAI 不是这样的。

## 品类问题

当下 AI 产品有一个有用的分类框架：

| 产品 | 品类 |
|------|------|
| ChatGPT | 答案引擎 |
| Perplexity | 研究引擎 |
| Cursor | 编程引擎 |
| **XingAI** | **决策引擎** |

区别不在于界面——在于系统在对话*结束之后*对这次交互做了什么。

聊天机器人给你一个答案。决策引擎给你一个推荐，跟踪你如何处置它，然后用这个结果改善下一条推荐。

## 什么让决策引擎与众不同

这就是定义决策引擎的循环：

```
提问 → 上下文 → 工作流 → 推荐 → 行动 → 结果 → 反馈 → 学习
```

每一步都很重要。大多数 AI 产品止步于"推荐"。

XingAI 不止步于此。当你问"我应该卖掉 NVDA 吗？"系统会：

1. **加载你的上下文** —— 投资组合、风险承受能力、投资期限、税务状况
2. **运行工作流** —— 市场环境分析、仓位计算、相关性检查
3. **做出推荐** —— 买入/持有/卖出/减仓，附带推理过程和置信度
4. **记录决策** —— 写入 Decision Ledger：问了什么、推荐了什么、为什么、置信度
5. **后续跟进** —— "你持有了 NVDA。自那以来上涨了 12%。这是我们学到的东西。"
6. **持续改进** —— 下一条推荐受益于这次结果

没有任何聊天机器人做到第 4、5、6 步。这三步才是让决策产生复利的原因。

## Decision Ledger（决策账本）

每个 XingAI 产品——Invest AI、Meal AI、SAT AI、Decision Engine——都写入 Decision Ledger。Schema 是共享的、轻量的：

```
question:        "我应该卖掉 NVDA 吗？"
recommendation:  "持有 —— 等待 8 月 28 日财报"
reasoning:       ["技术动量强劲", "宏观环境：风险偏好模式", "持仓 8%——在限制范围内"]
confidence:      0.73
action_taken:    "followed"     ← 用户事后更新
outcome:         "30天内 +12%"  ← 用户或系统填写
lessons:         "宏观判断正确；技术信号得到确认"
```

这一行数据是可查询、可比较、可改进的。这不是聊天记录，是你的决策审计轨迹。

这个 Schema 与产品无关。一个膳食计划推荐和一个股票再平衡推荐存在同一个形状里。这是刻意为之——你最终可以问："在 XingAI 帮我做的所有决策里，今年我实际执行了哪些？哪些真的有回报？"

## Personal Memory Engine（个人记忆引擎）

聊天机器人每次对话都从零开始。

XingAI 不是。Personal Memory Engine 在所有产品之间持久保存你的上下文：

- 年龄、目标、约束条件
- 健康状况（传入 Meal AI，同时影响 Invest AI 的风险推荐）
- 财务画像（风险承受能力、投资期限、储蓄率）
- 家庭成员及其目标

当你告诉 XingAI"我在为女儿考医学院做规划"，这个上下文在你做投资决策、制定膳食计划、和她一起备考 SAT 时都是可用的。这些产品不是孤岛——它们是同一个人的不同视角。

## 为什么模型可以被复制，但决策可以复利

OpenAI 可以复制任何模型，Google 可以复制任何功能。

他们无法复制的是你的决策历史。

使用 XingAI 12 个月后，系统积累了：
- 你跟随了哪些投资推荐
- 你坚持了哪些膳食计划
- 哪些学习计划真正提高了你女儿的 SAT 成绩
- 从你的行为（而非表单填写）中了解到的真实风险承受能力

这条护城河随着每一个决策变得更深。这不是关于世界的数据——是关于*你*的数据，专门为了让你的下一个决策更好而结构化。

## XingAI 现在在建什么

今天，Decision Ledger 和 Personal Memory Engine 正在变成现实：

- **[Decision Engine ADR-016](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/016-cross-product-decision-ledger.md)** —— 跨产品 Decision Ledger：Invest AI 和 Meal AI 的每一条推荐都写入共享 Schema。
- **[Engineering System ADR-001](https://github.com/xingaiapp/xingai-engineering-system/blob/main/docs/adr/001-personal-memory-engine.md)** —— Personal Memory Engine：一个用户画像，跨所有 XingAI 产品共享。
- **[Meal AI ADR-003](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.md)** —— Meal AI 成为第二个 Decision Ledger 采用者，证明该 Schema 是跨领域通用的。

这就是从"AI 聊天机器人封装"到"个人决策操作系统"的路在实践中是什么样的：一个 ADR、一个产品采用、一个 Schema，一步一步来。

---

**Personal Decision Intelligence（个人决策智能）** 是这个品类。

XingAI 正在建造它。

---

*XingAI 各产品仅供参考，不构成财务、医疗或专业建议。*
