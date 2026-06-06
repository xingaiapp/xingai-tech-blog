# 每天三次实时研究：Research AI 免费档与缓存

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `rate-limiting` `cache` `product`  
**语言：** [English](2026-06-07-research-ai-free-tier-three-live-runs.md) · 中文

---

匿名用户 **每 24 小时 3 次** 实时 AI 研究。已缓存主题（含 trending）**不计数**。

## 什么叫「实时」

只有 **cache miss** 触发 Worker 推理才扣配额。命中 `v2:research:{hash}`？即时、免费、可反复查看。

## 身份与存储

Next 转发 `X-Client-Id`；未来 Gmail 登录走 `X-User-Email` 不限次。限额写在 `usage_limits.db`，与 `research.db` 分开，避免写锁争抢。

## 触顶体验

429 → 结果页说明；引导试 trending 或登录。

**延伸阅读：** `xingai-research-ai/docs/adr/005-free-tier-rate-limits.zh.md`
