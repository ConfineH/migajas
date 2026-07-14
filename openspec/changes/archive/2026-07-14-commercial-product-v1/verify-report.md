```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:combined-test-build-2026-07-14
verdict: fail
blockers: 2
critical_findings: 35
requirements: 26/26
scenarios: 23/58
test_command: npm test
test_exit_code: 0
test_output_hash: sha256:c20aead6ecd9ca70f68e03553c18c70d8ec9ffb75bef50ec1fdf46275c5ce467
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:7e7908bf04a927f687bd042ba1abf9cf0b5d40fc47fb4d55ca5cf7df0
```

## Verification Report

**Change**: commercial-product-v1  
**Version**: Phase 1 (openspec delta, 8 domains)  
**Mode**: Strict TDD (`openspec/config.yaml` → `strict_tdd: true`)

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 26 |
| Tasks complete | 26 |
| Tasks incomplete | 0 |

### Build & Tests Execution

**Build**: ✅ Passed

```text
npm run build
▲ Next.js 16.2.10 (Turbopack)
✓ Compiled successfully
✓ TypeScript finished
✓ Static pages generated (29 routes)
Routes include: /diario, /api/profile, /api/intake, /api/clinical/export, /api/admin/metrics
```

**Tests**: ✅ 166 passed / ❌ 0 failed / ⚠️ 0 skipped (25 files)

```text
npm test
 RUN  v4.1.10
 Test Files  25 passed (25)
      Tests  166 passed (166)
   Duration  ~9.4s
```

