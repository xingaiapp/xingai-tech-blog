# 共享 CPU、共享 SQLite：Invest AI 如何在不破坏 CQRS 的前提下把控制台跑快

CQRS 说：worker 拥有决策，FastAPI 只读缓存。用户仍在 `/dashboard` 上等好几秒。计算边界没问题，**读路径**有问题。

这篇写的是 [ADR-056](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/056-console-read-path-cdn-parallel-auth.zh.md) 与 [ADR-036 OHLCV 修正](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/036-worker-ohlcv-bars-cache.zh.md) 背后的工程故事。

## 慢的到底是什么

三层时钟叠在一起：

1. **Fly 争用。** 一颗 shared vCPU 跑 uvicorn 和 market-cache worker，共用一个 SQLite。刷新窗口里 `/api/v2/dashboard` 经常 **3–12 秒**。日志 `ohlcv_written≈67266`：历史没变也整窗重写。
2. **串行控制台。** 客户端先等登录再挂载其实只需公开缓存的页面；`no-store` + Bearer 让 CDN 中间件主动跳过。
3. **过期 HTML + 重 JS。** 黄金坑 1 小时 ISR 卡在全 D；dashboard 约 3700 行一个 chunk。

请求路径上并没有重算决策。等的是 Fly 在删写 K 线。

## 治理包

### 无身份公开 GET 走边缘

白名单 + `CDN-Cache-Control` / `Vercel-Cache-Tag`；无标的客户端请求去掉 Bearer 与 `no-store`。上线后 dashboard CDN HIT 约 **0.15s**。

### 登录与缓存并行

SSR `Promise.all(auth(), fetch缓存)`。访客仍见门；已登录不再先登录再拉数。

### 别重写没变的历史

OHLCV：仅空库 / 距全量 >24h / 检测到回溯调价时全量；否则约 5 天 upsert。生产强制跑：`written=3915`，`incremental=69`，约 18s。

### 投递细节

Dashboard `dynamic()` 薄壳；黄金坑 `revalidate=60` 且进页必再拉。

## 我们没做什么

- 缓存「感觉慢」就在 FastAPI 里重算引擎。
- 把按用户变化的响应塞进 CDN。
- 只靠升配机器假装解决写放大。

## 数字（老实写）

| 检查 | 之前（常见） | 之后（2026-09-30） |
|---|---|---|
| Dashboard 经 invest CDN | 多秒级打 Fly | ~0.15s HIT |
| 每轮 OHLCV 行数 | ~6.7 万 | 热后增量约 4k |
| 控制台 HTML 壳 | 参差 | 多数 TTFB 0.2–0.5s |

浏览器 hydrate 仍不免费。`/method`、`/plans` 404 是路由缺口。

## 链接

- 仓库：https://github.com/xingaiapp/xingai-invest-ai
- ADR-056：https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/056-console-read-path-cdn-parallel-auth.zh.md
- ADR-036：https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/036-worker-ohlcv-bars-cache.zh.md
- 设计文：https://github.com/xingaiapp/xingai-enterprise-ai-design/blob/main/articles/2026-09-30-shared-cpu-cqrs-edge-cache-vs-write-amplification.zh.md
- 产品：https://invest.xingai.app

免责声明：工程说明，仅供信息参考。不构成投资、法律或运维建议。
