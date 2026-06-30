# 扫描器算数、人点头：Polymarket AI Phase 1–2

**日期：** 2026-06-28  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Polymarket AI](https://github.com/xingaiapp/xingai-polymarket-ai)  
**标签：** `polymarket` `human-in-the-loop` `kelly` `prediction-markets`  
**英文：** [2026-06-28-polymarket-scanner-human-confirm.md](2026-06-28-polymarket-scanner-human-confirm.md)

---

Polymarket AI 扫描市场、估 edge、用 fractional Kelly 定仓。典型翻车：cron 接 CLOB，edge > 5% 自动下单。

我们走反方向 — [ADR-002](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/002-decision-boundary-human-approval.zh.md)、[ADR-004](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/004-telegram-notify-vs-confirm.zh.md)。

## Worker 算；人批

```text
Scanner  →  edge + Kelly + 风险门控  →  SQLite + 审计
CLI      →  ConfirmationHandler y/n/q
执行     →  Phase 1–2 无
```

`auto_approve=True` **仅**回测/纸面。

## 人看到列表前的硬门控

阈值在 `config/strategy.yml`：最小 edge、单注上限、日损停、相关性去重。人只在**预过滤**后的 EXECUTE 里选。

## Telegram：通知 ≠ 确认

Phase 2 桩可发 Telegram 告警，**不等待回复**；批准仍在 CLI。

[ADR-004](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/004-telegram-notify-vs-confirm.zh.md) 规定 Phase 3 须 `YES <trace_id>` 回复。[ADR-003](https://github.com/xingaiapp/xingai-polymarket-ai/blob/main/docs/adr/003-live-clob-execution-gates.zh.md) 为 Phase 4+ CLOB 写设 G1–G7。

## 与 Invest AI 同一条品牌线

Decision Engine ADR-003、Invest AI ADR-028 同一模式：**决策助手，非自动交易。**

**延伸阅读：** [MCP 架构实践](2026-06-03-mcp-architecture-best-practices.zh.md)
