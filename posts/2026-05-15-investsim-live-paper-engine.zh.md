# 中文 · InvestSim 变成可运行的纸面引擎

**日期：** May 15, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [InvestSim / invest-performance-sim](https://github.com/xingaiapp/invest-performance-sim) (private)
**标签：** `paper-trading` `nextjs` `turso` `vercel-cron` `invest-ai` `simulation` `adr`
**语言：** [English](2026-05-15-investsim-live-paper-engine.md) · 中文

---

## 变了什么

InvestSim 起初只是能展示「今日 AI 选股」的仪表盘。现在它是一套小而确定的纸面交易引擎。

线上信号来自 Fly.io 上的 Invest AI：

```text
https://xingai-invest-ai-api.fly.dev
```

应用读取：

- `GET /api/v2/signals/top` — 当前 AI 选股
- `GET /api/v1/tickers?symbols=...` — 延迟/规范化报价

## V1 规则

引擎故意保持简单：

1. 起始资金 `$10,000`
2. 最多持有一只标的
3. 空仓时买入最新 AI 选股
4. 持仓时按优先级卖出：
   - `STOP`：−5%
   - `TIME_EXIT`：持仓满 2 个自然日
   - `ROTATE`：AI 选股变化
5.  fractional 股数向下取整到 4 位小数
6. 若该美东交易日已有引擎成交记录则跳过

这不是券商，也不是投资建议。是可复现的模拟。

## 为什么一个 Cron

每日 Vercel Cron：

```text
/api/cron/daily-run
```

顺序做两件事：

1. 拉取当前 AI 选股
2. 执行纸面交易规则

一条路由比拆成 ingest + trade 两个任务更好推理。

## 新增 ADR

InvestSim 有自己的 ADR 索引：

```text
docs/adr/README.md
docs/adr/0001-turso-bootstrap-runtime.md
docs/adr/0002-v1-paper-trade-engine.md
```

第一篇说明为何 Turso schema 在受保护的 Vercel 运行时里 bootstrap；第二篇锁定 V1 交易规则。

## 仍刻意不做的

- 价格是后端报价快照，不是交易所成交
- V1 用自然日算持仓时长；真实交易日历可后补
- 滑点目前为 `0`
- 无实盘券商连接

纸面实验室要先透明，再谈「看起来很专业」。

---

**License:** This post follows the [XingAI Tech Blog](../README.md) **CC BY 4.0** policy.
