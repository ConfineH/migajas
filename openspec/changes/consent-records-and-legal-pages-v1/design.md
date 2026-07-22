# Design: Consent Records & Legal Pages v1

## Legal versions

- `src/lib/domain/legal-versions.ts` — version strings + cookie inventory for `/cookies`

## Database

```sql
user_consents (
  id, user_id, consent_type, legal_version,
  granted_at, revoked_at, metadata jsonb
)
```

Types: `health_data`, `cookie_preferences`, `privacy_policy`.

RLS: `auth.uid() = user_id` select/insert/update (revoke = update `revoked_at`).

## Domain

- `src/lib/domain/consent-records.ts` — types, `hasActiveConsent`, `buildConsentGrant`, validation

## Supabase

- `src/lib/supabase/consent-records.ts` — grant, revoke, list for user

## API wiring

| Route | Change |
|-------|--------|
| `PATCH /api/profile` | grant `health_data` on enable; revoke on disable |
| `POST /api/cookie-consent` | grant `cookie_preferences` when authenticated |
| `POST /api/consent/revoke-health-data` | explicit revoke + disable clinical |
| `GET /api/account/export` | include `consents` |

## UI

| Surface | Behavior |
|---------|----------|
| `OnboardingFlow` | "Retirar consentimiento modo clínico" when active |
| `/cookies` | inventory + `CookiePreferencesPanel` |
| `/terminos` | ToS template |
| `SiteFooter` | Privacidad, Cookies, Términos, Configuración |
| `CookieConsentBanner` | link to `/cookies` |
