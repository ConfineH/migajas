# Proposal: Consent Records & Legal Pages v1

## Intent

Close GDPR proof-of-consent gaps and ship minimum legal pages (cookies, terms) with auditable consent records and clinical revocation UX.

## Capabilities

- `eu-security-compliance` — MODIFIED: consent audit trail, clinical revocation, cookie policy page
- `user-profile` — MODIFIED: persist health-data consent records on enable/disable

## Success Criteria

- `user_consents` table stores grant/revoke with `legal_version` and timestamps
- Enabling clinical mode records `health_data` consent; explicit revoke disables clinical mode
- Cookie banner choice persisted for authenticated users
- `/cookies` and `/terminos` pages live; footer links to both + cookie settings
- Account export includes consent history
- Vitest suite green

## Out of Scope

- Counsel-finalized legal copy (buyer placeholders remain where noted)
- DPIA, breach procedure, RoPA documents (organizational)
- WCAG audit
