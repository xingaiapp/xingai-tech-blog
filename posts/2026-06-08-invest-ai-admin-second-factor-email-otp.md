# One Admin, Real Power: Why We’re Skipping SMS and Planning Email OTP

**Date:** June 8, 2026  
**Author:** Xing @ [XingAI](https://xingai.app)  
**Project:** [Invest AI](https://invest.xingai.app)  
**Tags:** `invest-ai` `auth` `admin` `otp` `mfa` `security` `design`  
**Status:** Design note — not shipped  
**Also available:** [中文](2026-06-08-invest-ai-admin-second-factor-email-otp.zh.md)

---

Invest AI’s admin surface is not a demo toggle. A signed-in operator can:

- read precomputed trading decisions and macro overlays,
- queue bilingual PDF reports that email real subscribers,
- write notification prefs tied to worker-owned dispatch.

A stolen JWT is bad enough. We started asking: **should admin actions require a second factor, re-checked every ~30 days?**

Short answer: **yes, eventually.**  
Short pick for a **single-admin, self-hosted** setup: **Email OTP to the configured operator mailbox**, not SMS.

## Where We Are Today

We are rolling out Supabase Google OAuth on `invest.xingai.app`. Any interim operator-testing paths stay in **private runbooks** inside the product repo — not in this public post.

The MFA discussion below is the **step-up layer on top of** primary login once OAuth is live.

## The SMS OTP Idea (and Why It’s Tempting)

SMS one-time codes feel familiar:

- even if a JWT leaks, the attacker still needs the phone,
- a 30-day re-check is tolerable for a solo operator,
- Twilio makes the integration look cheap (~$0.01 per message).

For a one-person admin console, the implementation cost is low.

The problem is the threat model. SMS is the **weakest** common 2FA channel. SIM-swap attacks trick carriers into porting your number. For a system that can **send market PDFs to real inboxes** and expose decision cache semantics, that risk is not theoretical noise.

## Options Compared

| Approach | Security | Cost to ship | Fits solo admin? |
|----------|----------|--------------|------------------|
| SMS OTP (Twilio) | Medium | Low + per-SMS fees | OK, but SIM-swap exposure |
| TOTP (Google Authenticator) | High | Low (library only) | Great if you carry the phone |
| **Email OTP** (operator mailbox) | Medium | **Very low** (reuse Resend/worker mail) | **Best bang-for-buck here** |
| WebAuthn (Touch ID / Face ID) | Highest | Medium (browser APIs + backup codes) | Best long-term, more moving parts |

Email OTP is not perfect. Inbox compromise is a real scenario. But the operator mailbox can sit behind Google Workspace (or similar) controls — and we **already operate an email pipeline** for scheduled reports.

SMS adds a new vendor, secrets, billing, and delivery debugging for marginal gain over email in this exact setup.

## Recommended Shape: Email OTP

**Trigger:** admin JWT older than 30 days (`iat` check) or fresh login from a new browser profile.

**Flow:**

```text
Admin passes primary auth (Google / Supabase JWT)
  -> FastAPI sees session age > 30d
  -> POST /api/v2/admin/request-otp
  -> Worker or FastAPI sends 6-digit code to the configured operator mailbox
  -> Admin enters code on /admin/verify
  -> POST /api/v2/admin/verify-otp
  -> SQLite KV: admin:otp:{email} with 30-minute TTL
  -> Short-lived admin_step_up cookie or claim for report triggers
```

**Storage sketch (SQLite KV):**

```text
admin:otp:{email}     -> { code_hash, expires_at }
admin:stepup:{email}  -> { verified_at, expires_at }   # optional second key
```

Hash the code. Never store it plain text. Rate-limit requests per email and per IP.

## What We Would Touch (When We Build It)

| Layer | Change |
|-------|--------|
| **FastAPI** | `POST /api/v2/admin/request-otp`, `POST /api/v2/admin/verify-otp` |
| **SQLite KV** | OTP + expiry rows (same store as report trigger flags) |
| **Worker / mail** | Reuse Resend path from `daily_report_*` modules |
| **Frontend** | Step-up page after login; block `/reports` manual triggers until verified |

Estimated core logic: **~20 lines** for OTP generation + KV write + verify — plus routing, rate limits, and UI. The product work is mostly wiring and tests, not crypto inventing.

## What We Are Not Doing (Yet)

- No SMS vendor until the threat model changes (team admins, SMS-only users, regulated tenant).
- No WebAuthn in v1 of step-up — good follow-up once OAuth is stable.
- Interim operator-testing paths retire when production login is verified end-to-end.

## Decision (For Now)

| Choice | Verdict |
|--------|---------|
| SMS OTP | Defer — extra vendor, SIM-swap class risk |
| TOTP | Strong alternative; carry authenticator app |
| **Email OTP** | **Plan this** for single-admin step-up |
| WebAuthn | Target after Email OTP ships |

If you operate Invest AI as a solo admin today: finish **Supabase Google login** first, then add **Email OTP step-up** before opening admin surfaces to anyone else.

---

**Disclaimer:** This post describes engineering options under review. It is not security advice or a commitment to ship a particular control on a fixed date. Validate threat models and legal obligations before production rollout.

**Further reading:** Invest AI [ADR-023](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/023-frontend-session-token-resolution.md) (frontend session resolution), [ADR-022](https://github.com/xingaiapp/xingai-invest-ai/blob/main/docs/adr/022-pdf-report-delivery-triggers.md) (report triggers). Public security checklist: [docs/PUBLIC-SECURITY.md](../docs/PUBLIC-SECURITY.md).
