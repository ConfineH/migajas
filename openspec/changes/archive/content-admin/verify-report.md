# Verify: content-admin, ui-design-system-v1, analytics-backfill

- npm test: pass
- npm run build: pass
- proxy.ts replaces middleware.ts

## Manual

- Set `ADMIN_EMAILS` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel for admin writes
- Re-login to backfill timeline events from existing progress
