# Design: Pedagogical Content v2

## Content generation

- Source script: `scripts/build-pedagogical-v2.mjs`
- Outputs: `lessons.json`, `exercises.json`, `exams.json`, merges into `foods.json`
- Lesson steps use existing types: `explanation`, `example`, `practice`
- Exercise IDs: `ex-l{level}-{n}-{slug}` for lesson practice; `n{level}-ex{n}` for exam bank

## Level structure (España)

| Level | Lessons | Focus |
|-------|---------|-------|
| 1 | 5 | Rations, labels, modulators, fiber, daily staples |
| 2 | 3 | Rice/pasta, tubers, legumes |
| 3 | 2 | Vegetables free vs counted, advanced fruit |
| 4 | 3 | Mixed plates, Spanish home cooking, eating out |
| 5 | 3 | Fat/protein delay, full menus, alcohol |

## Fiber policy

Teach net carbs in lesson 4 but app counts **total carbs** by default unless user has clinical instruction to subtract fiber.

## Localization

Minimal alias updates for new food IDs (`pan-molde`, `arroz-cocido-150g`, etc.). Full DO lesson overrides deferred until RD users exist.

## Verification

- `test/domain/pedagogical-content-v2.test.ts` — structural integrity
- Existing guided-flow, exam-session, level-flashcards tests updated
