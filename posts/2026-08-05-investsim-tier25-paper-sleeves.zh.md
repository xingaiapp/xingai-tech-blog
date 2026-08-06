# 中文 · 再加五条纸面 sleeve：InvestSim Tier-2.5，不开新信号总线

**日期：** 2026-08-05  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [InvestSim](https://lab.xingai.app)  
**标签：** `investsim` `paper-trading` `strategy` `adr` `invest-ai`  
**语言：** [English](2026-08-05-investsim-tier25-paper-sleeves.md) · 中文

---

## 为什么是 Tier-2.5

Tier-2（ADR 0030）之后，下一批 sleeve 必须复用 Invest AI 的排名面——而不是发明平行信号总线。

ADR 0031 交付五条启用策略（sortOrder 21–25）：

| Slug | 思路 |
|------|------|
| `composite-ai-momentum` | 多因子元排名 |
| `ai-52week-high-momentum` | 最接近 52 周高的 AI 排名名 |
| `ai-fundamental-momentum-proxy` | 快照持续 + 置信度改善作修正代理 |
| `sector-dual-momentum` | 最强行业 ETF vs SHY |
| `gtaa-triad-rotation` | 风险资产轮动 + 债券安全篮 |

`ensureStrategies` 跑完后启用库存到 **25**。候选更宽 = 每条 sleeve 证据成熟更慢——这是预期，不是 bug。

## 诚实

Invest AI 提供排名宇宙。InvestSim 套固定后处理规则。slug 里的「AI」是代理标签，不是现场 LLM 下单脑。

实验室抛光（成交 UI、SEO、Slack、broker cron、promote）叠在这份库存上；不替代 ADR 0031。

## 要点

规则能复用共享排名时再扩 sleeve 表。别为了显得忙再建第二条研究饲料。

**延伸阅读：** InvestSim ADR 0031 · 2026-08-05 反馈环系统设计。
