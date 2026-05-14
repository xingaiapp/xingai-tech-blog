# Vercel Git Auto-Deploy Is Not Limited to Public Repositories

**Date:** May 14, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** Platform (Vercel + GitHub) · applies across [XingAI](https://xingai.app) apps  
**Tags:** `vercel` `github` `deployment` `private-repository` `devops` `ci`

---

## TL;DR（中文）

**Vercel 的「push 就自动部署」不限于公开仓库** — **私有（private）仓库也可以**，只要在 GitHub 侧完成 **Vercel GitHub App** 的安装与授权。  
是否自动部署，取决于 **有没有在 Vercel 里 Connect Git** 以及 **Vercel 能否读该仓库**；与 **public / private 无必然关系**（私库只是多一步权限配置）。这和 **用 `vercel deploy` CLI 手动发版** 是两条独立路径。

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
