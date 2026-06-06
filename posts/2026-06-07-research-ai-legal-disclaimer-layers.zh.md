# 学习 AI 的四层「非专业建议」防护

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `legal` `disclaimers` `product`  
**语言：** [English](2026-06-07-research-ai-legal-disclaimer-layers.md) · 中文

---

Research AI 判断「值不值得学」，但措辞不当仍像职业或财务建议。

**我们不是律师。** 以下是工程实践；付费上线前须律师审阅。

## MVP 四层

1. **页脚** — 隐私、条款、免责声明（移动抽屉 + 桌面）。  
2. **内联 `LegalNotice`** — 结果、对比、组合、主题页，紧贴 AI 输出。  
3. **提交说明** — 首页：研究即同意条款与隐私政策。  
4. **完整法律页** — 英/中/**韩** `/legal/*`。

邮件分享、FAQ、`llms.txt` 口径一致。

## 暂未做

首次访问弹窗；API JSON 里的 `disclaimer` 字段 — 下一版 FastAPI。

**延伸阅读：** ADR-009 · Invest [五层博文](2026-05-13-legal-disclaimers-five-layers.zh.md)
