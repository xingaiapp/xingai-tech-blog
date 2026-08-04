# 中文 · 每日投资智报：扩展 Invest AI，而不是再开一个报告产品

**日期：** 2026-08-04  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `invest-ai` `pdf` `resend` `worker` `reporting` `adr` `yfinance`  
**语言：** [English](2026-08-04-invest-ai-daily-investment-zhibao-pdf.md) · 中文

---

## 诱惑

一份围绕 20 万美元 FI 组合的中文 A4 密排 PDF，看起来很像新产品：新域名、新 Worker、新 Resend、甚至 `investment-report.xingai.app`。

ADR-032 已对 Daily Stock Market Intelligence 否决了绿场路线。ADR-040 对**每日投资智报**用了同一条规则：

放进 Invest AI。不要动 Premium Daily Brief、盘前/盘后 PDF、ADR-032 HTML 报告。

## 已交付

路径：

```txt
stock-ai-worker/market_cache_worker/investment_zhibao/
config/investment_zhibao/{user.yaml,portfolio.csv,policy.yaml}
```

CLI：

```bash
python -m market_cache_worker.investment_zhibao validate-data|generate|send|run-daily
```

报告类型：`daily-investment-zhibao`（ADR-025 目录）。

Live 模式批量拉 Yahoo K 线，用真实 bar 日期写 `market_as_of`，并给出日涨跌幅。CAPE / Forward P/E 在没有诚实源之前保持 `N/A`。缺数据就空着，假精度算产品 bug。

邮件复用现有 Resend 环境变量；在密钥到位前默认 dry-run。

## 边界

| 面 | 负责 |
|----|------|
| Worker 包 | 快照、计算、风险分桶、建议、PDF、邮件 |
| FastAPI | 仅报告类型元数据，不重算 |
| XNP | 只作未来传输，不在今日热路径 |

与 Premium Daily Brief 同一决策缓存边界：语义在 Worker，投递只是格式。

## 仍开放

- `run-daily` 的定时调度
- 诚实的 CAPE / 基本面，而不是编数字
- PDF 向约 8 页参考稿再加密
- Worker 主机配好 Resend 密钥后的一次实发验证

## 要点

对齐参考 PDF 是包装问题，不是绿场产品。扩展 Invest AI 让 Resend、报告目录和 Worker/缓存规则留在一处。

**延伸阅读：** [ADR-040](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/040-daily-investment-zhibao-pdf.md) · `xingai-enterprise-ai-design` 系统设计文。
