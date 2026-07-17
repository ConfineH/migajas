# Archive Report: pedagogical-content-v2

**Archived:** 2026-07-17  
**Change:** `pedagogical-content-v2`  
**Verdict at archive:** verify **PASS**

## Summary

Restructured Spain guided curriculum from 12 to 16 lessons per Perplexity audit. Added modulators/fiber in nivel 1, legumes in nivel 2, home vs eating-out split in nivel 4, alcohol and delayed glucose in nivel 5. Expanded exam pools and added 27 Spain foods.

## Spec merge

| Domain | Action |
|--------|--------|
| `guided-learning` | Updated in `openspec/specs/guided-learning/spec.md` |

## Deliverables

| Artifact | Location |
|----------|----------|
| Generator | `scripts/build-pedagogical-v2.mjs` |
| Content | `src/lib/data/{lessons,exercises,exams,foods,levels}.json` |
| Tests | `test/domain/pedagogical-content-v2.test.ts` |
| Seed | `supabase/migrations/20260713160000_seed_content.sql` |

## Verification at archive

- **12/12 tasks** complete
- `npm test`: 229/229 passed
- `npm run build`: passed

## Out of scope (deferred)

- RD native curriculum and DO lesson overrides
- Fase C: photo exercises, fiber on food card, IG module
- Remote Supabase migration apply
- Production deploy smoke test