**Coverage**: ➖ Not available (`openspec/config.yaml` → `coverage: false`)

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| **commercial-packaging** | | | |
| Commercial documentation kit | Buyer locates kit | (none) | ❌ UNTESTED |
| README-BUYER | Buyer reads product overview | (none) | ❌ UNTESTED |
| DEPLOYMENT runbook | New environment bootstrap | (none) | ❌ UNTESTED |
| SCHEMA documentation | Buyer reviews data model | (none) | ❌ UNTESTED |
| ADMIN-GUIDE | Content manager onboarding | (none) | ❌ UNTESTED |
| LEGAL drafts | Legal review handoff | (none) | ❌ UNTESTED |
| Territory licensing model | RD licensee clarity | (none) | ❌ UNTESTED |
| Territory licensing model | ES licensee clarity | (none) | ❌ UNTESTED |
| **food-catalog** | | | |
| Diary food selection | Pick food from diary | (none) | ❌ UNTESTED |
| Diary food selection | Picker respects region | (none) | ❌ UNTESTED |
| Diary food selection | Clinical mode off hides picker | (none) | ❌ UNTESTED |
| Phase 1 catalog expansion | Spain catalog size 80–100 | `test/domain/catalog-size.test.ts` > has at least 80 foods | ✅ COMPLIANT (80 items) |
| Phase 1 catalog expansion | RD catalog size 80–100 | `test/domain/catalog-size.test.ts` > has at least 80 foods | ✅ COMPLIANT (81 items) |
| Phase 1 catalog expansion | Expanded item displays correctly | (none) | ❌ UNTESTED |
| **user-profile** | | | |
| User profile persistence | Profile created on first authenticated session | (none) | ❌ UNTESTED |
| User profile persistence | Guest has no profile row | (none) | ❌ UNTESTED |
| Onboarding cookie sync | First login inherits cookie region and goal | `test/domain/user-profile.test.ts` > inherits cookie region and goal | ✅ COMPLIANT |
| Onboarding cookie sync | Existing profile not overwritten by stale cookie | `test/domain/user-profile.test.ts` > keeps existing profile goal over stale cookie | ✅ COMPLIANT |
| Settings editing | User updates daily carb goal | (none) | ❌ UNTESTED |
| Settings editing | Invalid goal rejected | `test/domain/user-profile.test.ts` > rejects zero / rejects invalid daily carb goal | ✅ COMPLIANT |
| Clinical mode opt-in flag | Clinical mode off by default | `test/domain/user-profile.test.ts` > defaults clinical mode to false | ✅ COMPLIANT |
| **clinical-export** | | | |
| User-initiated export only | User requests CSV export | (none) | ❌ UNTESTED |
| User-initiated export only | Unauthenticated export rejected | (none) | ❌ UNTESTED |
| Export formats | PDF download | (none) | ❌ UNTESTED |
| Export formats | CSV structure | `test/domain/clinical-export.test.ts` > includes daily and meal rows | ✅ COMPLIANT |
| Date range selection | Custom range within limit | (none) | ❌ UNTESTED |
| Date range selection | Custom range over limit rejected | `test/domain/clinical-report.test.ts` > rejects custom ranges over 90 days | ✅ COMPLIANT |
| Report contents | Goal comparison included | `test/domain/clinical-report.test.ts` > includes goal comparison when goal is set | ✅ COMPLIANT |
| Report contents | No goal set | `test/domain/clinical-report.test.ts` > omits goal comparison when goal is null | ✅ COMPLIANT |
| Report contents | Top foods section optional | `test/domain/clinical-report.test.ts` > ranks top foods by carbs | ✅ COMPLIANT |
| Educational disclaimer on PDF | Disclaimer visible | `test/domain/clinical-export.test.ts` > includes Spanish disclaimer | ✅ COMPLIANT |
| Own-data-only access | User cannot export another user's data | (none) | ❌ UNTESTED |
| **content-admin** | | | |
| Anonymized organization metrics | Admin views metrics dashboard | (none) | ❌ UNTESTED |
| Anonymized organization metrics | Optional funnel displayed | `test/domain/admin-metrics.test.ts` > parses aggregate metrics without PII | ⚠️ PARTIAL (parser only) |
| Anonymized organization metrics | Non-admin denied | (none) | ❌ UNTESTED |
| No individual PII or intake in admin v1 | Metrics response has no PII | `test/domain/admin-metrics.test.ts` > parses aggregate metrics without PII | ✅ COMPLIANT |
| No individual PII or intake in admin v1 | No intake admin view | (none) | ❌ UNTESTED |
| **progress-sync** | | | |
| Profile sync on authentication | First login creates profile from cookie | `test/domain/user-profile.test.ts` > inherits cookie region and goal | ⚠️ PARTIAL (merge unit only) |
| Profile sync on authentication | Profile sync does not block progress merge | (none) | ❌ UNTESTED |
| Profile sync on authentication | Returning user keeps DB profile | `test/domain/user-profile.test.ts` > keeps existing profile goal over stale cookie | ✅ COMPLIANT |
| Profile readable for authenticated sessions | Authenticated app uses profile region | `test/domain/intake.test.ts` > denormalizes RD rations at 15 g | ✅ COMPLIANT |
| **intake-logging** | | | |
| Clinical mode gate | Eligible user opens diary | (none) | ❌ UNTESTED |
| Clinical mode gate | Nivel 2 user blocked | `test/domain/guided-flow.test.ts` > canUseClinicalMode requires nivel 3 | ⚠️ PARTIAL (domain gate only) |
| Clinical mode gate | Clinical mode disabled | `test/domain/guided-flow.test.ts` > canUseClinicalMode requires opt-in | ✅ COMPLIANT |
| Clinical mode gate | Guest blocked | (none) | ❌ UNTESTED |
| Intake entry structure | Add entry with default portion | `test/domain/intake.test.ts` > accepts valid write payload | ✅ COMPLIANT |
| Intake entry structure | Invalid meal slot rejected | `test/domain/intake.test.ts` > rejects invalid meal slot | ✅ COMPLIANT |
| Denormalized nutrition at write | Spain ration denormalization | `test/domain/intake.test.ts` > denormalizes Spain rations at 10 g | ✅ COMPLIANT |
| Denormalized nutrition at write | RD ration denormalization | `test/domain/intake.test.ts` > denormalizes RD rations at 15 g | ✅ COMPLIANT |
| Denormalized nutrition at write | Portion multiplier applied | `test/domain/intake.test.ts` > applies portion multiplier | ✅ COMPLIANT |
| Same-day CRUD | Edit today's entry | `test/domain/intake.test.ts` > allows edits on the same local day | ⚠️ PARTIAL (date guard only) |
| Same-day CRUD | Delete today's entry | (none) | ❌ UNTESTED |
| Same-day CRUD | Prior-day entry read-only | `test/domain/intake.test.ts` > blocks edits on prior days | ✅ COMPLIANT |
| Data isolation | Cross-user access denied | (none) | ❌ UNTESTED |
| **guided-learning** | | | |
| Nivel 3 clinical mode unlock | Opt-in offered after nivel 3 pass | (none) | ❌ UNTESTED |
| Nivel 3 clinical mode unlock | Opt-in not shown before nivel 3 | (none) | ❌ UNTESTED |
| Nivel 3 clinical mode unlock | Guided flow preserved | (none) | ❌ UNTESTED |
| Nivel 3 clinical mode unlock | Catalog gate unchanged | (none) | ❌ UNTESTED |

