# Archive Report: commercial-product-v1

**Archived:** 2026-07-14  
**Change:** `commercial-product-v1`  
**Verdict at archive:** verify **FAIL** (Strict TDD coverage) — **intentional override**, user-approved for pilot/product delivery

## Summary

Delivered Phase 1 commercial product capabilities: user profiles with clinical opt-in, intake diary (nivel 3+), clinical CSV/PDF export, anonymized admin org metrics, buyer documentation kit, and expanded food catalog (~80 items per territory).

## Spec merge

| Domain | Action |
|--------|--------|
| `user-profile` | Created in `openspec/specs/` |
| `intake-logging` | Created |
| `clinical-export` | Created |
| `commercial-packaging` | Created |
| `guided-learning` | Merged ADDED (nivel 3 clinical unlock) |
| `food-catalog` | Merged ADDED (diary picker, catalog expansion) |
| `progress-sync` | Merged ADDED (profile sync on auth) |
| `content-admin` | Merged ADDED (anonymized org metrics) |

## Verify override rationale

- **26/26 tasks** marked complete; `npm test` and `npm run build` green at archive time
- Strict TDD audit: **23/58** scenarios fully evidenced; **7** partial; **28** untested
- Gaps are primarily route auth integration tests, UI tests, and docs manifest — acceptable for pilot; tracked in follow-up change **`commercial-hardening`**

## Follow-up

- **`commercial-hardening`**: ✅ archived 2026-07-14 (route auth tests, docs manifest, `30d` preset)
- Ops: apply Supabase migrations, `npm run db:seed`, set `CLINICAL_MODE_ENABLED`, `ADMIN_EMAILS`
- Legal templates in `docs/commercial/LEGAL/` require qualified review before EU clinic sales

## PR stack (merged/delivered)

1. Profiles + guided unlock wiring  
2. Intake diary + clinical access gates  
3. Clinical export (CSV/PDF)  
4. Admin metrics + commercial docs + catalog expansion
