# Meal AI: Worker + Cache for Health-Aware Meal Planning

**Date:** July 1, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [XingAI Meal Coach AI](https://github.com/xingaiapp/xingai-meal-coach-ai)
**Tags:** `meal-ai` `worker-cache` `cqrs` `health-ai` `nutrition` `fastapi` `sqlite`
**Also available:** [中文](2026-07-01-meal-ai-worker-cache-health-context.zh.md)

---

Meal AI is the health domain of XingAI — nutrition planning, meal recommendations, and caregiver support for family members with specific health conditions.

Three new ADRs define its architecture. Here's how the pieces fit together.

## The Core Problem

Calling an LLM on every page load for a meal plan is wrong:

- **Latency:** 3–8 seconds for a GPT-4o meal plan call
- **Cost:** $0.01–0.03 per request × many users = unpredictable
- **Consistency:** the plan changes every load even if nothing changed

The fix is the same one Invest AI uses ([ADR-008](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/008-cqrs-cache-pattern.md)): a background worker generates plans on a schedule, FastAPI reads the cache, the frontend polls until ready.

## ADR-001: Worker + Cache

```
Worker (background, Python)
  → load user profile
  → call LLM (GPT-4o → Claude fallback)
  → enrich with Nutritionix API
  → validate safety
  → write to meal_cache (SQLite)

FastAPI (request path, read-only)
  → read meal_cache
  → return { status: "ready", plan: {...} }
     or { status: "generating" }

Frontend (Next.js)
  → poll /api/meal?user_id=<id>
  → show loading state → render plan
```

Cache TTL: 24 hours standard / 1 hour for seasonal plans.

No Redis. SQLite is sufficient — the worker is a single background process and is the only writer.

## ADR-002: Health Condition Awareness

The key differentiator from a generic chatbot: the worker maps known health conditions to prompt instructions before calling the LLM.

| Condition | Prompt addition |
|-----------|----------------|
| `fatty_liver` | Avoid fried foods, high-fat meals, alcohol |
| `diabetes` | Low glycemic index, limit refined carbs |
| `high_blood_pressure` | Reduce sodium, increase potassium |
| `cancer_recovery` | High protein, anti-inflammatory, no processed foods |

Unknown conditions pass through as free text — the LLM handles them gracefully.

The worker also runs a rule-based `validate_safety()` check before writing to cache. It flags any ingredient that conflicts with a health condition. This is a backstop — not medically certified, but better than no check.

Every plan includes a non-hideable disclaimer: "This meal plan is for informational purposes only. Consult a healthcare provider before making significant dietary changes."

## ADR-003: Decision Ledger

Meal AI is the second XingAI product to adopt the [cross-product Decision Ledger schema](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md).

Every generated plan writes a ledger row:

```json
{
  "product": "meal-ai",
  "domain": "meal-plan/condition/fatty_liver",
  "question": "Weekly meal plan for my mom with fatty liver",
  "recommendation": "7-day low-fat, high-fiber meal plan",
  "confidence": 0.82,
  "action_taken": null,
  "outcome": null
}
```

`confidence` is a Meal AI-specific composite:
- `0.4` base
- `+0.2` safety validation passed
- `+0.2` Nutritionix enrichment succeeded  
- `+0.2` user profile complete

`action_taken` starts null. When the user taps "I followed this plan" in the UI, it updates to `"followed"`. This is the Feedback Loop Engine's input data.

The ledger row and the cache entry are written in separate calls — explicit, not fused. Preview a plan without logging it? Possible. Tests stay simple.

## How It Fits the XingAI Pattern

Meal AI's worker + cache architecture is identical to Invest AI's. The health-condition mapping is Meal AI-specific. The Decision Ledger row is cross-product standard.

This is the XingAI architecture discipline in action: decisions compound across products because they all write to the same schema, even though each product's internal logic is completely different.

**Further reading:** [ADR-001 Worker Cache](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/001-cqrs-worker-cache.md) · [ADR-002 Nutrition Pipeline](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/002-nutrition-worker-pipeline.md) · [ADR-003 Decision Ledger](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.md)

---

*Meal AI meal plans are for informational purposes only and do not constitute medical or dietary advice.*
