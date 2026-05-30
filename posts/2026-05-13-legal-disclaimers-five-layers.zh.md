# 中文 · AI 金融产品上的五层「非投资建议」

**日期：** May 13, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Invest AI](https://xingai.app/apps/invest-ai)
**标签：** `legal` `disclaimers` `product` `compliance` `frontend` `api-design`
**语言：** [English](2026-05-13-legal-disclaimers-five-layers.md) · 中文

---

## 为何重要

Invest AI 展示 BUY / HOLD / SELL 风格信号与置信度。在许多法域，**看起来像**个性化投资建议的东西，若不清楚「我们是什么 / 不是什么」，可能把你拖进监管范畴。

我们**不是**注册投资顾问（RIA）。产品定位为**教育**工具：用 AI 探索市场数据、自己做研究、行动前咨询持牌专业人士。

本文**不是法律意见**。上线前应有证券律师审阅具体文案。即便是**免费公测**，我们仍要可辩护、行业常见的模式，且合理用户难以忽略。

## 五层

五处独立表面，让信息在 UI 改版、爬虫、未来 API 客户端下仍能存活。

```mermaid
flowchart TD
    L1["第 1 层 · 页脚<br/>每页常驻"]
    L2["第 2 层 · 首次访问弹窗<br/>须接受"]
    L3["第 3 层 · 行内 AI 徽章<br/>紧邻推荐"]
    L4["第 4 层 · 条款 + 隐私<br/>完整页面"]
    L5["第 5 层 · API disclaimer 字段<br/>每条 JSON"]

    L1 --> L4
    L2 --> L4
    L3 --> L4
    L5 --> L4
```

1. **页脚** — 短句 + 链到条款、隐私、帮助、联系。始终可见。
2. **首次访问弹窗** — 要点列表、勾选确认条款+隐私、不接受不能关。`localStorage` 版本键，文案大变可强制重接受。
3. **行内徽章** — 推荐密集 UI 旁：「AI · 非建议 · 你决定」+ tooltip。
4. **条款与隐私** — `/terms`、`/privacy` 全文。
5. **API 信封** — 每条 `/api/v1/analyze` 含 `disclaimer` 字符串；剥 HTML 的第三方仍见法律框。

## 单一真相源（几乎）

前端集中在 `lib/legal/disclaimers.ts`；backend `ANALYSIS_DISCLAIMER` 对齐实质。后续可共享 JSON/YAML 双栈 import。

## 刻意没做的

- **当 RIA** — 阶段不对；成本高、持续合规重
- **只有页脚** — 太容易漏；监管看**显著性**
- **赌没人投诉** — 不是策略

## 一句话

AI 碰钱决策时，把免责声明当**产品设计**，不是法律附录。五层薄提示胜过一段没人读的长文。

**延伸阅读：** Invest AI 仓库 ADR-005（`docs/adr/005-legal-disclaimers-v1.md`）。
