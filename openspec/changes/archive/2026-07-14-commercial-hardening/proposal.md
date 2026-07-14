# Proposal: Commercial Hardening

## Intent

Close verification gaps left after `commercial-product-v1` archive (pilot override). Add targeted tests for auth gates, export presets, and buyer doc kit completeness — no new product features.

## Scope

### In Scope
- Vitest route-handler tests: 401/403 on `/api/clinical/export`, `/api/intake`, `/api/admin/metrics`
- Unit test: `parseExportRange("30d")`
- Static manifest test: required `docs/commercial/` files per `commercial-packaging` spec

### Out of Scope
- UI/component tests (`DiaryClient`, `ClinicalModePrompt`)
- E2E or Playwright
- RLS integration tests against live Supabase
- Legal template content review

## Approach

Mock `requireClinicalAccess` and `requireContentAdmin` at route boundary; assert HTTP status and error JSON. Docs manifest uses `fs.existsSync` against spec-listed paths. Follow existing Vitest + domain-test conventions.

## Success Criteria

- `npm test` green with new tests
- Archive follow-up items from `2026-07-14-commercial-product-v1` addressed
- No production code changes unless tests expose a bug
