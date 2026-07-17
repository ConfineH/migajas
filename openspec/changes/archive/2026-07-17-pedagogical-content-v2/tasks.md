# Tasks: Pedagogical Content v2

## Phase 1: TDD guardrails

- [x] 1.1 `test/domain/pedagogical-content-v2.test.ts` (RED)
- [x] 1.2 `scripts/build-pedagogical-v2.mjs` content generator

## Phase 2: Content JSON

- [x] 2.1 `lessons.json` — 16 lessons restructured
- [x] 2.2 `exercises.json` — 16 lesson + 43 bank exercises
- [x] 2.3 `exams.json` — expanded pools and questionsPerExam
- [x] 2.4 `foods.json` — +27 Spain foods
- [x] 2.5 `levels.json` — updated titles/descriptions

## Phase 3: Integration

- [x] 3.1 Update dependent tests (guided-flow, flashcards, localization)
- [x] 3.2 Add food aliases in `content-localization.ts`
- [x] 3.3 Regenerate `supabase/migrations/20260713160000_seed_content.sql`

## Phase 4: Verify

- [x] 4.1 `npm test` — 229 passed
- [x] 4.2 `npm run build` — pass
- [x] 4.3 `verify-report.md`
