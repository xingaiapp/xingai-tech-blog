# Public Security Checklist (XingAI Tech Blog)

This repo is **public**. Anything merged here is indexable and copy-pasteable by attackers. Run this checklist before every push.

## Never publish

| Category | Examples |
|----------|----------|
| **Credentials** | API keys, `sk-…`, JWTs, session cookies, Fly/Vercel secret values, `.env` dumps |
| **Personal identifiers** | Real admin/operator emails, phone numbers, internal `@xingai.app` inboxes used for auth |
| **Active bypass paths** | Header names (`X-Invest-Admin-Email`), `localStorage` keys, env allowlists with real values, “click this button to skip auth” |
| **Production gaps** | “OAuth not configured”, “JWT verifier missing”, “auth is disabled until …” |
| **Attack maps** | Exact unauthenticated admin routes, cron bearer values, internal hostnames not meant for users |
| **Customer data** | Real subscriber emails, portfolio holdings, report recipients |

Use placeholders: `admin@your-domain`, `<FLY_SECRET>`, `<comma-separated allowlist>`.

## OK to publish (with care)

| Category | Guidance |
|----------|----------|
| **Architecture patterns** | Worker cache boundary, CQRS, rate limits — no live config |
| **Env var names only** | `OPENAI_API_KEY` as a label, never the value |
| **Public URLs** | `invest.xingai.app`, `xingai.app` marketing routes |
| **Shipped product behavior** | Features users already see in the UI |
| **Generic runbooks** | OAuth setup with placeholder client id/secret |

## Pre-push review (agent + human)

1. Search the diff for: `@xingai.app`, `bypass`, `secret`, `localStorage`, `X-`, `V2_`, `sk-`, `password`, `token=`, real phone numbers.
2. Ask: *Would this help someone abuse production tonight?*
3. Move operator-only detail to **private** docs in the product repo (`docs/runbooks/`, Fly notes, `TROUBLESHOOTING` § with bypass steps).
4. Prefer **design intent** over **current vulnerability state** in public posts.
5. Link ADRs for architecture; do not link internal troubleshooting sections that describe bypasses.

## If something sensitive already shipped

1. Redact in a follow-up commit (this repo).
2. Rotate or remove the exposed control in the product (disable bypass, rotate keys if values leaked).
3. Do not assume “obscurity” — treat the blog as part of the attack surface.

## Related

- Product private ops: `xingai-invest-ai/docs/TROUBLESHOOTING.md` (bypass details stay there until removed from code).
- XingAI legal baseline: workspace `legal-protection-all-repos.mdc`.
