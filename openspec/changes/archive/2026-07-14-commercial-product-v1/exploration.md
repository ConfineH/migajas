# Exploration: Commercial Product v1

**Change**: `commercial-product-v1`  
**Date**: 2026-07-14  
**Goal**: Transform Migajas MVP into a sellable perpetual-license product (€80k–250k per territory: Spain or Dominican Republic) for clinics, diabetes associations, insurers, and governments.

---

## Current State

Migajas is a **guided-course-first** educational web app (Next.js 16, Supabase Auth + Postgres, Vercel). It teaches carbohydrate counting through lessons, practice, and exams. Production: `migajas.vercel.app`.

### What exists today

| Area | State |
|------|-------|
| **Food catalog** | 54 items in `foods.json` / Supabase: **37 España**, **17 República Dominicana**. Search, category filter, region filter via `filterByRegion`. |
| **User identity** | Supabase Auth (Google + email). Onboarding (region, guest mode) stored in **HTTP cookie only** — no `user_profiles` table. |
| **Progress** | `user_learning_state` JSONB (lessons, attempts, free-mode flag). Cookie fallback for guests. |
| **Analytics** | `learning_events` table: `lesson_completed`, `exam_passed`, `free_mode_unlocked`. Dashboard at `/analytics` aggregates learning milestones only. |
| **Admin** | `/admin` — update-only for foods, lessons, exams. `ADMIN_EMAILS` gate. No create/delete, no org metrics. |
| **Regionalization** | RD food overlays + lesson text aliases in `content-localization.ts`. Onboarding warns RD guided course still uses Spain examples. |
| **Clinical / intake** | **Does not exist.** No food diary, meal logging, carb goals, PDF/CSV export, or clinical mode. |
| **Tests** | 132 Vitest domain tests across 19 files. No component tests. `strict_tdd: true` in `openspec/config.yaml`. |
| **Packaging** | Developer README only. No buyer docs, legal templates, deployment runbook, or license kit. |
| **Migrations** | 5 Supabase migrations. Seed via `scripts/generate-content-seed.mjs` → `foods.json` + `lessons.json` + `exams.json`. |
| **OpenSpec hygiene** | 6 active (unarchived) changes in `openspec/changes/`; completed work lives under `archive/`. |

### Critical gap (blocker for Feature A)

**Clinical PDF+CSV export requires intake logging first.** The planned Feature A assumes daily carb intake data that is never captured. Analytics today tracks pedagogy, not nutrition.

### Implicit dependencies not in user notes

1. **Persistent user profile** — carb goals and clinical data need a DB-backed profile (region, daily carb target, optional clinician link).
2. **Intake logging UI** — new user-facing flow post free-mode unlock (or parallel “clinical mode” entry).
3. **Aggregation domain** — daily/weekly/monthly totals, meal breakdown, goal comparison, top foods (new `lib/domain/` modules + tests).
4. **Export pipeline** — no PDF/CSV libraries in `package.json` today.
5. **RD lesson native content** — selling RD territory credibly may require more than food aliases (buyer expectation vs. current Spain-centric guided path).
6. **GDPR / health data** — intake logs are likely special-category health data under GDPR; legal templates and data-processing docs are prerequisites for EU buyers.

---

## Affected Areas

| Path | Why affected |
|------|--------------|
| `supabase/migrations/` | New tables: `user_profiles`, `intake_entries` (or `meals` + `meal_items`), optional `clinical_exports` audit log. RLS policies. |
| `src/lib/domain/` | New: intake logging, clinical aggregates, export formatters. Extend: regions, foods. |
| `src/lib/data/foods.json` | Expand from 37→150–200 (ES) and 17→150–200 (RD). |
| `scripts/generate-content-seed.mjs` | Regenerated seed SQL after bulk food additions. |
| `src/app/` | New routes: `/diario` or `/clinical`, export endpoints, profile/settings for carb goal. |
| `src/app/api/` | CRUD for intake entries; export API (`/api/clinical/export`). |
| `src/app/analytics/` | May split learning vs. clinical dashboards, or add clinical section. |
| `src/app/admin/` | Aggregated metrics page; food create/delete; regional content filters. |
| `src/lib/onboarding.ts` | Migrate region preference to `user_profiles`; cookie becomes cache/fallback. |
| `src/lib/supabase/content-admin.ts` | Extend from update-only to full CRUD. |
| `openspec/specs/` | New domains: `intake-logging`, `clinical-export`, `user-profile`, `commercial-packaging`. Delta updates to `food-catalog`, `content-admin`. |
| `docs/` (new) | Buyer README, deployment, GDPR templates, schema export guide. |
| `package.json` | PDF generation dependency if server-side PDF chosen. |

