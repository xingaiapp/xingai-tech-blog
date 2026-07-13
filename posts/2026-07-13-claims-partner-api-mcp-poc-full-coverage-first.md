# Full API Coverage First: A Claims Partner MCP POC

**Date:** July 13, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Enterprise AI POCs — Claims Partner API MCP](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-partner-api-mcp-poc)
**Tags:** `mcp` `api-design` `insurance` `claims` `typescript` `openapi`
**Also available:** [中文](2026-07-13-claims-partner-api-mcp-poc-full-coverage-first.zh.md)

---

Yesterday's post covered [`claims-mcp-oauth-poc`](2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.md): real OAuth 2.1 + PKCE in front of four deliberately narrow tools. That POC answers "does the auth protocol generalize to a regulated domain." It doesn't answer a different, equally real question a claims business asks the moment it wants to open its API to partners: what if a partner needs more than the one workflow those four tools cover?

This POC answers that one. Same domain (insurance claims), same repo, opposite starting point: an 18-tool MCP server wrapping a full claims-business OpenAPI contract — claim intake, status transitions, notes, document evidence, policy coverage checks, claimant management, settlement payments — with **no** auth layer in front of it yet, on purpose.

Repo: `xingai-enterprise-ai-pocs/pocs/claims-partner-api-mcp-poc/`

## Contract first, then two implementations against it

The starting artifact is `claims-api-openapi.yaml` — 18 endpoints, 7 domains, OpenAPI 3.1. Everything else is derived from it twice, independently:

- `mcp-server/` (TypeScript, `@modelcontextprotocol/sdk`, Streamable HTTP): 18 MCP tools, one per endpoint, each with a Zod schema, a markdown/JSON dual-format response, and `readOnlyHint`/`destructiveHint`/`idempotentHint` annotations.
- `mock-api/` (Express, in-memory data): a runnable stand-in claims system implementing the same 18 routes, so the POC doesn't need a real carrier backend to be honest about its "Runnable" status label.

Only two tools carry `destructiveHint: true` — `claims_transition_status` and `claims_create_payment`. Everything else is read-only or additive. That's a small thing to notice in a tool list, but it's the one signal a calling agent (or the human reviewing what an agent is about to do) gets for free without reading any tool's implementation.

## The mock backend enforces a real state machine

```typescript
export const LEGAL_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  submitted: ["under_review", "closed"],
  under_review: ["approved", "denied", "closed"],
  approved: ["in_payment", "closed"],
  denied: ["closed", "reopened"],
  in_payment: ["closed"],
  closed: ["reopened"],
  reopened: ["under_review", "closed"],
};
```

`claims_transition_status` calling `approved → under_review` gets a 409, not a silently-accepted write. The end-to-end test asserts this explicitly (step 7) rather than just asserting the happy path — a mock that accepts anything isn't testing anything.

## A bug the test caught on the first real run

`claims_create_payment` is supposed to move a claim to `in_payment` on success — the OpenAPI spec says so in plain English. The first draft of `mock-api`'s payment route did exactly that: flipped `claim.status`, returned the payment, done. It did **not** append a `StatusEvent` recording the transition, because that bookkeeping lived in the *other* route (`/claims/:claimId/status`) and the payment route just... didn't call it.

The end-to-end test's last step asserts the status history has exactly 3 events after the full happy path (submit → review, review → approve, approve → in_payment via payment). First real run: 2. The payment-driven transition was invisible in the audit trail. Fixed by having the payments route emit its own `StatusEvent` with a reason referencing the payment ID — but the lesson is the more interesting part: **any code path that changes claim status needs to go through the same audit append, not just the code path whose whole job is changing status.** It's an easy thing to miss precisely because the payments endpoint's main job looks like "issue a payment," not "also, incidentally, change claim status."

## Idempotency, actually exercised

```javascript
console.log("8. Issuing settlement payment...");
const payment = await callTool("claims_create_payment", { ... });
```

`claims_create_payment` always sends an `Idempotency-Key` header — client-supplied if given, otherwise generated per call. `mock-api` keys a lookup table on it: same key twice, same payment returned, no second one created. This isn't tested by calling the tool once and checking the response looks right; a real retry (same key, same claim) has to come back byte-identical to the original for the guarantee to mean anything.

## What this deliberately doesn't have

No auth. `mcp-server` calls `mock-api` with one static bearer token — fine for a single internal caller, not something you'd hand to multiple external partners who each need a revocable credential. That's not an oversight; it's the explicit scope boundary this POC draws around itself, spelled out as the first "Not Production Yet" bullet and as [ADR-007](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/007-claims-partner-api-mcp-poc-full-coverage.md)'s whole reason for existing: building comprehensive API coverage and real OAuth in the same POC would have made it harder to tell whether any given gap was a coverage bug or an intentional auth boundary.

## How the two POCs fit together

Neither `claims-mcp-oauth-poc` nor this one is what you'd actually deploy. A real third-party integration needs this POC's 18-tool coverage with that POC's Authorization Server in front of it, enforcing the 10 scopes already declared (unenforced) in `claims-api-openapi.yaml`'s `securitySchemes`. The [design article accompanying this POC](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-13-mcp-api-coverage-vs-workflow-tools.md) works through when to start with which side of this tradeoff, using both POCs as the worked example.

**Positioning:** the API-coverage half of a two-POC pair that, combined, sketches a full answer to "how do we let third-party AI agents integrate with our claims API through MCP" — one POC proves the auth works, this one proves the coverage does, and neither pretends to be the whole answer on its own.
