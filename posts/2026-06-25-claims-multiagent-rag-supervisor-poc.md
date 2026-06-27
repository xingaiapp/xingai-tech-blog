# Supervisor + RAG + Citations: Building an Insurance Claims Multi-Agent POC

**Date:** June 25, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Enterprise AI POCs — Claims Multi-Agent RAG](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-multiagent-rag-poc)  
**Tags:** `multi-agent` `rag` `langgraph` `human-in-the-loop` `audit` `insurance`  
**Also available:** [中文](2026-06-25-claims-multiagent-rag-supervisor-poc.zh.md)

---

Insurance adjusters don't guess. They read the claim, pull the policy, check history, apply rules, and decide — with paperwork that shows *why*. Our new POC automates that **workflow**, not that judgment call.

Repo: `xingai-enterprise-ai-pocs/pocs/claims-multiagent-rag-poc/`

## The problem with one big prompt

A single LLM call that "reads the claim AND checks the policy AND checks fraud AND decides" is unreliable:

- The prompt becomes huge and untestable.
- You can't audit which step failed.
- The model may deny a claim without quoting an exclusion clause.

We split the job into **specialized agents** with a **supervisor** (LangGraph) that owns explicit handoffs.

```text
Claim → Intake → Retrieval (RAG) → Fraud-Check → Adjudication → Audit
              ↘ low confidence → Human Review
```

## What RAG means here

**Retrieval-Augmented Generation:** before any decision text is generated, we retrieve real document chunks from three **separate** Chroma collections:

| Collection | Contents |
|------------|----------|
| `policy_documents` | Coverage, exclusions, deductibles |
| `claim_history` | Past claims per synthetic policyholder |
| `regulations` | State handling rules |

Every chunk carries `document_id`, `chunk_id`, and similarity score. Downstream agents never see naked text without a citation.

## Rules before models

**Fraud-Check** runs deterministic rules first (claim frequency, amount vs limit, new-policy window), then a lightweight narrative pass. High fraud score → **escalate to human** — we never auto-deny on fraud alone.

**Adjudication** must cite at least one policy excerpt for APPROVE or DENY. Thresholds live in `config/claims_policy.yml` — no magic numbers in Python:

- `human_review_threshold_usd: 5000`
- `escalate_risk_score: 0.70`

## Audit trail

Every agent step appends to SQLite (`audit_trail`). PII patterns are redacted before logging. One query answers: "Why was claim #123 denied?"

## Demo paths (live script)

Three synthetic claims walk stakeholders through different outcomes:

1. **APPROVE** — $450 windshield on POL-1001, low fraud score, glass coverage cited.
2. **DENY** — flood damage on POL-2002; denial quotes the flood exclusion clause.
3. **ESCALATE** — third glass claim in 30 days, or amount over $5,000.

See [`demo_script.md`](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/pocs/claims-multiagent-rag-poc/demo_script.md).

## Golden-set eval

Ten synthetic claims with expected actions; CI target **≥ 80%** exact-match on decision action. Run:

```bash
pytest tests/eval/test_golden_claims.py -v -m eval
```

## Enterprise mapping

This POC validates [Enterprise POC ADR-001](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/001-supervisor-audit-human-in-the-loop.md): supervisor orchestration, append-only audit, human-in-the-loop thresholds, RAG citation discipline.

Production path (not built): Pinecone/Weaviate, PDF intake, field-level encryption, real claims system integration via MCP read tools first.

**Positioning:** Phase 1 validation of multi-agent RAG + governance — same architecture a production insurance copilot would use, with synthetic data only.
