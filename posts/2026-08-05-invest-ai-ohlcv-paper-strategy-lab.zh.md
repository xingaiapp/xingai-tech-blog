# 中文 · 从信号事件到 Strategy Lab：Invest AI 内由 Worker 拥有的纸面

**日期：** 2026-08-05  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `invest-ai` `paper-trading` `ohlcv` `strategy-lab` `eee` `cqrs` `adr`  
**语言：** [English](2026-08-05-invest-ai-ohlcv-paper-strategy-lab.md) · 中文

---

## 链条

```txt
ADR-035 持仓信号事件
  → ADR-036 Worker OHLCV（Yahoo 只在 Worker 后）
  → ADR-037 纸面账本 + /execution-log
  → ADR-038 基于缓存 K 线的 strategy-lab
  → ADR-039 导出到共享评估注册表（EEE）
```

036 之前，chart-lab 和 InvestSim 可能各自拉 Yahoo 并分叉。现在程序化消费者在缓存未命中时 fail-closed（`503`），而不是把 FastAPI 变成抓取代理。

纸面账本是真实的审计形态状态——仍远离券商风险。Strategy lab 在同一组 K 线上比较策略，不得在请求路径改纸面账本。EEE 导出让回归在仪表盘 JSON 之外可见。

## 边界

Worker 写。FastAPI 读。策略评估是缓存上的历史计算，不是第二套实时决策引擎。

## 要点

纸面与回测应挨着已拥有真相的信号缓存——而不是旁路再开一个 Yahoo 客户端。

**延伸阅读：** ADR-035–039 · `2026-08-05-three-repos-one-paper-to-draft-loop.md`。
