# MCP 认证机制:发现阶段、PKCE,以及每次调用到底在检查什么

**日期：** 2026 年 7 月 13 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**标签：** `mcp` `oauth` `pkce` `authorization` `education`
**其他语言：** [English](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.md)

---

[上一篇](2026-07-13-mcp-oauth-vs-api-key.zh.md)讲了 `claims-mcp-oauth-poc` *为什么*要用 OAuth 2.1 + PKCE 而不是一个简单的 API key——简短版本是:MCP 真实的形状是三方(用户、agent、resource server),而一个静态 key 是个两方原语,表达不出"这个具体用户授权了这个具体 agent 做这件具体的事,而且可以撤销"。这一篇是后续:既然 OAuth 是答案,那它在线上到底是怎么运作的,照着同一个 POC 的代码走一遍。

## 发现阶段:什么都没硬编码

agent 第一次调用 MCP server,是不带 token 的。server 不会只甩一个光秃秃的 401——它在 `WWW-Authenticate` 里指了一个 URL:

```
401 Unauthorized
WWW-Authenticate: Bearer resource_metadata="http://localhost:8001/.well-known/oauth-protected-resource/mcp"
```

client 去请求这个 URL,拿到一份 JSON,里面写着谁是 authorization server。然后它再去请求*那个* server 自己的 `.well-known/oauth-authorization-server` 元数据,拿到真正的端点——`/authorize`、`/token`、`/jwks.json`——外加"必须用 S256 的 PKCE"这个确认。两跳(先 RFC 9728,再 RFC 8414),那个 401 响应本身就是地图。authorization server 的地址,从头到尾都没有被硬编码进 client 里——就算整个换掉一个 authorization server,client 照样能找到它。

## PKCE:重定向到底暴露了什么

`/authorize` 这一步是通过浏览器重定向完成的:client 打开浏览器去 `/authorize?...`,人点了"允许",authorization server 把浏览器重定向回一个本地回调地址,带着 `?code=...`。这段经过浏览器的跳转就是脆弱点——在某些平台上,注册了同一个回调地址的另一个 app,可能抢在合法 client 之前先截到这个 code。

如果光凭偷来的 code 就能换到 token,攻击者的活儿就算干完了。`client/oauth.py` 的 `generate_pkce_pair()` 在浏览器打开之前,就先把这个洞堵上了:

```python
def generate_pkce_pair() -> tuple[str, str]:
    verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b"=").decode("ascii")
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge
```

`/authorize` 请求里只带出去 `challenge`(一个单向哈希值),它会跟着同一个可能被攻击者盯着的重定向一起走。`verifier` 本身则始终留在 client 进程里。之后拿 code 换 token 时,必须再提交原始的 `verifier`,authorization server 会检查:把它哈希一遍,是不是等于 `/authorize` 第一次调用时存下的那个 `challenge`。攻击者手里只有截获来的 code,没有 verifier——这东西在整个重定向过程中根本没上过线——所以 `/token` 会拒绝这次换取。

## server 每次调用都在检查什么

一旦有了 token,每次工具调用都会走 `mcp_server/auth.py` 里同一套三步关卡:

```python
def authenticate_request(request, required_scopes):
    token = extract_bearer_token(request)   # 没带 Bearer header -> 401
    claims = verify_token(token)            # 签名/iss/aud/exp -> 401
    require_scopes(claims, required_scopes) # scope 不够 -> 403
    return claims
```

`verify_token` 拿 authorization server 公开的 JWKS 去验这个 JWT 的签名,再确认 `iss`(是不是这个 client 期望的那个 server 签发的)、`aud`(是不是签发给*这台* MCP server 的,不能拿信任同一个 authorization server 的别的资源方的 token 来用)、`exp`(过期了没有)。`require_scopes` 再拿这次要调用的工具需要的 scope,去对照 token 里实际带的 scope——正是这一步检查,让 `get_claim` 和 `submit_claim_decision` 在同一个已认证身份下也会有不同的结果。返回的 `claims` 字典里带着 `sub`——之后每一条审计日志都是照着这个字段写的。

## 完整的一圈

发现 → PKCE 保护下的授权 → 每次调用的签名+scope 校验。每一步都在回答两个问题里的一个:"我该去哪里认证"(发现),或者"我能不能信任这个具体请求、这个具体 token,此刻被允许做这件具体的事"(PKCE + 逐次校验)。这两个问题,在一个静态 API key 之下都没有有意义的答案——这正是[上一篇](2026-07-13-mcp-oauth-vs-api-key.zh.md)开头指出的那个缺口。

## 相关

- [为什么 MCP 需要 OAuth,而不是简单发个 API key](2026-07-13-mcp-oauth-vs-api-key.zh.md) —— 第一篇,本文默认你已经看过的三方论证
- [Scope 不等于 Policy:claims-mcp-oauth-poc 里的第二道墙](2026-07-13-mcp-auth-scope-is-not-policy-second-wall.zh.md) —— 第三篇,本文这些检查全部通过之后,还有什么没被检查到
- [pocs/claims-mcp-oauth-poc/](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) —— 本文对照的可运行代码
- [从 Robinhood MCP 看懂 MCP 认证](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-auth-deep-dive.zh.md) —— 更完整的协议级教学指南
- [从零搭建 OAuth 2.1 + PKCE MCP 项目](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.zh.md) —— 本 POC 代码的直接来源实验
