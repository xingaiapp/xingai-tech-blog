# Fail-Closed 之后：Robinhood MCP 门控、数据新鲜度、Step-Up，以及为什么它仍然不自动交易

**日期：** 2026-07-18  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** XingAI Robinhood MCP + Invest AI  
**标签：** `mcp` `robinhood` `execution-gates` `step-up-auth` `data-freshness` `decision-boundary` `adr`  
**英文版：** [English](2026-07-18-robinhood-mcp-gates-after-fail-closed.md)

---

7 月 11 日，Robinhood MCP gateway 的故事很简单：它故意阻止每一笔写操作订单。G1、G6、G7 是真实代码。G2 到 G5 是明确命名的 fail-closed gate。

这是正确的第一版，但它很快就变旧了。

同一天结束前，原本未接线的 gate 里已经有两个不再是 placeholder：

- **G3 data freshness** 现在会调用 Invest AI 的 worker freshness endpoint；如果市场数据过期或 endpoint 不可达，就 fail closed。
- **G2 step-up auth** 现在会复用 Invest AI 已有的 admin Email OTP session check，用于当前 single-operator 部署里的较高风险或未知金额动作。

标题没有变：

```text
Gateway 仍然不自动交易。
```

真正变化的是更精确、也更重要的一点：

```text
它不再是因为所有依赖都缺失而阻断。
它现在是因为剩下的执行级证据还没有准备好而阻断。
```

## 第一次 follow-up 之后的 gate 状态

[Invest AI ADR-028](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md) 定义了 Robinhood 写工具 forward 前必须通过的七个 gate。

当前 gateway 状态是：

| Gate | 含义 | 当前状态 |
|---|---|---|
| G1 | 人类确认写操作 | 已接线 |
| G2 | 高风险动作的 step-up auth | single-operator 模式已接线 |
| G3 | Invest AI worker 数据新鲜 | 已接线 |
| G4 | 结构性风险 checklist 为绿色 | 仍然阻断 |
| G5 | 订单引用缓存决策证据 | 在 citation inputs 完整前仍然阻断 |
| G6 | 只能使用 Agentic account | 已接线 |
| G7 | Audit ledger | 已接线 |

这已经不是 7 月 11 日上午那个系统。它不是「图上画了七个框」。现在五个 gate 背后有真实代码。两个 gate 仍然阻止执行。

这个区别很重要，因为 fail-closed 只有在 failure reason 越来越具体时才有意义。「所有东西都没接线，所以全部阻断」是 bootstrap 状态。「因为决策证据还达不到执行级，所以阻断」才是产品边界。

## G3：新鲜度必须在决策时检查

Gateway 不需要 Invest AI 新建 freshness endpoint。它已经存在：

```text
GET /api/v2/system/data-freshness
```

这个 endpoint 返回 worker heartbeat、stale 状态、provider errors、symbol count 和 calculation mode。Gateway 现在会在 write evaluation 时获取它，并把任何失败都当成拒绝：

- 数据 stale：拒绝。
- endpoint 不可达：拒绝。
- response 格式不对：拒绝。
- 数据 fresh：G3 通过。

微妙的部分是时机。G3 在等待人类审批完成之后检查，而不是之前。一个人可能花几分钟才 approve。如果 freshness 在 G1 前获取，用户可能是在一个已经过期的 snapshot 上批准订单。

所以 G3 问的是：

```text
如果这笔写操作现在要继续，决策系统此刻是否新鲜？
```

这个「此刻」就是 dashboard check 和 execution gate 的区别。

## G2：Step-Up Auth 是有边界的，不是假装通用

Gateway 没有新建多用户 auth 系统。它复用了 Invest AI 已有的 admin Email OTP session check。

这个选择故意很窄。今天这是 single-operator gateway。它不是通用消费者券商产品，auth 设计也不该假装它已经是。

对当前部署来说：

- 小额动作可以依赖 G1 human confirmation。
- 较高金额订单需要有效 step-up session。
- gateway 无法知道金额的动作，比如 cancel request，需要 step-up。
- session check 失败或不可达都会拒绝写操作。

