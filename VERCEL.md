# Deploy (Vercel)

The public site is a Next.js App Router app at the **repo root** (not a subdirectory).

## Project settings

- Framework: Next.js
- Root Directory: `.` (leave empty)
- Build command: `npm run build`
- Install command: `npm install`
- Node: 20.x
- Env: `NEXT_PUBLIC_SITE_URL=https://blog.xingai.app`

## Domain

Point `blog.xingai.app` at this Vercel project:

1. Vercel → Project → Domains → add `blog.xingai.app`
2. DNS (wherever `xingai.app` is hosted): CNAME `blog` → `cname.vercel-dns.com`

Until DNS exists, the `*.vercel.app` URL from the project still serves the same static pages.

## What this is not

No Fly.io app. No GitHub Pages required. Markdown in `/posts` is the content source; Next.js generates HTML at build time.
