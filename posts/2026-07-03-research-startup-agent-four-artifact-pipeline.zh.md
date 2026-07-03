# Research-to-Startup Agent：四产物流水线架构

**日期：** 2026 年 7 月 3 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Research-to-Startup Agent](https://github.com/xingaiapp/xingai-research-startup-agent)
**标签：** `research-ai` `创业` `gpt-4o` `worker-cache` `流水线` `prd`
**English:** [English](2026-07-03-research-startup-agent-four-artifact-pipeline.md)

---

读 AI 论文很容易。知道从中能构建什么，很难。

Research-to-Startup Agent 接受一个 URL——一篇论文、一篇博客文章、一个公告——并生成四个产物：技术洞察摘要、创业想法、完整 PRD 和 Cursor/Lovable 构建 prompt。一个输入，四个输出，随时可以开始构建。

## 流水线

```
URL
  ↓  fetch_url_content()       — HTTP GET，去除 HTML 标签，取前 8k 字符
  ↓  call_openai(insight)      — 提取 3–5 条核心技术贡献
  ↓  call_openai(idea)         — 一个将该技术商业化的创业想法
  ↓  call_openai(prd)          — 问题 / 解决方案 / 指标 / MVP / 风险
  ↓  call_openai(build_prompt) — 一段 Cursor/Lovable/Bolt prompt
  ↓  write_cache()             — SQLite WAL，以 SHA-256(url)[:16] 为键
```

四次顺序 LLM 调用。首次运行总耗时：15–40 秒。重复访问：即时返回。

## 为什么顺序而非并行

每个产物依赖上一个：

- 创业**想法**基于技术**洞察**——否则 LLM 可能生成与论文实际贡献无关的通用创业想法。
- **PRD** 基于具体**想法**——它深化的是这个特定产品，而不是对该技术的通用应用。
- **构建 prompt** 基于 **PRD**——它告诉 AI 编程助手构建*这个* MVP，而不是泛泛的东西。

并行调用会产生四个互不参照的独立产物。链式依赖就是核心功能。

## 缓存模式

与 Invest AI（ADR-008）和 Meal AI（ADR-001）相同：worker 写入，FastAPI 读取。

```
POST /api/startup/generate  →  worker 运行流水线 → status="ready"
GET  /api/startup?url=...   →  FastAPI 读缓存   → 返回产物
```

缓存键：`SHA-256(url)[:16]`。无 TTL——论文的技术贡献不会改变。通过 `POST /api/startup/regenerate` 手动刷新（仅限管理员）。

SQLite WAL 模式。单写入者（worker 进程）。FastAPI 并发读取不阻塞。与 Invest AI 的 `db_init.py` 使用完全相同的 PRAGMA 配置：

```python
conn.execute("PRAGMA journal_mode = WAL")
conn.execute("PRAGMA busy_timeout = 5000")
conn.execute("PRAGMA synchronous = NORMAL")
```

## Decision Ledger（ADR-003）

每个生成的创业计划写入一条决策记录：

```json
{
  "product": "research-startup-agent",
  "domain": "startup-plan/paper",
  "question": "What startup can I build from: https://arxiv.org/...",
  "recommendation": "<想法的前 500 字符>",
  "confidence": 0.65,
  "action_taken": null
}
```

`confidence: 0.65` 是固定基础值——来自论文的创业想法本质上是推测性的。当 `action_taken` 更新为"我要构建这个"时，置信度才会上升。这个更新就是反馈循环引擎将来要学习的数据。

## 与 Research AI 的区别

| | Research AI | Research-to-Startup |
|---|---|---|
| 输入 | 主题 | 特定 URL |
| 输出 | 学习路径 | 4 个创业产物 |
| 用户意图 | 学习某技术 | 从中构建产品 |
| LLM 调用次数 | 1–2 次（主题摘要） | 4 次（链式流水线） |
| 缓存键 | 用户 + 主题 | URL 哈希 |

相同的 XingAI 架构模式，不同的产品。

## 运行方式

```bash
# 从论文 URL 生成
OPENAI_API_KEY=sk-... python worker/worker.py \
  --url "https://anthropic.com/news/claude-science-ai-workbench"

# 作为 FastAPI 服务器运行
python worker/worker.py --serve
# POST /api/startup/generate  {"url": "..."}
# GET  /api/startup?url=...
```

**延伸阅读：** [ADR-001 仓库边界](https://github.com/xingaiapp/xingai-research-startup-agent/blob/main/docs/adr/001-repo-boundary.md) · [ADR-002 Worker Cache](https://github.com/xingaiapp/xingai-research-startup-agent/blob/main/docs/adr/002-worker-cache.md) · [ADR-003 Decision Ledger](https://github.com/xingaiapp/xingai-research-startup-agent/blob/main/docs/adr/003-decision-ledger.md)
