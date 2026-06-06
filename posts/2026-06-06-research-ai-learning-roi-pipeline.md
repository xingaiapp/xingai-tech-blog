# One Pipeline, One ROI Number: How Research AI Scores a Topic

**Date:** June 6, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `openai` `worker` `roi` `decision-system` `json`  
**Also available:** [中文](2026-06-06-research-ai-learning-roi-pipeline.zh.md)

---

After you type a topic, Research AI returns a **verdict** and a **0–100 Learning ROI score**. Both come from the same worker run — not from the browser guessing.

## Pipeline (MVP)

`research-ai-worker/research_cache_worker/pipeline.py`:

1. **Core JSON synthesis** — OpenAI structured output: verdict, scores, route (4 steps), takeaways (5), sources (5). Locale-aware (en / zh / ko).  
2. **Discussions agent** — short list of how people talk about the topic.  
3. **Graph agent** — nodes you can tap to explore related concepts.  
4. **ROI scorer** — pure Python on worker sub-scores.

Design doc describes a 7-agent DAG; MVP collapses most work into one JSON call plus two enrichments to control latency and cost.

## ROI formula (deterministic)

```txt
ROI ∝ (learningValue × backgroundMatch × transfer) / (time × difficulty × decay)
```

`futureRelevance` maps to transfer/decay multipliers (`Critical` … `Low`). Shorter estimated time and lower difficulty help — but not without cap factors so edge cases do not explode.

The worker writes `roiScore` into cache. Portfolio ranking reads that field.

## Demo mode

No `OPENAI_API_KEY`? Worker still returns structured **demo** payloads so Vercel previews and local UI work. Production Fly deploy uses the same code path with real inference.

**Further reading:** ADR-004 + ADR-007 in `xingai-research-ai/docs/adr/`
