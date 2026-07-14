# Proposal: Commercial Product v1

## Intent

Sell Migajas as perpetual-license (€80k–250k/territory) to clinics and diabetes associations. Add intake + export; guided-course-first. Education through nivel 2; **opt-in diary at nivel 3**.

## Scope

### In Scope (Phase 1 — 6 weeks)
- `user_profiles` (region, daily carb goal); cookie → DB sync
- Clinical mode: nivel 3+ unlock, opt-in
- Intake: `intake_entries`, meal slots, same-day CRUD, catalog-backed
- Aggregates + TDD; totals vs goal
- CSV + PDF export (7/30/custom ≤90d); user-initiated
- Admin: anonymized — user count, 30d active, avg levels, optional funnel
- `docs/commercial/`: buyer README, DEPLOYMENT.md, schema, GDPR drafts; territory license notes (ES primary; RD overlays + 15g)
- Foods ~80–100/country via bulk import

### Out of Scope (Phase 1)
- AI/ML, payments, native apps, EHR; admin food CRUD; user admin views
- Full RD curriculum; 150–200 foods; Docker/self-host; clinician portal; SSO

### Phase 2
- 150–200 foods; admin CRUD + bulk import; RD curriculum; self-host bundle

## Capabilities

### New
- `user-profile`: profiles, carb goals, region sync
- `intake-logging`: opt-in diary at nivel 3+; denormalized carbs at write
- `clinical-export`: server CSV/PDF from aggregates
- `commercial-packaging`: deploy runbook, legal drafts, licensing notes

### Modified
- `guided-learning`: nivel 3 gate + clinical opt-in
- `content-admin`: anonymized org metrics RPC
- `food-catalog`: intake selection; expanded catalog
- `progress-sync`: profile sync on auth

## Approach

Single codebase, region selector; territories licensable in docs. **Sequence: profiles → intake → export.** Supabase + RLS; domain aggregates; thin export API. Deploy: Supabase eu-west-1 + Vercel.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | New | profiles, intake, admin RPC |
| `src/lib/domain/` | New | intake, clinical-report |
| `src/app/` | New/Mod | diary, export API, admin metrics |
| `docs/commercial/` | New | buyer kit |
| `foods.json` | Mod | ~80–100/country |

## Risks

| Risk | L | Mitigation |
|------|---|------------|
| GDPR / health data | H | Legal templates; no admin PII |
| RD curriculum gap | M | Buyer docs: ES curriculum + RD catalog |
| PR scope | H | Chained PRs: profile → intake → export |

## Rollback Plan

Down-migrate tables; flag clinical routes; disable admin RPC/export. Education MVP unaffected.

## Dependencies

Legal/GDPR review; nutritionist validation; PDF lib.

## Success Criteria

- [ ] Carb goal persists via `user_profiles`
- [ ] Nivel 3+ opt-in diary; intake CRUD works
- [ ] CSV/PDF export with goal comparison
- [ ] Admin anonymized metrics only
- [ ] Commercial kit; ~80–100 foods; tests pass
