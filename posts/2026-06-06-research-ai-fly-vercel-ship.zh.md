# 上线 Research AI：Vercel 跑 UI，Fly 跑 Worker + SQLite

**日期：** 2026-06-06  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `fly-io` `vercel` `deployment` `sqlite` `worker`  
**语言：** [English](2026-06-06-research-ai-fly-vercel-ship.md) · 中文

---

Research AI 沿用 Invest AI 部署形态：

| 层 | 位置 |
|----|------|
| Next.js | Vercel |
| FastAPI + Worker | Fly `xingai-research-ai-api` |
| 缓存 | Fly 卷 `/data` |

## 前端配置

```txt
RESEARCH_API_URL=https://xingai-research-ai-api.fly.dev
```

## 运维

- Fly secret：`OPENAI_API_KEY`  
- 健康检查：`/api/v2/health`  

**延伸阅读：** `xingai-research-ai/docs/deploy/fly-io.md`
