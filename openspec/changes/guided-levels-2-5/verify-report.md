# Guided Levels 2–5 — Verify Report

## Compliance Matrix

| Requirement | Verdict | Evidence |
|-------------|---------|----------|
| Multi-level course (levels 1–5) | COMPLIANT | `lessons.json`, `/learn` hub |
| Level 2 unlock after nivel-1 exam | COMPLIANT | `isGuidedLevelUnlocked`, `lessons-levels.test.ts` |
| Level content (≥2 lessons + exam) | COMPLIANT | `getLessonsForLevel`, exams per level |
| Dynamic routes per level | COMPLIANT | `/learn/[levelId]/*` |
| Free mode gate (nivel-1 only) | COMPLIANT | `isFreeModeUnlocked`, `requireFreeMode()` |
| TDD coverage | COMPLIANT | 52 tests passing |

## Build Evidence

| Check | Result |
|-------|--------|
| `npm test` | 52 passed |
| `npm run build` | Success (after import fix `62b6327`) |

## Deployment

- Failed: `3cafb82` — missing `getLevelById` import
- Fixed: `62b6327` — import restored, pushed to `main`

## Next Steps

- Learning analytics: `lesson_completed`, `exam_passed`, `free_mode_unlocked`
- Supabase admin for editable lesson content (deferred)
