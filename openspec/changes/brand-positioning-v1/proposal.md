# Proposal: Brand positioning and editorial system v0.1

## Intent

Formalize Migajas brand direction (validated strategic draft) so social content, landing copy, and future AI tools share one system with automated guardrails.

## Scope

### In Scope

- `brand-positioning` capability spec
- `src/lib/domain/brand-positioning.ts` — arc, copy, disclaimers, forbidden patterns
- Vitest tests on active surfaces
- `docs/BRAND_EDITORIAL_SYSTEM.md` v0.1 (incorporating review adjustments)
- Starter `docs/content-library/` (4 libraries + batch-01)
- Wire hero + metadata to canonical constants

### Out of Scope

- Canva/Figma templates
- Instagram account setup
- Landing visual redesign
- i18n beyond ES/RD territory rules

## Capabilities

### New Capabilities

- `brand-positioning`: brand arc, copy guardrails, editorial compliance, content library manifest

### Modified Capabilities

- None

## Success Criteria

- [ ] `npm test` passes including `brand-positioning.test.ts`
- [ ] Active landing/metadata sources use `brand-positioning.ts`
- [ ] No forbidden clinical/SaaS patterns in wired surfaces
- [ ] Editorial system doc + content library exist and are referenced in tests

## Rollback Plan

Revert `brand-positioning.ts`, tests, doc files, and copy wiring in layout/home.
