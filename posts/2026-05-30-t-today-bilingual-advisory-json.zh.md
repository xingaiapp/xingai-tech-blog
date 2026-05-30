# 中文 · 网络里 JSON 有内容，界面上却是空的

**日期：** May 30, 2026
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [T Today / invest-t-advisor](https://t.xingai.app)
**标签：** `openai` `json` `i18n` `bugfix` `nextjs` `vision` `adr`
**语言：** [English](2026-05-30-t-today-bilingual-advisory-json.md) · 中文

---

## 现象

T Today 持仓教练用 OpenAI，`response_format: { type: "json_object" }`。模型返回带 `zh`、`en` 的大块 JSON。用户切换语言 — 卡片还是空的。DevTools 里明明有内容。产品表现像「分析失败」。

典型：**解析器撒谎**。

## 我们要的契约

顶层只有一个对象：

```json
{
  "v": 1,
  "zh": { "summary": "…", "tDecision": { … }, "positions": [ … ] },
  "en": { "summary": "…", "tDecision": { … }, "positions": [ … ] }
}
```

人看的文案按语言分叶子；**`extractedPortfolio`（标的、股数、现金）两边必须一致**。

系统提示里写死了：数字 `v: 1`，**叶子字段不能放在顶层**，只能在 `zh` / `en` 里。

## 代码里错在哪

`parseBilingualAdvisory()` 曾经两条路：

1. `v === 1` 且有 `zh`/`en` → 解析子对象 ✅  
2. 否则 → 把**整个对象**当单语言叶子解析

模型返回 `{ "v": 1, "zh": {…}, "en": {…} }` 但 `v` 缺失或不是严格 `1` 时，会走路 2。包装对象顶层没有 `summary`，内容在 `zh`/`en` 里面。`parseRiskAdvisoryStructured` 却「成功」返回**空字符串**，再复制到中英文 — 两边都空。

界面空白。没抛错。比 500 还难查。

## 修复规则

1. 顶层有 **`zh` 和 `en` 对象** → 只解析它们（不管 `v`）。  
2. 只要还有 `zh`/`en` 键，**禁止**把包装层当叶子解析。  
3. 只有像叶子（有 `summary`、`positions` 等）且没有双语键时，才走旧版单语言逻辑。  
4. 一边解析成功 → 复制到另一边兜底。

回归脚本：`scripts/advisory-bilingual-smoke.ts`。

## 为什么要双语 JSON

产品要中英切换（韩文 UI 暂用英文 AI 正文）。每次切语言都重跑视觉模型又慢又贵。一次调用存 `{ zh, en }`，`pickLocalizedStructured()` 按 UI 取叶子即可。

## 结论

JSON 模式下，**提示词里的 schema 和解析器必须同一套话**。`zh`/`en` 嵌套时，别把父对象当叶子扫一遍。一次错误的 fallback，用户只会说「AI 坏了」，而模型其实是对的。

**延伸阅读：** [ADR-0002](https://github.com/xingaiapp/invest-t-advisor/blob/main/docs/adr/0002-bilingual-advisory-json.md)、[用户流程文档](https://github.com/xingaiapp/invest-t-advisor/blob/main/docs/T-TODAY-USER-FLOW.md)。
