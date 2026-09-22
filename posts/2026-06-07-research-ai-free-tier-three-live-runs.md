# Three Live Runs a Day: Research AI Free Tier on Top of Cache

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `rate-limiting` `sqlite` `cost-control` `product` `cache`  
**Also available:** [中文](2026-06-07-research-ai-free-tier-three-live-runs.zh.md)

---

Anonymous users get **3 live AI researches per rolling 24 hours**. Cached topics — including trending chips — do **not** count.

That split matters: we want guests to feel speed on warm topics while capping OpenAI spend on cold ones.

## What counts as “live”

Only a **cache miss** that triggers worker inference burns quota. Hit `v2:research:{hash}`? Instant, free, unlimited re-reads.

## Identity

Next.js forwards an anonymous browser id (a UUID in `localStorage`) to the backend. Signed-in users get a higher tier, and that identity must come from a verified server-side session, never from a header the browser can set (ADR-005).

## Storage

`usage_limits.db` on the Fly volume — separate from `research.db` so quota writes do not fight cache reads.

## UX when blocked

429 → friendly copy on result page; nudge to try a trending topic or sign in later.

Same playbook as Invest AI’s free tier post — adapted for **learning decisions** instead of stock analysis.

**Further reading:** ADR-005 in `xingai-research-ai/docs/adr/`
