# Scope 不等于 Policy:claims-mcp-oauth-poc 里的第二道墙

**日期：** 2026 年 7 月 13 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**标签：** `mcp` `oauth` `authorization` `policy-engine` `governance` `education`
**其他语言：** [English](2026-07-13-mcp-auth-scope-is-not-policy-second-wall.md)

---

这个系列的[第一篇](2026-07-13-mcp-oauth-vs-api-key.zh.md)和[第二篇](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.zh.md)讲了 `claims-mcp-oauth-poc` 为什么要用 OAuth,以及协议本身到底检查了什么——签名、issuer、audience、过期时间、scope。这些检查都回答得很好的,是同一个问题:这个 token 合不合法,带没带 `claims.adjudicate`。但值得直接问一句:这个检查通过之后,这次请求是不是就真的安全可以执行了?

## 一个 scope 对的 token,用在了错的理赔上

假设一个 agent 拿着一个完全合法、没过期的 token,scope 里明明白白带着 `claims.adjudicate`。它调用 `submit_claim_decision`,对象是 `CLM-9010`——这个 POC 里真实的一条 fixture——请求批准 **$28,500** 的赔付。

跟一下 `mcp_server/auth.py` 里 scope 检查实际做了什么:

```python
def require_scopes(claims: dict[str, Any], required: set[str]) -> None:
    token_scopes = set(claims.get("scope", "").split())
    missing = required - token_scopes
    if missing:
        raise HTTPException(status_code=403, detail=f"insufficient_scope: missing {missing}")
```

`required` 是 `{"claims.adjudicate"}`。token 里有这个 scope。`missing` 是空集。这一步——干净利落地——通过了,完全按设计运作。这个检查从头到尾没看过是哪笔理赔、多少钱。它结构上就没法看:"是哪笔理赔"根本不是 OAuth scope 字符串能表达的东西。

## 第二道墙

`mcp_server/policies.py` 存在的意义,就在于"通过了 wall #1"和"这次具体请求应该放行"根本不是一回事。`check_adjudication_policy` 在 scope 检查之后运行,针对的是这次操作具体作用的那笔理赔:

```python
def check_adjudication_policy(claim: dict, settlement_amount: float) -> None:
    if claim["status"] != AI_ASSIST_QUEUE_STATUS:
        raise HTTPException(403, "... not in the AI-assist queue ...")
    if claim["claim_type"] not in ALLOWED_CLAIM_TYPES:
        raise HTTPException(403, "... outside agent settlement authority ...")
    if settlement_amount > MAX_SETTLEMENT_USD:
        raise HTTPException(403, "... exceeds agent settlement authority ...")
```

`CLM-9010` 在第一个检查就过不了——它在 fixture 里被故意设定成 `standard-queue`,不是 `ai-assist-queue`,而且它的 `claim_type`(`auto_comprehensive_total_loss`)也不在 `ALLOWED_CLAIM_TYPES` 里。就算这两关都过了,`$28,500 > MAX_SETTLEMENT_USD`(这个 POC 里是 $2,500)也会在第三关把它拦下来。这条 fixture 的存在,就是专门为了把这三条拒绝路径都跑一遍——见 `tests/test_claim_flow.py`。

真正重要的区分在这里:wall #1 回答的是*"这个身份到底能不能调用这类操作"*——这是 token 的属性,签发那一刻就定死了。wall #2 回答的是*"这笔具体的理赔、这个具体的金额,现在该不该放行"*——这是活的业务数据的属性,每次调用都要重新查一遍,完全不管 token 里写了什么。

## 为什么不干脆把 scope 切得更细

一个听上去很直觉的修法——不用一个笼统的 `claims.adjudicate`,而是发一个 `claims.adjudicate.under2500` 这样的 scope——其实行不通,原因是结构性的:scope 是 token 签发那一刻,由发 token 的那一方一次性决定好的。它看不到一笔理赔*此刻*的状态、类型、金额,因为这些是会变的业务数据,不是身份属性。把 policy 塞进 scope 的粒度里,你要么得给"理赔类型 × 金额档位 × 队列状态"的每一种组合都发一个 scope(组合爆炸),要么得在理赔状态中途变化时不停地重新签 token。两条路都走不通。

还有一个组织层面的理由,这个 POC 自己的演示脚本就能看出来:把 `MAX_SETTLEMENT_USD` 从 `2_500` 改成 `100`,**只**重启 MCP server,再跑一遍之前能通过的那笔 $1,850 理赔(`CLM-8842`)——现在会被拒绝。authorization server 那边什么都没动。没有任何 token 被重新签发或撤销。管理理赔权限上限的团队,和管身份基础设施的团队,可以各自独立改自己的规则,因为这两个检查活在两套真正分开的代码里,而不是同一个 scope 目录下的两层。

## 这是一个可以复用的形状

这不是理赔业务专属的技巧。任何挡在受监管或高风险操作前面的 MCP server,都需要同样的拆分:一层身份/能力层(OAuth,回答"这个调用方到底能不能发起这类操作"),一层策略层(回答"这个操作,作用在这份数据上,现在该不该发生"——每次调用都重新评估,不管 token 说了什么)。检查的顺序也有讲究:scope 失败会在请求碰到任何业务数据之前就拿到一个笼统的 403;policy 失败会给出一个具体理由,因为到那一步,检查已经确切知道请求违反了哪条规则。

## 相关

- [为什么 MCP 需要 OAuth,而不是简单发个 API key](2026-07-13-mcp-oauth-vs-api-key.zh.md) —— 第一篇
- [MCP 认证机制:发现阶段、PKCE,以及每次调用到底在检查什么](2026-07-13-mcp-auth-api-key-vs-oauth-pkce.zh.md) —— 第二篇
- [pocs/claims-mcp-oauth-poc/](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc) —— `mcp_server/policies.py`、`mcp_server/auth.py`,以及本文例子出处的完整测试套件
- [Agent 治理参考架构:权限、来源、审批、审计](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-05-agent-governance-reference-architecture.zh.md) —— 这套双墙模型只是其中一个具体实例的更大模式
- [从 Robinhood MCP 看懂 MCP 认证](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-auth-deep-dive.zh.md) —— 这个 POC 双墙模型对应的四层保护模型
