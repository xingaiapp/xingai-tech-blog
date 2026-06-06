# 决策缓存边界：Worker 计算，API 读取

**日期：** June 6, 2026  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `decision-cache` `worker` `fastapi` `cqrs` `ai-safety`  
**语言：** [English](2026-06-06-invest-ai-decision-cache-boundary.md) · 中文

---

Invest AI 最重要的架构规则很简单：

```txt
Worker/core 计算决策。
FastAPI 读取缓存。
Frontend 负责渲染。
```

这条规则存在，是因为金融 UX 很容易在每一层“顺手补一点”时变危险。Dashboard route 可能重新算 rank。React 组件可能从 raw quote 推断 risk。通知 job 可能自己生成 action label。

每一种都是第二套决策引擎。

## 什么属于 worker

任何会改变投资解释的字段：

- Macro state。
- FRED factors。
- Engine scores。
- Consensus。
- Risk budget。
- Allocation。
- Top-signal ranking。
- Symbol overlays。
- Decision events。
- Stale/degraded semantics。

worker 把这些字段写入 `v2:dashboard:today`。

## 什么属于 FastAPI

FastAPI 可以：

- 读取 SQLite/cache rows。
- 选择预计算 scope。
- validate / serialize payload。
- 附加 `cache_meta` 与 freshness metadata。
- 执行 auth 与 rate limits。
- 返回明确 cache-miss 或 stale-data errors。

它不通过获取 live market data 来修复缺失决策字段。

## 为什么重要

这让系统更容易测试、更容易解释，也更安全。Dashboard、email、PDF 如果说同一件事，是因为它们读取同一份 cached decision package。

这就是重点。

**延伸阅读：** ADR-012（`docs/adr/012-decision-cache-boundary.md`）。
