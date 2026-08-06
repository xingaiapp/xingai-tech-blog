# 中文 · 三个仓，一条纸面到 draft 的环

**日期：** 2026-08-05  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** Invest AI · InvestSim · Robinhood MCP  
**标签：** `invest-ai` `investsim` `mcp` `robinhood` `paper-trading` `adr` `worker-cache`  
**语言：** [English](2026-08-05-three-repos-one-paper-to-draft-loop.md) · 中文

---

## 让人保持诚实的切分

Invest AI 排名并缓存。InvestSim 跑多条纸面 sleeve。Robinhood MCP 在门控下起草订单。

任何一方「全都管」，结果要么是假券商，要么是三个下个月对不上的 Yahoo 序列。

## 契约

```txt
Worker K 线/信号/纸面/lab  →  InvestSim 证据 + preferred
                           →  MCP fail-closed draft
                           →  人确认 G1
                           →  place_* 仍门控
```

证据合格 =「允许带引用起草」。**不是**「自动成交」。

## 相关 ADR

Invest AI 035–039；InvestSim 0024/0031；Robinhood MCP 010/011。  
系统设计：`xingai-enterprise-ai-design/articles/2026-08-05-invest-lab-feedback-loop-invest-ai-sim-mcp.md`。

## 要点

共享 K 线。分清所有权。别把实验室绿灯当成券商权限。
