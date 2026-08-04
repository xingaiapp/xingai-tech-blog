# 中文 · 引用校验上线之后的三道诚实补丁

**日期：** 2026-08-04  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Evidence Engine](https://github.com/xingaiapp/xingai-evidence-engine)  
**标签：** `evidence` `citation-verification` `pdf` `human-in-the-loop` `adr` `provenance`  
**语言：** [English](2026-08-04-evidence-honesty-overlay-pdf-refs-citation-dates.md) · 中文

---

## 「能校验」之后还缺什么

Evidence Engine 能给 markdown 引用打分之后，产品里很快露出三种假诚实：

1. 人要 Accept / Reject / Edit，但原则 1 要求 API 不做计算。
2. 好引文的 PDF 在未解析参考文献时覆盖率是 0%（ADR-008）；用户仍需要一条**不发明链接**的 PDF 路径。
3. 雷达把三个月前的 arXiv 信号说成「今日最重要新闻」，因为博客日期是昨天。

ADR-009～011 堵住这些洞，但不编造 provenance。

## ADR-009 — 人审 overlay，不原地改 verify 缓存

Worker 写 `v1:verify:{id}`。人写 `v1:review:{id}`（以及 skill / run / experience）。`GET` 合并。再跑 verify 会覆盖 verify，review 留下。

反证只作顾问且本地（反驳 stance + token 重叠），从不翻 verdict。批准的 skill **不会**自动合进 `extract.py`——那仍是人工 PR。

这就是工程体系里的 **human-overlay-cache** 模式。

## ADR-010 — 仅当 URL/DOI 存在时解析数字参考文献

解析 Bibliography。只有条目带 URL 或 DOI 才解析 `[12]`。作者-年份留在 unresolved。没有任何解析结果时覆盖率仍是 `n/a`——不发明 0%。

## ADR-011 — 报告引用日期；拒绝发明「首次公开」

交付页面元数据里的 `page_date`，以及仅对 arXiv URL 的 `first_public`。**不要**把公告自动挂到它所介绍的论文上。三种廉价做法在真页面上都给出了自信错误的 lag（无链接、错引另一篇 arXiv、2002 年同名撞车）。文献级解析（OpenAlex / Semantic Scholar）记为延期，并附证据，而不是糊一张假指标。

## 要点

校验计算 ≠ 诚实产品工作。Overlay、PDF 参考文献下限、带日期的引用是三个独立决定——多数内容是关于**什么不该做**。

**延伸阅读：** [ADR-009](https://github.com/xingaiapp/xingai-evidence-engine/blob/main/docs/adr/009-workspace-regression-counter.md) · [ADR-010](https://github.com/xingaiapp/xingai-evidence-engine/blob/main/docs/adr/010-pdf-numeric-references.md) · [ADR-011](https://github.com/xingaiapp/xingai-evidence-engine/blob/main/docs/adr/011-citation-dates.md)。
