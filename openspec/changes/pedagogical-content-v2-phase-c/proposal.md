# Proposal: Pedagogical Content v2 — Phase C (España refinamiento)

## Intent

Close the deferred Fase C ES backlog from `pedagogical-content-v2` verify report: align `/guia` with curriculum v2 topics, add estimation exam-bank exercises, spot-check BEDCA on v2 foods, and add missing Spain foods cited in the audit.

## Capabilities

- `reference-guide` — MODIFIED: Spain tips cover fiber policy, delayed glucose, alcohol
- `guided-learning` — MODIFIED: expanded exam pools (+10 bank exercises)
- `food-catalog` — MODIFIED: +3 Spain foods (tomate frito, embutido con almidón, salsa barbacoa)

## Success Criteria

- `/guia` ES tips mention fiber (HC totales), glucemia tardía, and alcohol
- 10 new `count_rations` / `identify_portion` bank exercises across niveles 1–5
- Exam pools grow: N1 15, N2 12, N3 11, N4 14, N5 17 (questionsPerExam unchanged)
- 3 new foods exist with plausible BEDCA notes
- `pedagogical-content-phase-c.test.ts` + full Vitest suite green

## Out of Scope

- New exercise types (photos, drag-and-drop)
- Fiber on food card, IG module (product Fase C)
- RD curriculum / DO lesson overrides
