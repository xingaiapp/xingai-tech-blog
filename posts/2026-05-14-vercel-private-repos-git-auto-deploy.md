# Vercel Git Auto-Deploy Is Not Limited to Public Repositories

**Date:** May 14, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** Platform (Vercel + GitHub) · applies across [XingAI](https://xingai.app) apps  
**Tags:** `vercel` `github` `deployment` `private-repository` `devops` `ci`  
**Languages:** English · [中文 ↓](#中文)

---

## The misconception

It is easy to assume that **“Connect Git Repository”** on Vercel only works for **public** GitHub repos — especially when your dashboard still shows **Connect Git** because you have been shipping with **`vercel deploy`** instead of wiring Git. Visibility of the repo and wiring of the integration are different concerns.

**Fact:** Vercel can attach to **both public and private** repositories. Private repos simply require an explicit grant so Vercel’s GitHub App is allowed to read the code that triggers builds.

## How it actually works

### Public and private

In the Vercel project, **Connect Git Repository** lets you pick a GitHub repo. That repo may be **public** or **private**. After a successful connection, pushes to the configured production branch (commonly `main`) trigger production deployments (and other branches/PRs can open preview deployments, depending on your settings).

### Private repositories — one extra permissions step

1. **Install the Vercel GitHub App** on the GitHub account or organization that owns the private repo.
2. During installation (or later under **GitHub → Settings → Applications**), **grant access** to the specific private repository — or to **all repositories**, depending on your security policy.
3. If the GitHub **organization** restricts third-party applications, an owner may need to approve Vercel under **Organization settings → Third-party access** (wording can vary slightly by GitHub UI version).

Until Vercel can list and clone that private repo, the connect flow will fail or stay incomplete — that is a **permissions** issue, not “private repos are unsupported.”

### Independent from the Vercel CLI

**Git-connected auto-deploy** and **`vercel deploy`** are separate paths:

| Mechanism | What triggers a build |
|-----------|------------------------|
| **Git integration** | A **git push** (or merge) to a branch Vercel watches |
| **CLI** | You run **`vercel deploy`** (or **`vercel deploy --prod`**) from a machine with the project linked |

You can use **CLI only**, **Git only**, or **both**. Using the CLI does not automatically hide the “Connect Git” prompt — it simply means you have not enabled push-driven builds yet.

## One-line takeaway

**Auto-deploy on push is not restricted to public repos.** For private repos, connect Vercel to GitHub and **grant the Vercel GitHub App access to that repository** (and satisfy any org third-party policies). Public vs private affects **authorization**, not whether the feature exists.

---

## Further reading

- Invest AI runbook (includes **Git vs CLI** for shipping without dashboard Git connect): [`xingai-invest-ai` `docs/deploy/release-runbook.md`](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/deploy/release-runbook.md)  
- Vercel’s own docs on Git integration and permissions update over time — verify **Install & authorize** steps in the current Vercel + GitHub documentation when you wire a new org.

---

# 中文 · 私有仓库也能用 Vercel Git 自动部署

**语言：** [English ↑](#vercel-git-auto-deploy-is-not-limited-to-public-repositories) · 中文

---

## 一句话

**Vercel 的「push 就自动部署」不限于公开仓库** — **私有（private）仓库也可以**，只要在 GitHub 侧完成 **Vercel GitHub App** 的安装与授权。是否自动部署，取决于 **有没有在 Vercel 里 Connect Git** 以及 **Vercel 能否读该仓库**；与 public / private **无必然关系**（私库只是多一步权限）。这和 **`vercel deploy` CLI 手动发版** 是两条独立路径。

## 常见误解

很多人以为 Vercel 的 **Connect Git Repository** 只对 **公开** GitHub 仓有效 — 尤其当你一直用 **`vercel deploy`** 发版、仪表盘仍显示 Connect Git 时。仓库可见性和是否接入 Git 是两回事。

**事实：** Vercel 可连接 **公开或私有** 仓库。私有仓只需明确授权，让 Vercel GitHub App 能读触发构建的代码。

## 实际怎么工作

### 公开与私有

在 Vercel 项目里 **Connect Git Repository** 可选公开或私有仓。连接成功后，推送到配置的生产分支（常见 `main`）会触发生产部署；其他分支/PR 可按设置出预览部署。

### 私有仓库 — 多一步权限

1. 在拥有该私有仓的 GitHub 账号或组织上**安装 Vercel GitHub App**
2. 安装时（或之后在 **GitHub → Settings → Applications**）**授权**该私有仓，或按安全策略授权**全部仓库**
3. 若组织限制第三方应用，所有者可能需在 **Organization settings → Third-party access** 批准 Vercel

在 Vercel 能列出并 clone 该私有仓之前，连接会失败或未完成 — 这是**权限**问题，不是「不支持私有仓」。

### 与 Vercel CLI 无关

| 机制 | 触发构建的方式 |
|------|----------------|
| **Git 集成** | **git push**（或 merge）到 Vercel 监听的分支 |
| **CLI** | 在本机对已 link 的项目执行 **`vercel deploy`**（或 **`--prod`**） |

可只用 CLI、只用 Git、或两者并存。用 CLI 不会自动隐藏「Connect Git」提示 — 只是你还没开 push 驱动部署。

## 一句话收束

**按 push 自动部署不限制公开仓。** 私有仓请连接 Vercel 与 GitHub，并**授予 Vercel GitHub App 对该仓库的访问**（并满足组织第三方策略）。公开 vs 私有影响的是**授权**，不是功能是否存在。

## 延伸阅读

- Invest AI 发布手册（含未接 Git 时的 **Git vs CLI**）：[`xingai-invest-ai` `docs/deploy/release-runbook.md`](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/deploy/release-runbook.md)
- 新组织接线时以当前 Vercel + GitHub 文档中的 **Install & authorize** 为准。
