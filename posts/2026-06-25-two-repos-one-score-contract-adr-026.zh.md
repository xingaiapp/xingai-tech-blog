# 两个仓库、一份分数契约：Decision Engine ADR-011 与 Invest AI ADR-026

**日期：** 2026-06-25  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Invest AI](https://xingai.app/apps/invest-ai) + [Decision Engine](https://github.com/xingaiapp/xingai-invest-decision-engine)  
**标签：** `architecture` `decision-engine` `integration` `cqrs` `adr`  
**语言：** [English](2026-06-25-two-repos-one-score-contract-adr-026.md) · 中文

---

Invest AI 交付带宏观共识的生产 dashboard。Decision Engine 拥有多周期技术打分与回测。**两个仓库是刻意设计** — [Decision Engine ADR-002](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/002-sibling-invest-ai.zh.md)、[Invest AI 项目对比](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/project-comparison-invest-ai-vs-decision-engine.md)。

集成需要双方可执行的契约。契约即 **`daily_scores.v1.json`**。

## Layer 1 与 Layer 2

| 层 | 负责方 | 职责 |
|----|--------|------|
| **Layer 1 — 技术** | Decision Engine | M/W/D/K 综合分、硬门控、StockType 上限、regime 块 |
| **Layer 2 — 宏观 overlay** | Invest AI | FRED、事件日历、combo 修正、叙事 |

Decision Engine 不导入 FRED 或 LLM 解释层。导入启用后 Invest AI 不重写打分公式（[ADR-026](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/026-decision-engine-integration.zh.md)）。

## 导出契约（Decision Engine ADR-011）

规范产物：**`daily_scores.v1.json`**

关键字段：

- `version`、`rules_version`、`as_of_date`（T 日报告用 ≤ T−1）
- `regime.level` — 技术 regime
- `scores[]` — 每 ticker 综合分、setup、action、confidence

**生产门控：** 在 [ADR-009](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/009-backtest-integrity.zh.md) 四 regime 回测通过前，导出不得进入 Invest AI 生产 cache。

## 导入管道（Invest AI ADR-026）

```text
Decision Engine
  → daily_scores.v1.json
       ↓
stock-ai-worker (decision_engine_importer.py)
  → 校验 schema + rules_version + as_of_date
  → 合并进 build_payload()
  → macro_radar overlay（仅 cap/折扣）
  → SQLite v2:dashboard:today
       ↓
FastAPI（只读 — ADR-012 不变）
```

硬规则：

1. FastAPI 请求时不拉 Decision Engine。
2. 导入开启后 worker 不用原始 OHLCV 重算 composite。
3. 导入失败 → 保留上次好 cache；设 `decision_engine_import.status: degraded`。

## Regime 映射

| Decision Engine `regime.level` | Invest AI `macro_radar.regime_gate` |
|-------------------------------|--------------------------------------|
| `RISK_ON` | `risk_on` |
| `NORMAL` | `neutral` |
| `CAUTION` | `caution` |
| `DEFENSIVE` | `defensive` |

技术 regime 在 `decision_engine.regime` 中仅供参考。宏观 gate 仍权威决定 combo 修正。

## Phase 2 边界（Decision Engine ADR-012）

编码 indicators/scoring 前：

- `engine/` 写导出；`scheduler/` 跑美东 4:30pm 任务。
- `api/` 只读 — HTTP 不按需算分。
- 见 [ADR-012](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/012-phase2-scoring-scheduler-api.zh.md)。

## 为何不合并仓库？

- 发布节奏不同（量化规则 vs 产品 UX）。
- 回测门控在用户看到前拦住坏数学。
- Invest AI 缓存边界（[ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.zh.md)）保持不变。

**现状：** Decision Engine Phase 1 数据层已建；ADR 与 schema 已定；worker 导入路径在 ADR-026 实现清单中。
