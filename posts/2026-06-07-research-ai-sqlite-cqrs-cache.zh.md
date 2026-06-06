# Research AI 的 SQLite CQRS：同一套键，同一个 Fly 卷

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `cqrs` `sqlite` `worker` `cache`  
**语言：** [English](2026-06-07-research-ai-sqlite-cqrs-cache.md) · 中文

---

Research AI 没有重新发明缓存，而是沿用 Invest AI 的 **单写多读** SQLite 模式，只换了键名。

## 键布局

| 键 | 写入 | 读取 |
|----|------|------|
| `v2:research:{hash}` | worker | FastAPI、Next 代理 |
| `v2:research:trending` | 预热 | `/api/trending` |
| `research:pending:queue` | API 入队 | worker 消费 |

文件在 Fly 卷 `/data/research.db`，WAL，研究行约 24h TTL。

## MVP 为什么不用 Redis

多一个服务、多一份账单、多一个凌晨要查的故障点。Invest 已验证 SQLite；QPS 上去再迁移（见 ADR-003）。

**延伸阅读：** `xingai-research-ai/docs/adr/003-cqrs-sqlite-cache.zh.md`
