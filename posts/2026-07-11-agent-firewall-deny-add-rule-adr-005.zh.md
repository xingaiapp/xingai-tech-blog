# 拒绝并加规则，但不现场改 YAML

**日期：** 2026 年 7 月 11 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** XingAI Agent Firewall
**标签：** `agent-security` `human-in-the-loop` `policy` `adr` `decision-ledger` `governance`
**英文版：** [English](2026-07-11-agent-firewall-deny-add-rule-adr-005.md)

---

ADR-003 承诺四个审批按钮：批准一次 / 本 session 批准 / 拒绝 / **拒绝并加规则**。前三个落地了。第四个停在文案里，没有后端。

两条约束撞在一起：

1. 人拦下一次坏调用后，期望「别再问我」。
2. ADR-002 要求永久策略改动走 YAML，像代码一样被评审。

运行中的服务一键改写 `policies/default.yaml` 违反 (2)。按钮只提示「自己去改文件」又辜负 (1)。[ADR-005](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/005-deny-add-rule.zh.md) 把动作拆成两层。

## 即时钉死 + 待审建议

```
拒绝并加规则
    ├─ pinned_denies     精确 normalized 调用 → 永久 deny（直到 unpin）
    └─ rule_suggestions  队列一行，等人事后写真正的 YAML
```

`/check` 在打分前查 `pinned_denies`。精确匹配直接 deny——匹配形态和 `session_allowlist` 相同，但不按 session 作用域。钉死的意义是「这个调用模式在哪出现都坏」，不是「这小时内这个聊天里」。

Rules 看板列出未解决建议：模式 + 触发信号理由。人在 git 里改 YAML，再把建议标为已解决。解决时可去掉对应 pin——耐久规则已经覆盖它。

## 我们拒绝做的

| 选项 | 为什么不做 |
|---|---|
| 服务直接改 `default.yaml` | 面向网络的进程做未评审的策略变更——正是防火墙要在别处挡住的事 |
| 只有可复制片段、无运行时效果 | 同一调用每次都会再进 `review`，直到有人想起来改文件 |
| 自动生成正则规则 | 「什么在变」（URL？host？整段管道？）*本身*就是人审步骤 |

精确字符串 pin 在攻击者改字面量时会吵。v1 故意如此。近重复 pin 堆高了，才是参数化建议语言的迁移触发——用真实 pin 当样本，不预先发明语言。

## 为什么看板重要

Pin 必须可见、可移除。没有 UI 的静默全局阻断是脚枪。审批队列（挂起的 `review`）和 Rules 视图（pin + 建议）合在一起，才让 ADR-003 的第四个按钮诚实。

CLI 镜像同一套本地优先操作面：

```
python cli.py deny <id> --add-rule
python cli.py pinned-denies
python cli.py suggestions
python cli.py resolve-suggestion <id>
```

## 这守住的纪律

强制 Agent 行为的配置，本身也是强制面。让运行时改写它，等于塌掉评审边界。运行时状态（pin）可以激进、可逆；策略代码（YAML）保持慢、可审。一次点击两层都有，但不假装它们是一回事。

## 相关

- [ADR-005](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/005-deny-add-rule.zh.md) · [English](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/005-deny-add-rule.md)
- 上一篇：[按轮次污染（ADR-004）](2026-07-11-agent-firewall-origin-provenance-adr-004.zh.md)
- 脚手架篇：[乐于助人就是攻击面](2026-07-05-agent-firewall-helpfulness-attack-surface.zh.md)
- 下一篇：[上线审批队列看板](2026-07-11-agent-firewall-approval-dashboard-ships.zh.md)
- 模式：[`agent-execution-gate`](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/agent-execution-gate.md)
