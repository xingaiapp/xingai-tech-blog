---
title: "Loop Engineering：为什么企业 AI 的真正资产是运行时"
author: Xing Wang
date: 2026-07-03
tags: [loop-engineering, context-engineering, harness-engineering, agent-runtime, enterprise, architecture]
description: 企业 AI 已从 prompt engineering 演进到 loop engineering。三层架构——context、harness、loop——揭示了为什么持久的护城河是运行时，而非模型。
---

# Loop Engineering：为什么企业 AI 的真正资产是运行时

> *完整深度文章：[超越 Prompt Engineering：为什么企业 AI 是一个运行时问题](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-03-beyond-prompt-engineering-loop-engineering.zh.md) (enterprise-ai-design)*

AI 工程学科演进很快。我们从 prompt engineering 到 context engineering，再到 harness engineering，现在到了 **loop engineering**——系统通过 plan → execute → evaluate → reflect 周期自主追求目标。

## 三层技术栈

一个生产级 AI Agent 不是带 UI 的 prompt。它是三个不同的工程层：

```
+--------------------------------------+
| Loop Engineering                     |
| 调度 • 反思 • 自主性                   |
+--------------------------------------+
| Harness Engineering                  |
| Agent • 工具 • 技能 • 运行时           |
+--------------------------------------+
| Context Engineering                  |
| Prompt • 记忆 • RAG • 知识            |
+--------------------------------------+
```

**Context** 控制模型知道什么。**Harness** 控制工作如何执行——工具调用、权限、多 Agent 协作、状态管理。**Loop** 控制工作何时发生、什么在重复、何时停止。

## 为什么运行时比模型更重要

每家公司都能买 GPT、Claude、Gemini 或 DeepSeek。很少有公司拥有：

- **决策记忆**——记录组织做了什么决定、为什么做
- **评估系统**——衡量输出质量的能力
- **反馈循环**——根据业务校准运行的调度器 + 评估器
- **Agent 运行时**——工具注册表、沙箱、状态管理器、权限系统

模型在更好的模型发布那天就贬值。运行时随着每次运行而升值。

## 终止条件最重要

每个生产级循环必须定义三件事：

1. **入口点**——什么触发循环（用户请求、cron、webhook、Slack）
2. **循环体**——plan → execute → evaluate → reflect
3. **终止条件**——目标达成、最大迭代次数、预算耗尽、无进展

跳过终止条件，你得到的就是一个有企业信用卡的无限 token 生成器。防护栏——迭代上限、token 预算、进度检测、人工审批关卡——在 harness 和 loop 层中，不在 prompt 里。

## XingAI 如何验证

每个 XingAI 产品锻炼三层技术栈的不同切面：

| 产品 | 关键模式 |
|------|---------|
| Invest AI | Worker-cache CQRS、宏观 regime overlay、执行关卡、个人记忆 |
| Decision Engine | 多时间框架评分循环、只读 broker harness、跨产品账本 |
| Polymarket AI | Scanner-to-confirm 循环、Kelly sizing、通知 vs 确认边界 |
| Enterprise POCs | Supervisor 编排、MCP 网关治理、事件总线设计 |

跨产品的结论一致：**模型生成智能；运行时交付价值；循环创造自主性。**

## 架构优先级

面向 AI 原生平台设计的团队：

- **目标优先于提示词**——为结果设计
- **运行时优先于模型**——投资于价值复合增长的地方
- **记忆优先于对话**——持久化跨会话的重要信息
- **评估优先于生成**——衡量质量 > 产出数量
- **循环优先于工作流**——自适应迭代 > 僵化管道
- **从第一天就开始治理**

完整文章——包括 15 个构建模块清单、Micro Loop Engine 模式、功能 vs 治理架构拆分，以及云计算类比——在这里：[超越 Prompt Engineering](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-03-beyond-prompt-engineering-loop-engineering.zh.md)。
