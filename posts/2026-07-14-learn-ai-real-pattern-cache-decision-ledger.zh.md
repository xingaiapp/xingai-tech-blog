# 从 Mock Pattern 到缓存学习数据：Learn AI 接入真实 Metadata

Learn AI 一开始的产品边界是对的：它不是 LeetCode clone。它回答的是一个决策问题：下一步我该练哪个 pattern？

但一个决策系统如果 pattern graph、company mode、similar questions 主要靠 seed data，就很难持续可信。2026 年 7 月 14 日，Learn AI 把核心学习 metadata 移到了 cache-always 路径：真实 metadata 离线导入，runtime 从 SQLite 读取，每条推荐都可以写入 Decision Ledger。

## 存 Metadata，不存完整题干

新的 catalog 刻意保持窄边界。它存：

- pattern family
- pattern slug
- question title
- difficulty
- tags
- source URL
- license note

它不复制第三方完整 problem statement。这个边界很重要。Learn AI 应该教题目背后的 pattern，而不是镜像另一个平台的内容。

source artifact 是 `data/pattern_catalog.v1.json`，importer 是 `scripts/import_patterns.py`。

## Cache Always

runtime 规则很简单：

> 外部学习数据先导入；request handler 只读本地 cache。

这意味着 pattern graph、company mode、readiness page、dashboard 和 similar-question picker 都不会在用户请求里抓外部网站。如果某家公司没有缓存信号，产品返回 `insufficient_data`，而不是编一个分数。

这是 XingAI 跨产品一直坚持的纪律：cache first、provenance first；当应该有缓存事实源时，不在 request time 即兴发挥。

## Company Mode 变诚实

旧 company mode 使用 hardcoded weights。新版使用缓存的 `company_pattern_weights` rows：

- `company_slug`
- `pattern_slug`
- `count`
- `window`
- `source`
- `license_note`

文案必须谨慎。这些是 curated public metadata signals，不是官方公司面试题频。它们可以指导练习优先级，但不是 hiring bar claim。

## Similar Questions 变成 DB-first

Similar questions 现在先从缓存 catalog 读取，再 fallback 到 LLM candidates。推荐面因此更稳定：

- same pattern slug
- known source
- known difficulty
- known tags
- no live fetch

这也让 UI 可以在 pattern graph 上显示 cached question count 和 source metadata。

## Decision Ledger 落地

Learn AI 现在会为这些事件写 Decision Ledger：

- next-question recommendation
- company-mode reweighting
- readiness snapshot

它还有真实的 `action_taken` 信号。用户 7 天内分析或解决了命中推荐 pattern 的题，这条 decision 标为 `followed`。如果练了不同 pattern，标为 `modified`。没有行为就保持 null。

这给 Learn AI 一个反馈闭环：不只是“我们推荐了什么”，而是“用户有没有跟随，后续 mastery 有没有变好”。

## 本地 Fallback 不是产品事实

这次也遇到一个很现实的本地问题：复制来的 test key 可能过期，本地网络也可能失败。Learn AI 现在有 development-only deterministic LLM fallback，让工程师仍然可以测试 UI、catalog cache 和 ledger writes。

生产环境不会这样隐藏 OpenAI failure。fallback 只用于本地流程测试，不是质量证据。

## 这次交付

这版包括：

- real metadata catalog
- offline importer 和 refresh wrapper
- DB-first similar-question selection
- cached company pattern weights
- 去掉 demo multiplier 的 readiness
- Decision Ledger implementation
- provenance fields
- development-only LLM fallback
- cache 和 ledger 的 enterprise operation docs

产品仍然不是题库。它是一个 pattern decision system，只是底下终于接上了真实缓存知识库。
