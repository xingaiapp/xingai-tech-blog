# 上线审批队列看板（顺带撞上一堵没人预警的 TypeScript 7 墙）

**日期：** 2026 年 7 月 11 日
**作者：** Xing @ [XingAI](https://xingai.app)
**项目：** XingAI Agent Firewall
**标签：** `agent-security` `nextjs` `typescript` `human-in-the-loop` `governance`
**英文版：** [English](2026-07-11-agent-firewall-approval-dashboard-ships.md)

---

[ADR-003](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/003-approval-workflow-ledger.zh.md) 在 PRD 里就定好了四个一键审批操作。[ADR-005](2026-07-11-agent-firewall-deny-add-rule-adr-005.zh.md) 给第四个按钮补上了后端。但 UI 本体一直只停在文档里——一行前端代码都没有。这次把它做出来了。

## 上线了什么

两个页面，都是直接轮询策略引擎的客户端组件（没有服务端代理——按 README 一直承诺的 local-first 路线）：

- **`/`** —— 审批队列。每个挂起的 `review` 调用一张卡片：领域、风险分、触发信号、四个按钮（批准一次 / 本 session 批准 / 拒绝 / 拒绝并加规则）。每 2 秒轮询一次 `/pending`。
- **`/rules`** —— ADR-005 的落地面。未解决的规则建议（带一个"已解决但保留 pin"的退路），加上钉住列表，一键 unpin。

引擎这边加了 CORS：固定的 `localhost:3000` 白名单，不用通配符、不带凭证——dashboard 和引擎是同一台机器上的两个不同源，不是一个公网 API。

## 那堵墙

`npm install` 装了当前最新稳定版依赖，其中包括 `typescript@7.0.2`。`next build` 编译没问题，跑到"Running TypeScript"这一步直接崩：

```
The "id" argument must be of type string. Received undefined
Next.js build worker exited with code: 1 and signal: null
```

没有指向自己代码的堆栈。第一个怀疑对象是个烟雾弹：Next 警告"检测到多个 lockfile"，因为这个仓库放在一个更大的 monorepo 检出目录里，外层自己有一个 `package-lock.json`，Next 选错了 workspace root。在 `next.config.ts` 里锁定 `turbopack.root` 后警告消失了——崩溃没动。

真正的原因是：**Next 16.2.10 内部的 TypeScript 集成还没适配 TypeScript 7 那套重写过的（原生/Go）编译器。** 每次构建都会去"检测"TypeScript，检测失败，重新安装，再以同样的方式崩掉。锁定到 `typescript@6.0.3`——7 之前的最后一个稳定版——第一次重试就过了。

这里的教训不是这两个具体版本号，而是排查顺序：当一个框架自己的内部工具集成抛出一个不透明的底层错误时，先检查自己是不是抓到了一个框架还没跟上的大版本——而不是先在自己的配置里追烟雾弹。Lockfile 的警告是真的，但跟崩溃无关；真正的修复从头到尾就是锁一个版本号的事。

## 有验证，不是只"能构建"

这次会话没有连上 Chrome 扩展，没法做真正的点击测试。退而求其次：对着一个真实跑起来的引擎和真实的 SQLite，直接调用每个按钮背后实际会发出的那个 HTTP 请求——不是 mock。

```
POST /check         (0din 类调用)            → 风险 60，挂起进 review
POST /deny/{id}      {"add_rule": true}       → 返回 pinned_deny_id + rule_suggestion_id
POST /check          (同一条调用再来一次)      → 风险 100，deny，0.008 秒——不再进队列等待
POST /rule-suggestions/{id}/resolve           → 建议标记已解决，对应的 pin 一并移除
```

每一步都跟 ADR-005 纸面设计的一致。这是对接线逻辑的真实验证——唯一没能补上的一环，是确认这几个按钮在真实浏览器里点击时的渲染和交互效果。

## 还没做的

审计/历史视图（PRD Week 3），以及给 `/pending` 里的文件写入调用加 diff 风格预览（ADR-003 提过，目前的 payload 里还没有前后内容对比）。两个都是有计划、没忘记，不是漏掉。

## 相关

- [ADR-005：拒绝并加规则](2026-07-11-agent-firewall-deny-add-rule-adr-005.zh.md)
- [ADR-004：按轮次污染跟踪](2026-07-11-agent-firewall-origin-provenance-adr-004.zh.md)
- [ADR-003：审批流 + Decision Ledger](https://github.com/xingaiapp/xingai-agent-firewall/blob/main/docs/adr/003-approval-workflow-ledger.zh.md)
