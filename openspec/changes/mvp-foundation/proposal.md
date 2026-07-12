# Proposal: MVP Foundation (Sprint 0–1)

## Intent

Bootstrap the Migajas web MVP — an educational app for learning carbohydrate counting by levels, starting with Spain. Validate that users understand the ration system (10g carbs = 1 ration), can complete onboarding in under one minute, and can browse localized Spanish food content.

## Problem

People with diabetes and their caregivers need to practice carb counting with real, everyday Spanish foods — not static tables. The MVP must teach the pattern through clear progression, immediate feedback, and visible grams + carbs + derived rations.

## Approach

- **Stack**: Next.js 16 + TypeScript + Tailwind CSS (responsive, mobile-first)
- **Data**: JSON seed from `migajas_espana_base_v1.csv` (DB-ready schema)
- **Auth**: Guest mode for MVP; no localStorage (cookies for onboarding state)
- **TDD**: Vitest in `test/` folder; domain logic tested first
- **Scope**: Sprint 0 (project skeleton) + Sprint 1 (home, onboarding, ration intro) + catalog base (Sprint 2 preview)

## Capabilities

### New Capabilities

- `ration-engine` — Calculate and format rations from carbs (10g = 1 ration)
- `food-catalog` — Load, filter, and display Spanish food items with grams, carbs, rations
- `onboarding` — Country selection (Spain), guest mode, ration unit explanation
- `home` — Landing page with primary CTA and secondary "how it works"

## Out of Scope (this change)

- Supabase integration (schema defined, wired later)
- Exercises, levels, exams (Sprint 3–4)
- Analytics dashboard (Sprint 6)
- Monetization (Sprint 7)

## Success Criteria

- User can start in < 1 minute
- Spain selected and persisted (cookie, not localStorage)
- Food catalog shows portion, grams, carbs, rations
- All domain tests pass
- App works on mobile and desktop viewports
