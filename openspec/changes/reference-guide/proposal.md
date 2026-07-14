# Proposal: Reference Guide (Guía)

## Intent

Give learners a searchable in-app reference for carbohydrate counting — foods, grams, rations, and conversion rules — without replacing the guided course as the primary path.

## Problem

Today `/catalog` only unlocks after passing nivel-1 and shows food cards, but:

- Students mid-lesson cannot look up a portion or conversion rule quickly.
- There is no dedicated cheat sheet (10 g CHO = 1 ración, how to round, quick tables).
- The catalog is framed as “free mode” content, not as study support during the course.

Users with diabetes often need a **portable reference** while practicing, not only after unlocking everything.

## Approach

Add `/guia` — a **reference guide** distinct from the full catalog:

| Section | Content |
|---------|---------|
| **Reglas** | Spain ration rule, grams ↔ raciones table, rounding notes |
| **Alimentos** | Search + filter (reuse catalog domain); read-only |
| **Conversión rápida** | Input grams of carbs → rations (calculator widget) |

### Access model (recommended)

- **During guided course:** Guía available from nav and lesson screens (read-only, no gamification).
- **After free mode:** Same page + link to full catalog and free practice.
- **Does NOT** unlock exercises or skip lessons.

This respects `guided-course-first` while solving the “I need to check while learning” use case.

## Capabilities

### New

- `reference-guide` — rules, conversion tables, searchable food lookup, quick calculator

### Modified

- `food-catalog` — clarify relationship: Guía = study reference; Catálogo = full browse post-unlock
- Nav — add “Guía” for all users; keep “Catálogo” gated

## Success Criteria

- [ ] User can open `/guia` before passing nivel-1 exam
- [ ] Search returns foods with portion, grams, carbs, rations
- [ ] Conversion table and quick calculator visible without login
- [ ] Mobile-first layout; Spanish UI

## Out of Scope (v1)

- Offline/PDF export
- User-custom foods
- Replacing lessons with self-study-only mode

## Proposal Question Round

Assumptions to confirm before design:

1. **¿Guía siempre visible** (incluso sin login) o solo tras onboarding?
2. **¿Mismos 37 alimentos** que el catálogo o un subconjunto “esencial” durante el curso?
3. **¿Calculadora solo carbos→raciones** o también raciones→gramos?
4. **¿Enlace desde lecciones** (“Consultar guía”) además del nav?

Default if unanswered: Guía tras onboarding, mismos alimentos, calculadora bidireccional simple, enlace en lecciones.

## Non-Goals

- Removing the free-mode gate from `/catalog`
- Medical dosing or insulin advice
