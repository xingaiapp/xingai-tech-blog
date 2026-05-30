# Bilingual posts (EN + 中文)

Every post in `posts/` ships as **two files**: English (`.md`) and Simplified Chinese (`.zh.md`). Same facts in both; cross-linked in the header.

## Naming

| Language | File pattern | Example |
|----------|--------------|---------|
| English | `YYYY-MM-DD-slug.md` | `2026-05-30-t-today-guest-access-and-ai-quotas.md` |
| 中文 | `YYYY-MM-DD-slug.zh.md` | `2026-05-30-t-today-guest-access-and-ai-quotas.zh.md` |

## English file header

```markdown
# English title

**Date:** …
**Author:** …
**Project:** …
**Tags:** …
**Also available:** [中文](YYYY-MM-DD-slug.zh.md)

## First section
…
```

## 中文 file header

```markdown
# 中文 · 中文标题

**日期：** …（与英文相同）
**作者：** …
**项目：** …
**标签：** …
**语言：** [English](YYYY-MM-DD-slug.md) · 中文

## 第一节
…
```

## Rules

1. **Two files per topic** — keep `slug.md` and `slug.zh.md` in sync in the same PR.
2. **Same facts** — numbers, env var names, code paths, and ADR links must match.
3. **Keep proper nouns** — T Today, Invest AI, Vercel, OpenAI, repo names stay as-is.
4. **Mermaid / code blocks** — duplicate in `.zh.md` when Chinese labels help; shared English blocks are OK when neutral.
5. **README index** — English title links to `.md`; add `· [中文](…zh.md)` in the Title column.
6. **Cross-links in 中文** — when linking another blog post in the same repo, prefer `./other-post.zh.md` if a 中文 file exists.

## ADRs (invest-t-advisor)

T Today architecture decisions use the same two-file pattern: `000N-slug.md` + `000N-slug.zh.md`. See [BILINGUAL-ADR.md](https://github.com/xingaiapp/invest-t-advisor/blob/main/docs/adr/BILINGUAL-ADR.md).

## Backlog

All posts under `posts/` as of 2026-05-30 have paired `.zh.md` files. New posts should add English + 中文 together.
