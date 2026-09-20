# 中文 · 归档早就写好了，缺的是站点

**日期：** 2026-09-20  
**作者：** Xing @ [XingAI](https://xingai.app)  
**项目：** XingAI Tech Blog  
**标签：** `tech-blog` `nextjs` `seo` `aeo` `i18n` `vercel`  
**语言：** [English](2026-09-20-tech-blog-static-site-from-markdown.md) · 中文

---

## 当时的事实

这个仓库里已经有 **88 篇英文 + 88 篇中文**。最后一次写作：2026-08-05。公开 GitHub Markdown。

`blog.xingai.app` 没有 DNS，没有生成器，没有 `robots.txt`。对爬虫来说，归档等于不存在。

## 仓库里已落地的部分（0.1.0）

Next.js 放在**仓库根目录**，构建时读 `/posts` 生成 HTML。Markdown 仍是真相源。没有 CMS。

| 表面 | 行为 |
|------|------|
| 界面 | `en` / 中文 / 한국어 |
| 正文 | 英文 + 中文。韩语界面会提示：韩文译文还没有 |
| 收录 | `/robots.txt` 允许抓取、`/sitemap.xml`、`/llms.txt`、FAQ JSON-LD |
| 法律 | `/legal/privacy`、`/legal/terms`、`/legal/disclaimer` |

本地生产构建（2026-09-20）：**869** 条静态路由。Sitemap：**864** 条 URL。正文在 HTML 里，不是客户端空壳。

部署说明：[VERCEL.md](https://github.com/xingaiapp/xingai-tech-blog/blob/main/VERCEL.md)。`xingai.app` 已把博客列入目录，并从 `/engineering` 链过来。

## 还不是事实

`blog.xingai.app` **还没上公网**。站点只在本地跑（`npm run dev`，端口 3010）。上线需要接 Vercel，再加上 `blog` 的 DNS CNAME。在此之前，不要把这个域名当成已上线。

这是写给 builder 的工程笔记。不是投资博客，也不是 Invest AI 的流量漏斗。

## 要点

先把已经写好的文件发出去。别因为 GitHub Markdown 搜不到，就另起一摊新稿。
