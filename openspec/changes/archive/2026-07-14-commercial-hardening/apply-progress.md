# Apply Progress: commercial-hardening

**Mode**: Strict TDD (`openspec/config.yaml` → `strict_tdd: true`)

## TDD Cycle Evidence

| Task | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|------|-----------|-------|------------|-----|-------|-------------|----------|
| 2.2 export 30d | `test/commercial-hardening/export-presets.test.ts` | Unit | N/A (new) | ✅ Written | ✅ Passed | ➖ Single scenario | ➖ None needed |
| 2.1 docs manifest | `test/commercial-hardening/docs-manifest.test.ts` | Unit | N/A (moved) | ✅ Written | ✅ Passed | ➖ Single scenario | ➖ None needed |
| 3.1 intake mutations | `test/commercial-hardening/api-routes-auth.test.ts` | Route | ✅ 174/174 | ✅ Written | ✅ Passed | ✅ POST/PATCH/DELETE | ➖ None needed |
| 3.2 profile auth | `test/commercial-hardening/api-routes-auth.test.ts` | Route | ✅ prior | ✅ Written | ✅ Passed | ✅ GET + PATCH | ➖ None needed |
| 3.3 clinical-access | `test/commercial-hardening/clinical-access.test.ts` | Unit | ✅ prior | ✅ Written | ✅ Passed | ✅ auth/feature/nivel/ok | ➖ None needed |
| 3.x admin gates | `test/commercial-hardening/api-routes-auth.test.ts` | Route | ✅ prior | ✅ Written | ✅ Passed | ✅ 403 + 503 | ➖ None needed |

## Work Unit Evidence

| Evidence | Value |
|----------|-------|
| Focused test command | `npm test -- test/commercial-hardening` → 16/16 passed |
| Runtime harness | N/A — route tests mock access boundaries; no live Supabase |
| Rollback boundary | Remove `test/commercial-hardening/` and restore prior scattered test files |

## Files Changed

| File | Action |
|------|--------|
| `test/commercial-hardening/*.test.ts` | Created (4 files) |
| `test/api/clinical-routes-auth.test.ts` | Deleted (consolidated) |
| `test/commercial/docs-manifest.test.ts` | Deleted (consolidated) |
| `test/domain/clinical-report.test.ts` | Modified (30d moved to change folder) |
| `openspec/changes/commercial-hardening/*` | SDD artifacts |

## Deviations from Design

None — implementation matches design. No production code changes required.

## Issues Found

- `clinical-access` mocks must use `UserProgress.completions` shape (not `levelCompletions`) — fixed during GREEN.

## Status

14/14 tasks complete. Ready for verify.
