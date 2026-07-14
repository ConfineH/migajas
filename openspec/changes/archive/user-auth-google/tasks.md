# Tasks: User Auth with Google

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 350–450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: Domain (TDD)

- [x] 1.1 RED: `test/domain/auth.test.ts` — redirect + auth mode scenarios
- [x] 1.2 GREEN: `src/lib/domain/auth.ts` — pass tests

## Phase 2: Supabase Infrastructure

- [x] 2.1 Install `@supabase/supabase-js` and `@supabase/ssr`
- [x] 2.2 Create `src/lib/supabase/{client,server,middleware}.ts`
- [x] 2.3 Create `src/middleware.ts` and `src/app/auth/callback/route.ts`
- [x] 2.4 Add `.env.example`

## Phase 3: UI & Wiring

- [x] 3.1 Create `/login` page + `GoogleSignInButton` + server actions
- [x] 3.2 Update `OnboardingFlow` for real account path
- [x] 3.3 Update `AppNavBar` / `NavBar` with session state

## Phase 4: Verification

- [x] 4.1 `npm test` — all domain tests pass
- [x] 4.2 `npm run build` — compiles without env (graceful) or with env
