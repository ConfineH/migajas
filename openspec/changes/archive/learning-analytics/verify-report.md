# Learning Analytics — Verify Report

## Compliance Matrix

| Requirement | Verdict | Evidence |
|-------------|---------|----------|
| `lesson_completed` on lesson complete | COMPLIANT | `/api/guided`, `buildLessonCompletedEvent` |
| `exam_passed` on ≥60% | COMPLIANT | `/api/progress`, `shouldEmitExamPassed` |
| No `exam_passed` below threshold | COMPLIANT | `analytics.test.ts` |
| `free_mode_unlocked` on first nivel-1 pass | COMPLIANT | `shouldEmitFreeModeUnlocked` |
| No duplicate free mode event | COMPLIANT | `wasFreeModeUnlocked` guard |

## Build Evidence

| Check | Result |
|-------|--------|
| `npm test` | 62 passed |
| `npm run build` | Success |
