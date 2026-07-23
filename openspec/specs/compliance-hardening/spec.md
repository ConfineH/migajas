# compliance-hardening Specification

## Purpose

Operational GDPR hardening: retention, export completeness, privacy consent on login, transport security, and visible account controls.

## Requirements

### Requirement: Intake data retention

The system MUST purge `intake_entries` older than `INTAKE_RETENTION_DAYS` (default 365) via an authorized cron endpoint.

#### Scenario: Cron purge authorized

- GIVEN `CRON_SECRET` is configured
- WHEN `GET /api/cron/purge-intake` is called with `Authorization: Bearer <secret>`
- THEN expired intake rows are deleted and the response reports the count

### Requirement: Export includes account email

Account export JSON MUST include `account.email` from the authenticated session.

### Requirement: Privacy policy consent on login

The system MUST record `privacy_policy` consent on first authenticated session if not already active.

### Requirement: HSTS in production

Production responses MUST include `Strict-Transport-Security`.

### Requirement: Visible account privacy controls

Authenticated users in Configuración MUST see export and delete actions without navigating wizard steps.
