# Deny + Add Rule Without Editing YAML Live

**Date:** July 11, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** XingAI Agent Firewall
**Tags:** `agent-security` `human-in-the-loop` `policy` `adr` `decision-ledger` `governance`
**Also available:** [中文](2026-07-11-agent-firewall-deny-add-rule-adr-005.zh.md)

---

ADR-003 promised four approval buttons: Approve once / Approve for session / Deny / **Deny + add rule**. The first three shipped. The fourth sat in the UI copy with no backend.

Two constraints collided:

1. Humans expect "don't ask me again" when they deny a bad call.
2. ADR-002 says permanent policy edits go through YAML, reviewed like code.

One-click rewrite of `policies/default.yaml` from a running service violates (2). A button that only says "go edit the file" fails (1). [ADR-005](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/005-deny-add-rule.md) splits the action in two.

## Instant pin + reviewed suggestion

```
Deny + add rule
    ├─ pinned_denies     exact normalized call → deny forever (until unpinned)
    └─ rule_suggestions  queue row for a human to write real YAML later
```

`/check` consults `pinned_denies` before scoring. Exact match short-circuits to deny — same matching shape as `session_allowlist`, but not session-scoped. The point of a pin is "this call pattern is bad wherever it shows up," not "for the next hour in this chat."

The Rules dashboard lists unresolved suggestions with the pattern and the fired-signal reasoning. A human edits YAML in git, then marks the suggestion resolved. Resolving can drop the matching pin — the durable rule now covers it.

## What we refused to build

| Option | Why not |
|---|---|
| Service mutates `default.yaml` | Unreviewed policy change from a network-facing process — the thing the firewall exists to stop elsewhere |
| Snippet-only button | Same call re-enters `review` on every repeat until someone remembers to edit |
| Auto-generated regex rules | Generalizing "what varies" (URL? host? whole pipe shape?) *is* the human review step |

Exact-string pins are noisy if attackers mutate literals. That is deliberate at v1. Near-duplicate pin piles are the migration trigger for a parameterized suggestion language — informed by real pins, not invented upfront.

## Why the dashboard matters

Pins must be visible and removable. A silent global block with no UI is a footgun. The approval queue (held `review` calls) and the Rules view (pins + suggestions) are the two surfaces that make ADR-003's fourth button honest.

CLI mirrors the same surface for local-first use:

```
python cli.py deny <id> --add-rule
python cli.py pinned-denies
python cli.py suggestions
python cli.py resolve-suggestion <id>
```

## The discipline this protects

Config that enforces agent behavior is itself an enforcement surface. Letting the runtime rewrite it collapses the review boundary. Runtime state (pins) can be aggressive and reversible. Policy code (YAML) stays slow and reviewed. One click gets both without pretending they are the same thing.

## Related

- [ADR-005](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/005-deny-add-rule.md) · [中文](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/005-deny-add-rule.zh.md)
- Prior: [Turn-Scoped Taint (ADR-004)](2026-07-11-agent-firewall-origin-provenance-adr-004.md)
- Scaffold: [Helpfulness Is the Attack Surface](2026-07-05-agent-firewall-helpfulness-attack-surface.md)
- Pattern: [`agent-execution-gate`](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/agent-execution-gate.md)
