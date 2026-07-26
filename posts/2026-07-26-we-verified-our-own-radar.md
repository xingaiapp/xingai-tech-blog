# We Ran Our Own AI Radar Through Citation Verification. It Flagged Us.

**Date:** 2026-07-26
**Author:** Xing @ [XingAI](https://xingai.app)
**Project:** XingAI Evidence Engine + Opportunity Radar
**Tags:** `evidence` `citation-verification` `evaluation` `every-eval-ever` `dogfooding`
**中文版：** [中文](2026-07-26-we-verified-our-own-radar.zh.md)

---

Every day we publish an internal AI opportunity radar: signals from lab blogs
and funding news, mapped to product decisions. Every issue cites its sources.
And until today, nobody checked those citations except the person reading them.

That's exactly the product gap the radar itself keeps pointing at: research
*generation* is getting cheap; research *verification* is not. So we built the
first cut of an evidence engine — claim extraction, evidence binding, citation
verification — and made the radar its first customer.

The 2026-07-26 issue went through the pipeline. Here's what came back.

## The numbers

```text
12 sources:  11 reachable, 1 blocked (WSJ paywall, HTTP 401)
14 claims:   6 supported, 3 partial, 1 not supported,
             2 uncited, 1 unverifiable, 1 unverified
citation coverage:      80%   (target: 90%)
unsupported claim rate: 30%   (target: <10%)
```

We missed our own targets on our own document. Good. The misses are the
interesting part.

## Finding 1: paywalled primary sources break verification

The radar's Neo funding claim cites The Wall Street Journal. The WSJ page
returns 401 to any verifier without a subscription — so the load-bearing
number ($100M) in that claim is unverifiable by machine, even though a manual
check against secondary coverage confirms it.

Lesson for the engine: `blocked` is a distinct source state from
`unreachable`, and coverage metrics must not punish citing paywalled primary
sources. Lesson for the radar: when the primary source is paywalled, add one
open corroborating source.

## Finding 2: bundled claims fail as a unit

One radar paragraph packs two facts into one sentence: Neo's funding (cited
to the blocked WSJ page) and Google DeepMind's AI control roadmap (cited to an
open page). The verifier judged the pair as a unit: the reachable citation
supports only half, so the whole claim came back `not_supported`.

The claim wasn't wrong — the granularity was. Atomic claims, one checkable
fact each, are going on the roadmap as the next extraction improvement.

## Finding 3: your hypotheses look like uncited facts

The radar states falsifiable targets — "citation coverage reaches 90%",
"unsupported claim rate below 10%". The deterministic extractor read those as
factual claims with no citation and flagged both. Technically a false
positive; practically a useful nudge: predictions and targets should be
visually and structurally separate from reported facts.

## The part that compounds: every run is an eval record

Each pipeline run emits an evaluation record in the
[Every Eval Ever](https://research.ibm.com/blog/every-evaluation-ever) shape —
the four-block schema (source / model / configuration / results) that IBM and
the EvalEval Coalition published to make AI evaluation results comparable and
reproducible. We deliberately did not invent our own schema.

Those records land in a small open registry with one CI-friendly verb:

```text
eval-registry diff <old-run> <new-run> --fail-on-regression
```

Today that diff already says something real: the deterministic baseline and
the LLM-verified run agree on source reachability, and the LLM pass converts
"unverified" into 6 supported / 3 partial / 1 not-supported verdicts at the
cost of one model call per claim-citation pair.

## Why this loop matters

The radar recommends building evidence infrastructure. The evidence
infrastructure now grades the radar. Every future issue becomes a test case,
every run a registry record, every regression a diff. The tool that tells us
what to build is no longer allowed to be wrong quietly.

That's the whole thesis in one sentence: **generation is a commodity;
verification is a habit.**
