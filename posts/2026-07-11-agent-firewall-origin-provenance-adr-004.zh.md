# 按轮次污染：让「不可信来源」变成真信号

**日期：** 2026 年 7 月 11 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** XingAI Agent Firewall
**标签：** `agent-security` `provenance` `claude-code` `prompt-injection` `adr` `governance`
**英文版：** [English](2026-07-11-agent-firewall-origin-provenance-adr-004.md)

---

7 月 5 日的 [Agent Firewall 文章](2026-07-05-agent-firewall-helpfulness-attack-surface.zh.md)里，0din 类拦截的风险分是 60。这个数字诚实——也不完整。

`shell_pipe_from_network`（+40）加上 `network_unknown_host`（+20）停在 **review**，到不了 deny。README 演示暗示了更强的结果：读过恶意 README 之后，分数应越过 deny 阈值。多出来的那一截是 `untrusted_origin_instruction`（+20）。纸面上有，生产上没人算。单测手工传 `origin`，真 hook 从不传。

[ADR-004](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/004-origin-provenance-tracking.zh.md) 补上这块。

## 错误的溯源粒度

诱人的设计是精确数据流：哪个文件里的哪段字符串变成了哪个工具参数。Claude Code hooks 给不了这个。追下去等于给模型推理插桩，而不是守工具边界——对今天能观测到的东西来说，过重了。

你*能*观测的是：

- 这次 session 是否在 git 仓库里启动？
- session 启动时哪些文件在 tracked 集合里？
- Agent 刚读的内容是否在基线之外——或者刚从公网抓取？

对 0din 来说，这就够回答关键问题：*这次调用，是不是发生在本轮读过不可信内容之后？*

## 三个 hook，一个引擎

```
SessionStart     → POST /session/init   快照 git ls-files 作为可信基线
PostToolUse      → POST /taint          Read/Grep/Glob/WebFetch/WebSearch
UserPromptSubmit → POST /taint/clear    人类新一轮 = 清零
PreToolUse       → POST /check          引擎从 session 污染状态推导 origin
```

分类仍是确定性的，写在 YAML 里：

- `WebFetch` / `WebSearch` — 永远不可信
- `Read` / `Grep` / `Glob` — 路径**不在** session 基线里 → 不可信
- 无基线（非 git `cwd`）— 文件读不污染；网页工具照样污染

`/check` 不再相信调用方传入的 `origin`。引擎查 `session_tainted(session_id)`。PreToolUse hook 保持薄。

## 为什么「本轮」胜过时间窗

| 窗口 | 失败方式 |
|---|---|
| 最近 5 分钟 | 任意数。长回合会漏；停顿后又会误伤无关工作 |
| 最近 N 次工具调用 | 中间一串良性调用会把污染读挤出窗口 |
| 整段 session | 早期一次 `WebFetch` 会毒死后面几小时的 `git commit`——产品没法用 |
| **当前轮次** | 对齐攻击形态：读不可信内容 → 在人类再次开口前动手 |

`UserPromptSubmit` 对每条人类消息只触发一次（对照 Claude Code hooks 文档核实过）。这就是边界。硬 TTL（默认 1800 秒）只是清零漏掉时的安全网。

这个信号单独 fail-open。缺基线不会扩大拒绝面——另外六个 ADR-002 信号照样工作。溯源有则加分；没有则不发明假拒绝。

## 演示里变了什么

同样是对未知主机的 `curl | sh`，但 Agent 刚读过新 clone 的 README：

```
shell_pipe_from_network (+40)
network_unknown_host (+20)
untrusted_origin_instruction (+20)
→ risk 80 → deny
```

没读过，仍是 60 → review。这个差别就是溯源存在的理由。

## 仍然抓不住什么

跨轮延迟攻击：读了污染内容，中间隔了一轮人类消息，再动手。若线上出现，ADR-004 的迁移触发条件会启动。非 git 项目只有网页溯源——写进文档，不当沉默缺口。

## 相关

- [ADR-004](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/004-origin-provenance-tracking.zh.md) · [English](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/004-origin-provenance-tracking.md)
- 上一篇：[乐于助人就是攻击面](2026-07-05-agent-firewall-helpfulness-attack-surface.zh.md)
- 下一篇：[拒绝并加规则，但不现场改 YAML](2026-07-11-agent-firewall-deny-add-rule-adr-005.zh.md)
- 企业篇：[Agent 治理参考架构](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-05-agent-governance-reference-architecture.zh.md)
