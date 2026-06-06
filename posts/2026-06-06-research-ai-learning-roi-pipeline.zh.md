# 一条流水线，一个 ROI：Research AI 如何给主题打分

**日期：** 2026-06-06  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `openai` `worker` `roi` `decision-system` `json`  
**语言：** [English](2026-06-06-research-ai-learning-roi-pipeline.md) · 中文

---

输入主题后，Research AI 返回 **结论** 和 **0–100 学习 ROI**。二者来自同一次 Worker 运行。

## 流水线（MVP）

1. **核心 JSON 合成** — 结论、分数、路线、要点、来源（en/zh/ko）  
2. **讨论 agent**  
3. **图谱 agent**  
4. **ROI 确定性计算**

设计文档里的 7-agent DAG 在 MVP 合并为一次 JSON + 两个 enrichment，控制延迟与成本。

## ROI 公式

```txt
ROI ∝ (学习价值 × 背景匹配 × 迁移性) / (时间 × 难度 × 衰减)
```

Worker 写入 `roiScore`；学习组合排序读该字段。

**延伸阅读：** `xingai-research-ai/docs/adr/004-worker-pipeline.zh.md`
