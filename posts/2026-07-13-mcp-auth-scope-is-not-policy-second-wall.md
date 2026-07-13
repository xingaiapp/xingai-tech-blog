# Scope Isn't Policy: The Second Wall in claims-mcp-oauth-poc

**Date:** July 13, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**Tags:** `mcp` `oauth` `authorization` `policy-engine` `governance` `education`
**Also available:** [中文](2026-07-13-mcp-auth-scope-is-not-policy-second-wall.zh.md)

---

[Part 1](2026-07-13-mcp-oauth-vs-api-key.md) and [Part 2](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.md) of this series covered why `claims-mcp-oauth-poc` uses OAuth and what the protocol actually checks — signature, issuer, audience, expiry, scope. All of that answers one question well: is this token legitimate, and does it carry `claims.adjudicate`. It's worth asking directly: once that check passes, is the request actually safe to execute?

## A token with the right scope, on the wrong claim

Say an agent presents a perfectly valid, unexpired token, scope `claims.adjudicate` present and correct. It calls `submit_claim_decision` on `CLM-9010` — a real fixture in this POC — requesting a **$28,500** settlement.

Trace what the scope check in `mcp_server/auth.py` actually does here:

```python
def require_scopes(claims: dict[str, Any], required: set[str]) -> None:
    token_scopes = set(claims.get("scope", "").split())
    missing = required - token_scopes
    if missing:
        raise HTTPException(status_code=403, detail=f"insufficient_scope: missing {missing}")
```

`required` is `{"claims.adjudicate"}`. The token has it. `missing` is empty. This passes — cleanly, correctly, exactly as designed. The check never looked at which claim, or how much money. It structurally can't; nothing about "which claim" is part of an OAuth scope string.

## The second wall

`mcp_server/policies.py` exists because passing wall #1 is not the same claim as "this specific request should go through." `check_adjudication_policy` runs after the scope check, against the specific claim being acted on:

```python
def check_adjudication_policy(claim: dict, settlement_amount: float) -> None:
    if claim["status"] != AI_ASSIST_QUEUE_STATUS:
        raise HTTPException(403, "... not in the AI-assist queue ...")
    if claim["claim_type"] not in ALLOWED_CLAIM_TYPES:
        raise HTTPException(403, "... outside agent settlement authority ...")
    if settlement_amount > MAX_SETTLEMENT_USD:
        raise HTTPException(403, "... exceeds agent settlement authority ...")
```

`CLM-9010` fails on the first check already — it's deliberately seeded in `standard-queue`, not `ai-assist-queue`, and its `claim_type` (`auto_comprehensive_total_loss`) isn't in `ALLOWED_CLAIM_TYPES` either. Even if it passed both of those, `$28,500 > MAX_SETTLEMENT_USD` ($2,500 in this POC) would refuse it on the third. The fixture exists specifically to exercise all three refusal paths — see `tests/test_claim_flow.py`.

The distinction that matters: wall #1 answers *"is this identity allowed to call this operation at all"* — a property of the token, fixed at issuance. Wall #2 answers *"should this specific claim, this specific amount, go through right now"* — a property of live business data, re-evaluated on every call, blind to whatever the token claims.

## Why not just finer-grained scopes?

The obvious-sounding fix — mint a `claims.adjudicate.under2500` scope instead of a flat `claims.adjudicate` — doesn't actually work, for a structural reason: scopes are decided once, at token-issuance time, by whatever issued the token. They have no visibility into a claim's *current* status, type, or amount, because those are mutable business data, not identity attributes. Push policy into scope granularity and you need either a combinatorial explosion of scopes (one per claim-type × amount-tier × queue-status combination) or constant token reissuance every time a claim's state changes mid-flight. Neither is tractable.

There's an organizational reason too, and the POC's own demo script makes it visible: change `MAX_SETTLEMENT_USD` from `2_500` to `100`, restart *only* the MCP server, and rerun the same $1,850 claim (`CLM-8842`) that passed before — it now gets refused. Nothing about the Authorization Server changed. No token was reissued or revoked. The team that owns settlement-authority limits and the team that owns identity infrastructure can change their respective rules independently, because the two checks live in genuinely separate code, not two layers of the same scope catalog.

## The generalizable shape

This isn't a claims-specific trick. Any MCP server sitting in front of a regulated or high-stakes action needs the same split: an identity/capability layer (OAuth, answering "can this caller invoke this kind of operation at all") and a policy layer (answering "should this operation happen, on this data, right now" — re-evaluated per call, independent of what the token says). Checking them in that order matters too: scope failure gets a generic 403 before the request ever touches business data; policy failure gets a specific reason, because by that point the check already knows exactly which rule the request violated.

## Related

- [Why MCP Needs OAuth, Not Just an API Key](2026-07-13-mcp-oauth-vs-api-key.md) — Part 1
- [MCP Auth Mechanics: Discovery, PKCE, and What Gets Checked on Every Call](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.md) — Part 2
- [pocs/claims-mcp-oauth-poc/](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) — `mcp_server/policies.py`, `mcp_server/auth.py`, and the full test suite this post's examples are drawn from
- [Agent Governance Reference Architecture: Authority, Provenance, Approval, Audit](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-05-agent-governance-reference-architecture.md) — the broader pattern this two-wall model is one instance of
- [MCP Auth from Robinhood — OAuth 2.1 / PKCE / Token Verification](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-auth-deep-dive.md) — the Four-Layer Protection Model this POC's two walls map onto
