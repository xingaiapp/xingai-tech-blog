# Interview Prep Is a Decision Problem: Learn AI's One-Call Engine Architecture

**Date:** July 5, 2026
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** [Learn AI](https://learn.xingai.app)
**Tags:** `learn-ai` `decision-system` `cache-first` `llm-cost` `engines` `patterns`
**Also available:** [中文](2026-07-05-learn-ai-one-call-engine-architecture.zh.md)

---

LeetCode tells you *what* to solve. It never answers the question that actually decides your interview: **what should I practice next?**

That is a decision problem, not a content problem — so [Learn AI](https://learn.xingai.app) is built like every XingAI product: a decision system, not a chatbot. Paste an interview question (or a screenshot of one), and it answers with a pattern, the interviewer's intent, your gaps, and the next best question — company-aware.

## Master patterns, not questions

The domain model is a knowledge graph: `PatternFamily → Pattern → Question`, with your `LearningHistory`, `PatternMastery`, and `MistakeRecord` layered on top. "Two Sum" matters only as evidence about how you handle hash-map patterns. Readiness is a score computed from pattern coverage, weakness reduction, and consistency — not a count of solved problems.

## One LLM call, nine engines

The obvious architecture is one LLM call per concern: classify, extract intent, list prerequisites, map the pattern, explain, generate replay steps, find similar questions, recommend. Nine calls per question.

Learn AI makes **one**. A single analysis call returns one JSON document; the engines are *parsers and post-processors* over it. Only the engines that need the database — similar questions, company-aware recommendation, readiness — do their own work, against SQLite, with zero extra LLM calls ([ADR-002](https://github.com/xingaiapp/xingai-learn/blob/main/docs/adr/002-single-call-engines.md)).

You keep the modularity (each engine independently testable as a pure function) without the 9× cost, 9× latency, or nine ways for the answers to disagree with each other.

## The worker standard, honestly deviated from

XingAI's global standard says: logic in a worker, API reads cache, frontend renders cache. That works when input is enumerable — N stocks, M meal plans. An interview question pasted at 11pm is not enumerable. There is nothing to precompute.

So Learn AI runs the LLM in the request path — guarded by three cache layers:

| Layer | Key | What it saves |
|---|---|---|
| OCR | sha256(image) | vision call on re-uploaded screenshots |
| Analysis | hash(text + image) | the full analyze call on repeat questions |
| Similar questions | category:subcategory:pattern | per-pattern regeneration (serve 5 from 20 cached) |

Cache hit → zero LLM involvement. Miss → exactly one call, cached for everyone after. Cost scales with *distinct* questions, not traffic — and in interview prep, everyone asks the same questions. The standard's goal ("no LLM call per page load") is met; the mechanism differs, and the deviation is recorded as an ADR instead of drifting silently.

## What's next: grading our own recommendations

Learn AI just adopted the cross-product [Decision Ledger](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md) ([ADR-003](https://github.com/xingaiapp/xingai-learn/blob/main/docs/adr/003-decision-ledger.md)) — every "practice this next" becomes a ledger row. Unlike most products, we can actually measure `action_taken`: if you analyze a question matching the recommended pattern within 7 days, the recommendation was followed; the next mastery update tells us whether it *helped*.

An interview-prep tool that grades its own advice against your outcomes — that is the difference between a decision system and a content library.
