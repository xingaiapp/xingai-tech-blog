# 中文 · 监控页不停刷新 — React Effect 循环复盘

**日期：** 2026-05-12
**项目：** Invest AI · `stock-ai-monitor`
**标签：** `react` `hooks` `useeffect` `bugfix` `postmortem`
**语言：** [English](2026-05-12-monitor-render-loop.md) · 中文

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