---

## Approaches

### 1. Intake logging architecture

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. Normalized Supabase tables** (`intake_entries`: user_id, logged_at, meal_slot, food_id, portion_multiplier, carbs_g computed) | Queryable for aggregates/exports; RLS per user; auditable; fits existing Supabase patterns | New migration + API + UI; requires backfill strategy for guests | **High** |
| **B. JSONB blob in `user_learning_state`** | Fast to ship; reuses existing sync | Poor query performance; export aggregation in app; schema evolution pain; weak clinical audit trail | **Medium** |
| **C. Client-only diary (localStorage)** + optional sync | Zero backend initially | Unsellable for clinical buyers; no cross-device; GDPR export harder | **Low** (reject for commercial) |

**Recommendation**: **Approach A** — normalized `intake_entries` table with denormalized `carbs_g` and `rations` at write time for stable exports. Optional `meal_slot` enum (desayuno, comida, cena, snack). Index on `(user_id, logged_at)`.

---

### 2. Clinical export technology

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. Server API route** — aggregate in domain layer; CSV as string; PDF via `@react-pdf/renderer` or `pdfkit` | Consistent output; testable domain; works on mobile | New dependency; PDF layout work; Vercel function limits for large ranges | **Medium–High** |
| **B. Client-side** — CSV via Blob download; PDF via print CSS (`window.print`) | No server deps; simple | Inconsistent PDF across browsers; harder to brand for buyers | **Medium** |
| **C. Export-as-data-only** — JSON/CSV API; buyer generates PDF | Minimal app work | Weak product story for €80k+ license | **Low** (insufficient) |

**Recommendation**: **Approach A** for CSV (always) + PDF (branded template). Domain functions in `clinical-report.ts` return structured report DTO; thin route serializes to CSV/PDF. Date ranges: 7d, 30d, custom (validated max e.g. 90d).

---

### 3. Content expansion strategy (150–200 foods per country)

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. JSON authoring + seed script** (current) | Matches existing pipeline; version-controlled; TDD on mappers | ~260 new curated items is **weeks of nutritionist work**; no admin self-service | **High** (mostly content) |
| **B. Admin CRUD + validation** | Buyers can extend catalog | Requires create/delete UI, ID generation, duplicate checks, bulk import | **Medium–High** (code) |
| **C. Spreadsheet import script** | Fast bulk load for initial 150–200 | One-off tooling; validation layer needed | **Medium** |

**Recommendation**: **Hybrid A+C for v1** — spreadsheet template → validation script → `foods.json` + migration. **Add B (admin create/delete)** in same change so buyers can maintain catalog without vendor. Phase food count: target **100/country** for first commercial ship, **150–200** as content milestone (not blocking code complete).

---

### 4. Daily carb goals + progress indicator

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. `user_profiles` table** (daily_carb_goal_g, region_id, synced from auth) | Durable; export can include goal; multi-device | Migration; sync onboarding cookie → profile on login | **Medium** |
| **B. Extend onboarding cookie** | No migration | Not clinical-grade; lost on device change | **Low** (reject) |

**Recommendation**: **Approach A**. Progress indicator: today’s logged carbs vs. goal on diary header and/or home widget (reuse `StatCard` pattern from analytics).

---

### 5. Admin aggregated metrics

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. SQL views / RPC in Supabase** (`admin_dashboard_stats`) | Efficient DAU, user counts; service-role only | Requires careful security; no PII leakage | **Medium** |
| **B. Client aggregates in admin page** | Simple queries | Slow at scale; multiple round trips | **Low–Medium** |
| **C. External analytics (PostHog, etc.)** | Rich dashboards | Wrong fit for perpetual on-prem license buyers | **N/A** |

**Recommendation**: **Approach A** — single RPC returning: total users, DAU (30d), avg levels passed, events/day. Admin-only via service role. Regional content management: filter admin lists by `country` on foods; lesson regional overrides editor (stretch).

---

### 6. Commercial packaging

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **A. `docs/commercial/` kit in repo** | Single source; ships with code | Must keep in sync with app | **Medium** |
| **B. Release tarball / git tag snapshot** | Clean handoff | Duplication | **Medium** |
| **C. Docker Compose self-host bundle** | Appeals to government/insurer IT | Supabase self-host complexity | **High** |

**Recommendation**: **Approach A** now, **C as optional Phase 2** for buyers who cannot use Supabase Cloud. Kit contents:

