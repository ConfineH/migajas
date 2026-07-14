# Archive Report: commercial-hardening

**Archived:** 2026-07-14  
**Change:** `commercial-hardening`  
**Verdict at archive:** verify **PASS** (Strict TDD)

## Summary

Closed verification gaps from `commercial-product-v1` pilot archive: route auth gates (clinical, profile, admin), `requireClinicalAccess` unit tests, `parseExportRange("30d")` preset test, and static `docs/commercial/` manifest test. Test-only change — no production code modified.

## Spec merge

| Domain | Action |
|--------|--------|
| `commercial-hardening` | Created in `openspec/specs/` |

## Deliverables

| Artifact | Location |
|----------|----------|
| Test suite | `test/commercial-hardening/` (4 files, 16 tests) |
| SDD change | `openspec/changes/archive/2026-07-14-commercial-hardening/` |

## Verification at archive

- **14/14 tasks** complete
- **12/12** spec scenarios with passing covering tests
- `npm test`: 182/182 passed
- `npm run build`: passed
- TDD Cycle Evidence in `apply-progress.md`

## Follow-up from commercial-product-v1 — resolved

| Item | Status |
|------|--------|
| Route 401/403 tests (clinical/admin APIs) | ✅ Done |
| Docs manifest test | ✅ Done |
| `parseExportRange("30d")` unit test | ✅ Done |

## Remaining deferred (out of scope)

- UI/component tests (`DiaryClient`, `ClinicalModePrompt`)
- E2E / live Supabase RLS integration tests
- Ops: apply migrations, `db:seed`, env vars (`CLINICAL_MODE_ENABLED`, `ADMIN_EMAILS`)
- Legal template review before EU clinic sales
