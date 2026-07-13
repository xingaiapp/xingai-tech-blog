# 先做全量覆盖：一个理赔第三方 MCP POC

**日期：** 2026 年 7 月 13 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [Enterprise AI POCs — Claims Partner API MCP](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-partner-api-mcp-poc)
**标签：** `mcp` `api-design` `insurance` `claims` `typescript` `openapi`
**其他语言：** [English](2026-07-13-claims-partner-api-mcp-poc-full-coverage-first.md)

---

昨天那篇讲的是 [`claims-mcp-oauth-poc`](2026-07-12-claims-mcp-oauth-poc-same-auth-different-industry.zh.md)：真实的 OAuth 2.1 + PKCE 挡在四个刻意收窄的工具前面。那个 POC 回答的是"认证协议能不能推广到一个受监管的业务域"。它回答不了另一个同样真实、理赔业务一想开放 API 给合作方就会问的问题：如果合作方需要的不只是那四个工具覆盖的那一个工作流呢？

这个 POC 回答的就是这个问题。同一个业务域（保险理赔）、同一个仓库、相反的起点：一个 18 工具的 MCP server，包装一份完整的理赔业务 OpenAPI 契约——理赔提交、状态流转、备注、文件证据、保单核验、理赔人管理、赔付结算——刻意**没有**认证层挡在前面。

仓库：`xingai-enterprise-ai-pocs/pocs/claims-partner-api-mcp-poc/`

## 契约先行，再各自实现两遍

起点是 `claims-api-openapi.yaml`——7 个业务域，18 个端点，OpenAPI 3.1。其余一切都是从它独立推导两遍出来的：

- `mcp-server/`（TypeScript，`@modelcontextprotocol/sdk`，Streamable HTTP）：18 个 MCP 工具，一个端点对应一个，每个都有 Zod schema、markdown/JSON 双格式响应，以及 `readOnlyHint`/`destructiveHint`/`idempotentHint` 标注。
- `mock-api/`（Express，内存数据）：一个可运行的理赔系统替身，实现同样的 18 条路由，这样这个 POC 不需要真实承保后端也能诚实地挂上"可运行"这个状态标签。

只有两个工具标了 `destructiveHint: true`——`claims_transition_status` 和 `claims_create_payment`。其余全部是只读或增量写。这在工具列表里是个不起眼的小细节，但它是调用方 agent（或者审查 agent 即将做什么的人）不用读任何一个工具的实现就能免费拿到的唯一信号。

## mock 后端强制执行一个真实的状态机

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

`claims_transition_status` 调用 `approved → under_review` 会拿到一个 409，而不是被悄悄接受的写入。端到端测试明确断言了这一点（第 7 步），而不是只断言正常路径——一个什么都接受的 mock 什么都没测出来。

## 测试第一次真跑就抓到的一个 bug

`claims_create_payment` 应该在成功后把理赔状态改成 `in_payment`——OpenAPI 规范里白纸黑字写着。`mock-api` 打款路由的第一版确实这么做了：改了 `claim.status`，返回 payment，完事。但它**没有**追加一条记录这次流转的 `StatusEvent`，因为这个记账逻辑本来放在*另一个*路由里（`/claims/:claimId/status`），而打款路由就……没调它。

端到端测试的最后一步断言，走完整个正常流程（提交→审核，审核→批准，批准→打款触发的 in_payment）之后，状态历史里应该恰好有 3 条事件。第一次真跑：2 条。打款触发的这次流转在审计追踪里是隐形的。修复方式是让打款路由自己也发一条 `StatusEvent`，reason 里写清楚是哪笔赔付触发的——但更有意思的是这条教训：**任何会改理赔状态的代码路径，都得走同一条审计追加逻辑，不能只指望"专门负责改状态"的那条代码路径。** 这个错误很容易犯，恰恰是因为打款端点看上去主要工作是"发一笔钱"，而不是"顺便，也改一下理赔状态"。

## 幂等性，真的验证过

```javascript
console.log("8. Issuing settlement payment...");
const payment = await callTool("claims_create_payment", { ... });
```

`claims_create_payment` 始终携带一个 `Idempotency-Key` header——客户端提供就用客户端的，没提供就每次调用生成一个。`mock-api` 用它做了一张查找表：同一个 key 再调一次，返回同一笔 payment，不会创建第二笔。这不是靠调一次工具、看返回结果长得对就算测过了；一次真正的重试（同一个 key、同一条理赔）必须原样返回和第一次一模一样的结果，这个保证才有意义。

## 这个 POC 刻意没有的东西

没有认证。`mcp-server` 用一个静态 bearer token 调用 `mock-api`——给一个内部调用方用没问题，但不能拿去给多个各自需要可吊销凭证的外部合作方用。这不是疏忽，而是这个 POC 给自己划的明确范围边界，被明确写成"距生产环境还差什么"的第一条，也是 [ADR-007](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/007-claims-partner-api-mcp-poc-full-coverage.zh.md) 存在的全部理由：如果在同一个 POC 里同时做全量 API 覆盖和真实 OAuth，会很难分辨任何一个缺口到底是覆盖面的 bug，还是刻意划出的认证边界。

## 两个 POC 怎么拼在一起

无论是 `claims-mcp-oauth-poc` 还是这个，都不是你真正会拿去部署的东西。一个真实的第三方集成，需要这个 POC 的 18 工具覆盖面，加上那个 POC 的认证服务器挡在前面，去校验 `claims-api-openapi.yaml` 的 `securitySchemes` 里已经声明（但还没强制执行）的 10 个 scope。[配套这个 POC 的设计文章](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-13-mcp-api-coverage-vs-workflow-tools.zh.md) 用这两个 POC 当例子，拆解了这个取舍该先做哪一侧。

**定位：** 这是一对 POC 里负责"API 覆盖"的那一半——两者合起来，勾勒出"如何让第三方 AI agent 通过 MCP 对接我们的理赔 API"这个问题的完整答案：一个 POC 证明认证是通的，这个 POC 证明覆盖面是通的，谁也没假装自己单独就是完整答案。
