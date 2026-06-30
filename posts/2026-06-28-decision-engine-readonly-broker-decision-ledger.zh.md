# 只读券商、可写账本：Decision Engine ADR-014 与 ADR-015

**日期：** 2026-06-28  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest Decision Engine](https://github.com/xingaiapp/xingai-invest-decision-engine)  
**标签：** `decision-engine` `robinhood` `mcp` `audit` `decision-ledger`  
**英文：** [2026-06-28-decision-engine-readonly-broker-decision-ledger.md](2026-06-28-decision-engine-readonly-broker-decision-ledger.md)

---

Robinhood [Agentic Trading](https://robinhood.com/us/en/support/articles/agentic-trading-overview/) 允许 Agent 读持仓并下单 — 用户甚至可配置**无需逐笔确认**自动执行。

Decision Engine 用两篇新 ADR 走反方向：

- **[ADR-014](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/014-robinhood-mcp-readonly.zh.md)** — 本仓 Robinhood MCP **只读**；代码中无下单函数。
- **[ADR-015](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/015-decision-ledger.zh.md)** — 日报中每条建议写入本地 **decision ledger**（[跨产品 schema](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md)）。

执行门控在 Invest AI [ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.zh.md)。Decision Engine 只做**建议生产者**。

## ADR-014：只读连接器

`broker/robinhood_client.py` 可读账户、持仓、流水。**禁止** `place_*` — 无配置开关、无「仅开发」例外。

评分引擎未完工前为何仍接 Robinhood？

- 验证 Agentic 账户资金与隔离
- 不依赖 `daily_scores.v1.json` 演示持仓
- 券商层与 Module 2–11 解耦

`daily_brief` 输出 Buy/Hold/Sell 供人在 **Robinhood UI** 手动操作 — 渲染器不调写 API。

## ADR-015：账本首用

```text
每条建议一行 → 各产品本地 SQLite → 无中心库
```

`record_decisions()` 与 `render_markdown()` **分离** — 可预览不写库。

`action_taken`/`outcome` 初值为 `null`（[ADR-003](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/003-human-in-the-loop.zh.md)）— 正常状态。

## 组合关系

```text
评分（未来）→ daily_scores.v1.json
        ↓
render_markdown() → 人读简报
record_decisions() → decisions.sqlite
broker 只读 → 可选账户上下文
        ↓
Invest AI（ADR-026）→ 仅宏观叠加，不执行
```

**延伸阅读：** [ADR-026](2026-06-25-two-repos-one-score-contract-adr-026.zh.md) · [ADR-028](2026-06-25-robinhood-mcp-execution-gates-adr-028.zh.md)
