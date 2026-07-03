# Newsletter Worker：把 Opportunity Radar 变成每周邮件

**日期：** 2026 年 7 月 3 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Opportunity Radar](https://github.com/xingaiapp/xingai-opportunity-radar)
**标签：** `newsletter` `resend` `opportunity-radar` `自动化` `github-actions`
**English:** [English](2026-07-03-newsletter-worker-radar-to-resend.md)

---

Opportunity Radar 每周生成一份详细的 markdown 报告。直到现在，它一直存在私有仓库里。这周我们添加了一个 newsletter worker，读取该报告并通过 Resend 以格式化邮件发送——零新基础设施，每周五早上自动执行。

## 问题

Radar 已经在生产这样的内容：

```markdown
| 排名 | 产品机会 | 分类 | 优先级 |
| 1 | XingAI Opportunity Radar Newsletter | New Opportunities | Build Now |
| 2 | Personal AI Memory OS | New Opportunities | Build Now |
```

问题不在内容，在于分发。一份只有作者自己看的精彩分析不是产品。

## 解决方案：一个脚本，一个 Cron Job

```
docs/issues/2026-07-03.md
         ↓
newsletter_worker.py
  load_latest_issue()         → 读取最新的 .md 文件
  extract_top_opportunities() → 解析机会表（正则）
  extract_key_signals()       → 解析信号表（正则）
  format_newsletter_html()    → HTML 邮件模板
  format_newsletter_text()    → 纯文本备选
  send_via_resend()           → POST https://api.resend.com/emails
```

没有数据库，没有新服务，没有 Substack API（它根本不存在）。只是一个每周通过 GitHub Actions 运行的 Python 脚本。

## `--dry-run` 标志

发送给订阅者之前，先在本地预览：

```bash
python workers/newsletter_worker.py --dry-run
# [DRY RUN] Would send newsletter:
#   From: radar@xingai.app
#   To:   (NEWSLETTER_TO not set)
#   Subject: 🛰️ XingAI Opportunity Radar — 2026-07-03
#
# --- TEXT PREVIEW ---
# XingAI Opportunity Radar — 2026-07-03
# ==================================================
# TOP OPPORTUNITIES THIS WEEK
# 1. XingAI Opportunity Radar Newsletter [New Opportunities] → Build Now
# ...
```

dry-run 输出也是 CI 验证的内容——cron workflow 在每个 PR 上运行 `--dry-run`，确认解析器没有出错。

## 为什么选 Resend 而不是 Mailchimp 或 Substack

| | Resend | Mailchimp | Substack |
|---|---|---|---|
| API | 简单 REST | 复杂 | 无发布 API |
| 免费层 | 每月 3k 封 | 500 联系人 | 无限但需手动 |
| 退订处理 | 自动（Audiences） | 自动 | 自动 |
| 开发者配置 | 10 分钟 | 1–2 小时 | 仅手动 |

Resend 在简单性上胜出。API 就是一次 POST 请求。Audience 管理处理退订。域名验证 10 分钟搞定。不需要 UI。

## GitHub Actions Cron

```yaml
# .github/workflows/newsletter.yml
on:
  schedule:
    - cron: '0 17 * * 5'  # 每周五上午 9 点（太平洋时间）

jobs:
  send-newsletter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: pip install httpx
      - run: python workers/newsletter_worker.py
        env:
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          NEWSLETTER_FROM: radar@xingai.app
          NEWSLETTER_TO: ${{ secrets.NEWSLETTER_AUDIENCE_ID }}
```

**相关 ADR：** [Opportunity Radar ADR-002](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/002-newsletter-worker-resend.md)
