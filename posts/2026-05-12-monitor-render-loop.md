# The Monitor That Wouldn't Stop Refreshing — A React Effect Loop Postmortem

**Date:** 2026-05-12
**Project:** Invest AI · `stock-ai-monitor`
**Tags:** `react` `hooks` `useeffect` `bugfix` `postmortem`  
**Languages:** English · [中文 ↓](#中文)

## What the user saw

A friend was testing our ops control plane — a small Next.js dashboard called **stock-ai-monitor** that lets us start, stop, and watch four services (frontend, backend, market-data worker, Ollama). They clicked **Start Worker** and reported back:

> "The monitor screen keeps refreshing and shaking. Scary."

The worker tile turned green. The worker process was actually running fine — we confirmed it from the log file. But the page itself was jumping up and down rapidly, several times per second.

This is the story of a classic React `useEffect` footgun, hidden behind an `exhaustive-deps`-approved dependency array, that turned a one-click action into a self-driving render storm.

## The component

`monitor-client.tsx` is the client component that renders the four service tiles. It does three things on a timer:

1. Poll service status every 20 minutes (`refresh`).
2. Poll system insights (CPU/memory) every 20 minutes (`refreshInsights`).
3. Auto-restart any service whose "Auto" toggle is on, every 60 seconds (`autoRestartTick`).

All three live inside a single `useEffect` that runs once on mount and tears down on unmount. Or so we thought.

```tsx
useEffect(() => {
  let statusId, insightsId, autoId

  const startTimers = () => {
    statusId = setInterval(() => void refresh(), STATUS_POLL_MS)
    insightsId = setInterval(() => void refreshInsights(), STATUS_POLL_MS)
    autoId = setInterval(() => void autoRestartTick(), AUTO_RESTART_POLL_MS)
  }

  // initial fetches
  void refresh()
  void refreshInsights()
  void refreshRunConfig()
  startTimers()

  document.addEventListener("visibilitychange", onVisibility)
  return () => {
    document.removeEventListener("visibilitychange", onVisibility)
    clearTimers()
  }
}, [autoStartWithRetries, refresh, refreshInsights, refreshRunConfig])
```

`refresh`, `refreshInsights`, and `refreshRunConfig` are all `useCallback(..., [])` — stable references. The fourth dependency, `autoStartWithRetries`, is where things go wrong.

## The chain of instability

```tsx
const autoStartWithRetries = useCallback(
  async (serviceId, reason) => { /* reads data?.services */ },
  [data?.services, runAction]
)

const runAction = useCallback(
  async (service, action) => { /* ... */ },
  [addHistory, data?.services, refresh, runConfig?.services]
)
```

Both callbacks depend on `data?.services`. Whenever we call `setData(...)`:

- A new `data` object is created.
- `data?.services` becomes a new array reference.
- `runAction` is recreated.
- `autoStartWithRetries` is recreated.
- The polling `useEffect` re-runs.

And what does the polling `useEffect` do on its first line of work? It fires off three fetches:

```tsx
void refresh()
void refreshInsights()
void refreshRunConfig()
```

`refresh` calls `setData(body)` on success. Which means:

```
refresh() → setData() → new data.services → new runAction
        → new autoStartWithRetries → effect re-runs → refresh()
```

A self-driving loop. On localhost, where each round trip is a few milliseconds, this fires 5–10 times per second. Each iteration re-renders the entire monitor tree.

## Why the symptom looked like "page shaking"

A re-render alone is invisible if nothing changes on screen. But every iteration was producing slightly different output:

- The `checkedAt` timestamp on every service changed each tick.
- Service detail strings flipped between transient states (`"Port 3000 is not listening"` → `"HTTP 200 at http://localhost:3000"` → `"Port 3000 is listening"`).
- The footer "Last fetched at" timestamp updated continuously.

Different strings have different rendered widths and wrap differently in narrow columns. Combined with the LED pulse animation (a fast 0.65-second scale animation on the "working" state), the page produced the visual impression of jumping up and down.

The loop was technically live the whole session, but it became dramatic right after clicking Start because the action handler also called `setData(...)`, which fed straight into the cycle, and the worker's startup produced a flurry of changing detail strings.

## Why `exhaustive-deps` didn't save us

ESLint's `react-hooks/exhaustive-deps` rule checks that every value the effect reads is listed in the dependency array. Our dependency array was correct *by that rule*. The lint rule cannot detect that `autoStartWithRetries` is itself unstable, or that the effect updates state the callback depends on. Both conditions together create the loop.

This is the gap I want every React developer to remember:

> `exhaustive-deps` guarantees **completeness**. It does not guarantee **stability**. Effects that perform `setState` for state their dependencies read are loops waiting to happen.

## The fix

Move `autoStartWithRetries` behind a ref, then mark the polling effect as mount-only.

```tsx
const autoStartWithRetriesRef = useRef<
  ((id: ServiceId, reason: "checked" | "poll") => Promise<void>) | null
>(null)

useEffect(() => {
  autoStartWithRetriesRef.current = autoStartWithRetries
}, [autoStartWithRetries])

useEffect(() => {
  // ...
  const autoRestartTick = async () => {
    // ...
    const auto = autoStartWithRetriesRef.current
    if (auto) await auto(s.id, "poll")
  }
  // ... startTimers, listeners, initial fetches ...
  return () => { /* cleanup */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

The effect now runs exactly once. The auto-restart tick still uses the latest version of `autoStartWithRetries` via the ref, because we update the ref in a separate, cheap, dependency-only effect.

We disable `exhaustive-deps` with a comment that explains why — because doing it silently is also a bug-shaped pattern. Future readers see "intentional, not forgotten".

## Verification

Open the browser DevTools → Network tab → filter `system-monitor`.

| | Before | After |
|---|---|---|
| Idle | Many requests per second | 1 on load, then every 20 minutes |
| After Start Worker | A storm | 1 action + 1 settle, then quiet |
| Visible page jitter | Severe | None |

## Lessons

1. **`useRef` is the correct tool for "latest callback inside a long-lived effect."** When you want a `setInterval` or event listener to call into your component's current state without restarting the timer, refs are the canonical pattern.

2. **Mount-only effects are not anti-patterns.** A polling/subscription effect that runs once is exactly right — provided you have a story for accessing fresh state inside it.

3. **Be suspicious whenever an effect calls `setState` *and* depends on a callback that reads that state.** This is the structural shape of the loop.

4. **Comment your `eslint-disable`s.** Future-you (and your friends in 2 a.m. debugging sessions) will thank you.

5. **Watch transitive dependencies.** `autoStartWithRetries` looked harmless. The actual instability lived one hop away in `runAction`. Always trace the chain to ground.

## Code

- The patched file: [`stock-ai-monitor/components/monitor-client.tsx`](https://github.com/xingaiapp/xingai-invest-ai/blob/main/stock-ai-monitor/components/monitor-client.tsx) (private repo — link for context)
- Internal bug record with the full diagnostic: kept in `xingai-invest-ai/docs/bugs/2026-05-12-monitor-render-loop.md`

---

# 中文 · 监控页不停刷新 — React Effect 循环复盘

**语言：** [English ↑](#the-monitor-that-wouldnt-stop-refreshing--a-react-effect-loop-postmortem) · 中文

---

## 用户看到什么

朋友在测运维控制台 **stock-ai-monitor** — 用来启停、观察四套服务（前端、backend、行情 worker、Ollama）。点了 **Start Worker** 后反馈：

> 「监控屏一直在刷新、抖，吓人。」

Worker 瓦片变绿，进程其实正常 — 日志也确认了。但页面每秒跳好几次。

这是一个藏在「`exhaustive-deps` 也挑不出毛病」的依赖数组里的经典 `useEffect` 坑：一次点击触发自我驱动的渲染风暴。

## 组件在做什么

`monitor-client.tsx` 用定时器做三件事：每 20 分钟轮询服务状态、轮询系统洞察、每 60 秒对开了 Auto 的服务尝试自动重启。三者在一个「挂载时跑、卸载时清理」的 `useEffect` 里 — 我们以为如此。

依赖含 `autoStartWithRetries`，而它通过 `runAction` 依赖 `data?.services`。每次 `refresh()` → `setData()` → 新 `data.services` → 新 callback → **effect 重跑** → effect 开头又 `refresh()` → 循环。本地往返快时每秒 5–10 次。

## 为何像「页面在抖」

每次迭代 `checkedAt`、服务 detail 字符串、页脚时间戳都变，窄列里换行宽度变；加上 working 状态的 LED 脉冲动画，视觉上像上下跳。点 Start 后更明显，因为 handler 也 `setData`，且 worker 启动期 detail 字符串狂变。

## 为何 exhaustive-deps 没救

规则保证依赖**完整**，不保证依赖**稳定**。effect 既 `setState` 又依赖读该 state 的 callback — 就是待爆的环。

## 修复

`autoStartWithRetries` 放进 ref；轮询 effect **仅挂载跑一次**（带注释的 eslint-disable）。ref 在单独 effect 里更新，interval 里始终调最新逻辑。

## 验证

Network 里 `system-monitor`：改前空闲也每秒多条；改后加载 1 次再每 20 分钟。Start Worker 后 1 次 action + 1 次 settle，然后安静。

## 教训

1. 长生命周期 effect 里要「最新 callback」→ **`useRef`**
2. 仅挂载一次的轮询/订阅 effect 没问题 — 要有拿新 state 的故事
3. effect 既 set 又依赖读该 state 的 callback → 怀疑环
4. **`eslint-disable` 要写原因**
5. 追**传递依赖** — 不稳定往往在上一跳

---

*Part of the [XingAI Tech Blog](../README.md). We publish bug postmortems alongside architecture posts because the engineering reality of building AI products is shaped at least as much by the small mistakes we catch as by the big decisions we make.*
