# Decision Board, Not Chatbot: Why Research AI Ships One Verdict

**Date:** June 7, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Research AI](https://research.xingai.app)  
**Tags:** `decision-system` `product` `learning` `ux` `architecture`  
**Also available:** [中文](2026-06-07-research-ai-decision-board-not-chatbot.zh.md)

---

Google answers *what*. Research AI answers *whether tonight*:

> Should I spend an hour on MCP, RAG, or neither?

## One screen, one outcome

Each query returns a **decision board**:

- Verdict — Learn Now · Learn Later · Skip · Delegate  
- Learning ROI (0–100)  
- 30-minute route + ranked sources  
- Optional graph + hot discussions  

No chat thread. No essay by default. If users want depth, they open sources — not another prompt box.

## Why we rejected chat-first

Chat hides the verdict below scroll. It invites follow-ups before the user commits attention. Our upgrade rule says inherit the main flow — for Research AI, the main flow is **decide**, not converse.

## Backend follows the same story

Worker-owned inference, read-only API (ADR-002). The UI renders cached fields; it does not re-rank or re-decide.

## Optional paths stay optional

Compare two topics. Portfolio by ROI. History in localStorage. Topic SEO pages for shareable briefs. None of them replace the home → verdict path.

**Further reading:** `xingai-research-ai/docs/adr/001-learning-decision-system.md`
