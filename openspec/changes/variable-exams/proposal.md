# Proposal: Variable Exams

## Intent

Level exams should draw questions from a **pool** so each attempt feels fresh, measures real understanding, and reduces memorization of fixed answer sequences.

## Problem

`level_exams.exercise_ids` is a fixed ordered list. Every user sees the same 4–5 questions in the same order on every attempt. Retakes do not meaningfully reassess.

Current pools are barely larger than the exam (e.g. nivel-1: 6 exercises in data, 4 in exam), but the **model** is wrong for growth.

## Approach

Replace fixed exam lists with **pool + draw**:

```typescript
interface LevelExamConfig {
  levelId: string;
  title: string;
  description: string;
  poolExerciseIds: string[];   // all eligible
  questionsPerExam: number;    // e.g. 4
}
```

### Selection rules

1. On exam start, if no active session → sample `questionsPerExam` unique IDs from pool (shuffled).
2. Persist `examSession: { levelId, exerciseIds, startedAt }` in user progress (cookie + Supabase).
3. **Resume** in-progress exam with same session.
4. **Retake after fail** → new sample.
5. **After pass** → session cleared; next optional retake gets new sample.
6. Seed: `hash(userId + levelId + sessionStartedAt)` for reproducibility within a session (optional v1: simple shuffle).

### Content migration

- Expand exercise pools per level (target: pool ≥ 8, exam draws 4–5).
- Migrate `exercise_ids` JSON → `{ pool, count }` or interpret existing array as pool with `questionsPerExam = min(4, length)`.

### Admin

- Admin exams UI: edit pool IDs + questions per exam (not fixed ordered list).

## Success Criteria

- [ ] Two consecutive failed attempts can show different question sets
- [ ] Passing exam still uses ≥60% threshold on drawn set
- [ ] Domain tests for sampling, dedupe, pool validation
- [ ] Progress sync preserves active exam session across devices

## Out of Scope

- Adaptive difficulty (IRT)
- Questions generated from foods at runtime
- Timed exam mode

## Proposal Question Round

1. **¿Cuántas preguntas por examen?** (default: 4, nivel-5: 5)
2. **¿Repetir preguntas falladas** en el siguiente intento? (default: no, fresh draw)
3. **¿Incluir ejercicios de práctica** en el pool? (default: yes, level pool only)

Default if unanswered: 4 questions, fresh draw on retake, pool = all level exercises not used in current lesson practice only if tagged.

## Non-Goals

- Changing pass threshold (60%)
- Removing exams from guided flow
