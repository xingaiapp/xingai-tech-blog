# Research AI 的 SEO 与 AEO：单 URL、三语言 UI

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `seo` `aeo` `llms-txt` `json-ld`  
**语言：** [English](2026-06-07-research-ai-seo-aeo-ship.md) · 中文

---

营销站用语言路径（`/zh/…`）。Research AI 在顶栏切换语言并存 localStorage。SEO 照样要做。

## 做了什么

**SEO：** canonical、OG/Twitter、sitemap（含 compare 与 topic）、robots。

**AEO：** `llms.txt`；JSON-LD（Organization、WebSite、SoftwareApplication、FAQPage）；首页**可见 FAQ**（三语）与 `lib/seo-faq.ts`、llms.txt 同源。

只有隐藏 schema、页面上没有 FAQ，对答案引擎不够。

## 没做

按语言拆 URL、hreflang — 除非以后改路由。

**延伸阅读：** `xingai-research-ai/docs/adr/010-seo-aeo-ship.zh.md`
