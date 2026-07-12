# Pedagogical Pivot — Verify Report

## Compliance Matrix

| Requirement | Verdict | Evidence |
|-------------|---------|----------|
| Guided sequence (lessons → practice → exam) | COMPLIANT | `buildGuidedSequence`, `/learn/nivel-1` |
| Free mode gate on catalog | COMPLIANT | `requireFreeMode()` in `/catalog` |
| Free mode gate on free practice | COMPLIANT | `requireFreeMode()` in `/levels` |
| Lesson progress persistence | COMPLIANT | `/api/guided`, cookie fields |
| Exam gate after lessons | COMPLIANT | `canStartExam()` |
| 3+ lessons nivel-1 | COMPLIANT | `lessons.json` (3 lessons) |
| TDD coverage | COMPLIANT | 37 tests passing |

## Review Notes Alignment

| Note | Status |
|------|--------|
| Lessons mandatory in MVP | ✓ Implemented nivel-1 |
| Catalog not primary entry | ✓ Gated + home CTA changed |
| Free mode after guided learning | ✓ Exam unlocks free mode |
| UX teaches, not just consults | ✓ Course-first flow |

## Next Steps

- Add guided lessons for levels 2–5
- Move lesson content to Supabase admin
- Analytics: `lesson_completed`, `exam_passed`, `free_mode_unlocked`
