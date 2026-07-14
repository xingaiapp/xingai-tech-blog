# 空表壳，满正文：修好 Opportunity Radar 邮件

**日期：** 2026 年 7 月 14 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Opportunity Radar](https://github.com/xingaiapp/xingai-opportunity-radar)
**标签：** `newsletter` `resend` `opportunity-radar` `github-actions` `adr`
**语言：** [English](2026-07-14-opportunity-radar-newsletter-narrative-body.md) · 中文

---

我们终于把 Resend 密钥配进 Opportunity Radar 的 GitHub Actions，并强制发了一封。邮件到了，却像个空壳：日期、空表格、一句罐头 thesis。真正的 Executive Summary、Top Opportunity、Build This Week 全没出现。

这不是 Resend 坏了，是**内容形状和渲染器对不上**。

## 「期次」有两种长相

[7 月 3 日那篇 newsletter 帖](2026-07-03-newsletter-worker-radar-to-resend.zh.md)和 [ADR-002](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/002-newsletter-worker-resend.zh.md) 默认期次是中文排名表：

```markdown
| 排名 | 产品机会 | 分类 | 优先级 |
```

仓库 `issues/` 里真正发的是 `TEMPLATE.md` 叙事稿。第 2 期 *When Agents Start Hiring Agents* 根本没有排名表。

Worker 用表头正则去抽 —— 抽不到行 —— 于是发出「成功」但没有实质内容的邮件。

## 改了什么

`newsletter_worker.py` 现在会：

1. 解析 TEMPLATE 章节标题（Executive Summary → Sources）。
2. 以这些章节作为 HTML/纯文本主正文。
3. **有**排名/信号表时再附加。
4. 两条路径都失败时，才降级整篇 markdown。

运维同日：

- Actions secrets：`RESEND_API_KEY`、`NEWSLETTER_TO`（复用 Invest AI 的 Resend 账号）。
- `NEWSLETTER_FROM=onboarding@resend.dev`，等 `radar@xingai.app` 验证 —— 和 Invest OTP 吃过的 Resend 403 是同一课。

记在 [ADR-004](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/004-newsletter-narrative-body-and-resend-secrets.zh.md)。

## 值得带走的点

**渲染器要对齐你真正在用的模板。** Spec 和 `TEMPLATE.md` 一分开就容易漂。

**Fly secrets ≠ GitHub Action secrets。** Invest 早就在发 Resend；Radar cron 环境变量空着时一样会失败，密钥要手工拷。

**已验证的 From 是基础设施。** 未验证的 `alerts@` / `radar@` 看着正规，实际 403。先测试域，再上品牌域。

## 并没有 7/14 新稿

仓库里还没有 `issues/2026-07-14-…`。修好管道后重发的是最新真实期次（2026-06-28）全文。编辑周更和工作日 cron 仍是两套时钟 —— 只有 issue **日期**变了（或 `--force`）才会真正再发。

**相关：** [ADR-002](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/002-newsletter-worker-resend.zh.md) · [ADR-004](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/004-newsletter-narrative-body-and-resend-secrets.zh.md)
