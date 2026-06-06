# Shipping SEO and AEO on Research AI (Single URL, Three Locales)

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `seo` `aeo` `llms-txt` `json-ld` `nextjs`  
**Also available:** [中文](2026-06-07-research-ai-seo-aeo-ship.zh.md)

---

The marketing site puts locale in the path (`/zh/…`). Product apps like Research AI switch language in the header and persist to `localStorage`. SEO still has to ship.

## What we added

**Classic SEO**

- `buildPageMetadata()` — canonical, OG, Twitter on main routes  
- `sitemap.xml` — home, portfolio, compare, about, legal, featured topics  
- `robots.txt` → sitemap  

**AEO (AI answer engines)**

- `public/llms.txt` — flows, topic URLs, FAQ, legal links  
- JSON-LD graph: Organization, WebSite, SoftwareApplication, FAQPage  
- **Visible homepage FAQ** (en/zh/ko) — same Q&A as schema via `lib/seo-faq.ts`  

Hidden FAQ schema alone is not enough. Crawlers and humans should see the same facts.

## What we did not do

Per-locale canonical paths or hreflang — not until routing changes. One URL per page; UI locale is independent.

## Checklist mindset

Copied from `xingai-dot-app/docs/seo-aeo-checklist.md`, adapted for cookie-locale products.

**Further reading:** ADR-010 in `xingai-research-ai/docs/adr/`
