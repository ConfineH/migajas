# Proposal: Pedagogical Content v2 (España)

## Intent

Restructure the Spain guided course from 12 to 16 lessons based on Perplexity curriculum audit (6.5/10 → target ~8/10). Cover modulators and fiber early, move legumes to nivel 2, split mixed dishes into home vs eating out, and add alcohol plus delayed glucose concepts in nivel 5.

## Capabilities

- `guided-learning` — MODIFIED: lesson counts per level, exam pool sizes
- `food-catalog` — MODIFIED: +27 Spain foods for new lessons/exercises

## Success Criteria

- 16 lessons across 5 levels (5+3+2+3+3)
- 16 lesson-linked exercises (`ex-l1-*` … `ex-l5-*`) + expanded exam banks
- Exam draws: N1 5/12, N2–N4 4/10–12, N5 6/15
- HC totals rule for fiber (net carbs taught but not default counting)
- `pedagogical-content-v2.test.ts` + full Vitest suite green

## Out of Scope

- República Dominicana native curriculum (no RD users yet)
- New exercise types (photos, drag-and-drop)
- Fase C product features (fiber on food card, IG module)
