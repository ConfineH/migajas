# Tasks: Commercial Hardening

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250–350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Test folder + route/auth coverage | PR1 | `npm test -- test/commercial-hardening` | N/A — unit/route mocks | `test/commercial-hardening/` |

## Phase 1: SDD artifacts

- [x] 1.1 `specs/commercial-hardening/spec.md` with scenarios
- [x] 1.2 `design.md` with test layout and threat matrix

## Phase 2: Test folder foundation

- [x] 2.1 Create `test/commercial-hardening/` and move manifest + route auth tests
- [x] 2.2 RED `export-presets.test.ts`: `parseExportRange("30d")`
- [x] 2.3 GREEN — preset already implemented

## Phase 3: Expanded auth coverage (TDD)

- [x] 3.1 RED `api-routes-auth.test.ts`: intake POST/PATCH/DELETE 403
- [x] 3.2 RED same file: profile GET/PATCH 401
- [x] 3.3 RED `clinical-access.test.ts`: auth + feature flag gates
- [x] 3.4 GREEN — routes/helper already correct

## Phase 4: Verify

- [x] 4.1 `npm test` full suite green
- [x] 4.2 `apply-progress.md` with TDD Cycle Evidence
- [x] 4.3 `verify-report.md` PASS
