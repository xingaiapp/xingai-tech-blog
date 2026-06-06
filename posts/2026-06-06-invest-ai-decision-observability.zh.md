# 决策可观测性：让 AI 信号可审计

**日期：** June 6, 2026  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `observability` `decision-events` `macro-radar` `invest-ai`  
**语言：** [English](2026-06-06-invest-ai-decision-observability.md) · 中文

---

AI 投资 dashboard 不应该只展示答案。它应该展示答案为什么变化。

这就是 Invest AI 加入 decision observability 的原因：decision events、macro radar factors、cache freshness，以及可追溯到结构化字段的 worker-owned explanations。

## 问题

没有可观测性时，用户只看到：

```txt
Protect Capital
13 / 100
```

但不知道它来自 volatility、macro stress、weak breadth、stale data，还是 engine disagreement。

## 形态

Decision observability 把 payload 变成原因时间线：

- Consensus events。
- Macro radar events。
- Engine events。
- Signal candidates。
- Stale/degraded state。

这些事件由 worker cache 生成，不由 frontend 临时发明。

## UX 规则

产品顶部仍然 decision-first。细节逐步展开：

1. Header 与 hero card 说明该怎么做。
2. Event feed 解释发生了什么变化。
3. Macro radar 展示 factor layer。
4. Dashboard 让用户检查完整状态。

## 一句话

可观测性不只是给 operator 的。在决策产品里，可观测性也是用户信任的一部分。

**延伸阅读：** ADR-013（`docs/adr/013-v11-decision-observability.md`）。
