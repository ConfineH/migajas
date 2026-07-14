# Design: Variable Exams

## Domain

`src/lib/domain/exam-session.ts`:

```typescript
interface ExamSession {
  levelId: string;
  exerciseIds: string[];
  startedAt: string;
}

function buildExamSession(
  levelId: string,
  poolExerciseIds: string[],
  questionsPerExam: number,
  now?: () => number,
): ExamSession

function shouldRotateSession(
  progress: UserProgress,
  levelId: string,
  passed: boolean,
): boolean
```

Sampling: Fisher–Yates shuffle on pool copy, take first N. Validate pool size ≥ N.

## Progress schema extension

```typescript
interface UserProgress {
  // existing fields...
  activeExamSessions?: ExamSession[];
}
```

Merge compatible with `progress-sync` (remote wins per field merge).

## Flow

```
/learn/[levelId]/exam
  → resolveProgress()
  → getExamConfig(levelId)
  → getOrCreateExamSession(progress, config)
  → map exerciseIds → Exercise[]
  → ExamRunner (unchanged UI)
```

On exam complete (fail): clear session for level so next visit draws anew.
On pass: clear session; store completion as today.

## API

`POST /api/progress` — when exam completes, include `clearExamSession: levelId`.

Optional: `GET /api/guided/exam-session?levelId=` for client refresh (v1: server page only).

## Supabase

Migration: add columns to `level_exams`:

```sql
pool_exercise_ids jsonb not null default '[]',
questions_per_exam integer not null default 4
```

Backfill: `pool_exercise_ids = exercise_ids`, `questions_per_exam = jsonb_array_length(exercise_ids)`.

Seed: expand `exercises.json` pools where needed.

## Files

| File | Action |
|------|--------|
| `src/lib/domain/exam-session.ts` | Create |
| `test/domain/exam-session.test.ts` | TDD |
| `src/lib/domain/lessons.ts` | LevelExam type + getters |
| `src/app/learn/[levelId]/exam/page.tsx` | Use session |
| `src/lib/learning-state.ts` | Persist session |
| `src/app/api/progress/route.ts` | Clear session on complete |
| Admin exams editor | pool + count fields |
| `supabase/migrations/...` | Schema |

## Testing

- Pool of 8, draw 4 → 4 unique IDs
- Pool of 3, need 4 → validation error
- Retake after fail → different IDs (mock shuffle seed)
- Session resume returns same IDs
