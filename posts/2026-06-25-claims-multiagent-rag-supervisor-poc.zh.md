# Supervisor + RAG + 引用：保险理赔 Multi-Agent POC 怎么搭

**日期：** 2026-06-25  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Enterprise AI POCs — Claims Multi-Agent RAG](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/tree/main/pocs/claims-multiagent-rag-poc)  
**标签：** `multi-agent` `rag` `langgraph` `human-in-the-loop` `audit` `insurance`  
**语言：** [English](2026-06-25-claims-multiagent-rag-supervisor-poc.md) · 中文

---

理赔员不会瞎猜。他们读报案、查保单、看历史、套规则、做决定 — 还要能说明**为什么**。这个新 POC 自动化的是**流程**，不是替人拍板。

仓库：`xingai-enterprise-ai-pocs/pocs/claims-multiagent-rag-poc/`

## 一个巨型 prompt 的问题

让模型「同时读报案、查保单、查欺诈、做决定」不可靠：

- Prompt 巨大且难测。
- 无法审计哪一步出错。
- 模型可能不引用除外条款就拒赔。

我们把工作拆成 **specialist agent**，由 **Supervisor**（LangGraph）显式交接。

```text
报案 → Intake → Retrieval (RAG) → Fraud-Check → Adjudication → Audit
              ↘ 置信度低 → 人工复核
```

## 这里的 RAG 指什么

**检索增强生成：** 在生成决策文案前，从三个**独立** Chroma 集合检索真实文档片段：

| 集合 | 内容 |
|------|------|
| `policy_documents` | 保障、除外、免赔 |
| `claim_history` | 合成被保人历史理赔 |
| `regulations` | 州级处理规则 |

每个 chunk 带 `document_id`、`chunk_id`、相似度。下游 agent 看不到无引用的裸文本。

## 规则先于模型

**Fraud-Check** 先跑确定性规则（频率、金额相对限额、新保单窗口），再做轻量叙事检查。欺诈分高 → **升级人工** — 不因欺诈单独自动拒赔。

**Adjudication** 对 APPROVE/DENY 必须引用至少一条保单摘录。阈值在 `config/claims_policy.yml` — Python 里无 magic number：

- `human_review_threshold_usd: 5000`
- `escalate_risk_score: 0.70`

## 审计链路

每步 append 到 SQLite（`audit_trail`）。日志前 `redact()` 脱敏。一条查询回答：「理赔 #123 为何被拒？」

## Demo 三条路径

三条合成报案覆盖不同结果：

1. **APPROVE** — POL-1001 挡风玻璃 $450，低欺诈分，引用玻璃保障。
2. **DENY** — POL-2002 洪水；拒赔引用洪水除外条款。
3. **ESCALATE** — 30 天内第三次玻璃理赔，或金额超 $5,000。

见 [`demo_script.md`](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/pocs/claims-multiagent-rag-poc/demo_script.md)。

## Golden-set 评估

十条合成报案 + 期望动作；CI 目标 **≥ 80%** 决策动作完全匹配：

```bash
pytest tests/eval/test_golden_claims.py -v -m eval
```

## 企业映射

本 POC 验证 [Enterprise POC ADR-001](https://github.com/xingaiapp/xingai-enterprise-ai-pocs/blob/main/docs/adr/001-supervisor-audit-human-in-the-loop.zh.md)：Supervisor 编排、只追加审计、人工复核阈值、RAG 引用纪律。

生产路径（未建）：Pinecone/Weaviate、PDF  intake、字段级加密、经 MCP 只读工具对接真实理赔系统。

**定位：** Multi-Agent RAG + 治理的 Phase 1 验证 — 与生产级保险 copilot 同架构，数据全为合成。
