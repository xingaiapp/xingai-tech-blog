# Agentic 不等于自动交易

**日期：** June 6, 2026  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `agentic-ai` `mcp` `product-boundary` `invest-ai` `safety`  
**语言：** [English](2026-06-06-invest-ai-v4-agentic-platform-boundary.md) · 中文

---

“Agentic” 是一个被过度使用的词。在投资产品里，它必须有边界。

对 Invest AI V4 来说，agentic 意味着：

```txt
Observe -> trigger -> draft -> explain -> user approves
```

它不意味着：

```txt
AI places trades
```

## 产品方向

V4 规划的是从被动分析走向主动辅助：

- Watch rules。
- Portfolio context。
- Triggered recommendations。
- Push/email notifications。
- Audit logs。
- Paid accounts。

这是一次真实产品升级，也是真实风险升级。

## 边界

平台可以观察和建议。用户做决定。

券商集成默认只读。每条推荐都要可审计。法律 review 是上线 gate。结构性风险治理是平台 gate。

## 为什么先写再写代码

没有边界 ADR，“agentic” 就只是一种感觉。有了边界 ADR，它才是契约。

这个契约防止团队不小心跨进 trade execution、custody、tax advice 或 fiduciary positioning。

## 一句话

在金融产品里，agentic product design 首先要定义 agent 不能做什么。

**延伸阅读：** ADR-015（`docs/adr/015-v4-agentic-platform.md`）。
