# Meal AI：在没有后端的 Next.js 应用里实现 Decision Ledger

**日期：** 2026 年 7 月 3 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** [XingAI Meal Coach AI](https://github.com/xingaiapp/xingai-meal-coach-ai)
**标签：** `meal-ai` `nextjs` `decision-ledger` `api-routes` `无后端`
**English:** [English](2026-07-03-meal-ai-nextjs-decision-ledger-api-route.md)

---

Meal AI v4 是一个纯 Next.js 应用——没有 Python 后端，没有数据库，所有决策逻辑都在客户端的 TypeScript 里。[Decision Ledger schema](https://github.com/xingaiapp/xingai-engineering-system/blob/main/patterns/decision-ledger-schema.md) 要求在向用户展示推荐时写入一条记录。当你的产品没有后端时，如何采用这个跨产品模式？

Next.js API 路由。方法如下。

## 约束条件

Meal AI v4 没有 Python worker，没有 SQLite，没有 Supabase auth。技术栈：

```json
{
  "dependencies": {
    "next": "16.2.4",
    "react": "^19"
  }
}
```

没有 `better-sqlite3`，没有 Prisma，没有 ORM。决策逻辑（`decision-engine.ts`）在浏览器中运行。

## 解决方案：带进程内存储的 Next.js API 路由

```typescript
// app/api/decisions/route.ts

// 进程内存储 —— 以 session_id 为键 → Decision[]
const _store = new Map<string, Decision[]>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const decision: Decision = {
    id: `meal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    product: "meal-ai",
    domain: body.domain ?? "meal-plan",
    question: body.question,
    recommendation: body.recommendation,
    reasoning: body.reasoning ?? [],
    confidence: body.confidence ?? 0.4,
    action_taken: null,
    outcome: null,
    created_at: new Date().toISOString(),
    // ...
  };
  const rows = _store.get(body.session_id) ?? [];
  rows.push(decision);
  _store.set(body.session_id, rows);
  return NextResponse.json(decision, { status: 201 });
}
```

三个接口：`GET`（列表）、`POST`（记录）、`PATCH`（更新 `action_taken`）。全部使用进程内 Map 存储状态。

## 接入页面

当用户触发膳食决策时，前端发送一个即发即忘的 POST：

```typescript
function runQuickDecision() {
  setShowResult(true);
  // ... 滚动 ...

  const decision = getTodayDecision(userState);
  fetch("/api/decisions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionStorage.getItem("xingai_session") ?? "anon",
      domain: `meal-plan/condition/${decision.state.toLowerCase()}`,
      question: `膳食决策：${decision.mode} 模式，血压=${userState.bloodPressure}`,
      recommendation: decision.rules.join("; "),
      reasoning: decision.reason,
      confidence: decision.confidence,
    }),
  }).catch(() => {/* 非阻塞 */});
}
```

`.catch(() => {})` —— ledger 写入是非阻塞的。网络错误或服务器冷启动不影响用户体验。

## 权衡：进程内 vs. 持久化

进程内 Map 在服务器重启或冷启动时会重置。这是 v1 的刻意选择：

| 方案 | 持久性 | 复杂度 | v1 合适？ |
|---|---|---|---|
| 进程内 Map | 仅限会话 | 零 | ✅ 是 |
| `better-sqlite3` | 跨重启 | 中等 | 暂时不 |
| Supabase | 跨设备 | 高 | 以后再说 |

Schema 已经是正确的。当 Meal AI 获得后端时，把 `_store` 换成数据库是一个文件的改动。契约（schema 形状、接口路径、前端调用）保持不变。

## 这证明了什么

Meal AI 成为第二个 Decision Ledger 采用者（[ADR-003](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.md)）——验证了跨产品 schema 适用于：

- Python FastAPI 后端（Invest Decision Engine）
- 带 API 路由的 Next.js 客户端应用（Meal AI）

这个模式与框架无关。Schema 是契约，实现适配产品的技术栈。

**相关 ADR：** [Meal AI ADR-003：Decision Ledger 采用](https://github.com/xingaiapp/xingai-meal-coach-ai/blob/main/docs/adr/003-decision-ledger-adoption.md)
