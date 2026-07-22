# Proposal: EU Security & Compliance

## Intent

Harden Migajas against progress-integrity bypass and close technical GDPR/ePrivacy gaps identified in the security audit, using Strict TDD.

## Scope

### In Scope
- Server-side validation for `/api/progress` and `/api/guided`
- Secure cookies + security headers
- Cookie consent banner + `/privacidad`
- Art. 9 health-data consent on clinical mode activation
- Account data export (Art. 20) and deletion (Art. 17) APIs
- Vitest coverage in `test/eu-security-compliance/`

### Out of Scope
- Legal finalization of buyer templates (counsel review)
- Supabase leaked-password protection toggle (dashboard config)
- Automated retention cron for `intake_entries`
- RLS integration tests against live Supabase

## Success Criteria

- `npm test` green with new security tests
- Fake `nivel-3` completion via API returns 403
- Clinical mode enable requires explicit `health_data_consent`
- Authenticated users can export/delete account data
