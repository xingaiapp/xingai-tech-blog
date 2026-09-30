# 研究平面 vs 决策平面（ADR-055）

**日期：** 2026-09-29  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** Invest AI  
**标签：** `invest-ai` `evidence` `adr` `cqrs` `agentic-ai` `governance`  
**英文：** [English](2026-09-29-research-decision-plane-evidence-contract.md)

---

## 拒绝说谎的演示

Invest 演练原定路径：地图 → Micron → 13F 持仓。Micron 快照没有可核验的 13F 引用。演示披露缺口，持仓改用 NVIDIA。

这就是产品规则在干活：**无出处，不宣称。** 支持一只标的的证据不能支撑另一只。

## 架构缺口

[ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.md) 已规定 worker 计算、API 只读。它还没命名更软的拆分：

- **研究平面：** 证据支持什么？
- **决策平面：** 在目标与约束下该怎么做？

想要建议，不会让弱证据变强。有出处的持仓本身也不等于「这个用户该买」。

## 证据契约（planned）

[ADR-055](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/055-research-decision-plane-evidence-contract.md) 采纳该模式并标为 **planned**。研究应向决策提交数据包：主张、来源段落、日期、直接/推导/推断、核验状态、未决缺口——并**保留**缺失字段。

**不宣称：** 已部署的契约 schema、强制 Research→Decision 门、血缘指标或准确率提升。

线上近亲：公开 `/ai-map` 引用、ADR-054 隐藏无出处落地页卡片、Growth Engine 只写事实 + 人工门（ADR-050）。

长文教学版：[企业设计文章](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-09-29-research-decision-plane-evidence-contract.zh.md)。

## 收束

守住 CQRS。加上能拒绝的证据交接。来源停在哪里就指出来——别用叙事蒙过去。
