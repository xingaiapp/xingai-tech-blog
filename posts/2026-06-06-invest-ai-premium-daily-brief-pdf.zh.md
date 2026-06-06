# Email 是决策，PDF 是解释

**日期：** June 6, 2026  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)  
**标签：** `product-design` `email` `pdf` `invest-ai` `decision-ux` `reporting`  
**语言：** [English](2026-06-06-invest-ai-premium-daily-brief-pdf.md) · 中文

---

## 错误：发送更多数据

第一版 daily-picks email 在技术上可用：读取 worker cache，选择 top signals，然后发邮件。但产品形态不对：它像一张原始表格。

表格要求用户分析。晨报应该帮助用户做决定。

所以我们把产品拆成三个表面：

```txt
Email = 决策摘要
PDF report = 完整解释
Dashboard = 探索分析
```

## Email：30 秒内完成判断

邮件现在只回答一个问题：

> 今天我应该怎么做？

它包含：

- Today's playbook。
- Consensus score。
- Suggested exposure 与 cash allocation。
- 一个 top opportunity。
- What we see。
- Today's actions。
- Dashboard CTA。
- PDF attachment card。

它刻意不展示原始 RSI/volume 表格。这些内容属于报告。

## PDF：premium explanation

PDF 是慢一点的表面。它解释为什么邮件给出这个判断。

报告包含：

- Cover。
- Executive summary。
- Market story。
- Allocation model。
- Top opportunities。
- Signal breakdown。
- Full watchlist。
- Risk dashboard。
- Action plan。
- Disclaimer。
- Methodology。
- Appendix。

PDF 由 worker 基于同一份缓存决策包生成，不要求 API 重新计算任何东西。

## Dashboard：探索

Dashboard 继续承载好奇心：symbol scope、macro radar、engine cards、signal feeds 和更深的检查。邮件不应该试图在 inbox 里变成 dashboard。

## 产品原则

一个屏幕只承载一个决定。

这意味着邮件要短到用户在咖啡店排队时也能读懂；PDF 要丰富到事后能解释建议；Dashboard 要开放到可以继续探索。

## 工程原则

设计升级没有改变决策边界：

- Worker 拥有决策语义。
- FastAPI 读取缓存。
- React 负责渲染。
- Email 与 PDF 是同一份 cache 的投递格式。

这是关键。产品打磨不应该制造隐藏的第二套决策引擎。

## 一句话

不要交付更多数据。交付清晰。

**延伸阅读：** ADR-017（`docs/adr/017-premium-daily-brief-email-pdf.md`）。
