# MCP Auth Mechanics: Discovery, PKCE, and What Gets Checked on Every Call

**Date:** July 13, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**Tags:** `mcp` `oauth` `pkce` `authorization` `education`
**Also available:** [中文](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.zh.md)

---

[Last post](2026-07-13-mcp-oauth-vs-api-key.md) covered *why* `claims-mcp-oauth-poc` uses OAuth 2.1 + PKCE instead of a plain API key — the short version being that MCP's real shape is three parties (user, agent, resource server), and a static key is a two-party primitive that can't express "this specific user authorized this specific agent to do this specific thing, revocably." This one is the follow-up: given that OAuth is the answer, what actually happens on the wire, walked through with the same POC's code.

## Discovery: nothing is hardcoded

The agent's first call to the MCP server carries no token. The server doesn't fail with a bare 401 — it fails with a `WWW-Authenticate` header naming a URL:

```
401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="http://localhost:8001/.well-known/oauth-protected-resource/mcp"
```

The client fetches that URL and gets back JSON naming the Authorization Server. It then fetches *that* server's own `.well-known/oauth-authorization-server` metadata and gets the real endpoints — `/authorize`, `/token`, `/jwks.json` — plus confirmation that PKCE with S256 is required. Two hops (RFC 9728, then RFC 8414), and the 401 response is the map. Nothing about the Authorization Server's location was ever hardcoded into the client — swap the Authorization Server entirely and the client still finds it.

## PKCE: what the redirect actually exposes

The `/authorize` step happens through a browser redirect: the client opens a browser to `/authorize?...`, a human clicks Allow, and the Authorization Server redirects back to a loopback callback with `?code=...`. That hop through the browser is the vulnerable point — on some platforms, another app registered against the same redirect URI can intercept that code before the legitimate client sees it.

If a stolen code alone were enough to get a token, that's the whole game for an attacker. `client/oauth.py`'s `generate_pkce_pair()` closes it before the browser ever opens:

```python
def generate_pkce_pair() -> tuple[str, str]:
    verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b"=").decode("ascii")
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge
```

Only the `challenge` (a one-way hash) goes into the `/authorize` request, where it rides through the same redirect an attacker could be watching. The `verifier` itself stays in the client process the entire time. Later, exchanging the code for a token requires submitting the original `verifier`, and the Authorization Server checks that hashing it reproduces the `challenge` it stored when `/authorize` was first called. An attacker holding only the intercepted code has no verifier — it never crossed the network during the redirect — so `/token` rejects the exchange.

## What the server checks on every call

Once a token exists, every tool call runs through the same three-step gate in `mcp_server/auth.py`:

```python
def authenticate_request(request, required_scopes):
    token = extract_bearer_token(request)   # no Bearer header -> 401
    claims = verify_token(token)            # signature/iss/aud/exp -> 401
    require_scopes(claims, required_scopes) # missing scope -> 403
    return claims
```

`verify_token` checks the JWT's signature against the Authorization Server's published JWKS, and confirms `iss` (issued by the server this client expects), `aud` (issued *for this* MCP server, not some other resource that happens to trust the same Authorization Server), and `exp` (not expired). `require_scopes` then checks the specific scope the tool being called needs against what the token actually carries — this is the check that makes `get_claim` and `submit_claim_decision` behave differently even when called by the same authenticated identity. The returned `claims` dict carries `sub` — whose identity every audit line downstream gets written against.

## The full loop

Discovery → PKCE-protected authorization → per-call signature and scope verification. Every step exists to answer one of two questions: "where do I even go to authenticate" (discovery), or "can I trust that this specific request, from this specific token, is allowed to do this specific thing right now" (PKCE + per-call verification). Neither question has a meaningful answer under a static API key — which is exactly the gap [the previous post](2026-07-13-mcp-oauth-vs-api-key.md) started from.

## Related

- [Why MCP Needs OAuth, Not Just an API Key](2026-07-13-mcp-oauth-vs-api-key.md) — Part 1, the three-party argument this post assumes
- [Scope Isn't Policy: The Second Wall in claims-mcp-oauth-poc](2026-07-13-mcp-auth-scope-is-not-policy-second-wall.md) — Part 3, what still isn't checked even after everything in this post passes
- [pocs/claims-mcp-oauth-poc/](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) — the runnable code this post walks through
- [MCP Auth from Robinhood — OAuth 2.1 / PKCE / Token Verification](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-auth-deep-dive.md) — the fuller protocol-level education guide
- [Build an OAuth 2.1 + PKCE MCP Project from Scratch](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.md) — hands-on lab this POC's code is ported from
