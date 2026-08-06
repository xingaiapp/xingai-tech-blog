# 中文 · 先证据后 draft：Robinhood MCP 开始读 InvestSim

**日期：** 2026-08-05  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Robinhood MCP](https://github.com/xingaiapp/xingai-robinhood-mcp)  
**标签：** `mcp` `robinhood` `investsim` `execution-gates` `human-in-the-loop` `adr`  
**语言：** [English](2026-08-05-robinhood-mcp-investsim-evidence-handoff.md) · 中文

---

## 控制面之后还缺什么

ADR-008 给了网关 HTTP 控制面。`signal_watcher` 仍只按 Invest AI Top-1 起草，InvestSim 证据停在「以后再说」。

### ADR-010 — 消费 execution evidence

设置 `INVESTSIM_BASE_URL`（或强制证据）时，`run_once()` 在起草**之前**拉 `GET /api/execution/evidence/latest`，模式不过则拦截：

- `require_eligible`（默认）
- `require_present`
- `off`

Draft 带 `invest_sim_evidence` + `source_ref`。`place_equity_order` 路径不变（仍是 G1–G7）。

### ADR-011 — 偏好实验室策略

策略 slug：

1. 运维覆盖 `INVESTSIM_EVIDENCE_STRATEGY`
2. 开启 prefer-lab 时用 `GET /api/mcp-preferred`
3. 回退 `ai-top-1`

标的/方向仍来自 Invest AI Top-1 Buy。InvestSim 从不被叫去 `place_*`。证据合格仍不自动批准。

## 要点

把实验室接到起草门。把人留在成交门。

**延伸阅读：** Robinhood MCP ADR-010 / 011 · InvestSim ADR 0024 · 2026-08-05 环路博文。
