# 从诚实 404 到缓存分数：Decision Engine 的第一版 Producer

Decision Engine API 最初发布时有一个刻意诚实的行为：如果没有 `daily_scores.v1.json` export，就返回 404。

这是正确边界。API 是 reader，不是 scoring engine。它不应该在 request 过程中拉市场数据、计算信号或临时发明 recommendation。

2026 年 7 月 14 日，`xingai-invest-decision-engine` 增加了这层 API 背后的第一版 research-grade producer：缓存 OHLCV 输入，ADR-011 score export 输出。

## 交付了什么

新的 scoring layer 分成两块：

- `scoring/scorer.py`：基于 OHLCV frame 和本地指标的确定性技术评分。
- `engine/report_generator.py`：Module 7 producer，从 `MarketDataCache` 读取并写出 `reports/daily_scores.v1.json`。

scorer 产出 action、confidence、多周期分数、risk gate 和 explanation 字段，形状贴合已有 score export contract。

report generator 不拉实时数据。它读取 cache、生成文件，并让 API 继续作为只读传输层。

## 仍然不是生产交易逻辑

这件事值得说清楚：这个 producer 是 research-grade。

它解锁 integration tests，也给下游系统一个真实 export 形状，但它不授权导入 Invest AI 生产环境，也不授权 live trading。ADR-009 backtest integrity 仍然掌握这个 gate。

这个边界让系统保持诚实：

- indicators 本地计算；
- scoring 发生在 API 读取之前；
- API 只服务 cached file；
- broker-facing 系统引用 cache snapshot；
- 人类仍然留在 approval path。

## 为什么这对 Robinhood MCP 重要

Robinhood MCP 的 G5 gate 需要引用 decision snapshot，而不是引用模型运行时的即兴判断。有了第一版 cached score producer，drill 现在可以指向真实的 `daily_scores.v1.json` artifact。

这是一个有用的里程碑。它让 pipeline 更端到端，但没有让它更自动交易。

## 验证

实现中增加了 scorer 和 report generator 的聚焦测试。实现时 Decision Engine 全量测试结果：`80 passed`。

下一步的硬活不是继续加 endpoint，而是 backtesting、promotion criteria、monitoring，以及证明一个 score 有资格从 research artifact 升级成 production input。
