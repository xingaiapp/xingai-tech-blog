# 只读优先 MCP：Robinhood Agentic Trading 与 ADR-028 执行门控

**日期：** 2026-06-25  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `mcp` `robinhood` `human-in-the-loop` `execution-gates` `agents` `risk`  
**语言：** [English](2026-06-25-robinhood-mcp-execution-gates-adr-028.md) · 中文

---

Robinhood [Agentic Trading MCP](https://robinhood.com/us/en/support/articles/agentic-trading-overview/) 允许第三方 agent 在专用 **Agentic 账户** 读持仓并下单。用户甚至可配置**无需逐笔确认自动执行**。

XingAI 立场相反：**MCP 默认只读，写操作须人工批准。** 这不是口号 — 见 [ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.zh.md)。

## 有 Wiki 为什么还要 ADR？

[Robinhood MCP Wiki](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/wiki/robinhood-agentic-trading-mcp.zh.md) 说明工具目录。ADR-028 定义 **Invest AI 何时可调用** — 可在 code review 中执行。

相关：[ADR-003 MCP 分阶段](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/003-mcp-phased-rollout.zh.md)、[ADR-014 结构性风险](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/014-structural-risk-mitigations.zh.md)、Decision Engine [ADR-003 人工确认](https://github.com/xingaiapp/xingai-invest-decision-engine/blob/main/docs/adr/003-human-in-the-loop.zh.md)。

## Phase 1：只读

| 当前允许 | 门控通过前禁止 |
|----------|----------------|
| `get_portfolio`、报价、自选 | `place_equity_order`、`place_option_order` |
| 开发沙箱 / 工程 skill | 生产一键下单 |
| 仅展示 enrichment | 无用户确认的自动执行 |

MCP 读工具**不得**修改缓存决策分（[ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.zh.md)）。

## 门控 G1–G7（写工具全部必需）

| 门控 | 要求 |
|------|------|
| **G1** | 用户在 UI 明确确认每笔订单 |
| **G2** | 升级认证（延伸 [ADR-024](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/024-admin-email-otp-step-up.zh.md) OTP 模式） |
| **G3** | Worker 数据新鲜度为绿 — 降级时不交易 |
| **G4** | ADR-014 结构性风险清单 |
| **G5** | 订单须引用缓存 `v2:dashboard:today` — 非现场 LLM 编造 |
| **G6** | 仅 Agentic 账户（Robinhood 政策） |
| **G7** | 审计：用户、时间戳、工具、参数 hash、决策快照 id |

任一门控缺失 → 生产写工具 **拒绝**。

## 分阶段 R0–R3

| 阶段 | 能力 | Invest AI 界面 |
|------|------|----------------|
| **R0** | 开发环境读工具 | 无交易按钮 |
| **R1** | 设置页读持仓 | 持仓 overlay |
| **R2** | 由缓存建议起草订单 | 用户在弹窗确认 |
| **R3** | G1–G7 通过后 MCP 下单 | 记录执行 + 回执 |

Cursor skill：`rh-mcp-read-*` 允许；`rh-mcp-trade-*` 至 R2 前 gated。`XINGAI_MCP_TRADE_ENABLED=true` 永不默认开启。

## Decision Engine 不参与执行

Decision Engine **永不**调用 Robinhood MCP，只输出建议。执行仅在 Invest AI（或用户 agent 环境）并带审计。

## 我们拒绝的方案

- MCP 全自动交易 — 责任与品牌不符。
- FastAPI 请求路径内调 MCP — 破坏缓存边界与审计。
- 仅 Wiki 无 ADR — 无法在评审中强制执行。

**延伸阅读：** [6 月 24 机会雷达](2026-06-24-xingai-opportunity-radar-agent-stack.zh.md) · [MCP 架构实践](2026-06-03-mcp-architecture-best-practices.zh.md)
