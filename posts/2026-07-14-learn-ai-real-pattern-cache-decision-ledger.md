# From Mock Patterns to Cached Learning Data: Learn AI Gets Real Metadata

Learn AI started with the right product boundary: it is not a LeetCode clone. It answers a decision question: what pattern should I practice next?

But a decision system cannot stay convincing if its pattern graph, company mode, and similar questions are mostly seed data. On July 14, 2026, Learn AI moved the core learning metadata onto a cache-always path: real metadata imported offline, runtime reads from SQLite, and every recommendation can be recorded in the Decision Ledger.

## Metadata, Not Problem Statements

The new catalog is intentionally narrow. It stores:

- pattern family
- pattern slug
- question title
- difficulty
- tags
- source URL
- license note

It does not copy full third-party problem statements. That boundary matters. Learn AI should teach the pattern behind a question, not mirror another platform's content.

The source artifact is `data/pattern_catalog.v1.json`, and the importer is `scripts/import_patterns.py`.

## Cache Always

The runtime rule is simple:

> external learning data is imported first; request handlers read local cache only.

That means the pattern graph, company mode, readiness page, dashboard, and similar-question picker do not fetch external websites during a user request. If a company has no cached signal, the product returns `insufficient_data` instead of inventing a score.

This is the same discipline we use across XingAI: cache first, provenance first, no request-time improvisation when a cached source of truth should exist.

## Company Mode Becomes Honest

The old company mode used hardcoded weights. The new version uses cached `company_pattern_weights` rows:

- `company_slug`
- `pattern_slug`
- `count`
- `window`
- `source`
- `license_note`

The language is deliberately careful. These are curated public metadata signals, not official company interview frequencies. They can guide practice priority; they are not hiring-bar claims.

## Similar Questions Become DB-first

Similar questions now come from the cached catalog before falling back to LLM candidates. That makes the recommendation surface more stable:

- same pattern slug,
- known source,
- known difficulty,
- known tags,
- no live fetch.

This also lets the UI show cached question counts and source metadata in the pattern graph.

## Decision Ledger Ships

Learn AI now writes Decision Ledger rows for:

- next-question recommendations,
- company-mode reweighting,
- readiness snapshots.

It also has a real `action_taken` signal. If a user analyzes or solves a question matching the recommended pattern within seven days, the decision is marked `followed`. If they practice a different pattern, it is marked `modified`. If nothing happens, it stays null.

That gives Learn AI a feedback loop: not just "what did we recommend?" but "did the user follow it, and did mastery improve later?"

## Local Fallback Is Not Product Truth

One practical local issue came up: copied test keys can expire, and local networking can fail. Learn AI now has a development-only deterministic LLM fallback so engineers can still test the UI, catalog cache, and ledger writes.

Production does not hide OpenAI failures this way. The fallback is for local flow testing, not quality evidence.

## What Changed

The shipped version includes:

- real metadata catalog,
- offline importer and refresh wrapper,
- DB-first similar-question selection,
- cached company pattern weights,
- readiness without demo multipliers,
- Decision Ledger implementation,
- provenance fields,
- development-only LLM fallback,
- enterprise operation docs for cache and ledger.

The product is still not a question bank. It is a pattern decision system with a real cached knowledge base underneath it.
