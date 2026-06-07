# Research AI 如何处理假数据：先有来源 URL，再做 AI 合成

**日期：** 2026-06-07  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `research-ai` `fake-data` `worker` `cache` `openai` `source-verification`  
**语言：** [English](2026-06-07-research-ai-fake-data-boundary.md) · 中文

---

Research AI 里发现了一个不该出现的模式：有些 UI 看起来像事实数据，但背后没有原始来源。

最明显的是 **Hot discussions**。它显示平台、作者、互动数和引用句子。用户看到会以为是真实帖子。其实不是，那是 OpenAI 生成的代表性讨论摘要。

这在 research 产品里不能接受。

## 规则

LLM 可以做合成。它不能做事实来源。

所以我们把 pipeline 改成这样：

```text
Worker 抓真实来源 URL
  → OpenAI 只基于这些来源做总结
  → Worker 校验输出里的 URL
  → Worker 写 SQLite cache
  → FastAPI 读 cache
  → Next.js 渲染缓存字段
```

FastAPI 不调用 OpenAI。Next.js 不生成 fallback answer。缓存 miss 时，API 只入队，让 worker 处理。

## 我们删掉了什么

这次删掉/停用了几类容易制造假数据的路径：

- Next.js serverless 直接调用 OpenAI。
- Demo research payload。
- 静态 trending topic 列表。
- Next.js 本地 topic warmer。
- AI 生成的“讨论引用”、假作者、假点赞数。
- “如果不知道真实 URL，就给 Google search URL” 这种 prompt。

最后一点很关键。Google search URL 不是来源，它只是找来源的入口。

## 新的数据边界

OpenAI 写 verdict 之前，worker 先从真实端点收集候选来源：

- Hacker News Algolia API
- arXiv API
- Wikipedia API

worker 把这些候选作为 `allowed_sources` 传给 OpenAI。

生成之后，worker 再校验一遍：每个 `sources[].url` 必须来自 worker 之前抓到的 URL。模型编出来的链接会被丢掉。如果最后没有可验证来源，worker 直接失败，不写缓存。

宁可没有结果，也不要漂亮的假结果。

## Hot discussions 也改了

我们不再假装自己拿到了原帖。

现在 UI 只给可核实入口：

- X live search
- Hacker News search
- Reddit search

没有编造作者。没有编造引用。没有编造互动数。

看起来没那么“满”。但它诚实。

## 缓存过期怎么办

Research 内容会变旧。FastAPI 读缓存时会检查年龄。如果结果太旧，就不再把旧 payload 当新结果返回。

流程变成：

1. FastAPI 判断 cache stale。
2. FastAPI 入队 `force_refresh`。
3. Worker 重新抓来源 URL。
4. Worker 带来源调用 OpenAI。
5. Worker 覆盖 SQLite cache。

边界不变：FastAPI 只读和入队，worker 负责计算。

## 现在的检查清单

任何 AI 生成内容上线前，先问：

- 这个结论有没有 URL？
- URL 是代码从真实来源抓到的，还是模型自己说的？
- prompt 是否限制模型只能引用这些 URL？
- 输出里不在允许列表的链接，会不会被拒绝或丢弃？
- cache stale 后是否会触发 worker refresh？
- UI 有没有把搜索入口伪装成原帖引用？
- 有没有 demo fallback 可能跑到生产？

有一项说不清，就还不能 ship。

## 更大的教训

假数据通常不是从恶意开始的。它往往只是一个捷径：“先让 UI 看起来完整。”

但 AI 产品里，这个捷径很危险。一个漂亮的假数据，比空状态更糟，因为用户会信。

Research AI 的边界现在很简单：

**先有来源，再合成，再写缓存，最后渲染。**
