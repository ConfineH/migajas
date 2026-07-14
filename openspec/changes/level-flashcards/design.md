# Design: Fichas del nivel

## Domain

### `level-flashcards.ts`

```typescript
type FlashcardMode = "portion" | "carbs" | "rations";

interface LevelFlashcard {
  foodId: string;
  mode: FlashcardMode;
}

function getEssentialFlashcardFoodIds(levelId: string): string[]
function buildLevelFlashcardDeck(levelId: string): LevelFlashcard[]
function getFlashcardPrompt(card, food, exchangeUnitG): { front, back }
```

Food IDs collected from `lessons.steps[].foodId` and `exam.poolExerciseIds → exercise.foodId`.

### Guided flow

- `GuidedItemType` adds `"flashcards"`.
- Item id: `flashcards-{levelId}`.
- `canAccessFlashcards` = all lessons + practices done (same predicate as exam prerequisites minus fichas).
- `hasCompletedFlashcards(progress, levelId)` checks `completedFlashcardLevels`.
- `canStartExam` unchanged (lessons + practices only).

### Progress schema

```typescript
interface UserProgress {
  // ...
  completedFlashcardLevels?: string[];
}
```

Parsed in cookies, Supabase `user_learning_state.progress`, and `mergeUserProgress` (union).

## Routes

| Route | Purpose |
|-------|---------|
| `GET /learn/[levelId]/fichas` | Flashcard session UI |
| `POST /api/guided` `complete-flashcards` | Mark level fichas done |

## UI

- `FlashcardDeck` client component: flip animation, progress counter, "Siguiente", final "Terminar repaso".
- `GuidedPathList`: icon 🃏, href `/learn/{levelId}/fichas`.
- Exam page: amber callout linking to fichas when incomplete.

## Content

No new JSON files — deck derived from existing lessons + exams + foods catalog.
