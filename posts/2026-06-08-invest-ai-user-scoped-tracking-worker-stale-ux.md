# Saved Preferences Are Not Decisions: Tracking Stocks Without Breaking the Worker Boundary

**Date:** June 8, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** XingAI Invest AI  
**Tags:** `invest-ai` `sqlite` `fastapi` `worker-cache` `decision-boundary`  
**Also available:** [中文](2026-06-08-invest-ai-user-scoped-tracking-worker-stale-ux.zh.md)

---

A financial decision system has two very different kinds of state:

```text
Decision state:
  top signals, rankings, risk, confidence, overlays

Preference state:
  tracked symbols, notification toggles, custom slots
```

Confusing them creates bugs. Worse, it creates places where the app can quietly start making decisions outside the decision engine.

We hit this while adding **My Tracked Stocks** to XingAI Invest AI.

Users wanted to add symbols like `AVL` and `TSLL`. Simple enough. But the first version exposed two design mistakes:

1. It treated tracked-symbol writes as if they required authenticated paid-style access.
2. It rendered a stale worker cache as a large red frontend failure.

Both were technically understandable. Neither was the right product behavior.

## The Boundary We Had to Preserve

Invest AI has a hard rule:

```text
Worker computes decisions.
FastAPI reads cache.
Frontend renders.
```

That means the solution could not be:

- let FastAPI recompute top signals when the worker is stale,
- let React infer rankings from raw market fields,
- store tracked symbols only in the browser where the worker cannot read them.

The tracked-symbol list needs to live in SQLite because the worker reads it later for signal-change alerts. But saving a symbol is not itself an investment decision.

## Split the Problem Into Three Paths

We separated the workflow into three paths:

```text
Tracked symbols
  user preference
  SQLite
  anonymous or logged-in

Custom symbol slots
  paid/admin entitlement
  authenticated
  SQLite slot list

AI signal rankings
  worker decision output
  SQLite cache
  stale-gated by FastAPI
```

That split is the architecture.

## Anonymous Users Still Need a Backend Key

The app supports anonymous users, so requiring a Bearer token for:

```text
POST /api/v1/signal-tracking/AVL
```

caused production failures:

```text
Missing or invalid Authorization header
```

The fix was not localStorage persistence. The fix was a browser-scoped backend key:

```text
X-Client-Id: <stable browser id>
```

The frontend sends `X-Client-Id` for anonymous users and `Authorization: Bearer <jwt>` when a login token exists. FastAPI resolves the user key like this:

```python
if current_user:
    user_id = current_user["user_id"]
else:
    user_id = get_identifier_from_request(request)  # prefers X-Client-Id
```

The source of truth remains SQLite:

```text
user_notification_settings.tracked_symbols
```

The browser id is only the key used to find that row.

## Admin Access Is Permission, Not Computation

We also needed a configured operator email to test paid custom symbol slots without a billing record.

The narrow fix is an allowlist in Fly secrets (comma-separated operator emails). That grants custom-slot entitlement. It does not grant permission for FastAPI to compute a signal.

Even for an admin:

- FastAPI may write the slot list.
- FastAPI may select cached output.
- FastAPI may return `WORKER_DATA_STALE`.
- FastAPI may not fetch live market data and build a decision on demand.

That is the difference between authorization and decision logic.

## Stale Worker Data Is a UX State

When the worker cache was stale, FastAPI correctly returned:

```text
WORKER_DATA_STALE
```

The Signals page originally turned that into a large red "Failed to load signals" error. But the page was not broken. The tracked list was still valid. Only the worker-owned ranking snapshot was unavailable.

The UI now treats this as a degraded state:

```text
AI signals are waiting for a fresh worker cache.
Your tracked stocks remain saved below.
Signal rankings will return after the worker writes a fresh decision snapshot.
```

No fake ranking. No frontend inference. No request-time recompute. Just an honest state.

## The Design Lesson

If a user saves `TSLL`, that is a preference.

If the system says `TSLL` is a buy, that is a decision.

If the worker is stale, that is an operational state.

Each belongs in a different place.

```text
SQLite preferences:
  tracked symbols, notification toggles

SQLite decision cache:
  top signals, rankings, macro radar, overlays

FastAPI:
  user key resolution, preference CRUD, cache reads

Worker:
  decision generation, stale semantics, alert dispatch

Frontend:
  render saved preferences and explain cache state
```

The small bug was "AVL does not show up."

The real design lesson was this: user preferences should be easy to save, but decision intelligence should remain hard to fake.

**Further reading:** ADR-020 in the XingAI Invest AI repo.
