# 为什么 MCP 需要 OAuth,而不是简单发个 API key

**日期：** 2026 年 7 月 13 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**标签：** `mcp` `oauth` `pkce` `authorization` `api-design` `education`
**其他语言：** [English](2026-07-13-mcp-oauth-vs-api-key.md)

---

每次有人第一次搭 MCP server 都会问这个问题:它不就是个调用几个函数的 HTTP 端点吗,为什么不像其他内部服务一样发个 API key,非要折腾 OAuth 2.1、PKCE、JWT 这一整套?

简短的答案是:MCP 真实的形状是**三方**,不是两方,而 API key 是一个两方原语。下面用 `claims-mcp-oauth-poc` 里的真实代码把这个推理过一遍。

## 两方 vs 三方

一个典型的 API key 保护的是**调用方和服务**之间的关系——你的后端调用 Stripe,Stripe 检查 key,完事。这里面没有第三方,也没有谁的"同意"需要被考虑进去。

MCP 的真实场景是一个人授权*自己的 agent* 去访问*自己的数据*,而这些数据在*别人的系统*里:一个理赔员(用户)、一个替理赔员干活的 Claims Agent Client(agent)、还有存着理赔员真实数据的 Claims MCP Server(资源服务器)。一个请求要回答的问题不是"这是不是一个合法调用方",而是"*这个具体用户*有没有授权*这个具体 agent*做*这件具体的事*,而且这个授权能不能之后单独撤销、不影响其他任何东西"。一个静态 API key 表达不了这些——不管是谁在问、问的是什么、什么时候问,它给出的都是同一段信息。

## 一个普通 API key 检查具体在哪里失效

拆开看一个普通 API key 检查在请求时到底做了什么:把提交的字符串和存好的值比对一下,返回合法或不合法。这个比对里没有"这次请求到底想干哪个具体操作"这个维度。在它眼里,`get_claim`(读一条理赔记录)和 `submit_claim_decision`(敲定一笔赔付)长得一模一样——都只是"一个带着合法 key 的请求"。

`claims-mcp-oauth-poc` 的 `mcp_server/auth.py` 解决的正是这个缺口,靠的是检查一个 API key 根本不携带的东西——token 里的一个 scope 声明:

```python
def require_scopes(claims: dict[str, Any], required: set[str]) -> None:
    token_scopes = set(claims.get("scope", "").split())
    missing = required - token_scopes
    if missing:
        raise HTTPException(status_code=403, detail=f"insufficient_scope: missing {missing}")
```

`get_claim` 需要 `claims.read`;`submit_claim_decision` 需要 `claims.adjudicate`。同一个 token 持有者,不同的 token,不同的结果——这是一个"合法 key / 不合法 key"式的检查根本没有词汇去表达的区分。

## OAuth 加上的四件 key 做不到的事

1. **Scope(权限范围)。** 上面已经展示过——一个 token 可以携带"只允许做 X",server 每次调用都检查这一点,而不只是检查"这是不是一个合法 token"。
2. **短生命周期。** 这个 POC 签发的 JWT 只活 5 分钟。一个泄露的 API key 是一个持续存在的风险,直到有人发现并轮换它;一个泄露的 5 分钟 token,等有人想拿它做坏事的时候,基本上已经作废了。
3. **用户同意,按每次授权记录下来。** OAuth 的 `/authorize` 环节,是理赔员亲眼看到*这个 agent*正在请求*这些具体 scope*、然后点击允许的那一刻——这是一个绑定到这个用户、这个客户端、这组 scope 的决定。API key 没有对应的时刻;它通常是开发者一次性发出去的,没有按每次使用留下同意记录。
4. **PKCE,保护的是 OAuth 自己引入的交接环节。** OAuth 基于重定向的流程,带来了一个 API key 从来没有过的新风险:一个授权码短暂地经过浏览器重定向,恶意 app 可能借机截获它。PKCE 就是用来堵这个洞的:

```python
def generate_pkce_pair() -> tuple[str, str]:
    verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b"=").decode("ascii")
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    return verifier, challenge
```

`challenge`(从 verifier 推导出来的)会出现在重定向里,有被截获的风险;而 `verifier` 本身在最后一步兑换 token 之前,从来不会离开客户端进程。就算有人截获了授权码,没有 verifier 也兑换不了——堵住的这个洞,恰恰*因为* OAuth 一开始就用了重定向流程才会存在。值得点破的是:这是 OAuth 自己造成、自己修补的问题——PKCE 修的是 OAuth 自身设计带来的漏洞,而 API key 因为压根没有重定向这一步,从来不需要面对这个问题。

## 一句话版本

API key 回答的是"这是不是一个合法调用方"。OAuth 回答的是"此刻,这个具体用户有没有授权这个具体 agent 去做这件具体的事,时限很短,而且可以单独撤销、不影响别的东西"。MCP 天生是三方结构,需要的是第二个问题的答案,而一个两方原语在结构上就回答不了这个问题——不管你怎么轮换 key、怎么按服务分别发 key,都补不回缺失的那第三方。

## 相关

- [MCP 认证机制:发现阶段、PKCE,以及每次调用到底在检查什么](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.zh.md) —— 第二篇,本文之后的线上机制详解
- [Scope 不等于 Policy:claims-mcp-oauth-poc 里的第二道墙](2026-07-13-mcp-auth-scope-is-not-policy-second-wall.zh.md) —— 第三篇,为什么一个 scope 合法的 token 还是不够授权一个具体动作
- [pocs/claims-mcp-oauth-poc/](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) —— 本文代码出处,一个可运行的 POC
- [MCP Auth from Robinhood — OAuth 2.1 / PKCE / Token Verification](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-auth-deep-dive.zh.md) —— 完整的协议级深潜
- [从零搭建 OAuth 2.1 + PKCE MCP 项目](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.zh.md) —— 这个 POC 移植自的动手实验
- [Same Crypto, Different Industry: A Claims MCP OAuth POC](2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.zh.md) —— 在这套认证之上搭建的双墙授权模型（scope *加上*理赔权限策略）
