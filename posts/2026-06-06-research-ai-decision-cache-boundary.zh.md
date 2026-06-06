# 学习决策边界：Research AI 的结论由 Worker 拥有

**日期：** 2026-06-06  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `decision-cache` `worker` `fastapi` `learning` `cqrs`  
**语言：** [English](2026-06-06-research-ai-decision-cache-boundary.md) · 中文

---

Research AI 回答的问题和 Google 不同：

> *今晚值得在这个主题上花时间吗？*

**现在学 / 稍后再学 / 跳过 / 委派** — 这层结论不能在 Worker、API、前端各算一套。

## 规则

```txt
research-ai-worker   → 流水线 + 写入 v2:research:{hash}
research-ai-back-end → 只读缓存、入队、限额
research.xingai.app  → 渲染缓存字段
```

与 Invest AI ADR-012 同思路：**一个决策引擎，一行缓存。**

## Worker 拥有

结论、ROI、路线、来源、讨论、知识图谱、trending 预热。

## FastAPI 不做

在请求线程里调 OpenAI「补」缓存。

**延伸阅读：** `xingai-research-ai/docs/adr/002-decision-cache-boundary.zh.md`