- `README-BUYER.md` — product overview, territory license terms placeholder
- `DEPLOYMENT.md` — Vercel + Supabase setup, env vars, migrations, seed
- `SCHEMA.md` + `supabase/schema.sql` dump or migration bundle
- `LEGAL/` — GDPR DPA template, privacy policy template, cookie notice, health-data disclaimer (legal review required)
- `ADMIN-GUIDE.md` — content editing, metrics, user support boundaries
- Perpetual license file template (not legal advice)

---

## Recommended phasing

### Phase 1 — Commercial MVP (weeks 1–6, realistic for **one senior dev**)

**Shippable to early buyer pilot; not full 150–200 foods.**

1. `user_profiles` + carb goal + onboarding sync
2. Intake logging (core UX: add food from catalog, meal slot, edit/delete same day)
3. Clinical aggregates domain + unit tests
4. CSV + PDF export (7/30/custom range)
5. Admin: user count + DAU 30d + avg levels passed
6. Commercial docs kit (deployment, schema, GDPR templates draft)
7. Food expansion to **~80–100 per country** (parallel content work)

### Phase 2 — Territory-complete (weeks 7–12)

1. Foods → 150–200 per country
2. Admin food create/delete + bulk import
3. RD guided lesson localization (beyond aliases) OR explicit “ES curriculum + RD catalog” positioning in buyer docs
4. Component tests for diary UI
5. Archive stale OpenSpec changes

### Phase 3 — Enterprise hardening (optional)

1. Docker/self-host path
2. Clinician read-only portal (view patient export with consent)
3. Audit log for exports
4. SSO / org tenancy if multi-clinic buyers emerge

---

## Timeline realism: 4–6 weeks?

| Scope | 4–6 weeks? |
|-------|------------|
| **Full user feature list (A–E) at 150–200 foods/country** | **No** — content alone is 4–8 weeks with a nutritionist; plus intake + export + profile + admin + docs ≈ **10–14 weeks** one dev |
| **Commercial MVP pilot** (intake + export + goals + docs + ~100 foods + basic admin metrics) | **Tight but possible** in 6 weeks with scope discipline and content help |
| **Packaging-only** (docs, schema export, no new features) | **Yes** — ~1 week |

**Verdict**: 4–6 weeks is realistic only for **Phase 1 Commercial MVP**, not the complete transformation. Sell roadmap explicitly: pilot → territory content complete → enterprise options.

---

## Risks

1. **Blocker**: Clinical export without intake logging — must be sequenced first in proposal/tasks.
2. **Health data / GDPR**: Intake logs trigger stricter obligations (DPA, retention, export/delete rights). Legal templates need human review before EU sales.
3. **Content quality at scale**: 300+ new food rows risk inconsistent carb values — needs nutritionist validation per territory.
4. **RD product credibility**: Guided course Spain-centric; RD buyers may expect native curriculum — scope creep or explicit positioning required.
5. **No user profile persistence**: Carb goals cannot ship without migration from cookie-only onboarding.
6. **Admin update-only**: Content expansion without create/delete burdens vendor for every buyer customization.
7. **OpenSpec debt**: 6 unarchived changes may confuse SDD pipeline; archive before large change.
8. **TDD budget**: `strict_tdd: true` adds ~30% time but is appropriate for clinical aggregates.
9. **400-line PR guard**: This change will require **chained PRs** (intake schema → logging UI → export → content → docs).
10. **Perpetual license ops**: Buyers expect upgrade/migration path; document how schema migrations ship post-sale.

---

## Recommendation (summary)

Build **normalized intake logging + user profiles + server-side clinical export** on the existing Supabase/Next.js stack. Expand foods via **validated bulk import** to ~100/country for first license, with **admin CRUD** for buyer self-service. Deliver **commercial docs kit** in parallel. Treat **150–200 foods and full RD curriculum** as Phase 2 content milestones. **Do not promise full A–E in 4–6 weeks** — propose **6-week Commercial MVP pilot** instead.

---

## Ready for Proposal

**Yes**, with these orchestrator notes for the user:

1. Explicitly add **intake logging** and **user profiles** as prerequisites in the proposal (not implied).
2. Split into **Phase 1 (6 weeks)** vs **Phase 2 (content + admin CRUD)** with chained PR strategy.
3. Flag **legal/GDPR review** as external dependency before EU clinic sales.
4. Clarify RD territory: **catalog-localized** vs **full guided localization** — buyer-facing decision.
5. Archive completed OpenSpec changes before `sdd-spec` to reduce noise.

**Next phase**: `sdd-propose`
