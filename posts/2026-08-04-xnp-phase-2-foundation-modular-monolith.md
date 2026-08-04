# XNP Phase 2: A Modular Monolith That Boots With Nothing In It

**Date:** August 4, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [XingAI Notification Platform](https://github.com/xingaiapp/xingai-notification-platform)  
**Tags:** `xnp` `dotnet` `postgres` `outbox` `multi-tenancy` `architecture` `adr`  
**Also available:** [中文](2026-08-04-xnp-phase-2-foundation-modular-monolith.zh.md)

---

## Why Phase 2 is boring on purpose

Phase 1 shipped the architecture package: system design, ADRs 0001–0018, C4, contracts. The next temptation is SMS + templates + campaigns before the host can say no to a bad JWT.

Phase 2 stops there. Boot plumbing. No Twilio. No SendGrid. No cute provider yet.

## What "foundation complete" means

| Piece | Choice |
|-------|--------|
| Shape | Modular monolith (`Xnp.Api` + `Xnp.Worker` + SharedKernel + Infrastructure) |
| Database | PostgreSQL 16 + EF Core — tenants, subscribers, outbox/inbox, audit |
| Auth | JWT + tenant middleware — unsigned requests fail |
| Messaging | `IMessageBus` + in-memory bus; in-process outbox dispatcher (single writer) |
| Ops | `/health/live`, `/health/ready`, OpenTelemetry hooks |
| Local | `docker compose` for Postgres; full profile builds API + DB |

Apps still must not call Twilio / SendGrid / FCM directly. They will talk to XNP later. Today XNP must exist as a process that can reject, accept, and dispatch outbox rows without lying about providers.

## ADRs that pin Phase 2 implementation

- **ADR-0019** — Phase 2 foundation skeleton (exit criteria: builds, tests, compose, JWT, health).
- **ADR-0020** — Keep the outbox dispatcher in-process for Phase 2; Azure Service Bus remains the production broker (ADR-0003) for later phases.

## What we did not ship

Subscriber CRUD vertical slice. Templates. SMS. Schedules. Campaigns. Admin UI. Production Service Bus consumers.

That is Phase 3+. Roadmap already says one vertical slice before horizontal fan-out.

## Takeaway

Empty and honest beats half-wired channels. Phase 2 is the scaffolding you can refuse to skip when someone asks for "just one Twilio call."

**Further reading:** `docs/architecture/` · ADR-0019 / ADR-0020 in the same repo.
