# 两套 Regime、一块仪表盘：技术层 vs 宏观层（ADR-027）

**日期：** 2026-06-28  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `macro-radar` `decision-engine` `regime` `integration` `adr`  
**英文：** [2026-06-28-dual-regime-technical-vs-macro-adr-027.md](2026-06-28-dual-regime-technical-vs-macro-adr-027.md)

---

[ADR-026](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/026-decision-engine-integration.zh.md) 之后，同一块仪表盘可能同时出现两种 **regime**：

1. **技术 regime** — Decision Engine 导入的 `daily_scores.v1.json`（QQQ 趋势、VIX、组合提示）。
2. **宏观 regime gate** — Invest AI `macro_radar.py` 的 `risk_on` | `neutral` | `caution` | `defensive`。

若语义不清，UI 与 MCP 门控可能当成一个数 — 仓位上限错、文案矛盾，或用陈旧技术层驱动宏观 combo。

[ADR-027](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/027-dual-regime-semantics.zh.md) 划清边界。

## 两层 — 禁止合并成一个字段

| 概念 | 来源 | 权威用途 |
|------|------|----------|
| 技术 regime | Decision Engine 导入 | 标的 `action`、`composite`、setup |
| 宏观 regime gate | `macro_radar.regime_gate` | combo 修正、折扣、`risk_budget_cap`、事件降级 |

宏观 gate **不得**覆盖 Decision Engine 的 `composite`/`action`，只能限仓与折扣（[ADR-011 第二层](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/011-score-export-contract.zh.md)）。

## 不一致时

技术层 `DEFENSIVE`、宏观 gate `neutral` 时 — **combo 以宏观 gate 为准**；UI **分别展示**，不做混合徽章。

## 导入降级

- `ok`：展示技术 regime，排名优先 `symbol_scores`
- `degraded`/缺失：技术块标不可用，宏观 gate 不变
- `as_of_date` 过期：仅技术块标 stale

## 与 MCP 门控

[ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.zh.md) **G5** 引用 `v2:dashboard:today` — 缓存须保持技术/宏观字段分离。

**延伸阅读：** [ADR-026 双仓分数契约](2026-06-25-two-repos-one-score-contract-adr-026.zh.md)
