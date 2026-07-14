# Design: Content Admin

## Auth

```
Request → getAuthUser() → isContentAdmin(email) → service client write
```

`ADMIN_EMAILS` parsed in `src/lib/domain/admin.ts`. No client-side admin flag.

## Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Hub |
| `/admin/foods` | List + edit foods |
| `/admin/lessons` | List + edit lesson metadata |

## Files

| File | Action |
|------|--------|
| `src/lib/domain/admin.ts` | Admin email check |
| `src/lib/domain/content-admin.ts` | Input validation + row mapping |
| `src/lib/supabase/service.ts` | Service-role client |
| `src/lib/supabase/content-admin.ts` | Persist + cache refresh |
| `src/app/admin/**` | Pages + server actions |
