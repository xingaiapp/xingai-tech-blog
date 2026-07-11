# Turn-Scoped Taint: Making Untrusted Origin a Real Signal

**Date:** July 11, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** XingAI Agent Firewall
**Tags:** `agent-security` `provenance` `claude-code` `prompt-injection` `adr` `governance`
**Also available:** [中文](2026-07-11-agent-firewall-origin-provenance-adr-004.zh.md)

---

The July 5 [Agent Firewall post](2026-07-05-agent-firewall-helpfulness-attack-surface.md) described a 0din-class block with risk 60. That number was honest — and incomplete.

`shell_pipe_from_network` (+40) plus `network_unknown_host` (+20) lands at **review**, not deny. The README demo implied something stronger: reading a malicious README should push the score over the deny threshold. That extra signal was `untrusted_origin_instruction` (+20). On paper it existed. In production, nothing computed it. Unit tests passed `origin` by hand. The live hook never did.

[ADR-004](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/004-origin-provenance-tracking.md) closes that gap.

## The wrong kind of provenance

The tempting design is exact dataflow: which string in which file became which tool argument. Claude Code hooks do not expose that. Chasing it means instrumenting the model's reasoning, not the tool boundary. Overbuilt for what you can actually observe today.

What you *can* observe:

- Did this session start in a git repo?
- Which files were tracked at session start?
- Did the agent just read something outside that baseline — or fetch the open web?

That is enough to answer the question that matters for 0din: *is this call happening after the agent ingested untrusted content this turn?*

## Three hooks, one engine

```
SessionStart     → POST /session/init   snapshot git ls-files as trusted baseline
PostToolUse      → POST /taint          Read/Grep/Glob/WebFetch/WebSearch
UserPromptSubmit → POST /taint/clear    new human turn = clean slate
PreToolUse       → POST /check          engine derives origin from session taint
```

Classification stays deterministic, in YAML:

- `WebFetch` / `WebSearch` — always untrusted
- `Read` / `Grep` / `Glob` — untrusted if the path is **not** in the session baseline
- No baseline (non-git `cwd`) — file reads never taint; web tools still do

`/check` no longer trusts a caller-supplied `origin`. The engine queries `session_tainted(session_id)`. The PreToolUse hook stays thin.

## Why turn scope beats time windows

| Window | Failure mode |
|---|---|
| Last 5 minutes | Arbitrary. Misses long agentic turns; flags unrelated work after a pause |
| Last N tool calls | A long benign loop pushes the tainting read out before the malicious call |
| Whole session | One early `WebFetch` poisons every `git commit` for hours — product dies |
| **Current turn** | Matches the attack: read untrusted → act before the human speaks again |

`UserPromptSubmit` fires once per human message (verified against the Claude Code hooks docs). That is the boundary. A hard TTL (default 1800s) is only a safety net if a clear is missed.

Fail-open on this signal alone. A missing baseline never widens denial — the other six ADR-002 signals still fire. Provenance raises score when present; it does not invent false denials when absent.

## What changes in the demo

Same `curl | sh` to an unknown host, after the agent read a freshly cloned README:

```
shell_pipe_from_network (+40)
network_unknown_host (+20)
untrusted_origin_instruction (+20)
→ risk 80 → deny
```

Without the read, you stay at 60 → review. That distinction is the whole point of provenance.

## What this still does not catch

Cross-turn delayed attacks: agent reads tainted content, sits quiet through a human message, acts later. Migration trigger in ADR-004 if that shows up in the wild. Non-git projects get web provenance only — documented, not silent.

## Related

- [ADR-004](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/004-origin-provenance-tracking.md) · [中文](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/004-origin-provenance-tracking.zh.md)
- Prior post: [Helpfulness Is the Attack Surface](2026-07-05-agent-firewall-helpfulness-attack-surface.md)
- Next: [Deny + Add Rule Without Editing YAML Live](2026-07-11-agent-firewall-deny-add-rule-adr-005.md)
- Enterprise: [Agent Governance Reference Architecture](https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-07-05-agent-governance-reference-architecture.md)