**Compliance summary**: 23/58 scenarios compliant (7 partial, 28 untested)

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| User profiles + RLS | ✅ Implemented | `supabase/migrations/20260715140000_commercial_profiles.sql` |
| Intake entries + RLS | ✅ Implemented | `supabase/migrations/20260715150000_commercial_intake.sql` |
| Admin RPC | ✅ Implemented | `supabase/migrations/20260715160000_commercial_admin_rpc.sql` |
| Profile sync on auth | ✅ Implemented | `src/lib/profile-sync.ts` wired in callback + `auth-session.ts` |
| Clinical gate | ✅ Implemented | `src/lib/clinical-access.ts`, `canUseClinicalMode` |
| Diary UI | ✅ Implemented | `src/app/diario/page.tsx`, region-filtered foods, same-day `editable` flag |
| CSV/PDF export | ✅ Implemented | `src/app/api/clinical/export/route.ts`, pdfkit layout |
| Admin metrics | ✅ Implemented | `src/app/api/admin/metrics/route.ts`, StatCards on admin page |
| Commercial kit | ✅ Implemented | `docs/commercial/*` (8 files incl. `LEGAL/`) |
| Foods 80–100/country | ✅ Implemented | ES=80, RD=81 in `src/lib/data/foods.json` |
| Phase 2 deferrals | ✅ As proposed | No admin food CRUD UI, no Docker bundle, RD curriculum docs-only |
| Legal docs | ⚠️ Draft only | Templates marked for qualified legal review (expected) |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Normalized `intake_entries` with denormalized carbs | ✅ Yes | `buildIntakeEntry` at write |
| Client `local_date` on writes | ✅ Yes | Validated in intake domain + API |
| `region_id` es \| do | ✅ Yes | Matches `regions.ts` |
| pdfkit in Node route | ✅ Yes | `runtime = "nodejs"` on export route |
| Admin metrics via RPC + service role | ✅ Yes | `get_org_dashboard_stats()` |
| `canUseClinicalMode` in guided-flow | ✅ Yes | Unit-tested matrix |
| Four chained PRs | ✅ Yes | Tasks reflect PR1–PR4 split |
| Single combined migration file | ⚠️ Deviation | Design listed one migration; tasks applied three (profiles, intake, admin) — additive, lower risk |
| Optional diary component tests | ✅ Yes | Design marked optional; not present |

### TDD Compliance

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported | ❌ | No `apply-progress` artifact or TDD Cycle Evidence table found |
| All tasks have tests | ⚠️ | Domain unit tests exist for core logic; route/UI/integration tests largely absent |
| RED confirmed (tests exist) | ✅ | `test/domain/{user-profile,intake,clinical-report,clinical-export,guided-flow}.test.ts` present |
| GREEN confirmed (tests pass) | ✅ | 166/166 pass at verification time |
| Triangulation adequate | ⚠️ | Domain tests cover happy + error paths; UI/route scenarios mostly single-case or missing |
| Safety Net for modified files | ➖ | Not documented in apply-progress |

**TDD Compliance**: 2/6 checks passed (strict TDD protocol incomplete)

### Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | ~40 (commercial domains) | 7 | Vitest |
| Integration | 0 | 0 | not used for this change |
| E2E | 0 | 0 | not installed |
| **Total** | **166** (full suite) | **25** | Vitest |

Commercial-change coverage is overwhelmingly unit/domain layer. No route-handler or component tests for `/diario`, export API, admin metrics API, or `ClinicalModePrompt`.

### Changed File Coverage

Coverage analysis skipped — no coverage tool detected (`coverage: false` in openspec config).

### Assertion Quality

**Assertion quality**: ✅ All assertions verify real behavior

Scanned commercial domain tests; no tautologies, ghost loops, or smoke-only renders found. Tests assert concrete values (carbs, rations, CSV rows, disclaimer text, aggregate field shapes).

### Quality Metrics

**Linter**: ➖ Not run (verification scope: test + build)  
**Type Checker**: ✅ Passed (via `next build` TypeScript step)

### Issues Found

**CRITICAL**

1. **Strict TDD evidence missing** — no `apply-progress` / TDD Cycle Evidence table despite `strict_tdd: true`.
2. **28 spec scenarios UNTESTED** — no passing covering test (docs kit, route auth, UI flows, RLS isolation, admin gate, diary picker, guided-learning UI scenarios).
3. **7 scenarios PARTIAL** — domain-only tests where spec implies route/UI/integration behavior.
4. **No integration/E2E tests** for `/api/profile`, `/api/intake`, `/api/clinical/export`, `/api/admin/metrics` despite design calling for handler tests.

**WARNING**

1. **Legal docs are drafts only** — `docs/commercial/LEGAL/README.md` explicitly requires qualified legal review before EU clinic use (expected per proposal).
2. **Phase 2 items correctly deferred** — admin food CRUD, 150–200 foods, Docker self-host, full RD curriculum (documented in `README-BUYER.md`).
3. **Catalog size test lower-bound only** — `catalog-size.test.ts` asserts `>= 80` but not upper bound ≤100; actual counts (80/81) are within spec.
4. **Weekly/monthly rollups untested** — `buildRollups` implemented in `clinical-report.ts` but no test exercises rollup rows in CSV/PDF output.
5. **Design migration split** — three migrations vs one file in design.md (non-breaking deviation).
6. **30d export preset** — `parseExportRange("30d")` implemented but not covered by tests (only `7d` and over-limit custom tested).

**SUGGESTION**

1. Add Vitest route-handler tests with mocked Supabase for auth gates (401/403) on export, intake, admin metrics.
2. Add component test for `DiaryClient` food picker region filter.
3. Add static doc manifest test listing required `docs/commercial/` files.
4. Record TDD Cycle Evidence in apply-progress for strict TDD audit trail.

### Verdict

**FAIL**

All 26 tasks are complete and `npm test` / `npm run build` pass, but **Strict TDD compliance is not met**: 28/58 spec scenarios lack covering tests, 7 are partial, and no apply-progress TDD evidence was produced. Implementation appears coherent with design and proposal scope; failures are verification/TDD-coverage gaps, not build breakage.
