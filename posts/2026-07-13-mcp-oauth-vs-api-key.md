# Why MCP Needs OAuth, Not Just an API Key

**Date:** July 13, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**Tags:** `mcp` `oauth` `pkce` `authorization` `api-design` `education`
**Also available:** [中文](2026-07-13-mcp-oauth-vs-api-key.zh.md)

---

A question that comes up every time someone builds their first MCP server: it's just an HTTP endpoint calling a few functions — why not hand it an API key like any other internal service, instead of dragging in OAuth 2.1, PKCE, and JWTs?

The short answer is that MCP's actual shape has **three parties**, not two, and an API key is a two-party primitive. Here's the reasoning, worked through with the real code from `claims-mcp-oauth-poc`.

## Two parties vs. three

A typical API key secures a relationship between **a caller and a service** — your backend calls Stripe, Stripe checks the key, done. There's no third party in the picture whose consent matters.

MCP's real scenario is a human granting *their own agent* access to *their own data* on *someone else's system*: a claims adjuster (the user), a Claims Agent Client (the agent acting on the adjuster's behalf), and the Claims MCP Server (the resource holding the adjuster's actual data). The question a request has to answer isn't "is this a valid caller" — it's "did *this specific user* authorize *this specific agent* to do *this specific thing*, and can that be taken back later without breaking anything else." A static API key can't express any of that; it's the same bit of information no matter who's asking, what they're asking for, or when.

## Where a plain API key check actually fails

Trace what a bare API key check does at request time: compare the presented string against a stored value, return valid or invalid. That comparison has no notion of *which* action was requested. `get_claim` (read one claim) and `submit_claim_decision` (finalize a settlement) look identical to it — both are just "a request carrying a valid key."

`claims-mcp-oauth-poc`'s `mcp_server/auth.py` solves exactly this gap by checking something an API key doesn't carry at all — a scope claim inside the token:

```python
def require_scopes(claims: dict[str, Any], required: set[str]) -> None:
    token_scopes = set(claims.get("scope", "").split())
    missing = required - token_scopes
    if missing:
        raise HTTPException(status_code=403, detail=f"insufficient_scope: missing {missing}")
```

`get_claim` requires `claims.read`; `submit_claim_decision` requires `claims.adjudicate`. Same token holder, different token, different outcome — a distinction a "valid key / invalid key" check has no vocabulary for.

## Four things OAuth adds that a key can't

1. **Scope.** Shown above — a token can carry "only allowed to do X," and the server checks that per call, not just "is this a legitimate token at all."
2. **Short lifetime.** The JWT this POC issues is valid for 5 minutes. A leaked API key is a standing risk until someone notices and rotates it; a leaked 5-minute token is mostly worthless by the time anyone could misuse it.
3. **User consent, recorded per grant.** OAuth's `/authorize` step is the moment the adjuster sees *this agent* is requesting *these specific scopes* and clicks allow — a decision tied to that user, that client, that scope set. An API key has no equivalent moment; it's typically issued once, by a developer, with no per-use consent trail.
4. **PKCE, protecting the handoff OAuth itself introduces.** OAuth's redirect-based flow creates a new risk an API key never had: an authorization code briefly passing through a browser redirect, where a malicious app could intercept it. PKCE closes that:

```python
def generate_pkce_pair() -> tuple[str, str]:
    verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b"=").decode("ascii")
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge
```

The `challenge` (derived from the verifier) goes out in the redirect where it could be intercepted; the `verifier` itself never leaves the client process until the final token exchange. Whoever intercepts the authorization code still can't redeem it without the verifier — closing a hole that only exists *because* OAuth uses a redirect flow in the first place. It's worth naming this one as self-inflicted: OAuth needs PKCE to fix a problem OAuth's own design created, which an API key — having no redirect step — never had to solve.

## The one-sentence version

An API key answers "is this a legitimate caller." OAuth answers "did this specific user, right now, authorize this specific agent to do this specific thing, for a short window, in a way that can be revoked without touching anything else." MCP's three-party shape needs the second question answered, and a two-party primitive structurally cannot answer it — no amount of key rotation or per-service key issuance adds the missing party back in.

## Related

- [MCP Auth Mechanics: Discovery, PKCE, and What Gets Checked on Every Call](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.md) — Part 2, the wire-level walkthrough this post sets up
- [Scope Isn't Policy: The Second Wall in claims-mcp-oauth-poc](2026-07-13-mcp-auth-scope-is-not-policy-second-wall.md) — Part 3, why a valid scoped token still isn't enough to authorize a specific action
- [pocs/claims-mcp-oauth-poc/](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) — the runnable POC this post's code comes from
- [MCP Auth from Robinhood — OAuth 2.1 / PKCE / Token Verification](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-auth-deep-dive.md) — the full protocol-level deep dive
- [Build an OAuth 2.1 + PKCE MCP Project from Scratch](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.md) — the hands-on lab this POC ported
- [Same Crypto, Different Industry: A Claims MCP OAuth POC](2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.md) — the two-wall authorization model (scope *and* settlement-authority policy) built on top of this
