# Personal Memory Engine: One Profile, Every XingAI Product

**Date:** July 1, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Tags:** `xingai` `memory-engine` `cross-product` `supabase` `privacy` `architecture`
**Also available:** [中文](2026-07-01-personal-memory-engine-cross-product.zh.md)

---

The problem with building multiple AI products is that each one starts from scratch.

You tell Invest AI you're 55 years old with a conservative risk tolerance. You tell Meal AI you have fatty liver. You tell SAT AI your daughter wants to be a doctor. Each product hears you once and forgets the next time a different product asks.

The Personal Memory Engine ([Engineering System ADR-001](https://github.com/xingaiapp/xingai-engineering-system/blob/main/docs/adr/001-personal-memory-engine.md)) is the solution.

## What Gets Stored

One `user_memory` row per user, in Supabase:

```
age, goals, constraints, health_conditions,
financial_profile, family_members, preferences,
decision_style, language
```

That's it. The schema is intentionally flat. Each product keeps its own rich domain-specific tables (portfolio positions, meal logs, SAT scores). Memory stores only what's useful *across* products.

The rule: **if another product would benefit from knowing it, it belongs in memory. If only one product needs it, it stays local.**

## Why Supabase, Not a New Service

Everything else in XingAI follows the "per-product local database" rule. Memory is the one exception.

Three reasons:

1. **Auth is already there.** `user_memory` is essentially an extension of the Supabase auth user — same `user_id`, same RLS policies. It's not a new dependency, it's an extension of an existing one.
2. **Access is always by primary key.** `SELECT * FROM user_memory WHERE user_id = $1` — no cross-user joins, no aggregations. The performance profile is the same as a key-value store.
3. **The alternative is worse.** If each product stored its own memory slice, a cross-product recommendation ("given your health profile AND your investment profile") would require product A to call product B's API at request time. That's an O(N²) dependency graph as products grow, for the sole purpose of reading a few fields.

## How It Flows Into the LLM

The worker (not the FastAPI layer) reads `user_memory` and injects it into the LLM system prompt:

```python
system_prompt = build_system_prompt(
    product="invest-ai",
    user_memory=load_user_memory(user_id),
    domain_context=portfolio_context,
)
```

The memory isn't cached separately from the plan — memory changes are rare, and a stale prompt for a meal plan or investment recommendation is a meaningfully worse experience than the extra 5ms lookup.

## Worker-Inferred Memory Updates

Some memory updates come from the user explicitly (editing their profile). Others the system infers from behavior.

Example: a user ignores 3 consecutive high-sodium meal plans. The Meal AI worker notices this pattern and queues a `pending_memory_update`:

```json
{
  "field": "constraints",
  "add": "low_sodium",
  "reason": "ignored 3 high-sodium plans (Aug 1–15)",
  "confidence": 0.8
}
```

Before writing, the user sees a confirmation: "We noticed you prefer low-sodium meals. Add this to your profile?" They can confirm, edit, or dismiss.

This is the Feedback Loop Engine working at the memory layer — not just improving recommendations, but improving the *context* that generates all future recommendations.

## Privacy Is Non-Negotiable

`user_memory` contains health conditions and financial data. Two requirements that aren't optional:

1. **Supabase RLS:** `user_id = auth.uid()` on all operations. A user can only read and write their own row.
2. **Right to delete:** `DELETE /api/memory` hard-deletes the row and triggers cascade deletion in each product's decision ledger. The user can export or delete everything from any XingAI product's settings page.

`health_conditions` and `financial_profile` are never logged in plaintext in application logs — not even in development.

## What This Enables

With Personal Memory Engine live, a recommendation can say:

> "Given your conservative risk tolerance, fatty liver, and the fact that your daughter is preparing for medical school in 3 years, here's a portfolio adjustment that keeps your liquidity for tuition while staying defensive in the current macro environment."

No chatbot can say that. Not because it lacks the LLM capability — but because it doesn't know who you are across contexts.

The memory is the moat.

**Further reading:** [Engineering System ADR-001: Personal Memory Engine](https://github.com/xingaiapp/xingai-engineering-system/blob/main/docs/adr/001-personal-memory-engine.md)
