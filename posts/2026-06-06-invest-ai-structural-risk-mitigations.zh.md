# AI 投资产品里的结构性风险

**日期：** June 6, 2026  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `risk` `ai-safety` `market-data` `llm` `invest-ai`  
**语言：** [English](2026-06-06-invest-ai-structural-risk-mitigations.md) · 中文

---

AI 投资产品危险的地方不只是答错。更危险的是：脆弱结构上长出一个很自信的答案。

Invest AI 在进入执行级流程前跟踪三类结构性风险：

1. 单一市场数据源。
2. confidence 衡量的是相关引擎一致性，不是校准后的准确率。
3. LLM explanation drift。

## 数据源风险

如果所有引擎都读取同一份 stale quote cache，系统可能内部一致，但外部错误。

缓解方式不是“在 API 里直接抓 live data”。那会破坏决策边界。真正的缓解是 freshness gates、provider checks、heartbeat monitoring 和明确 degraded states。

## Confidence 语义

Engine agreement 有价值。但它不等于盈利概率。

如果六个引擎都是同一组输入的代数变换，高一致性主要说明输入指向同一方向，并不证明正确。

## 解释漂移

LLM prose 可能比结构化决策更有说服力。这正是风险所在。

对 Invest AI 来说，用户可见 prose 要么 template-first，要么通过 cached decision payload 的一致性检查。

## 一句话

在加入 broker sync 或 agentic workflows 前，先命名结构性风险，再把它们变成 gate。

**延伸阅读：** ADR-014（`docs/adr/014-structural-risk-mitigations.md`）。
