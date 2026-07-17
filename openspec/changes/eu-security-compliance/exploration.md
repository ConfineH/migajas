# Exploration: EU Security & Compliance Hardening

## Current State

Migajas has a solid baseline from `commercial-hardening` (archived): clinical/profile/admin API auth gates are tested (16 tests in `test/commercial-hardening/`), RLS is enabled on `user_learning_state`, `user_profiles`, and `intake_entries`, and a buyer legal kit exists under `docs/commercial/LEGAL/`.

Full suite: **269/269 tests pass** (`npm test`).

### Security controls already in place

| Area | Implementation | Evidence |
|------|----------------|----------|
| Clinical data access | Layered gate: auth → feature flag → nivel 3 → opt-in | `src/lib/clinical-access.ts`, `test/commercial-hardening/clinical-access.test.ts` |
| API auth on sensitive routes | 401/403 before business logic | `test/commercial-hardening/api-routes-auth.test.ts` |
| Postgres isolation | RLS `auth.uid() = user_id` | `supabase/migrations/*` |
| Admin metrics | `SECURITY DEFINER` RPC, revoked from `authenticated` | `20260715160000_commercial_admin_rpc.sql` |
| Admin content | Email whitelist + service role | `src/lib/domain/admin.ts`, `content-admin.ts` |
| Open redirect | `sanitizePostAuthRedirect` blocks `//` | `src/lib/domain/auth.ts` |
| Session cookies | `httpOnly`, `sameSite: lax` on progress/attempts/onboarding | `src/lib/learning-state.ts`, `onboarding/route.ts` |
| Legal drafts | DPA, privacy, cookies, health disclaimer templates | `docs/commercial/LEGAL/`, `test/commercial-hardening/docs-manifest.test.ts` |

### Gaps identified

#### CRITICAL — Progress integrity bypass

`POST /api/progress` and `POST /api/guided` accept client-supplied completion data with **no server-side verification** of exam attempts or lesson completion. An attacker can mark `nivel-3` as passed and unlock clinical mode gates that depend on `hasPassedNivel3`.

- `src/app/api/progress/route.ts` — accepts arbitrary `correctCount`/`totalCount`
- `src/app/api/guided/route.ts` — accepts `complete-lesson`/`complete-practice` without proof

Impact: integrity bypass → premature clinical mode access (health data processing under Art. 9 GDPR).

#### HIGH — GDPR / ePrivacy compliance gaps

| Regulation | Gap | Current state |
|------------|-----|---------------|
| Art. 6/7 GDPR | No cookie consent UI before non-essential cookies | Cookies set on first visit without banner |
| Art. 9 GDPR | Clinical opt-in lacks explicit health-data consent copy + privacy link | Checkbox in `OnboardingFlow.tsx` is functional only |
| Art. 17 GDPR | No account/data erasure flow | No `/api/account/delete` or Supabase user purge |
| Art. 20 GDPR | Portability limited to clinical CSV/PDF | No export of profile, progress, learning events |
| Art. 13/14 GDPR | Privacy policy is a template with placeholders | `PRIVACY-POLICY-TEMPLATE.md` not production-ready |
| ePrivacy | Cookie notice exists as template only, not wired in app | `COOKIE-NOTICE-TEMPLATE.md` |

#### HIGH — Transport & header hardening

- Cookies lack `secure: true` in production (`learning-state.ts`, `onboarding/route.ts`)
- `next.config.ts` has no security headers (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`)

#### MEDIUM — Supabase Auth

- Remote advisor: **Leaked password protection disabled** on project `tqxxdajuguthwljzmqfe`
- Remediation: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

#### MEDIUM — Operational

- No automated data retention purge for `intake_entries` (template mentions `[RETENTION_DAYS]` but no cron/job)
- No rate limiting on auth or mutation APIs
- `POST /api/onboarding` has no input validation (low risk — only sets guest prefs cookie)

#### LOW / Informational

- RLS integration tests deferred (documented in commercial-hardening verify report)
- Admin access via `ADMIN_EMAILS` env — acceptable for v1, document rotation policy
- MDR: health disclaimer correctly positions product as educational, not a medical device

## Affected Areas

- `src/app/api/progress/route.ts` — progress integrity
- `src/app/api/guided/route.ts` — guided completion integrity
- `src/app/api/exam/start/route.ts` — exam session creation (related)
- `src/lib/learning-state.ts` — cookie `secure` flag
- `next.config.ts` — security headers
- `src/components/OnboardingFlow.tsx` — clinical consent UX
- New: cookie consent component, privacy settings page, account deletion API
- `docs/commercial/LEGAL/*` — finalize placeholders for production
- `test/eu-security-compliance/` — new TDD test suite

## Approaches

### 1. Progress integrity — server-side exam attestation (Recommended)

Store exam session state server-side; only allow `completeLevel` when an active exam session exists with sufficient answered questions matching `correctCount`. Guided completions require prior step order validation.

- Pros: Closes clinical bypass; aligns with guided-flow business rules
- Cons: Medium effort; may affect guest mode (needs cookie-signed or session-bound state)
- Effort: **Medium**

### 2. Progress integrity — authenticated-only mutations

Reject `POST /api/progress` and `POST /api/guided` for guests; require signed tokens for completion events.

- Pros: Simpler than full attestation
- Cons: Breaks current guest-first flow; doesn't fully prevent authenticated cheating
- Effort: **Low** (insufficient alone)

### 3. GDPR compliance — phased legal + technical

**Phase A (technical, testable):** Cookie banner, `secure` cookies, security headers, clinical consent checkbox with legal copy, account deletion API, full data export endpoint.

**Phase B (legal, buyer responsibility):** Finalize privacy policy, DPA, cookie notice placeholders; retention cron.

- Pros: Separates code from legal review; TDD on technical gates
- Cons: Full EU clinic compliance still needs qualified counsel
- Effort: **Medium–High**

### 4. Supabase hardening only

Enable leaked-password protection, add RLS integration tests, run advisors in CI.

- Pros: Quick wins
- Cons: Doesn't address app-layer gaps
- Effort: **Low**

## Recommendation

Chained SDD change `eu-security-compliance` in two PRs:

1. **PR1 — Progress integrity** (`progress-integrity-v1`): Server-side exam attestation + guided step validation. TDD: RED tests proving API rejects fake nivel-3 completion.
2. **PR2 — GDPR technical controls** (`gdpr-technical-v1`): Cookie consent, secure cookies, security headers, clinical Art. 9 consent UX, account deletion + full export APIs. TDD: route tests for 401/403 and consent gating.

Enable Supabase leaked-password protection immediately (config change, no code).

Legal templates remain buyer responsibility but add a manifest test for required placeholder fields.

## Risks

- Progress integrity changes may affect guest users if not designed carefully
- Cookie consent banner impacts UX on first visit
- Account deletion must cascade `user_profiles`, `intake_entries`, `user_learning_state`, `learning_events`
- CSP may break inline scripts if too strict — start with report-only or permissive policy

## Ready for Proposal

**Yes.** Orchestrator should confirm scope priority with user:
1. Progress integrity first (security-critical)?
2. GDPR technical controls first (compliance-critical)?
3. Both in single change (larger PR)?

Also confirm: production privacy policy text is buyer/legal team responsibility vs. Migajas ships finalized ES copy.
