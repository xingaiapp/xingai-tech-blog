# The Archive Was Already Written. It Just Was Not a Site.

**Date:** September 20, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** XingAI Tech Blog  
**Tags:** `tech-blog` `nextjs` `seo` `aeo` `i18n` `vercel`  
**Also available:** [中文](2026-09-20-tech-blog-static-site-from-markdown.zh.md)

---

## What was true

This repo already had **88 English + 88 中文** posts. Last write: 2026-08-05. Public GitHub Markdown.

`blog.xingai.app` had no DNS. No generator. No `robots.txt`. For a crawler, the archive did not exist.

## What shipped in the repo (0.1.0)

Next.js at the **repo root** reads `/posts` at build time and emits HTML. Markdown stays the source of truth. There is still no CMS.

| Surface | Behavior |
|---------|----------|
| UI | `en` / 中文 / 한국어 |
| Article bodies | English + 中文. Korean UI shows a note until KO translations exist |
| Indexing | `/robots.txt` allow-all, `/sitemap.xml`, `/llms.txt`, FAQ JSON-LD |
| Legal | `/legal/privacy`, `/legal/terms`, `/legal/disclaimer` |

Local production build (2026-09-20): **869** static routes. Sitemap: **864** URLs. Post bodies are in the HTML, not a client shell.

Deploy notes: [VERCEL.md](https://github.com/xingaiapp/xingai-tech-blog/blob/main/VERCEL.md). `xingai.app` now lists the blog and links it from `/engineering`.

## What is not true yet

`blog.xingai.app` is still **not on the public internet**. The site runs locally (`npm run dev` → port 3010). Production needs a Vercel project **and** a DNS CNAME for `blog`. Until that lands, do not treat the domain as live.

This archive is engineering notes for builders. It is not an investing blog and not a traffic funnel for Invest AI.

## Takeaway

Ship the files you already wrote. Do not start a second writing pile because GitHub Markdown is invisible to search.
