# Design: Pedagogical Content v2 — Phase C

## Scope

Incremental ES refinements on top of archived `pedagogical-content-v2`. No lesson restructure.

## Guía

- Extend `buildReferenceTips()` ES branch with curriculum v2 topics already taught in lessons
- DO tips unchanged (plain-language layer)

## Exercises

- 10 bank exercises (`n1-ex13` … `n5-ex17`) using `count_rations` and `identify_portion`
- Focus: visual estimation prompts without label-reading setup
- Added to exam pools only (not new lesson practice steps)

## Foods

| ID | Rationale |
|----|-----------|
| `tomate-frito` | Audit gap — Spanish home cooking |
| `embutido-almidon` | Audit gap — starch filler in sausages |
| `salsa-barbacoa` | Audit gap — sugary sauces (ketchup already existed) |

## Verification

- `pedagogical-content-phase-c.test.ts` — phase C guardrails
- `pedagogical-content-v2.test.ts` — updated pool sizes
- `reference-guide.test.ts` — new ES tips
