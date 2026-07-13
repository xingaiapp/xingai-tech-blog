# Same Crypto, Different Industry: A Claims MCP OAuth POC

**Date:** July 12, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**Tags:** `mcp` `oauth` `pkce` `insurance` `claims` `agent-security` `human-in-the-loop`
**Also available:** [中文](2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.zh.md)

---

Two [education guides](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.md) shipped yesterday, walking through a full OAuth 2.1 + PKCE + JWT implementation using Robinhood's Agentic Trading MCP as the worked example. Both ended with the same unfinished sentence: *"submit the code to a dedicated POC directory."* This is that POC — same code, same crypto, ported out of brokerage into a domain most enterprise MCP writeups never touch: insurance claims adjudication.

Repo: `xingai-enterprise-ai-pocs/pocs/claims-mcp-oauth-poc/`

## The question this answers

Every MCP auth writeup uses a brokerage or a generic SaaS API as the example. That leaves an honest question unanswered: does the pattern actually generalize, or does it only look clean because trading has well-known concepts (symbols, notional caps, isolated Agentic accounts) that happen to map neatly onto OAuth scopes? Insurance claims is a good stress test — different regulator, different risk shape, different vocabulary — and if the same three services (Authorization Server, MCP Server, Client) and the same PKCE math still fit without contorting, that's real evidence, not just a second demo.

They fit. Here's the domain mapping:

| Brokerage (source lab) | Claims (this POC) |
|---|---|
| `portfolio.read` / `orders.review` / `orders.place` | `claims.read` / `claims.review` / `claims.adjudicate` |
| Symbol allowlist + per-order notional cap | Claim-type allowlist + settlement-authority cap |
| Isolated, separately-funded Agentic account | Claims explicitly routed into an "AI-assist queue" |
| `review_equity_order` → `place_equity_order` | `review_claim_decision` → `submit_claim_decision` |

## Two walls, not one

It's tempting to read a `claims.adjudicate` scope as "this agent can adjudicate claims" and stop there. The POC's `mcp_server/policies.py` exists to break that assumption — every one of its checks runs *after* the OAuth scope check has already passed:

```python
def check_adjudication_policy(claim: dict, settlement_amount: float) -> None:
    if claim["status"] != AI_ASSIST_QUEUE_STATUS:
        raise HTTPException(403, "... not in the AI-assist queue ...")
    if claim["claim_type"] not in ALLOWED_CLAIM_TYPES:
        raise HTTPException(403, "... outside agent settlement authority ...")
    if settlement_amount > MAX_SETTLEMENT_USD:
        raise HTTPException(403, "... exceeds agent settlement authority ...")
```

A caller with a perfectly valid, unexpired, correctly-scoped token still gets refused here if the specific claim is out of bounds. This maps onto a real insurance concept — settlement authority tiers — better than the brokerage version's notional cap does: a junior adjuster doesn't get to settle a six-figure claim just because their login works, and the agent here is modeled as the most junior possible adjuster on the team.

## A bug the reference code hid

Porting crypto glue code "verbatim" isn't the same claim as porting it *correctly*. `public_key_to_jwk()` called `.public_key()` on an object that was already a public key — `load_pem_public_key()` returns the key directly, not a certificate wrapper needing an extra unwrap. It only surfaced when `pytest` actually exercised `/jwks.json`. A design doc doesn't get read line-by-line; a test suite that hits every endpoint does.

A second bug was in the tests themselves, not the implementation: the first draft of the scope-enforcement tests mocked `authenticate_request` wholesale, which silently skipped the real `require_scopes()` check it was supposed to be exercising. Every "insufficient scope" test passed — for the wrong reason. Fixed by mocking one layer deeper (`verify_token`) so the real scope check runs against the mocked claims. When a security check is the thing under test, mock its *input*, never the check itself.

## Verified end to end, not just unit-tested

33 tests cover PKCE, metadata discovery, token exchange/rotation, scope enforcement, and settlement-authority policy — all against mocked auth. On top of that, one live run against real running servers: real PKCE exchange, real signed JWT, real `get_claim` → `review_claim_decision` → `submit_claim_decision` → idempotent retry, over the wire.

## Enterprise mapping

This POC sits outside [ADR-003](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/003-mcp-gateway-placeholder-policy.md)'s placeholder rule on purpose — see [ADR-006](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/006-claims-mcp-oauth-poc-real-auth.md). ADR-003 governs cross-domain tool *routing and policy*, which genuinely doesn't exist yet and stays a simulated preview in every other POC here. This POC is the *authentication protocol* underneath any future gateway — real, tested, and now proven to generalize past the one domain it was first written for.

**Positioning:** first runnable proof that XingAI's Robinhood-derived MCP auth pattern is domain-general, not brokerage-specific — plus a from-scratch [MCP auth deep dive](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/pocs/claims-mcp-oauth-poc/docs/mcp-auth-deep-dive.md) tied line-by-line to the claims-domain code, for anyone who wants to understand PKCE, scoped JWTs, and the two-wall model well enough to explain *why*, not just point at a diagram.
