# Shared CPU, Shared SQLite: How Invest AI Made the Console Fast Without Breaking CQRS

CQRS said the worker owns decisions and FastAPI only reads cache. Users still waited seconds on `/dashboard`. The compute boundary was fine. The **read path** was not.

This post is the engineering story behind [ADR-056](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/056-console-read-path-cdn-parallel-auth.md) and the [ADR-036 OHLCV amendment](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/036-worker-ohlcv-bars-cache.md).

## What was actually slow

Three different clocks stacked:

1. **Fly contention.** One shared vCPU runs uvicorn and the market-cache worker on one SQLite file. During a refresh, public GETs for `/api/v2/dashboard` often took **3–12 seconds**. Logs showed `ohlcv_written≈67266` every cycle — full Yahoo windows rewritten when history had not moved.
2. **Serial console UX.** Client `SignedInOnly` waited for session before mounting pages that only need a **public** cache snapshot. Then `cache: "no-store"` plus a Bearer on unscoped reads skipped the CDN middleware on purpose.
3. **Stale HTML + heavy JS.** Golden Pit kept a **1h ISR** seed (all D) after grades were already B/B- on the API. Dashboard shipped ~3700 lines of client UI in one chunk.

Decision math was not running on the request path. Waiting for Fly during a delete-rewrite of K-lines was.

## The pack

### Edge cache for identity-free GETs

`PublicCdnCacheMiddleware` allowlists worker-backed routes and sets `CDN-Cache-Control` + `Vercel-Cache-Tag`. Vercel rewrite caching is on for the same paths. Unscoped dashboard / today / golden-pit client fetches no longer send Bearer or `no-store`. Sign-in stays a product gate, not an API auth requirement for the shared market snapshot.

After ship: CDN HIT on dashboard about **0.15s**.

### Parallel auth + cache seed

SSR runs `auth()` and the cache fetch with `Promise.all` (`lib/console-session.ts`). Guests still see the sign-out gate. Signed-in users do not wait login → then data.

### Stop rewriting unchanged history

OHLCV cycles now full-refresh only when the store is empty, the last full pull is older than 24h, or a closed bar’s price moved (split / re-base). Otherwise fetch ~5 days and upsert. Forced production run on 2026-09-30: `written=3915`, `full=0`, `incremental=69` in ~18s.

### Delivery details

Dashboard entry is a thin `dynamic()` shell; body is a separate chunk. Golden Pit `revalidate=60` and always revalidates client-side after paint.

## What we did not do

- Recompute engines inside FastAPI when the cache “felt stale.”
- CDN-cache responses that vary by user identity.
- Pretend a bigger VM alone fixes write amplification.

## Numbers (honest)

| Check | Before (typical) | After (2026-09-30) |
|---|---|---|
| Dashboard via invest CDN | often multi-second MISS to Fly | ~0.15s HIT |
| OHLCV rows per cycle | ~67k | ~4k incremental when warm |
| Console HTML shells | mixed | mostly 0.2–0.5s TTFB |

Browser hydrate is still not free. `/method` and `/plans` 404s are routing gaps, not latency.

## Links

- Repo: https://github.com/xingaiapp/xingai-invest-ai
- ADR-056: https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/056-console-read-path-cdn-parallel-auth.md
- ADR-036: https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/036-worker-ohlcv-bars-cache.md
- Design: https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-09-30-shared-cpu-cqrs-edge-cache-vs-write-amplification.md
- Product: https://invest.xingai.app

Disclaimer: informational engineering notes. Not investment, legal, or operational advice for your deployment.
