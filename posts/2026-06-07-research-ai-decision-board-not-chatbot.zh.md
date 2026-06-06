# 决策板，不是聊天框：Research AI 为什么只给一个结论

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `decision-system` `product` `learning` `ux`  
**语言：** [English](2026-06-07-research-ai-decision-board-not-chatbot.md) · 中文

---

Google 回答 *是什么*。Research AI 回答 *今晚值不值得*：

> MCP 和 RAG，我该花一小时学哪个，还是都不学？

## 一屏一个结果

每次查询返回 **决策板**：

- 结论 — 现在学 · 稍后再学 · 跳过 · 委派  
- 学习 ROI（0–100）  
- 30 分钟路线 + 排序来源  

没有聊天线程。默认不是长文。要深度？去看来源，不是再开一轮对话。

## 为什么不做聊天优先

聊天把结论埋在滚动条下面，还没决定要不要学就先追问。我们的主流程是 **决策**，不是对话。

## 后端同一套逻辑

Worker 拥有推理，API 只读（ADR-002）。UI 渲染缓存字段，不在前端重算。

**延伸阅读：** `xingai-research-ai/docs/adr/001-learning-decision-system.zh.md`
