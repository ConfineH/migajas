# eu-security-compliance Specification

## Purpose

Close critical security and EU technical-compliance gaps without expanding product scope beyond privacy controls.

## Requirements

### Requirement: Progress completion integrity

`POST /api/progress` MUST derive level completion from stored exam sessions and attempts, not client-supplied counts.

#### Scenario: Fake exam completion rejected

- GIVEN an active exam session for `nivel-3` with zero matching attempts
- WHEN `POST /api/progress` is called with fabricated `correctCount`/`totalCount`
- THEN the response status is 403 and progress is not persisted

### Requirement: Guided step integrity

`POST /api/guided` MUST reject out-of-sequence lesson, practice, or flashcard completions.

#### Scenario: Skipped lesson rejected

- GIVEN guided progress with the first lesson incomplete
- WHEN `POST /api/guided` completes a later lesson
- THEN the response status is 403

### Requirement: Secure cookie defaults

App-owned cookies MUST use `httpOnly`, `sameSite: lax`, and `secure: true` in production.

#### Scenario: Production secure flag

- GIVEN `NODE_ENV=production`
- WHEN `getAppCookieOptions()` runs
- THEN `secure` is true

### Requirement: Security headers

The app MUST send baseline security headers on all routes.

#### Scenario: Frame protection

- GIVEN any HTTP response from the app
- WHEN headers are inspected
- THEN `X-Frame-Options` is `DENY`

### Requirement: Cookie consent

The app MUST record cookie consent before treating analytics/optional cookies as accepted.

#### Scenario: Consent persistence

- GIVEN a visitor accepts cookies
- WHEN `POST /api/cookie-consent` runs with `accepted`
- THEN a `migajas_cookie_consent` cookie is set

### Requirement: Clinical health-data consent

Enabling clinical mode MUST require explicit health-data consent.

#### Scenario: Clinical enable without consent

- GIVEN a profile patch with `clinical_mode_enabled: true` and no consent
- WHEN `validateProfilePatch` runs
- THEN validation fails with a consent error

### Requirement: Account data portability

Authenticated users MUST be able to export their personal data as JSON.

#### Scenario: Unauthenticated export

- GIVEN no Supabase session
- WHEN `GET /api/account/export` is called
- THEN the response status is 401

### Requirement: Account erasure

Authenticated users MUST be able to delete their account and associated rows.

#### Scenario: Authenticated deletion

- GIVEN an authenticated user and configured service role
- WHEN `DELETE /api/account/delete` is called
- THEN user-owned rows are deleted and auth user is removed
