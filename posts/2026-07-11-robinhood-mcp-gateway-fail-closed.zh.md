# 一个会挡住每一笔订单的交易网关（故意的）

**日期：** 2026 年 7 月 11 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** XingAI Robinhood MCP
**标签：** `mcp` `robinhood` `agent-security` `human-in-the-loop` `governance` `adr`
**英文版：** [English](2026-07-11-robinhood-mcp-gateway-fail-closed.md)

---

[Invest AI ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.zh.md) 定义了七道门（G1–G7），下单必须全部通过才能到达 Robinhood 的 Agentic Trading MCP。在这一轮之前，这七道门没有一道是代码。挡在 Agent 和真实下单之间的，只有 [`common-prompts.md`](2026-06-25-robinhood-mcp-execution-gates-adr-028.zh.md)——一套提示词惯例，好声好气地请 Agent 下单前先 review。这是个请求，不是门禁。

## 为什么 hook 在这里不管用

`xingai-agent-firewall` 用 Claude Code 的 `PreToolUse` hook 来管住工具调用。Robinhood 的 Agentic Trading MCP 按官方文档是从 Cursor、Claude Desktop、ChatGPT、Codex、Grok 用的——没有一个共享 Claude Code 的 hook 契约。按 harness 做拦截点意味着 N 个 harness 要配 N 个适配器。[ADR-001](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/001-mcp-gateway-proxy.zh.md) 干脆挪了拦截点：客户端连一个本地 **MCP 网关代理**，代替直连 `agent.robinhood.com`。任何支持 MCP 的客户端指向这个网关，门禁就生效，不管背后是哪个 harness 在问。

## 只读透传，写操作现在谁都过不去

```
get_accounts、get_portfolio、review_equity_order   → 直接转发上游，从不设防
place_equity_order、cancel_equity_order            → 先过 G1-G7，也许才到上游
```

七道门里，三道自成一体、不用碰别的仓库就能做：

- **G1**（人工确认）——待审批队列，跟 Agent Firewall 一个形态：调用挂起，直到人类跑 `cli.py approve` 或 `deny`，或者超时归为拒绝。
- **G6**（仅 Agentic 账户）——网关在转发前独立核对订单账户是不是上游标记为 `agentic_allowed` 的账户，不管 Robinhood 服务端自己有没有限制。
- **G7**（审计台账）——每次写操作尝试都写一行，在转发决策做出**之前**写，用的是 Agent Firewall、Founder 已经在用的同一套 schema。

另外四道——二次认证、数据新鲜度、结构性风险清单、引用缓存决策快照而不是让 LLM 现场编——需要 `xingai-invest-ai` 那边的基础设施。这一轮没有假装做了它们。每一道都点名拒绝：`"G3 data freshness not wired — fail-closed"`。写单只有七道全过才转发，而其中四道现在注定过不了，这是设计如此。

**这意味着现在通过这个网关，没有任何一笔交易能成功。** 这不是个要赶紧绕过去的 bug——对一个挡在真实券商账户前面的工具来说，这才是正确的默认状态。另一个选项——把 G2–G5 桩成"通过"，让清单看起来做完了——那才是真正应该避免的失败：一个只是摆设的门禁，恰恰是这整条工作线要防止的东西。

## 一个差点被 async/await 模型藏起来的 bug

第一版直接复用了 Agent Firewall 的 `wait_for_resolution`——一个阻塞的 `time.sleep` 轮询循环——塞进了网关的 `async def place_equity_order` 里。这会在等待期间卡住整个 event loop，把其他所有并发的 MCP 请求都拖在一个待处理审批后面排队。修法是加一个基于 `asyncio.sleep` 的异步版本，只给网关用；CLI 因为不在 event loop 里，继续用同步版本。两个都写了测试，其中一个专门在等待过程中用另一个并发协程去批准，证明 event loop 没有被卡住。

## 测试边界

