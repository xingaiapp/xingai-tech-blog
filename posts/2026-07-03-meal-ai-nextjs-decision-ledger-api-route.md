# Meal AI: Decision Ledger in a Next.js App with No Backend

**Date:** July 3, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [XingAI Meal Coach AI](https://github.com/xingaiapp/xingai-meal-coach-ai)
**Tags:** `meal-ai` `nextjs` `decision-ledger` `api-routes` `no-backend`
**Also available:** [中文](2026-07-03-meal-ai-nextjs-decision-ledger-api-route.zh.md)

---

Meal AI v4 is a pure Next.js app — no Python backend, no database, all decision logic in TypeScript on the client. The [Decision Ledger schema](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md) expects a write call when a recommendation is shown. How do you adopt the cross-product pattern when your product has no backend?

Next.js API routes. Here's how.

## The Constraint

Meal AI v4 has no Python worker, no SQLite, no Supabase auth. Its stack:

```json
{
  "dependencies": {
    "next": "16.2.4",
    "react": "^19"
  }
}
```

No `better-sqlite3`, no Prisma, no ORM. The decision logic (`decision-engine.ts`) runs in the browser.

## The Solution: Next.js API Route with In-Process Store

```typescript
// app/api/decisions/route.ts

// In-process store — keyed by session_id → Decision[]
const _store = new Map<string, Decision[]>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const decision: Decision = {
    id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    product: "meal-ai",
    domain: body.domain ?? "meal-plan",
    question: body.question,
    recommendation: body.recommendation,
    reasoning: body.reasoning ?? [],
    confidence: body.confidence ?? 0.4,
    action_taken: null,
    outcome: null,
    created_at: new Date().toISOString(),
    // ...
  };
  const rows = _store.get(body.session_id) ?? [];
  rows.push(decision);
  _store.set(body.session_id, rows);
  return NextResponse.json(decision, { status: 201 });
}
```

Three endpoints: `GET` (list), `POST` (record), `PATCH` (update `action_taken`). All stateful in the in-process Map.

## Wiring into the Page

When the user triggers a meal decision, the frontend sends a fire-and-forget POST:

```typescript
function runQuickDecision() {
  setShowResult(true);
  // ... scroll ...

  const decision = getTodayDecision(userState);
  fetch("/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionStorage.getItem("xingai_session") ?? "anon",
      domain: `meal-plan/condition/${decision.state.toLowerCase()}`,
      question: `Meal decision: ${decision.mode} mode, BP=${userState.bloodPressure}`,
      recommendation: decision.rules.join("; "),
      reasoning: decision.reason,
      confidence: decision.confidence,
    }),
  }).catch(() => {/* non-blocking */});
}
```

`.catch(() => {})` — the ledger write is non-blocking. A network error or server cold start does not affect the user's experience.

## The Tradeoff: In-Process vs. Persistent

The in-process Map resets on server restart or cold start. This is v1 behavior, explicitly chosen:

| Approach | Persistence | Complexity | Right for v1? |
|---|---|---|---|
| In-process Map | Session-only | Zero | ✅ Yes |
| `better-sqlite3` | Across restarts | Medium | Not yet |
| Supabase | Cross-device | High | Later |

The schema is already correct. When Meal AI gets a backend, swapping `_store` for a database is a one-file change. The contract (schema shape, endpoint paths, frontend call) stays the same.

## What This Proves

Meal AI becomes the second Decision Ledger adopter ([ADR-003](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.md)) — validating that the cross-product schema works for:

- A Python FastAPI backend (Invest Decision Engine)
- A Next.js client-side app with an API route (Meal AI)

The pattern is framework-agnostic. The schema is the contract. The implementation adapts to the product's stack.

**Related ADR:** [Meal AI ADR-003: Decision Ledger Adoption](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.md)
