# Bilingual posts (EN + 中文)

Every new post in `posts/` should ship **English and Simplified Chinese in one file**, unless the piece is English-only by design (e.g. external quote-heavy).

## File layout

```markdown
# English title

**Date:** …  
**Author:** …  
**Project:** …  
**Tags:** …  
**Languages:** English · [中文 ↓](#中文)

---

[English sections…]

---

# 中文标题

**日期：** …（与上文相同）  
**语言：** [English ↑](#english-title-anchor) · 中文

---

[中文段落，结构与英文对应…]
```

## Rules

1. **One file per topic** — do not split `post.en.md` / `post.zh.md` unless we later add a static site generator that needs it.
2. **Same facts** — numbers, env var names, code paths, and ADR links must match across languages.
3. **Keep proper nouns** — T Today, Invest AI, Vercel, OpenAI, repo names stay as-is.
4. **Mermaid / code blocks** — usually shared once (English labels OK in both sections, or duplicate diagram with Chinese labels if it helps).
5. **README index** — list English title; add `· 中文` in the Title column when the file includes a 中文 section.

## Anchor tips (GitHub)

- English H1 becomes the anchor (lowercase, spaces → `-`).
- Chinese H1: use a short Latin slug if needed, e.g. `# 中文` → `#中文`, or prefix `## 中文版` under a stable `# 中文` heading.

## Backlog

Older posts are English-only until touched. Priority when editing: product launches, ADR companions, anything linked from `xingai.app`.
