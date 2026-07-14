# Proposal: Pedagogical Pivot — Guided Learning

## Intent

Realign Migajas from "catalog + loose exercises" to a **guided course**: short lessons → linked practice → level exam → free mode (catalog + free practice).

This implements the product direction from *Notas de revisión para desarrollador*.

## Problem

Users need to **learn** carb counting, not just query a food database. The previous flow prioritized catalog and free practice as entry points, which felt like a reference tool rather than an educational product.

## Approach

- **Guided path** per level: lesson → practice → … → exam
- **Lessons** with explanation + visual food examples
- **Practice** tied to each lesson (single exercise)
- **Exam** at end of nivel-1 unlocks **free mode**
- **Catalog** and **free practice** gated until exam passed (≥60%)
- Cookie-based progress (lessons, practices, exam, freeModeUnlocked)
- TDD in `test/domain/guided-flow.test.ts`

## Capabilities

### New Capabilities

- `guided-learning` — Guided sequence, next-step logic, free-mode gate
- `lessons` — Lesson content, steps (explanation, example, practice), lesson progress

### Modified Capabilities

- `food-catalog` — Reference mode only; not primary entry (gated until free mode)
- `exercise-engine` — Practices embedded in lessons; exams separate from free practice

## Success Criteria

- User flow: onboarding → `/learn/nivel-1` → lessons → practices → exam
- Catalog/levels inaccessible until nivel-1 exam passed
- 37 tests pass (guided-flow + existing)
- UX communicates "course" not "catalog"

## Out of Scope (this change)

- Lessons for levels 2–5 (structure ready, content later)
- Admin CMS for lessons
- Analytics events
