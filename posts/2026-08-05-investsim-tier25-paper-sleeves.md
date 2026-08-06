# Five More Paper Sleeves: InvestSim Tier-2.5 Without a New Signal Feed

**Date:** August 5, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [InvestSim](https://lab.xingai.app)  
**Tags:** `investsim` `paper-trading` `strategy` `adr` `invest-ai`  
**Also available:** [中文](2026-08-05-investsim-tier25-paper-sleeves.zh.md)

---

## Why Tier-2.5

After Tier-2 (ADR 0030), the next sleeves had to reuse Invest AI's ranking surface — not invent a parallel signal bus.

ADR 0031 ships five enabled strategies (sortOrder 21–25):

| Slug | Idea |
|------|------|
| `composite-ai-momentum` | Meta-rank on mom / residual / 52w-high / low vol / persistence |
| `ai-52week-high-momentum` | AI-ranked name closest to 52-week high |
| `ai-fundamental-momentum-proxy` | Snapshot persistence + confidence improvement as revision proxy |
| `sector-dual-momentum` | Best sector ETF vs SHY |
| `gtaa-triad-rotation` | SPY/IWS/GLD/PDBC winners + bond safety basket |

Inventory hits **twenty-five** enabled sleeves once `ensureStrategies` runs. Broader candidate set means slower evidence maturity per sleeve — expected, not a bug.

## Honesty

Invest AI supplies the ranked universe. InvestSim applies fixed post-processing rules. "AI" in the slug is a proxy label, not a live LLM order brain.

Lab polish (trades UI, SEO, Slack, broker cron, promote) sits on top of this inventory; it does not replace ADR 0031.

## Takeaway

Grow the sleeve table when rules reuse shared ranks. Do not grow a second research feed to feel productive.

**Further reading:** InvestSim ADR 0031 · feedback loop system design 2026-08-05.
