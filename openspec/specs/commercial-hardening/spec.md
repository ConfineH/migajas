# commercial-hardening Specification

## Purpose

Close verification gaps from `commercial-product-v1` archive: auth gates, export presets, and buyer documentation manifest — tests only, no new product features.

## Requirements

### Requirement: Clinical API auth gates

Protected clinical routes MUST return the access helper status and error body without executing business logic when access is denied.

#### Scenario: Unauthenticated export request

- GIVEN `requireClinicalAccess` returns `{ ok: false, status: 401 }`
- WHEN `GET /api/clinical/export` is called
- THEN the response status is 401 and body includes the access error message

#### Scenario: Clinical access denied on export

- GIVEN `requireClinicalAccess` returns `{ ok: false, status: 403 }`
- WHEN `GET /api/clinical/export` is called
- THEN the response status is 403

#### Scenario: Unauthenticated intake read

- GIVEN `requireClinicalAccess` returns `{ ok: false, status: 401 }`
- WHEN `GET /api/intake` is called
- THEN the response status is 401

#### Scenario: Intake mutations blocked without access

- GIVEN `requireClinicalAccess` returns `{ ok: false, status: 403 }`
- WHEN `POST`, `PATCH`, or `DELETE /api/intake` is called
- THEN each response status is 403

### Requirement: Profile API auth gate

Profile routes MUST reject unauthenticated callers before loading or mutating profile data.

#### Scenario: Unauthenticated profile read

- GIVEN no Supabase session user
- WHEN `GET /api/profile` is called
- THEN the response status is 401

#### Scenario: Unauthenticated profile patch

- GIVEN no Supabase session user
- WHEN `PATCH /api/profile` is called
- THEN the response status is 401

### Requirement: Admin metrics auth gate

Admin metrics MUST reject non-admin callers and surface service-role misconfiguration.

#### Scenario: Non-admin metrics request

- GIVEN `requireContentAdmin` throws `FORBIDDEN`
- WHEN `GET /api/admin/metrics` is called
- THEN the response status is 403

#### Scenario: Missing service role

- GIVEN `requireContentAdmin` throws `SERVICE_ROLE_MISSING`
- WHEN `GET /api/admin/metrics` is called
- THEN the response status is 503

### Requirement: Clinical access helper

`requireClinicalAccess` MUST encode auth, feature flag, nivel, and opt-in gates with distinct status codes.

#### Scenario: No session user

- GIVEN `getAuthUser` returns null
- WHEN `requireClinicalAccess` runs
- THEN result is `{ ok: false, status: 401, reason: "auth" }`

#### Scenario: Feature flag disabled

- GIVEN authenticated user and `CLINICAL_MODE_ENABLED=false`
- WHEN `requireClinicalAccess` runs
- THEN result is `{ ok: false, status: 403, reason: "feature" }`

### Requirement: Export range presets

`parseExportRange` MUST support `7d` and `30d` presets anchored to a reference date.

#### Scenario: 30-day preset

- GIVEN anchor date `2026-07-14` and range `30d`
- WHEN `parseExportRange` runs
- THEN `from` is `2026-06-15` and `to` is `2026-07-14`

### Requirement: Commercial documentation manifest

The buyer kit MUST include every path listed in `commercial-packaging` spec.

#### Scenario: Required docs present

- GIVEN the repository checkout
- WHEN the manifest test runs
- THEN all required `docs/commercial/` files exist on disk
