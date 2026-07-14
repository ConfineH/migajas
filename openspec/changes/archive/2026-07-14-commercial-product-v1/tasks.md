# Tasks: Commercial Product v1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1200 across 4 PRs |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 profile → PR2 intake → PR3 export → PR4 admin/docs/foods |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Profiles + sync + gate helpers | PR1 | `npm test -- test/domain/user-profile.test.ts test/guided-flow.test.ts` | Cookie sign-in → PATCH `/api/profile` | Profiles migration + profile routes |
| 2 | Intake diary + same-day CRUD | PR2 | `npm test -- test/domain/intake.test.ts` | Gated `/diario` POST | Intake migration + `/api/intake` |
| 3 | CSV/PDF export | PR3 | `npm test -- test/domain/clinical-*.test.ts` | GET export `format=pdf&range=7d` | Export route + pdfkit |
| 4 | Admin + buyer kit + foods | PR4 | `npm test` | Admin metrics cards; food counts | RPC migration + `docs/commercial/` |

## Phase 1: Profile Foundation (PR1)

- [x] 1.1 `supabase/migrations/20260715140000_commercial_profiles.sql`: `user_profiles` + RLS only
- [x] 1.2 RED `test/domain/user-profile.test.ts`: mergeCookie, goal validation (stale cookie, invalid goal)
- [x] 1.3 GREEN+REFACTOR `src/lib/domain/user-profile.ts`: types, `mergeCookieIntoProfile`, validators
- [x] 1.4 `src/lib/supabase/user-profile.ts`: get/upsert
- [x] 1.5 `src/lib/onboarding.ts`: `daily_carb_goal_g` on cookie
- [x] 1.6 `src/lib/profile-sync.ts` + auth callback/`finalizeAuthenticatedSession` wiring
- [x] 1.7 `src/app/api/profile/route.ts`: GET/PATCH
- [x] 1.8 `src/components/OnboardingFlow.tsx`: goal + clinical toggle in settings
- [x] 1.9 RED `test/guided-flow.test.ts`: `canUseClinicalMode` matrix
- [x] 1.10 GREEN `src/lib/domain/guided-flow.ts`: `hasPassedNivel3`, `canUseClinicalMode`

## Phase 2: Intake Logging (PR2)

- [x] 2.1 `supabase/migrations/20260715150000_commercial_intake.sql`: enum, `intake_entries`, RLS, index
- [x] 2.2 RED `test/domain/intake.test.ts`: denormalize ES/RD, multiplier, same-day
- [x] 2.3 GREEN+REFACTOR `src/lib/domain/intake.ts`: `buildEntry`, `assertSameDayEditable`
- [x] 2.4 `src/lib/supabase/intake.ts` + `src/app/api/intake/route.ts`: gated CRUD
- [x] 2.5 `src/app/diario/page.tsx`: gated UI, totals vs goal, region picker
- [x] 2.6 `src/components/ClinicalModePrompt.tsx` + NavBar diary link gated

## Phase 3: Clinical Export (PR3)

- [x] 3.1 RED `test/domain/clinical-report.test.ts`: rollups, goal, top foods
- [x] 3.2 GREEN `src/lib/domain/clinical-report.ts`
- [x] 3.3 RED `test/domain/clinical-export.test.ts`: CSV, range ≤90d
- [x] 3.4 GREEN `src/lib/domain/clinical-export.ts`: CSV + `PdfReportDTO`
- [x] 3.5 `pdfkit`; `src/lib/clinical/pdf-layout.ts`; `src/app/api/clinical/export/route.ts`
- [x] 3.6 Export UI on `/diario`: 7d/30d/custom CSV/PDF

## Phase 4: Admin & Commercial Kit (PR4)

- [x] 4.1 `supabase/migrations/20260715160000_commercial_admin_rpc.sql`: `get_org_dashboard_stats()`
- [x] 4.2 `src/app/api/admin/metrics/route.ts` + `src/app/admin/page.tsx` StatCards
- [x] 4.3 `docs/commercial/*`: README-BUYER, DEPLOYMENT, SCHEMA, ADMIN-GUIDE, LEGAL drafts
- [x] 4.4 Expand `foods.json` to ~80–100/country; verify region picker
