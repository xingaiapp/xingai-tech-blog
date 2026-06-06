# Research AI 的 Google OAuth：登录流程到底怎么工作

**日期：** 2026-06-06  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** [Research AI](https://research.xingai.app)  
**标签：** `oauth` `google-cloud` `next-auth` `vercel` `auth` `runbook`  
**语言：** [English](2026-06-06-research-ai-google-oauth-setup.md) · 中文

---

Research AI 允许游客免费使用已缓存的学习主题。Gmail 登录后，可以解锁不限次数的实时 AI research。

在 UI 上，这只是一个按钮：**Sign in with Google**。但在系统里，至少有四个部分必须对齐：

1. Google Cloud 管 OAuth client。
2. Vercel 管生产环境变量。
3. Auth.js / NextAuth 管 callback route。
4. Research AI 管产品规则：登录用户跳过 demo 实时次数限制。

任何一环不对，用户看到的通常只是一个笼统的登录失败。

## 先建立心智模型

OAuth 不是把 Google 密码交给我们的 app。它是一个 redirect 握手流程。

```text
用户
  -> Research AI /login
  -> Auth.js 生成 Google 授权 URL
  -> Google 让用户确认授权
  -> Google redirect 回 Research AI callback URL
  -> Auth.js 用 GOOGLE_CLIENT_SECRET 换取 token
  -> Research AI 建立 session
```

最关键的是 callback：

```text
https://research.xingai.app/api/auth/callback/google
```

这条 URI 必须出现在 Google Cloud 的 **Authorized redirect URIs** 里。协议、域名、路径、末尾斜杠都必须完全一致。

## 每个变量负责什么

`GOOGLE_CLIENT_ID` 用来标识这个 OAuth 应用。它不是特别敏感，但必须来自 Google Cloud 里同一个 OAuth client。

`GOOGLE_CLIENT_SECRET` 用来证明服务器有权限使用这个 OAuth client 去交换授权码。它是敏感信息，只应该放在服务端环境，比如 Vercel Production env 或本地 `.env.local`。

`AUTH_SECRET` 用来签名 Auth.js cookie 和 session token。

`AUTH_URL` 和 `NEXTAUTH_URL` 告诉 Auth.js 生产环境的标准域名。Research AI 使用：

```env
AUTH_URL=https://research.xingai.app
NEXTAUTH_URL=https://research.xingai.app
```

## Google Cloud 怎么设置

打开：

```text
https://console.cloud.google.com/apis/credentials
```

然后：

1. 选择拥有这个 OAuth client 的 Google Cloud project。
2. 进入 **Credentials**。
3. 在 **OAuth 2.0 Client IDs** 下，打开 Research AI 使用的 Web client。
4. 确认 Application type 是 **Web application**。
5. 在 Authorized JavaScript origins 里添加：

```text
https://research.xingai.app
```

6. 在 Authorized redirect URIs 里添加：

```text
https://research.xingai.app/api/auth/callback/google
```

7. 保存，并等待 Google 生效。通常几十秒到几分钟。

本地开发可以额外添加：

```text
http://localhost:3000/api/auth/callback/google
```

## Vercel 怎么设置

在 Vercel Production 环境变量里添加：

```env
AUTH_SECRET=<32+ character random string>
AUTH_URL=https://research.xingai.app
NEXTAUTH_URL=https://research.xingai.app
GOOGLE_CLIENT_ID=<Google OAuth web client id>
GOOGLE_CLIENT_SECRET=<Google OAuth web client secret>
```

Vercel env 改完后，必须重新部署。旧 deployment 不会自动读取新 env。

```bash
cd /Users/xing/Desktop/ai-projects-work-space/xingai-research-ai
vercel deploy --prod --yes --force
```

部署完成后应该看到：

```text
readyState: READY
Aliased: https://research.xingai.app
```

## Research AI 里的实现位置

Research AI 使用 Auth.js / NextAuth。

关键文件：

```text
auth.ts
lib/oauth-credentials.ts
lib/auth-config.ts
app/api/auth/[...nextauth]/route.ts
app/actions/auth.ts
app/login/page.tsx
```

OAuth client 会从这些变量里读取：

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_GOOGLE_CLIENT_ID
AUTH_GOOGLE_CLIENT_SECRET
```

只需要一组有效的 id/secret。不要把一个 Google Cloud OAuth client 的 id 和另一个 client 的 secret 混用。

## Research AI 如何使用登录身份

产品规则不是“先登录才能用”。规则是：

```text
已缓存主题免费。
匿名用户每天有限次实时 AI research。
Gmail / @xingai.app 登录用户跳过实时次数限制。
```

前端和 API 会在解析 session 后，通过类似 `X-User-Email` 的 header 传递身份。缓存命中的主题读取不受登录影响。

## 常见失败

### 1. 登录页提示添加 GOOGLE_CLIENT_ID / SECRET

说明当前 active deployment 没有读到完整 auth 配置。

先看：

```bash
vercel env ls
```

然后重新部署：

```bash
vercel deploy --prod --yes --force
```

### 2. 登录页显示 “Sign-in failed”

说明 app 已经有部分 auth 配置，但 Google 拒绝了 OAuth 握手。

最常见原因：

- Google Cloud 没有添加 Authorized redirect URI。
- redirect URI 用了 `http`，生产环境应该是 `https`。
- 生产环境 redirect URI 仍然是 localhost。
- `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET` 来自不同 OAuth client。
- Vercel env 改了，但没有重新 deploy。
- `research.xingai.app` 还 alias 到旧 deployment。

### 3. curl 直接 POST 出现 `MissingCSRF`

这是正常的。Auth.js 的 sign-in endpoint 需要先拿 CSRF token 和 cookie。

浏览器点击按钮时会自动处理。

### 4. Vercel 已 Ready，但域名还是旧页面

检查 deployment：

```bash
vercel inspect <deployment-url>
```

确认 aliases 包含：

```text
https://research.xingai.app
```

如果没有，手动绑定：

```bash
vercel alias set <deployment-url> research.xingai.app
```

## Smoke Test

重新部署后：

```bash
curl -I https://research.xingai.app/login
```

预期：

```text
HTTP/2 200
x-matched-path: /login
```

然后在浏览器测试：

1. 打开 `https://research.xingai.app/login`。
2. 点击 **Sign in with Google**。
3. 应该进入 Google account chooser。
4. 授权后回到 Research AI 首页。

## 经验总结

OAuth 失败看起来像 UI bug，但大多数时候是配置契约不一致。

Research AI 的契约是：

```text
Google Cloud redirect URI
  == Auth.js callback route
  == Vercel production domain
  == active deployment alias
```

这四件事一致以后，Google 登录就应该变得很无聊。无聊，就是生产系统最好的状态。

