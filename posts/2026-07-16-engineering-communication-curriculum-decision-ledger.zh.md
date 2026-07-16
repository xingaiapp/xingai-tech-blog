# 语法正确不等于资深沟通：14 天技能课程 + Decision Ledger

XingAI Engineering Communication Coach 不是 Grammarly 套壳。产品问题是：非母语工程师今天该练什么，才能让明天的设计评审、事故同步、或对不合理截止日期说「不」听起来像资深——而不只是语法正确？

2026-07-16 我们把答案锁进两份合约：**14 天沟通与魅力课程**，以及既有的 **Decision Ledger** 评审写入路径。

## 边界

「工程师英语 AI」演示里常见两个坑：

1. **随机场景** —— 用一次就噪声，没有技能阶梯。
2. **只改语法** —— 句子干净了，仍是「I think maybe…」、缺下一步、领导力语气弱。

教练日环故意固定：

```text
今日技能（为何重要）
  → 真实工程场景（角色、受众、风险）
  → 用户先写 5–10 句
  → 评审：逐句 → Level 1/2/3 → 最终版
       → 可复用表达 → 声音 → 微练习
       → 一个焦点
```

可以给提示。用户尝试前给完整范文——不行。

## 课程负责排序

第 1–14 天覆盖第一印象、信任、自信、设计评审发言、技术叙事、声音、读懂房间、困难反馈、防御型同事、说不、礼貌打断、化解冲突、领导者倾听、得体闲聊。第 14 天后循环进阶（高管汇报、架构影响、事故领导力、协商）。

采纳评审会推进 `curriculumDay`。这是档案状态——不是第二张记忆表。

## 台账负责记忆

评审仍映射到共享 Decision 形态（ADR-001）：润色版 → `recommendation`，解释 → `reasoning`，短语 → `alternatives`，改进点 → `risks`，采纳/修改/拒绝 → `action_taken`。弱点仍是从近期 `risks` **派生**的视图，与 Meal AI、Invest 接入台账的纪律一致。

因此：课程回答「练什么」；台账回答「我们建议了什么、用户怎么处置」。

## 我们没做什么

- 自造 `weakness_patterns` 真相源。
- 尚未上线 Email/Push 或多设备持久历史（脚手架仍偏内存/本地）。
- 不伪装成认证语言测评。

## 链接

- 产品（计划）：https://engineering-coach.xingai.app  
- 仓库：https://github.com/xingaiapp/xingai-engineering-coach-ai  
- ADR-001：https://github.com/xingaiapp/xingai-engineering-coach-ai/blob/main/docs/adr/001-decision-ledger-adoption.md  
- ADR-002：https://github.com/xingaiapp/xingai-engineering-coach-ai/blob/main/docs/adr/002-14-day-communication-curriculum.md  
- 目录：https://xingai.app（Engineering Communication Coach — coming soon）
