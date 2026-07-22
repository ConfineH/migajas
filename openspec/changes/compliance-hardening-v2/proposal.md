# Proposal: Compliance Hardening v2

## Intent

Close remaining operational GDPR gaps and improve account-privacy UX without premium Supabase features.

## Capabilities

- `consent-records` — MODIFIED: privacy policy consent on login
- `intake-logging` — MODIFIED: automated retention purge
- `eu-security-compliance` — MODIFIED: HSTS header in production

## Success Criteria

- Intake entries older than `INTAKE_RETENTION_DAYS` (default 365) are purged via cron route
- Account export includes auth email
- Privacy policy consent recorded on first authenticated session
- HSTS sent in production
- Export/delete visible at top of Configuración for logged-in users
- `docs/commercial/LEGAL/MDR-POSITION.md` exists
- Tests green

## Out of Scope

- Supabase leaked-password protection (premium plan)
- Full legal counsel review
