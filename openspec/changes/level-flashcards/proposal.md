# Proposal: Fichas del nivel

## Intent

Bridge the gap between **procedural** learning (grams → rations) and **declarative** memory (standard portions and carb content per food). Users should not reach the exam without having seen every food that can appear in the question pool.

## Problem

- Lessons teach the formula with 1–2 examples per topic.
- Practices and exams often **state HC grams in the prompt**, so users pass without memorizing portions.
- The exam pool can include foods not deeply covered in lessons.
- The catalog is passive reference, unlocked late, and does not train active recall.

## Approach

Insert **Fichas del nivel** in the guided path after all lessons/practices and before the exam:

```
Lecciones → Prácticas → Fichas del nivel → Examen
```

### Deck composition (essential)

Union of:

1. `foodId` values from lesson steps (examples) for the level
2. `foodId` values from exercises in the level exam pool

No full-category deck in v1 (avoids overwhelm).

### Card types (per food)

| Mode | Front | Back |
|------|-------|------|
| `portion` | Porción estándar de {food}? | {portionText} ({grams} g) |
| `carbs` | ¿Cuántos g de HC aporta esa porción? | {carbsG} g |
| `rations` | ¿Cuántas raciones son {carbsG} g HC? | {rations} |

User flips each card, advances through the deck, then marks the session complete.

### Exam gate (soft)

- Fichas are **recommended**, not hard-blocked in v1.
- Exam page shows a Spanish banner if fichas are incomplete.
- Guided path lists fichas as the next step before exam.

### Progress

- `UserProgress.completedFlashcardLevels: string[]` — level IDs where fichas session was finished.

## Success Criteria

- [ ] Guided sequence includes fichas before exam on all 5 levels
- [ ] Deck covers every food in the level exam pool
- [ ] Completing fichas is persisted (cookie + Supabase)
- [ ] Exam shows soft warning when fichas skipped
- [ ] Completed fichas revisitable from level path
- [ ] Domain tests for deck building and guided integration

## Out of Scope

- Full Anki / SM-2 spaced repetition
- Export to `.apkg`
- Hard exam lock until fichas mastery %
- Category-wide expansion deck (phase 2)
