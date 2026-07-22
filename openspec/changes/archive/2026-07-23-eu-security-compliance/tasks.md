# Tasks: EU Security & Compliance

## Phase 1 — Progress integrity (TDD)

- [x] RED: `progress-integrity.test.ts` domain tests
- [x] GREEN: `src/lib/domain/progress-integrity.ts`
- [x] RED: `api-progress-guard.test.ts`, `api-guided-guard.test.ts`
- [x] GREEN: wire `/api/progress` and `/api/guided`

## Phase 2 — Transport & cookies

- [x] RED/GREEN: `cookie-options.test.ts` + `src/lib/cookie-options.ts`
- [x] Apply secure cookie helper to learning/onboarding cookies
- [x] Add security headers in `next.config.ts`

## Phase 3 — GDPR technical controls

- [x] Cookie consent domain, API, banner, layout gate
- [x] `/privacidad` page
- [x] Clinical Art. 9 consent validation + onboarding UI
- [x] Account export/delete APIs + settings UI
- [x] Tests: `cookie-consent`, `clinical-consent`, `account-lifecycle`

## Phase 4 — Verify

- [x] `npm test` full suite
- [x] `npm run build`
