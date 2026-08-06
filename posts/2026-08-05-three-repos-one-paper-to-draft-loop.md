# Three Repos, One Paper-to-Draft Loop

**Date:** August 5, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** Invest AI · InvestSim · Robinhood MCP  
**Tags:** `invest-ai` `investsim` `mcp` `robinhood` `paper-trading` `adr` `worker-cache`  
**Also available:** [中文](2026-08-05-three-repos-one-paper-to-draft-loop.zh.md)

---

## The split that keeps people honest

Invest AI ranks and caches. InvestSim papers many sleeves. Robinhood MCP drafts orders under gates.

If any one of those owns *everything*, you get either a fake broker or three Yahoo series that disagree next month.

## The contract

```txt
Worker bars/signals/paper/lab  →  InvestSim evidence + preferred
                               →  MCP fail-closed draft
                               →  Human G1 confirm
                               →  place_* still gated
```

Eligible evidence means "allowed to draft with citation." It does **not** mean "autotrade."

## Why this shipped as ADRs, not vibes

- Invest AI ADR-035–039: events → bars → paper → strategy-lab → EEE
- InvestSim ADR 0024/0031: mcp-preferred + Tier-2.5 sleeves
- Robinhood MCP ADR-010/011: consume evidence + prefer lab strategy

System design article: `xingai-enterprise-ai-design/articles/2026-08-05-invest-lab-feedback-loop-invest-ai-sim-mcp.md`.

## Takeaway

Share bars. Separate ownership. Never confuse lab green lights with broker authority.
