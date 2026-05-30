# 中文 · MCP 分阶段上线：从仪表盘到自动交易

**日期：** May 12, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)
**标签：** `mcp` `broker` `architecture` `roadmap` `invest-ai`
**语言：** [English](2026-05-12-mcp-phased-rollout.md) · 中文

---

## 别一次建五个 MCP

理想图是 AI 决策引擎 → MCP 网关 → 金融/新闻/日历/组合/券商五个服务。**别这么干。**

五个服务器风险画像、数据源难度、监管含义都不同。**Broker MCP**  alone 做错就能拖垮项目。

## 分阶段思路

按 **价值 / 风险** 排序：

- **阶段 1（低风险，跟 V2）** — Financial MCP、News MCP：包装已有 yfinance/Finnhub，可换供应商、AI 用 function calling 按需取数
- **阶段 2（中风险）** — Calendar MCP、Portfolio MCP（**只读**）：时间催化剂与持仓感知；要管密钥与隐私
- **阶段 3（高风险）** — Broker MCP：真钱；拆成 A 只记决策 → B 纸面 → C 用户确认实盘 → D 自治（也许永不）

## 为何先 Alpaca

REST 清晰、免费纸面、无最低入金、文档好；IBKR 给高级用户第二选项。

## 上线前安全清单（摘要）

3+ 月决策日志、纸面验证下单、服务端仓位上限、日损熔断、审计日志、Monitor 杀开关、禁 margin、阶段 C 每笔需用户确认。

## 时间线

阶段 1 跟 V2 约 2 周；2 在 V2+1 月；3A–3D 各需数月准确性与执行验证。细节见 Invest AI [ADR-003](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/003-mcp-phased-rollout.md)。

---

*Part of the [XingAI Tech Blog](https://github.com/xingaiapp/xingai-tech-blog). We build AI decision systems for everyday life.*

**Links:** [XingAI](https://xingai.app) · [Invest AI](https://xingai.app/apps/invest-ai) · [GitHub](https://github.com/xingaiapp) · [LinkedIn](https://www.linkedin.com/in/xingaiapp/) · [X/Twitter](https://x.com/XingAIApp)
