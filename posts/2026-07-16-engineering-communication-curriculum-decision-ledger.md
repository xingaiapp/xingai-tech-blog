# Grammar Fixes Are Not Senior Communication: A 14-Day Skill Curriculum + Decision Ledger

XingAI Engineering Communication Coach is not a Grammarly wrapper. The product question is: what should a non-native engineer practice today so tomorrow’s design review, incident update, or “no” to a bad deadline sounds like a senior—not just grammatically correct?

On 2026-07-16 we locked that answer into two contracts: a **14-day communication & charisma curriculum**, and the existing **Decision Ledger** write path for every review.

## The Boundary

Two mistakes keep showing up in “AI English for engineers” demos:

1. **Random scenarios** — useful once, then noise. No skill ladder.
2. **Grammar-only diffs** — they clean sentences and still leave hedging (“I think maybe…”), missing next steps, and weak leadership presence.

The coach’s loop is fixed on purpose:

```text
Today’s skill (why it matters)
  → Real engineering scenario (role, audience, risk)
  → User writes 5–10 sentences first
  → Review: line-by-line → Level 1/2/3 → final version
       → reusable expressions → voice → micro practice
       → one focus area
```

Hints are allowed. Full sample answers before the user tries are not.

## Curriculum Owns Sequencing

Days 1–14 cover first impression, trust, confidence, design-review speak-up, technical storytelling, voice, reading the room, difficult feedback, defensive colleagues, saying no, polite interrupt, conflict defuse, leader listening, and professional small talk. After day 14 the product cycles advanced topics (executive updates, architecture influence, incident leadership, negotiation).

Accepting a review advances `curriculumDay`. That is profile state—not a second memory table.

## Ledger Owns Memory

Reviews still map into the shared Decision shape (ADR-001): polished version → `recommendation`, explanations → `reasoning`, phrases → `alternatives`, improvement areas → `risks`, Accept/Edit/Reject → `action_taken`. Weak areas stay a **derived** view from recent `risks`, same discipline as Meal AI and Invest’s ledger adoption.

So the curriculum answers “what to practice.” The ledger answers “what we recommended and what the user did with it.”

## What We Did Not Do

- Invent a bespoke `weakness_patterns` source of truth.
- Ship Email/Push or durable multi-device history (still in-memory / local for the scaffold).
- Pretend this is certified language assessment.

## Links

- Product (planned): https://engineering-coach.xingai.app  
- Repo: https://github.com/xingaiapp/xingai-engineering-coach-ai  
- ADR-001 Decision Ledger: https://github.com/xingaiapp/xingai-engineering-coach-ai/blob/main/docs/adr/001-decision-ledger-adoption.md  
- ADR-002 Curriculum: https://github.com/xingaiapp/xingai-engineering-coach-ai/blob/main/docs/adr/002-14-day-communication-curriculum.md  
- Catalog: https://xingai.app (Engineering Communication Coach — coming soon)
