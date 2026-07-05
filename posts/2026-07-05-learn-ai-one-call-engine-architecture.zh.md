# 面试准备是决策问题：Learn AI 的单次调用 Engine 架构

**日期：** 2026 年 7 月 5 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Learn AI](https://learn.xingai.app)
**标签：** `learn-ai` `decision-system` `cache-first` `llm-cost` `engines` `patterns`
**英文版：** [English](2026-07-05-learn-ai-one-call-engine-architecture.md)

---

LeetCode 告诉你*解什么*，却从不回答真正决定你面试成败的问题：**下一步该练什么？**

这是决策问题，不是内容问题——所以 [Learn AI](https://learn.xingai.app) 和每个 XingAI 产品一样：决策系统，不是聊天机器人。粘贴一道面试题（或它的截图），它回答的是：pattern、面试官意图、你的缺口、下一道最优题——还带 company 感知。

## 掌握 pattern，而不是题目

领域模型是知识图谱：`PatternFamily → Pattern → Question`，叠加你的 `LearningHistory`、`PatternMastery`、`MistakeRecord`。"Two Sum" 的意义仅在于它是你处理哈希表 pattern 能力的证据。就绪度是由 pattern 覆盖率、薄弱点消减、连续性算出的分数——不是解题计数。

## 一次 LLM 调用，九个 Engine

显而易见的架构是每个关注点调一次 LLM：分类、意图、前置知识、pattern 映射、讲解、replay 步骤、相似题、推荐。每道题九次调用。

Learn AI 只调**一次**。单次分析调用返回一个 JSON 文档；各 engine 是它之上的*解析器和后处理器*。只有需要数据库的 engine——相似题、company 感知推荐、就绪度——自己干活，对象是 SQLite，额外 LLM 调用为零（[ADR-002](https://github.com/xingaiapp/xingai-learn/blob/main/docs/adr/002-single-call-engines.zh.md)）。

模块化保留了（每个 engine 作为纯函数独立可测），但没有 9 倍成本、9 倍延迟，也没有九个答案互相打架的可能。

## 对 worker 标准的诚实偏离

XingAI 全局标准说：逻辑放 worker、API 读缓存、前端渲染缓存。它的前提是输入可枚举——N 只股票、M 份餐谱。晚上 11 点粘贴进来的面试题不可枚举，没有任何东西可以预计算。

所以 Learn AI 把 LLM 放进请求路径——由三层缓存守护：

| 层 | Key | 省下的 |
|---|---|---|
| OCR | sha256(图片) | 重复上传截图的 vision 调用 |
| 分析 | hash(文本 + 图片) | 重复题目的完整分析调用 |
| 相似题 | category:subcategory:pattern | 按 pattern 重新生成（缓存 20 取 5） |

缓存命中 → 零 LLM 参与。未命中 → 恰好一次调用，之后所有人共享。成本随*不同题目数*增长而不是流量——而面试准备里，大家问的就是同一批题。标准的目标（"页面加载不调 LLM"）达成了；机制不同，而且这次偏离写成了 ADR，没有静默漂移。

## 下一步：给自己的推荐打分

Learn AI 刚采用了跨产品 [Decision Ledger](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md)（[ADR-003](https://github.com/xingaiapp/xingai-learn/blob/main/docs/adr/003-decision-ledger.zh.md)）——每条"下一步练这个"都成为台账行。与多数产品不同，我们真能测量 `action_taken`：7 天内你分析了命中推荐 pattern 的题，就是跟随了推荐；下一次掌握度更新会告诉我们它*有没有用*。

一个会用你的结果给自己建议打分的面试准备工具——这就是决策系统和内容库的区别。
