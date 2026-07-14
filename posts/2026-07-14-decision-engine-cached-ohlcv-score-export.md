# From Honest 404 to Cached Scores: Decision Engine's First Producer

The Decision Engine API originally shipped with an intentionally honest behavior: if there was no `daily_scores.v1.json` export, it returned 404.

That was the right boundary. The API is a reader, not a scoring engine. It should not fetch market data, calculate signals, or invent recommendations during a request.

On July 14, 2026, `xingai-invest-decision-engine` added the first research-grade producer behind that API: cached OHLCV in, ADR-011 score export out.

## What Shipped

The new scoring layer is split in two pieces:

- `scoring/scorer.py`: deterministic technical scoring over OHLCV frames and local indicators.
- `engine/report_generator.py`: a Module 7 producer that reads `MarketDataCache` and writes `reports/daily_scores.v1.json`.

The scorer produces action, confidence, multi-timeframe scores, risk gate, and explanation fields shaped for the existing score export contract.

The report generator does not fetch live data. It reads the cache, produces the file, and leaves the API as a read-only transport.

## Still Not Production Trading Logic

This matters enough to say plainly: the producer is research-grade.

It unblocks integration tests and gives downstream systems a real export shape, but it does not authorize production import into Invest AI and does not authorize live trading. ADR-009 backtest integrity still owns that gate.

That boundary keeps the system honest:

- indicators compute locally,
- scoring happens before API reads,
- API serves cached files,
- broker-facing systems reference cache snapshots,
- humans remain in the approval path.

## Why This Matters for Robinhood MCP

Robinhood MCP's G5 gate needs to reference a decision snapshot rather than a model's live improvisation. With the first cached score producer in place, drills can now point at a real `daily_scores.v1.json` artifact.

That is a useful milestone. It makes the pipeline more end-to-end without making it more autonomous.

## Validation

The implementation added focused tests for the scorer and report generator. Full Decision Engine test suite at implementation time: `80 passed`.

The next hard work is not adding more endpoints. It is backtesting, promotion criteria, monitoring, and proving that a score deserves to graduate from research artifact to production input.
