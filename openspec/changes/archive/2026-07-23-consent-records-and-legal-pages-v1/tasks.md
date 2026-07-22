# Tasks: Consent Records & Legal Pages v1

## Phase 1 — TDD domain

- [x] RED: `test/consent-records-and-legal-pages/consent-records.test.ts`
- [x] GREEN: `src/lib/domain/legal-versions.ts`, `consent-records.ts`

## Phase 2 — Database + supabase layer

- [x] Migration `user_consents`
- [x] `src/lib/supabase/consent-records.ts`

## Phase 3 — API + export

- [x] RED: API tests for revoke + cookie record
- [x] GREEN: wire profile, cookie-consent, revoke-health-data, export

## Phase 4 — UI + legal pages

- [x] Revoke button in `OnboardingFlow`
- [x] `/cookies`, `/terminos`, footer + banner links
- [x] Update `/privacidad` cross-links

## Phase 5 — Verify

- [x] `npm test` — 301 passed
- [x] `npm run build` — pass
