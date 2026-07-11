# Shipping the Approval Queue Dashboard (and a TypeScript 7 Wall Nobody Warned Us About)

**Date:** July 11, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** XingAI Agent Firewall
**Tags:** `agent-security` `nextjs` `typescript` `human-in-the-loop` `governance`
**Also available:** [中文](2026-07-11-agent-firewall-approval-dashboard-ships.zh.md)

---

[ADR-003](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/003-approval-workflow-ledger.md) specified four one-click approval actions back in the PRD. [ADR-005](2026-07-11-agent-firewall-deny-add-rule-adr-005.md) gave the fourth button a backend. Both were still spec-only for the UI itself — zero lines of frontend code existed. This pass shipped it.

## What shipped

Two pages, both client components polling the policy engine directly (no server-side proxy — local-first, per the README's stack promise):

- **`/`** — the approval queue. Every held `review` call as a card: domain, risk score, fired signals, four buttons (Approve once / Approve for session / Deny / Deny + add rule). Polls `/pending` every 2s.
- **`/rules`** — the ADR-005 surface. Unresolved rule suggestions (with a "resolved, keep pin" escape hatch) and the pinned-denies list with one-click unpin.

The engine gained CORS: a fixed `localhost:3000` allowlist, no wildcard, no credentials — the dashboard and engine are different origins on the same machine, not a public API.

## The wall

`npm install` grabbed current-stable dependencies, including `typescript@7.0.2`. `next build` compiled the app fine, then died at the "Running TypeScript" step:

```
The "id" argument must be of type string. Received undefined
Next.js build worker exited with code: 1 and signal: null
```

No stack trace into our code. First suspect was a red herring: Next warned about "multiple lockfiles" because this repo lives inside a larger monorepo checkout with its own top-level `package-lock.json`, and picked the wrong workspace root. Pinning `turbopack.root` in `next.config.ts` silenced the warning — the crash didn't move.

The real cause: **Next 16.2.10's internal TypeScript integration doesn't yet handle TypeScript 7's rewritten (native/Go) compiler.** Every build tried to "detect" TypeScript, failed, reinstalled it, and crashed the same way. Pinning `typescript@6.0.3` — the last pre-7 stable — fixed it on the first retry.

The lesson isn't about this specific pair of version numbers. It's the order of operations: when a framework's own internal tooling integration throws an opaque, low-level error, check whether you grabbed a major version the framework hasn't caught up to yet — *before* chasing red herrings in your own config. The lockfile warning was real but irrelevant; the actual fix was one version pin away the whole time.

## Proof, not just "it builds"

No Chrome extension was connected this session, so real click-testing wasn't possible. The substitute: call the exact HTTP endpoints each button calls, against a real running engine and real SQLite — not mocked.

```
POST /check         (0din-class call)        → risk 60, held in review
POST /deny/{id}      {"add_rule": true}       → pinned_deny_id + rule_suggestion_id
POST /check          (same call again)        → risk 100, deny, 0.008s — no queue wait
POST /rule-suggestions/{id}/resolve           → suggestion resolved, matching pin removed
```

Every step matches what ADR-005 designed on paper. That's a real verification of the wiring — the one gap it doesn't close is confirming the buttons *render and click* correctly in an actual browser.

## Still open

Audit/history views (PRD week 3), and a diff-style preview for file-write calls in `/pending` (ADR-003 mentions it; the payload doesn't carry before/after content yet). Both are scoped, not forgotten.

## Related

- [ADR-005: Deny + Add Rule](2026-07-11-agent-firewall-deny-add-rule-adr-005.md)
- [ADR-004: Turn-Scoped Taint](2026-07-11-agent-firewall-origin-provenance-adr-004.md)
- [ADR-003: Approval Workflow + Decision Ledger](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/003-approval-workflow-ledger.md)
