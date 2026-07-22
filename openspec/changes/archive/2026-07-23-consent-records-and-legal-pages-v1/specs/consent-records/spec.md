# consent-records Specification

## Purpose

Persist auditable GDPR consent grants and revocations with legal text versions.

## Requirements

### Requirement: Consent record persistence

The system MUST store consent events per authenticated user with: `consent_type`, `legal_version`, `granted_at`, optional `revoked_at`, and metadata for cookie preference.

#### Scenario: Health data consent recorded on clinical enable

- GIVEN an authenticated user enabling clinical mode with explicit health-data consent
- WHEN the profile patch succeeds
- THEN a `health_data` consent row exists with the current legal version and no `revoked_at`

#### Scenario: Health data consent revoked

- GIVEN an authenticated user with active clinical mode and health-data consent
- WHEN they revoke clinical consent
- THEN `clinical_mode_enabled` is false, the active consent has `revoked_at` set, and intake routes return 403

### Requirement: Cookie preference audit

The system MUST record cookie banner decisions for authenticated users.

#### Scenario: Authenticated cookie accept

- GIVEN a logged-in user accepting cookies
- WHEN `POST /api/cookie-consent` runs with `accepted`
- THEN a `cookie_preferences` consent row is stored with metadata `preference: accepted`

### Requirement: Legal pages

The system MUST expose `/cookies` and `/terminos` with Spanish educational copy and version identifiers.

#### Scenario: Cookie inventory visible

- GIVEN a visitor opens `/cookies`
- WHEN the page renders
- THEN it lists app cookies with name, purpose, category, and duration

### Requirement: Export includes consents

Account data export MUST include the user's consent history.

#### Scenario: Export contains consent rows

- GIVEN an authenticated user with consent records
- WHEN `GET /api/account/export` runs
- THEN the JSON includes a `consents` array
