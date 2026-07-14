# Design: Commercial Hardening

## Technical Approach

Test-only change. Colocate all new tests under `test/commercial-hardening/` per change boundary. Follow `strict_tdd: true` from `openspec/config.yaml`.

## Test Layout

```
test/commercial-hardening/
├── api-routes-auth.test.ts      # Route handlers; mock access helpers / Supabase
├── clinical-access.test.ts      # Unit tests for requireClinicalAccess
├── docs-manifest.test.ts        # Static filesystem manifest
└── export-presets.test.ts       # parseExportRange preset coverage (30d)
```

Domain tests in `test/domain/` remain the home for shared clinical-report behavior; this change adds the missing `30d` preset case in the dedicated folder to satisfy archive follow-up without duplicating the full clinical-report suite.

## Mocking Strategy

| Layer | Mock target | Rationale |
|-------|-------------|-----------|
| Route auth | `requireClinicalAccess`, `requireContentAdmin` | Assert HTTP contract at route boundary |
| Profile auth | `createClient` → `auth.getUser` | Profile route uses inline session check |
| Access helper | `getAuthUser`, `getUserProfile`, `resolveProgress`, env | Fewer mocks than full route stack |

## Threat Matrix

| Case | RED test location | Expected |
|------|-------------------|----------|
| Clinical 401 | `api-routes-auth.test.ts` | status 401 |
| Clinical 403 export/intake | `api-routes-auth.test.ts` | status 403 |
| Intake POST/PATCH/DELETE 403 | `api-routes-auth.test.ts` | status 403 |
| Profile 401 GET/PATCH | `api-routes-auth.test.ts` | status 401 |
| Admin 403 / 503 | `api-routes-auth.test.ts` | status 403 / 503 |
| Access helper auth/feature | `clinical-access.test.ts` | reason + status |
| Docs manifest | `docs-manifest.test.ts` | empty missing list |
| Export 30d | `export-presets.test.ts` | date range |

## Production Code

No changes expected. If a test exposes a bug, fix minimally in the failing layer.
