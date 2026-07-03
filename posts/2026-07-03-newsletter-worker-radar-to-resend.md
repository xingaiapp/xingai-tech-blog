# Newsletter Worker: Turning the Opportunity Radar into a Weekly Email

**Date:** July 3, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [XingAI Opportunity Radar](https://github.com/xingaiapp/xingai-opportunity-radar)
**Tags:** `newsletter` `resend` `opportunity-radar` `automation` `github-actions`
**Also available:** [中文](2026-07-03-newsletter-worker-radar-to-resend.zh.md)

---

The Opportunity Radar generates a detailed markdown report every week. Until now, it lived in a private repo. This week we added a newsletter worker that reads that report and sends it as a formatted email via Resend — zero new infrastructure, Friday morning, automatically.

## The Problem

The Radar was already producing content like this:

```markdown
| 排名 | 产品机会 | 分类 | 优先级 |
| 1 | XingAI Opportunity Radar Newsletter | New Opportunities | Build Now |
| 2 | Personal AI Memory OS | New Opportunities | Build Now |
```

The problem wasn't content. It was distribution. A great analysis that only the author reads is not a product.

## The Solution: One Script, One Cron Job

```
docs/issues/2026-07-03.md
         ↓
newsletter_worker.py
  load_latest_issue()        → read most recent .md file
  extract_top_opportunities() → parse opportunity table (regex)
  extract_key_signals()       → parse signal table (regex)
  format_newsletter_html()    → HTML email template
  format_newsletter_text()    → plain-text fallback
  send_via_resend()           → POST https://api.resend.com/emails
```

No database. No new service. No Substack API (it doesn't exist). Just a Python script that runs weekly via GitHub Actions.

## The --dry-run Flag

Before sending to subscribers, preview locally:

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

The dry-run output is also what CI validates — the cron workflow runs `--dry-run` on every PR to confirm the parser doesn't break.

## Why Resend, Not Mailchimp or Substack

| | Resend | Mailchimp | Substack |
|---|---|---|---|
| API | Simple REST | Complex | No publishing API |
| Free tier | 3k/month | 500 contacts | Unlimited but manual |
| Unsubscribe handling | Automatic (Audiences) | Automatic | Automatic |
| Developer setup | 10 min | 1–2 hours | Manual only |

Resend wins on simplicity. The API is one POST call. Audience management handles unsubscribes. Domain verification takes 10 minutes. No UI required.

## GitHub Actions Cron

```yaml
# .github/workflows/newsletter.yml
on:
  schedule:
    - cron: '0 17 * * 5'  # Friday 9am PT (17:00 UTC)

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

**Related ADR:** [Opportunity Radar ADR-002](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/002-newsletter-worker-resend.md)
