# 交易 UI 仍然不交易：Robinhood MCP Control Plane

2026 年 7 月 14 日，`xingai-robinhood-mcp` 发布了 `0.7.0`：给私有 Robinhood operator UI 用的一层很小的 HTTP control-plane API。

重点是它不做什么。它不下单，不撤单，也不绕过 gateway 开第二条执行路径。它只是让 UI 稳定读取 monitor 状态、查看 pending approvals、执行 G1 approve/deny、查看 ledger。

## 为什么需要它

在这次改动前，同样的信息散落在几个地方：

- CLI 命令
- SQLite ledger 行
- 只读 shape-check 脚本
- signal watcher 输出

这些足够做工程 drill，但不够支撑私有 operator screen。UI 需要稳定 HTTP contract，也需要脱敏响应、可预测认证，以及一个明确的安全答案：这个 endpoint 能不能交易？

v1 的答案是：不能。

## 合同形状

control plane 现在暴露：

- `GET /v1/health`
- `GET /v1/monitor/summary`
- `GET /v1/readonly/snapshot`
- `GET /v1/approvals/pending`
- `GET /v1/approvals/{id}`
- `POST /v1/approvals/{id}/approve`
- `POST /v1/approvals/{id}/deny`
- `GET /v1/ledger/recent`

approve 和 deny 路由走的是和 CLI 相同的本地 approval ledger 路径。它们 resolve 本地 decision record，不调用 Robinhood `place_*` 或 `cancel_*`。

## 安全默认值

server 默认绑定 `127.0.0.1`。如果绑定到 loopback 之外，必须设置 `XINGAI_MCP_CONTROL_TOKEN`，客户端必须使用 bearer auth。

响应不得包含 OAuth token、完整账号或完整 account id。如果 `XINGAI_MCP_TRADE_ENABLED=true`，monitor summary 会显式暴露 warning，只读 snapshot endpoint 可以拒绝返回。

这样我们得到的是私有 UI 传输层，而不是变弱的 gateway：

- UI 通过 HTTP 读状态。
- Gateway 保留 G1-G7。
- 真实 forwarding 仍然要求最终显式 trade switch。
- Approval 仍然是 human-in-the-loop。

## 为什么重要

Agentic trading infrastructure 需要无聊但明确的边界。最危险的问题往往不是语法错误，而是一条看起来像 observability、实际悄悄变成 execution 的第二路径。

这次 release 故意让 control plane 很无聊。它是已有状态上的传输层，不是 broker client。

发布时 Robinhood MCP 测试套件验证结果：`103 passed`。

## 下一步

私有 UI 现在可以把 Operator Monitor 接到真实本地 endpoint。后续版本可以增加更好的 watcher status、push updates 和更丰富的 audit views。执行边界应保持不变：没有无人值守自动交易 loop，没有 request-time 投资决策，也没有绕过 gateway approval 的 UI 路径。
