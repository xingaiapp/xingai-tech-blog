# 单人管理员、真实权限：为什么我们先不做 SMS，而是规划 Email OTP

**日期：** 2026-06-08  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Invest AI](https://invest.xingai.app)  
**标签：** `invest-ai` `auth` `admin` `otp` `mfa` `security` `design`  
**状态：** 设计笔记 — 尚未实现  
**语言：** [English](2026-06-08-invest-ai-admin-second-factor-email-otp.md) · 中文

---

Invest AI 的管理员能力不是演示开关。登录后的运维可以：

- 读取 worker 预计算的交易决策与宏观叠加层，
- 排队双语 PDF 报告并发送到真实订阅邮箱，
- 写入与 worker 投递绑定的通知偏好。

JWT 泄露已经够糟。我们开始问：**管理员高危操作是否该有第二因子，且大约每 30 天复核一次？**

简短结论：**要，但不必急着上 SMS。**  
对 **单人自用、自托管** 场景，更划算的是：**向配置的运维邮箱发 Email OTP**。

## 现状

我们正在 `invest.xingai.app` 上线 Supabase Google OAuth。任何过渡期的运维测试路径写在产品仓库的 **私有 runbook** 里——**不会**写进这篇公开博文。

下文 MFA 讨论的是 **主登录上线之后** 叠加的 step-up 层。

## SMS OTP 为什么诱人（以及问题在哪）

短信验证码很常见：

- JWT 泄露了，攻击者还得有手机，
- 30 天复核一次，单人运维能接受，
- Twilio 看起来便宜（大约 $0.01/条）。

单人管理后台，接入成本确实低。

但威胁模型不客气。SMS 是常见 2FA 里 **最弱** 的一档。SIM-swap 骗运营商把号码转走，不是都市传说。对我们这种能 **向真实用户发市场 PDF**、能接触决策缓存语义的系统，这个风险不能当背景噪音。

## 方案对比

| 方案 | 安全性 | 实现成本 | 适合单人 admin？ |
|------|--------|----------|------------------|
| SMS OTP（Twilio） | 中 | 低 + 按条计费 | 可以，但有 SIM-swap 面 |
| TOTP（Google Authenticator） | 高 | 低（库即可） | 很好，前提是手机在手 |
| **Email OTP**（运维邮箱） | 中 | **极低**（复用 Resend/worker 邮件） | **当前性价比最高** |
| WebAuthn（指纹 / Face ID） | 最高 | 中（浏览器 API + 备用码） | 长期最佳，零件更多 |

Email OTP 不完美。邮箱被盗同样是真风险。但运维邮箱可以放在 Google Workspace（或同类）后面——而且我们 **本来就有** 定时报告邮件管道。

SMS 要多一个供应商、密钥、账单和送达排查，对这个场景增益有限。

## 推荐形态：Email OTP

**触发：** 管理员 JWT 超过 30 天（查 `iat`），或新浏览器配置下首次登录。

**流程：**

```text
管理员通过主认证（Google / Supabase JWT）
  -> FastAPI 发现会话超过 30 天
  -> POST /api/v2/admin/request-otp
  -> Worker 或 FastAPI 向配置的运维邮箱发 6 位验证码
  -> 管理员在 /admin/verify 输入
  -> POST /api/v2/admin/verify-otp
  -> SQLite KV：admin:otp:{email}，TTL 30 分钟
  -> 短期 step-up 标记，再允许手动触发报告
```

**KV 草图：**

```text
admin:otp:{email}     -> { code_hash, expires_at }
admin:stepup:{email}  -> { verified_at, expires_at }   # 可选第二个 key
```

验证码要哈希存储，明文不落库。按邮箱和 IP 限速。

## 真要动手时会改哪里

| 层 | 改动 |
|----|------|
| **FastAPI** | `POST /api/v2/admin/request-otp`、`POST /api/v2/admin/verify-otp` |
| **SQLite KV** | OTP + 过期时间（与报告触发 flag 同一套存储） |
| **Worker / 邮件** | 复用 `daily_report_*` 的 Resend 路径 |
| **前端** | 登录后 step-up 页；未验证前拦截 `/reports` 手动触发 |

核心 OTP 生成 + 写入 + 校验，粗估 **二十行级别**——再加路由、限速和 UI。难点在接线与测试，不是发明密码学。

## 现阶段不做的事

- 不上 SMS 供应商，除非威胁模型变了（多管理员、只能 SMS、合规租户等）。
- step-up v1 不做 WebAuthn——OAuth 稳定后再上。
- 过渡期运维测试路径会在生产登录端到端验证后下线。

## 当前决策

| 选项 | 结论 |
|------|------|
| SMS OTP | 暂缓 — 多供应商 + SIM-swap 类风险 |
| TOTP | 强备选；愿意随身 authenticator 就上 |
| **Email OTP** | **规划实现** — 单人 admin step-up |
| WebAuthn | Email OTP 之后再瞄准 |

如果你今天就是 Invest AI 的唯一运维：先把 **Supabase Google 登录** 做完，再考虑 **Email OTP step-up**，然后再谈把 admin 面开放给第二个人。

---

**免责声明：** 本文记录工程方案讨论，不构成安全咨询，也不承诺固定上线日期。生产落地前请自行评估威胁模型与合规要求。

**延伸阅读：** Invest AI [ADR-023](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/023-frontend-session-token-resolution.zh.md)（前端会话解析）、[ADR-022](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/022-pdf-report-delivery-triggers.zh.md)（报告触发）。公开安全清单：[docs/PUBLIC-SECURITY.md](../docs/PUBLIC-SECURITY.md)。
