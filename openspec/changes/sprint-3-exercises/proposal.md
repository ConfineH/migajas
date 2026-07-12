# Proposal: Sprint 3 — Exercise Engine

## Intent

Enable the core educational experience: users practice carb counting with interactive exercises, receive immediate feedback, and have attempts persisted server-side.

## Capabilities

### New Capabilities

- `exercise-engine` — Grade answers, validate exercise structure, select exercises for a level
- `attempts` — Record and retrieve user attempts (cookie-based, no localStorage)
- `levels-practice` — Level 1 practice flow with 3+ exercise types

## Scope

- Level 1 exercises (pan, fruta, lácteos)
- 3 exercise types: multiple choice, count rations, identify portion
- Immediate feedback with short explanation
- Attempt persistence via API + HTTP cookie

## Out of Scope

- Exams and level unlock (Sprint 4)
- Analytics events (Sprint 6)
