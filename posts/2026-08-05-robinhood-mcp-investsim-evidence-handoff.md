# Evidence Before Draft: Robinhood MCP Now Reads InvestSim

**Date:** August 5, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Robinhood MCP](https://github.com/xingaiapp/xingai-robinhood-mcp)  
**Tags:** `mcp` `robinhood` `investsim` `execution-gates` `human-in-the-loop` `adr`  
**Also available:** [中文](2026-08-05-robinhood-mcp-investsim-evidence-handoff.zh.md)

---

## What changed after the control plane

ADR-008 gave the gateway an HTTP control plane. `signal_watcher` still drafted from Invest AI Top-1 alone while InvestSim evidence stayed "documented for later."

### ADR-010 — consume execution evidence

When `INVESTSIM_BASE_URL` is set (or evidence required), `run_once()` fetches `GET /api/execution/evidence/latest` **before** drafting and blocks unless the mode passes:

- `require_eligible` (default)
- `require_present`
- `off`

Drafts carry `invest_sim_evidence` + `source_ref`. `place_equity_order` path unchanged (still G1–G7).

### ADR-011 — prefer lab strategy

Strategy slug resolution:

1. Ops override `INVESTSIM_EVIDENCE_STRATEGY`
2. Lab `GET /api/mcp-preferred` when prefer-lab is on (default)
3. Fallback `ai-top-1`

Symbol/side still from Invest AI Top-1 Buy. InvestSim never called for `place_*`. Eligible evidence still does not auto-approve.

## Takeaway

Wire the lab into the draft gate. Keep the human on the place gate.

**Further reading:** Robinhood MCP ADR-010 / 011 · InvestSim ADR 0024 · loop post 2026-08-05.
