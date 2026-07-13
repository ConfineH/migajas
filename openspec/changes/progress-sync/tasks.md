# Tasks: Progress Sync

## Phase 1: Domain (TDD)

- [x] 1.1 RED: `test/domain/progress-sync.test.ts`
- [x] 1.2 GREEN: `src/lib/domain/progress-sync.ts`

## Phase 2: Database

- [x] 2.1 Migration `user_learning_state` + RLS

## Phase 3: Storage & Sync

- [x] 3.1 `src/lib/supabase/learning-state.ts`
- [x] 3.2 Auth-aware `learning-state.ts` facade
- [x] 3.3 Sync in `auth/callback/route.ts`
- [x] 3.4 Update API routes to use persist helpers

## Phase 4: Verify

- [x] 4.1 `npm test` && `npm run build`
