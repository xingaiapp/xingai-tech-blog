# 分阶段 SSE，不剧透结论：Research AI 等待体验

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `sse` `ux` `worker`  
**语言：** [English](2026-06-07-research-ai-sse-streaming-wait-ux.md) · 中文

---

缓存未命中要排队等 Worker。只转圈像坏了；流式输出半个结论则是 **撒谎**。

## 流什么

SSE 四个 **阶段标签**：

```txt
thinking → scoring → sourcing → synthesizing → done
```

`done` 才带完整 JSON，与缓存命中同结构。阶段只是进度，不是决策片段。

## 规则

若在 `done` 前展示结论，就违反了 ADR-002。可以有进度，不能有半成品判决。

**延伸阅读：** `xingai-research-ai/docs/adr/008-sse-streaming-progress.zh.md`