全部 24 个测试都是对着 `gateway/mock_upstream.py` 跑的——一个假的 Robinhood MCP 服务器，假账户假订单，集成测试里是真的起了一个子进程。这个仓库的测试套件里没有任何代码碰过 `https://agent.robinhood.com`，也没碰过任何真实 OAuth 凭证。把网关指向真实端点，是操作者自己后续要做的、独立的决定——这里既没有验证过，也不暗示这样做是安全的。

## 更新（同一天）：四道 fail-closed 门里，两道接通了

上面写的是网关今天早上刚上线时的状态。到今天结束前，又有两道门从 fail-closed 变成真的了：

- **G3（数据新鲜度）**——[ADR-002](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/002-g3-data-freshness-wired.zh.md)。发现 Invest AI 的新鲜度端点（`GET /api/v2/system/data-freshness`）其实在这个网关写出来**之前**就已经存在了——上面"需要 Invest AI 基础设施"的说法只对了一半。工作量全在本仓库这边：一个小的 HTTP 客户端、一个纯谓词门禁检查，数据过期或者检查本身查不到都 fail-closed。
- **G2（二次确认）**——[ADR-003](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/003-g2-step-up-wired-single-user.zh.md)。同样的发现：Invest AI 的管理员邮箱 OTP 流程（那边的 ADR-024）已经是一个公开、可调用的端点。直接复用，没有搭一套通用的按用户 step-up 认证——这个网关现在只有一个操作者，为一个用户量的场景搭多用户基础设施是投机性的工作。金额在可配置门槛以内的订单直接跳过检查（G1 的人工确认已经覆盖了这些）；超过门槛的，或者 `cancel_equity_order`（没有已知金额）的，需要一个实时校验过的管理员 session。

**通过这个网关依然没有任何一笔交易能成功**——这一点没变。变的是原因：现在挡着的是 G4（结构性风险清单）和 G5（决策快照引用），不再是四道门。G4 今天在 Invest AI 那边也拿到了第一个真实子信号：一个 `confidence_kind` 字段，让 UI 不再暗示"置信度"是经过校准的概率；还有一个 worker 计算的二次行情交叉校验（Yahoo vs. Tradier），在没配置 Tradier API key 之前诚实地报 `unavailable`——写这篇更新的时候，确实还没配。

有一个实现细节值得单独说一下：那个二次行情校验的第一版是在 FastAPI 请求处理函数里直接同步调用 Tradier——直接违反了 Invest AI 自己的 [ADR-012](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.zh.md)（worker 计算，API 只读缓存），这条规则这同一个代码库[已经写过两次博客](2026-05-13-cqrs-sqlite-worker-writes.zh.md)。上线前被发现并修掉了——现在 worker 每个刷新周期调用一次 Tradier 并缓存结果，API 端点只读这个缓存。便宜的教训：在 ADR 里写下一条架构规则，不代表五分钟后写的不相关新代码会自动遵守它。

## 相关

- [ADR-001：MCP 网关代理](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/001-mcp-gateway-proxy.zh.md)
- [ADR-002：G3 数据新鲜度接通](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/002-g3-data-freshness-wired.zh.md)
- [ADR-003：G2 二次确认接通（限单用户）](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/003-g2-step-up-wired-single-user.zh.md)
- [Invest AI ADR-028：Robinhood MCP 执行门控](2026-06-25-robinhood-mcp-execution-gates-adr-028.zh.md)
- [Invest AI ADR-012：决策缓存边界](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.zh.md)
- [Agent Firewall ADR-003：审批流 + Decision Ledger](2026-07-05-agent-firewall-helpfulness-attack-surface.zh.md)
- 模式：[`agent-execution-gate`](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/agent-execution-gate.md)
- 模式：[`worker-cache-boundary`](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/worker-cache-boundary.md)
- 企业篇：[Agent 治理参考架构](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-05-agent-governance-reference-architecture.zh.md)
