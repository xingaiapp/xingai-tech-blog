# 保存偏好不是投资决策：在不破坏 Worker 边界的前提下追踪股票

**日期：** 2026-06-08  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** XingAI Invest AI  
**标签：** `invest-ai` `sqlite` `fastapi` `worker-cache` `decision-boundary`  
**英文版：** [English](2026-06-08-invest-ai-user-scoped-tracking-worker-stale-ux.md)

---

金融决策系统里有两类完全不同的状态：

```text
决策状态：
  top signals、排名、风险、置信度、symbol overlays

偏好状态：
  追踪股票、通知开关、自定义 slots
```

把它们混在一起会产生 bug。更糟的是，系统会悄悄在决策引擎之外开始“做决策”。

我们在给 XingAI Invest AI 增加 **My Tracked Stocks** 时遇到了这个问题。

用户希望添加 `AVL`、`TSLL` 这样的代码。表面上很简单，但第一版暴露了两个设计问题：

1. 把“保存追踪股票”当成了需要 paid-style 认证的操作。
2. 把 worker 缓存过期显示成了大型红色前端错误。

两者都能理解，但都不是正确的产品行为。

## 必须保住的边界

Invest AI 有一条硬规则：

```text
Worker 计算决策。
FastAPI 读取缓存。
Frontend 渲染。
```

因此修复方案不能是：

- worker stale 时让 FastAPI 重新计算 top signals；
- 让 React 从 raw market fields 推断排名；
- 把追踪股票只存在浏览器里，导致 worker 无法读取。

追踪股票列表必须存在 SQLite，因为 worker 后续需要读取它来发送信号变化提醒。但保存一个 symbol 本身不是投资决策。

## 把问题拆成三条路径

最终我们把流程拆成三条路径：

```text
追踪股票
  用户偏好
  SQLite
  匿名或登录用户都可用

自定义 symbol slots
  paid/admin 权限
  需要认证
  SQLite slot 列表

AI 信号排名
  worker 决策输出
  SQLite 缓存
  FastAPI stale gate 保护
```

这个拆分就是架构。

## 匿名用户也需要后端身份键

产品支持匿名用户，所以给下面这个接口强制要求 Bearer token：

```text
POST /api/v1/signal-tracking/AVL
```

会在线上失败：

```text
Missing or invalid Authorization header
```

修复方案不是把数据存在 localStorage。修复方案是使用浏览器维度的后端 key：

```text
X-Client-Id: <stable browser id>
```

前端对匿名用户发送 `X-Client-Id`，有登录 token 时再发送 `Authorization: Bearer <jwt>`。FastAPI 这样解析 user key：

```python
if current_user:
    user_id = current_user["user_id"]
else:
    user_id = get_identifier_from_request(request)  # 优先 X-Client-Id
```

事实源仍然是 SQLite：

```text
user_notification_settings.tracked_symbols
```

浏览器 id 只是用来找到那一行数据。

## Admin 权限是授权，不是计算

我们还需要让配置的运维邮箱在没有付费账单的情况下测试 paid custom symbol slots。

收窄后的修复是在 Fly secrets 里配置逗号分隔的运维邮箱白名单。它只授予 custom slot entitlement，不授予 FastAPI 计算信号的权力。

即使是 admin：

- FastAPI 可以写 slot list；
- FastAPI 可以选择缓存输出；
- FastAPI 可以返回 `WORKER_DATA_STALE`；
- FastAPI 不可以拉 live market data 并现场生成决策。

这就是授权逻辑和决策逻辑的区别。

## Worker stale 是一种 UX 状态

当 worker 缓存过期时，FastAPI 正确返回：

```text
WORKER_DATA_STALE
```

Signals 页面最初把它显示成大型红色 “Failed to load signals”。但页面没有坏。追踪列表仍然有效。不可用的只是 worker 拥有的排名快照。

现在 UI 把它显示成降级状态：

```text
AI signals are waiting for a fresh worker cache.
Your tracked stocks remain saved below.
Signal rankings will return after the worker writes a fresh decision snapshot.
```

不伪造排名。不在前端推断。不在请求路径重算。只是诚实地展示状态。

## 设计教训

用户保存 `TSLL`，这是偏好。

系统说 `TSLL` 是买入，这是决策。

worker stale，这是运行状态。

三者应该在不同地方处理。

```text
SQLite preferences:
  追踪股票、通知开关

SQLite decision cache:
  top signals、排名、macro radar、overlays

FastAPI:
  user key 解析、偏好 CRUD、缓存读取

Worker:
  决策生成、stale 语义、提醒派发

Frontend:
  渲染已保存偏好并解释缓存状态
```

小 bug 是 “AVL 添加后不显示”。

真正的设计教训是：用户偏好应该容易保存，但决策智能必须很难被伪造。

**延伸阅读：** XingAI Invest AI repo 中的 ADR-020。
