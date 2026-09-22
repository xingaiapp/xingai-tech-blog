#!/usr/bin/env node
/**
 * Public-safety gate for this PUBLIC repo (see docs/PUBLIC-SECURITY.md).
 *
 * Runs before every build (npm "prebuild", so Vercel cannot deploy a failing
 * tree) and on every push / PR in CI. Exit code 1 blocks the release.
 *
 * Scans posts/ and README.md for credentials, auth-trust headers, internal
 * hostnames, private emails and env values. False positives go in
 * .public-safety-allow — one entry per line, "path:exact text" or "exact text",
 * each with a comment saying why it is safe.
 *
 * Usage: node scripts/check-public-safety.mjs [files...]
 */
import { readFileSync, readdirSync, existsSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = new URL("..", import.meta.url).pathname

const RULES = [
  // Credentials — never acceptable in any form.
  { id: "openai-key", re: /(?<![A-Za-z])sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}/g, why: "looks like an OpenAI API key" },
  { id: "stripe-key", re: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/g, why: "looks like a Stripe secret key" },
  { id: "jwt", re: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, why: "looks like a JWT" },
  { id: "aws-key", re: /\bAKIA[0-9A-Z]{16}\b/g, why: "looks like an AWS access key" },
  { id: "github-token", re: /\b(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{30,}|\bgithub_pat_[A-Za-z0-9_]{30,}/g, why: "looks like a GitHub token" },
  { id: "resend-key", re: /\bre_[A-Za-z0-9]{20,}/g, why: "looks like a Resend API key" },
  { id: "slack-token", re: /\bxox[abpr]-[A-Za-z0-9-]{10,}/g, why: "looks like a Slack token" },
  { id: "google-key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g, why: "looks like a Google API key" },
  { id: "private-key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, why: "private key block" },
  {
    id: "env-value",
    re: /\b[A-Z][A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD|PASSWD)\s*[=:]\s*["']?(?!<|\$|\{|your|xxx|\.\.\.|…|changeme|example)[A-Za-z0-9/+_.-]{12,}/g,
    why: "a secret-looking env var with a real-looking value (use a <PLACEHOLDER>)",
  },

  // Active bypass paths — headers a backend trusts for identity or tier.
  {
    id: "auth-trust-header",
    re: /\bX-(?:[A-Za-z]+-)*(?:Email|Admin|Paid-Token|Api-Key|User-Id|Role|Tier)\b/g,
    why: "names a request header used for identity/tier; describe the design, not the header (it tells attackers what to forge)",
  },

  // Attack maps — backend hosts users never see directly.
  { id: "internal-host", re: /\b[a-z0-9-]+\.(?:fly\.dev|internal|railway\.app|onrender\.com)\b/g, why: "backend/internal hostname; use <API_BASE_URL>" },
  { id: "private-ip", re: /\b(?:10\.\d{1,3}|192\.168|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/g, why: "private network address" },

  // Personal identifiers.
  {
    id: "email",
    re: /\b[A-Za-z0-9._%+-]+@(?!example\.(?:com|org)\b|your-domain\b|domain\.com\b|github\.com\b|users\.noreply\.github\.com\b)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[a-z]{2,}\b/g,
    why: "a real email address; use admin@your-domain unless it is a public sender listed in .public-safety-allow",
  },
]

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".md") ? [join(dir, e.name)] : []
  )
}

function loadAllow() {
  const file = join(ROOT, ".public-safety-allow")
  if (!existsSync(file)) return []
  return readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.replace(/\s+#.*$/, "").trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf(":")
      const maybePath = i > 0 ? l.slice(0, i) : ""
      return maybePath.includes("/") || maybePath.endsWith(".md") ? { path: maybePath, text: l.slice(i + 1) } : { path: "", text: l }
    })
}

function mask(s) {
  return s.length <= 12 ? s : `${s.slice(0, 6)}…${s.slice(-3)}`
}

const args = process.argv.slice(2)
const files = args.length ? args : [...walk(join(ROOT, "posts")), join(ROOT, "README.md")].filter(existsSync)
const allow = loadAllow()
const findings = []

for (const file of files) {
  const rel = relative(ROOT, file)
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((line, idx) => {
      for (const rule of RULES) {
        for (const m of line.matchAll(rule.re)) {
          const hit = m[0]
          const allowed = allow.some((a) => (!a.path || a.path === rel) && (hit === a.text || line.includes(a.text) && a.text.includes(hit)))
          if (!allowed) findings.push({ rel, line: idx + 1, rule, hit })
        }
      }
    })
}

if (findings.length) {
  console.error(`\n✖ public-safety: ${findings.length} finding(s) — this repo is public (docs/PUBLIC-SECURITY.md)\n`)
  for (const f of findings) console.error(`  ${f.rel}:${f.line}  [${f.rule.id}] ${mask(f.hit)}\n      ${f.rule.why}`)
  console.error("\nFix the text, or if it is genuinely safe, add it to .public-safety-allow with a reason.\n")
  process.exit(1)
}
console.log(`✔ public-safety: ${files.length} file(s) clean`)
