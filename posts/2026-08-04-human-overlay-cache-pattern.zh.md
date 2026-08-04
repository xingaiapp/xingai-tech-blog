# 中文 · Human Overlay Cache：能在再跑 verify 后活下来的人审写入

**日期：** 2026-08-04  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** XingAI Engineering System · Evidence Engine  
**标签：** `patterns` `worker-cache` `human-in-the-loop` `evidence` `decision-boundary`  
**语言：** [English](2026-08-04-human-overlay-cache-pattern.md) · 中文

---

## 看起来像功能的 bug

校验器上线了。仪表盘有 Accept / Reject。工程师在 verify JSON 上打了 `review=accepted`。下一次 CLI 覆盖缓存。人工工作消失。信任也没了。

## 规则

把人的决定放在与 Worker 载荷**不同的缓存键**里。

```txt
Worker 写入   →  v1:verify:{id}
人 写入       →  v1:review:{id}
GET 合并      →  两个都读，overlay 到响应
再跑 Worker   →  覆盖 verify；review 键留下
```

API 可以写 review / skill 批准回滚 / 鉴权元数据。API 不得抓 URL、调 LLM、或改门控指标。

Evidence Engine ADR-009 验证。模式文件：`xingai-engineering-system/patterns/human-overlay-cache.md`。

## 常见错误

- 原地 PATCH verify
- 在不能写的静态 demo 上显示 Accept
- 把已批准 skill 自动合进抽取代码
- 把 overlay 字段塞进 EEE 分母

## 要点

人审是产品状态，不是 verify 字段。分键保住原则 1 和审计轨迹。

**延伸阅读：** Evidence Engine ADR-009 · engineering-system `human-overlay-cache`。
