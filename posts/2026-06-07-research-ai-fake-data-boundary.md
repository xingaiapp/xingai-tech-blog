# How Research AI Handles Fake Data: Source URLs Before Synthesis

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `research-ai` `fake-data` `worker` `cache` `openai` `source-verification`  
**Also available:** [中文](2026-06-07-research-ai-fake-data-boundary.zh.md)

---

We found a bad pattern in Research AI: some UI blocks looked factual but were not backed by original sources.

The obvious example was **Hot discussions**. It showed platform names, handles, engagement counts, and quotes. They looked like real posts. They were not. They were OpenAI-generated representative snippets.

That is not acceptable for a research product.

## The rule

LLMs can synthesize. They cannot be the source of truth.

So we changed the pipeline:

```text
Worker fetches real source URLs
  → OpenAI summarizes only from those collected sources
  → worker validates output URLs
  → worker writes SQLite cache
  → FastAPI reads cache
  → Next.js renders cached fields
```

FastAPI does not call OpenAI. Next.js does not generate fallback answers. If the cache misses, the API queues work and waits for the worker.

## What we removed

We removed paths that could quietly produce fake-looking data:

- Frontend serverless OpenAI generation.
- Demo research payloads.
- Static trending topic lists.
- Local topic warmers in Next.js.
- AI-generated “discussion quotes,” fake handles, and fake upvotes.
- Source prompts that allowed “use a Google search URL if unsure.”

That last one matters. A Google search URL is not a source. It is a way to look for a source.

## The new source boundary

Before OpenAI writes a verdict, the worker collects candidate sources from real endpoints:

- Hacker News Algolia API
- arXiv API
- Wikipedia API

The worker passes those candidates into the OpenAI prompt as `allowed_sources`.

Then it checks the answer after generation. Every `sources[].url` must match one of the URLs collected by the worker. If OpenAI invents a link, the worker drops it. If no verified source remains, the worker fails the job instead of writing a fake result.

## Hot discussions changed too

We stopped pretending we had original posts.

The UI now shows verification entry points:

- X live search
- Hacker News search
- Reddit search

No invented author. No invented quote. No invented engagement count.

That is less flashy. It is also honest.

## Cache freshness

Research content gets stale. The FastAPI read path now checks cache age. If a result is too old, it does not serve the stale payload as if it were fresh.

Instead:

1. FastAPI marks the result stale.
2. FastAPI queues a `force_refresh` job.
3. Worker fetches fresh source URLs.
4. Worker calls OpenAI with those sources.
5. Worker overwrites the cache.

Again: FastAPI reads and queues. Worker computes.

## The checklist we use now

Before shipping any AI-generated content block:

- Does this claim have a URL?
- Did the URL come from code fetching a real source, not from the model?
- Does the model have permission to cite only those URLs?
- Do we reject or drop citations outside the allowed set?
- Does stale cache trigger worker refresh?
- Does the UI make search links look like search links, not original quotes?
- Is there any demo fallback that can reach production?

If the answer is weak, the feature is not ready.

## The bigger lesson

Fake data usually does not start as fraud. It starts as a shortcut: “just make the UI feel complete.”

That shortcut is dangerous in AI products. A polished fake is worse than an empty state because users may trust it.

For Research AI, the right boundary is simple:

**source first, synthesis second, cache third, render last.**
