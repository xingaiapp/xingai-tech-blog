# 中文 · XNP Phase 2：先跑起来、里面先什么也没有的模块化单体

**日期：** 2026-08-04  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [XingAI Notification Platform](https://github.com/xingaiapp/xingai-notification-platform)  
**标签：** `xnp` `dotnet` `postgres` `outbox` `multi-tenancy` `architecture` `adr`  
**语言：** [English](2026-08-04-xnp-phase-2-foundation-modular-monolith.md) · 中文

---

## 为什么 Phase 2 故意无聊

Phase 1 交了架构包：系统设计、ADR 0001–0018、C4、契约。下一步的诱惑是还没搞懂如何拒绝坏 JWT，就先上 SMS、模板、活动。

Phase 2 停在这里：只做管道。没有 Twilio，没有 SendGrid，没有假装已经接通的提供商。

## 「Foundation 完成」指什么

| 部件 | 选择 |
|------|------|
| 形态 | 模块化单体（`Xnp.Api` + `Xnp.Worker` + SharedKernel + Infrastructure） |
| 数据库 | PostgreSQL 16 + EF Core — 租户、订阅者、outbox/inbox、审计 |
| 鉴权 | JWT + 租户中间件 — 未签名请求失败 |
| 消息 | `IMessageBus` + 内存总线；进程内 outbox 派发（单写者） |
| 运维 | `/health/live`、`/health/ready`、OTel 钩子 |
| 本地 | `docker compose` 起 Postgres；full profile 起 API + DB |

各应用仍不得直连 Twilio / SendGrid / FCM。它们以后打 XNP。今天 XNP 必须先是一个能拒绝、接受并派发 outbox、又不假装有提供商的进程。

## 钉住 Phase 2 落地的 ADR

- **ADR-0019** — Phase 2 foundation 骨架（退出标准：构建、测试、compose、JWT、健康检查）。
- **ADR-0020** — Phase 2 保留进程内 outbox 派发；生产总线仍是 Azure Service Bus（ADR-0003），留给后续阶段。

## 没交付什么

订阅者 CRUD 竖切、模板、SMS、调度、活动、管理台、生产 Service Bus 消费者。

那是 Phase 3+。路线图已经写明：先一条竖切，再横向铺开。

## 要点

空而诚实，好过半接通道。有人喊「就接一下 Twilio」时，Phase 2 就是你有理由拒绝跳过的脚手架。

**延伸阅读：** `docs/architecture/` · 同仓 ADR-0019 / ADR-0020。
