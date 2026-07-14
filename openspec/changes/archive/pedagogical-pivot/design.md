# Design: Pedagogical Pivot

## Flow

```
Onboarding → /learn/nivel-1
  → Lesson 1 → Practice → Lesson 2 → Practice → Lesson 3 → Practice
  → Exam (nivel-1)
  → Free mode unlocked → /catalog, /levels
```

## Data Model

```typescript
interface Lesson {
  id: string;
  levelId: string;
  orderIndex: number;
  title: string;
  summary: string;
  steps: LessonStep[];  // explanation | example | practice
}

interface LevelExam {
  levelId: string;
  exerciseIds: string[];
}

interface UserProgress {
  completions: LevelCompletion[];
  completedLessons: string[];
  completedPracticeSteps: string[];
  freeModeUnlocked: boolean;
}
```

## Routes

| Route | Purpose |
|-------|---------|
| `/learn/nivel-1` | Guided path overview |
| `/learn/nivel-1/lessons/[id]` | Lesson content |
| `/learn/nivel-1/practice/[stepId]` | Lesson-linked practice |
| `/learn/nivel-1/exam` | Level exam |
| `/catalog` | Gated — reference |
| `/levels` | Gated — free practice |

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entry point | `/learn` not `/catalog` | Review notes: catalog is support |
| Free mode unlock | Pass nivel-1 exam (≥60%) | Guided learning first |
| Progress storage | HTTP cookies | PRD: no localStorage |
| Lesson content | JSON seed (`lessons.json`, `exams.json`) | DB-ready, editable later |

## Files Added

- `src/lib/domain/lessons.ts`, `guided-flow.ts`
- `src/lib/data/lessons.json`, `exams.json`
- `src/app/learn/**`
- `src/app/api/guided/route.ts`
- `src/components/LessonViewer`, `GuidedPathList`, `SingleExercise`, `ExamRunner`