这不是多用户产品的最终 auth model。它是当前 operator surface 的正确模型。共享部署或远程部署需要 user-scoped step-up、secret storage、account ownership checks，以及不同的 threat model。

## G4 和 G5 仍然阻止交易

剩下的 blocker 正是应该继续阻断的 blocker。

**G4 问：** 结构性风险治理是否为绿色？

这包括数据源韧性、不要把 confidence 说成盈利概率、解释一致性、execution readiness 等。Invest AI 在这些方向有进展，但还不足以把产品称为 execution-grade。

**G5 问：** 订单是否能引用缓存决策 snapshot，而不是 live LLM 临时发明？

这和 Invest AI 的 worker/cache 架构是同一条边界：worker 计算，API 读取，frontend 渲染。Trade ticket 必须引用已经存在于 decision system 里的缓存证据，不能在 gateway 里发明，也不能用 live prompt 临时拼出来。

这就是新的 Today Intelligence 工作为什么重要。Invest AI 现在有一个 worker-owned 的每日综合解释 contract：

```text
GET /api/v2/intelligence/today
```

它把财报、宏观、新闻流、市场状态、持仓风险 readiness、watch items 和 decision events 组合成一个缓存 payload。当 live earnings、provider-backed news 或真实 broker portfolio risk 缺失时，它会明确标注 **research-ready, not execution-ready**。

这是 G5 的正确方向。不是「AI 说买」。一个 citation 更应该像这样：

```text
decision_snapshot_id
data_freshness
readiness
risk_budget
source_refs
watch_item_reason
```

在这些字段足够支持 order draft 前，G5 就应该继续阻断。

## 产品教训：不要先商业化 Bot 幻觉

现在工程边界和产品边界指向同一个方向。

Invest AI 的近期价值不是 autonomous execution，而是 daily decision intelligence：

- 发生了什么。
- 什么重要。
- 哪些风险变了。
- 哪些 source 是 fresh。
- 哪些信息缺失。
- 下一步该观察什么。

Gateway 未来可以 draft orders，但它应该只在 intelligence layer 能解释为什么这个动作值得考虑、为什么它足够安全可以出现在 execution-adjacent workflow 之后再做。

这比一个 agent 说「买 10 股」然后调用工具的 demo 慢。但它更可能经得起真钱、真实用户和真实合规审查。

## 更准确的新叙事

旧叙事是：

```text
我们做了一个 gateway，因为大多数 gate 还没接线，所以阻止每笔订单。
```

更新后的叙事是：

```text
我们做了一个 gateway：读工具直接通过，写工具穿过真实 gate，剩下的 blocker 正是那些应该阻止执行的证据缺口。
```

这是更健康的架构。目标不是尽快把每个 gate 变绿。目标是让每个 gate 说真话。

## 相关

- [Invest AI ADR-028: Robinhood MCP Execution Gates](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/028-robinhood-mcp-execution-gates.md)
- [Invest AI ADR-012: Decision Cache Boundary](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/012-decision-cache-boundary.md)
- [Invest AI ADR-034: Today Intelligence Cache Contract](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/034-today-intelligence-cache-contract.md)
- [Robinhood MCP ADR-001: MCP Gateway Proxy](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/001-mcp-gateway-proxy.md)
- [Robinhood MCP ADR-002: G3 Data Freshness Wired](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/002-g3-data-freshness-wired.md)
- [Robinhood MCP ADR-003: G2 Step-Up Wired for Single-User Operation](https://github.com/xingaiapp/xingai-robinhood-mcp/blob/main/docs/adr/003-g2-step-up-wired-single-user.md)
- 前文：[A Trading Gateway That Blocks Every Order (On Purpose)](2026-07-11-robinhood-mcp-gateway-fail-closed.md)
- 后续：[The Trading UI Still Does Not Trade](2026-07-14-robinhood-control-plane-http-api.md)

