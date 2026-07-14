# Empty Tables, Full Issues: Fixing the Opportunity Radar Newsletter Body

**Date:** July 14, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [XingAI Opportunity Radar](https://github.com/xingaiapp/xingai-opportunity-radar)
**Tags:** `newsletter` `resend` `opportunity-radar` `github-actions` `adr`
**Also available:** [中文](2026-07-14-opportunity-radar-newsletter-narrative-body.zh.md)

---

We finally wired Resend secrets into the Opportunity Radar GitHub Actions job and forced a send. The mail arrived. It also looked like a shell: date line, empty tables, a canned thesis box. The real issue — Executive Summary, Top Opportunity, Build This Week — never showed up.

That's a content ↔ renderer mismatch, not a Resend problem.

## Two shapes of "issue"

The [July 3 newsletter post](2026-07-03-newsletter-worker-radar-to-resend.md) and [ADR-002](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/002-newsletter-worker-resend.md) assumed a Chinese ranking table:

```markdown
| 排名 | 产品机会 | 分类 | 优先级 |
```

What we actually publish under `issues/` follows `TEMPLATE.md`: narrative sections in English (and the occasional bilingual note). Issue #2, *When Agents Start Hiring Agents*, has no ranking table at all.

The worker used regex on the table headers. No match → empty rows → "success" email with no substance.

## What we changed

`newsletter_worker.py` now:

1. Parses TEMPLATE section headings (Executive Summary → Sources).
2. Renders those as the primary HTML/text body.
3. Still attaches ranking/signal tables **when they exist**.
4. Falls back to a full markdown dump only if both paths fail.

Ops side, same day:

- Actions secrets: `RESEND_API_KEY`, `NEWSLETTER_TO` (reused the Invest AI Resend account).
- `NEWSLETTER_FROM=onboarding@resend.dev` until `radar@xingai.app` is verified — same Resend 403 lesson as Invest OTP.

Documented as [ADR-004](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/004-newsletter-narrative-body-and-resend-secrets.md).

## Lessons worth stealing

**Match the renderer to the template you actually ship.** Spec sheets and TEMPLATE.md diverge fast if nobody re-reads both.

**Fly secrets ≠ GitHub Action secrets.** Invest already mailed via Resend; Radar cron still failed with empty env until we copied the key by hand.

**Verified From addresses are product infrastructure.** Unverified `alerts@` / `radar@` looks branded and dies with 403. Test domain first, brand later.

## Not a July 14 issue

There still isn't a fresh `issues/2026-07-14-…` draft. The fixed pipeline re-sent the latest real issue (2026-06-28) with full body. Editorial cadence and weekday cron are still different clocks — weekday only fires when the issue **date** is new (or you pass `--force`).

**Related:** [ADR-002](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/002-newsletter-worker-resend.md) · [ADR-004](https://github.com/xingaiapp/xingai-opportunity-radar/blob/main/docs/adr/004-newsletter-narrative-body-and-resend-secrets.md)
