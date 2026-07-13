# 同一套密码学，换一个行业：理赔 MCP OAuth POC

**日期：** 2026 年 7 月 12 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Enterprise AI POCs — Claims MCP OAuth](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-mcp-oauth-poc)
**标签：** `mcp` `oauth` `pkce` `insurance` `claims` `agent-security` `human-in-the-loop`
**English:** [2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.md](2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.md)

---

昨天上线了两篇[教学实验课](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/guides/2026-07-12-mcp-oauth-pkce-lab.zh.md)，用 Robinhood 的 Agentic Trading MCP 当例子，完整走了一遍 OAuth 2.1 + PKCE + JWT 的实现。两篇都用同一句没兑现的话收尾："把代码提交到一个独立的 POC 目录。"这篇讲的就是那个 POC——同样的代码，同样的密码学，从券商领域搬到了一个大多数企业 MCP 文章从不碰的领域：保险理赔裁定。

仓库：`xingai-enterprise-ai-pocs/pocs/claims-mcp-oauth-poc/`

## 这篇要回答的问题

几乎所有 MCP 认证文章都拿券商或者一个泛泛的 SaaS API 当例子。这留下一个诚实的问题没回答：这套模式到底是真的能泛化，还是只是因为交易这个领域本来就有一堆现成概念（股票代码、名义金额上限、隔离的 Agentic 账户）刚好能干净地映射到 OAuth scope 上，看起来才显得漂亮？保险理赔是个不错的压力测试——不同的监管方、不同的风险形态、不同的词汇表——如果同样三个服务（授权服务器、MCP 服务器、客户端）、同样的 PKCE 数学，不用硬拗就能套进去，那才是真证据，不只是多做一个 demo。

结果是套进去了。领域映射表：

| 券商（源实验课） | 理赔（本 POC） |
|---|---|
| `portfolio.read` / `orders.review` / `orders.place` | `claims.read` / `claims.review` / `claims.adjudicate` |
| 股票代码白名单 + 单笔名义金额上限 | 理赔类型白名单 + 理赔权限上限 |
| 隔离的、单独入金的 Agentic 账户 | 明确路由进"AI 辅助队列"的理赔 |
| `review_equity_order` → `place_equity_order` | `review_claim_decision` → `submit_claim_decision` |

## 两道墙，不是一道

很容易把 `claims.adjudicate` scope 读成"这个 Agent 能裁定理赔"就此打住。POC 的 `mcp_server/policies.py` 存在的目的就是打破这个假设——它的每一项检查都是在 OAuth scope 检查*已经通过之后*才跑的：

```python
def check_adjudication_policy(claim: dict, settlement_amount: float) -> None:
    if claim["status"] != AI_ASSIST_QUEUE_STATUS:
        raise HTTPException(403, "... not in the AI-assist queue ...")
    if claim["claim_type"] not in ALLOWED_CLAIM_TYPES:
        raise HTTPException(403, "... outside agent settlement authority ...")
    if settlement_amount > MAX_SETTLEMENT_USD:
        raise HTTPException(403, "... exceeds agent settlement authority ...")
```

一个持有完全有效、未过期、scope 正确的 token 的调用者，如果这一笔具体理赔超出边界，在这里照样会被拒绝。这比券商版本的名义金额上限更贴合一个真实保险概念——理赔权限分级：一个初级理赔顾问不会因为登录成功了就能裁定一笔六位数的理赔，本 POC 的 Agent 就是被建模成团队里最初级的那个顾问。

## 参考代码藏了一个 bug

把密码学胶水代码"原样搬过来"和"搬对了"不是一回事。`public_key_to_jwk()` 对一个已经是公钥的对象调用了 `.public_key()`——`load_pem_public_key()` 直接返回的就是公钥本身，不是一个需要额外解包的证书封装。直到 `pytest` 真的跑了 `/jwks.json` 才暴露出来。设计文档不会被逐行读；覆盖每个端点的测试套件会。

第二个 bug 出在测试本身，不是实现里：scope 强制测试的第一版整个 mock 掉了 `authenticate_request`，这悄悄跳过了它本该测试的真实 `require_scopes()` 检查。每个"权限不足"测试都通过了——但理由是错的。修法是往下 mock 一层（`verify_token`），让真实的 scope 检查针对 mock 出来的 claims 真正执行。当一个安全检查本身就是被测对象时，永远 mock 它的*输入*，绝不 mock 检查本身。

## 端到端验证过，不只是单元测试

33 个测试覆盖 PKCE、元数据发现、token 兑换/轮换、scope 强制、理赔权限策略——全部对着 mock 认证跑。在这之上还做了一次对着真实运行服务器的完整跑通：真实的 PKCE 兑换、真实签名的 JWT、真实的 `get_claim` → `review_claim_decision` → `submit_claim_decision` → 幂等重试，全程走网络。

## 企业地图

这个 POC 故意排除在 [ADR-003](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/003-mcp-gateway-placeholder-policy.zh.md) 的占位规则之外——见 [ADR-006](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/006-claims-mcp-oauth-poc-real-auth.zh.md)。ADR-003 管的是跨领域工具*路由和策略*，这个东西现在确实不存在，在这里所有其他 POC 里都还是模拟预览。本 POC 是任何未来 Gateway 底下的*认证协议*——真实、测过，现在证明了它能泛化到最初写它时那一个领域之外。

**定位：** 第一个可运行的证据，证明 XingAI 从 Robinhood 借鉴的 MCP 认证模式是通用的，不是券商专属的——外加一份从零讲起、逐行对应理赔领域代码的 [MCP 认证深度讲解](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/pocs/claims-mcp-oauth-poc/docs/mcp-auth-deep-dive.zh.md)，给任何想把 PKCE、带 scope 的 JWT、双墙模型真正搞懂、能讲出"为什么"而不只是指着架构图的人看。
