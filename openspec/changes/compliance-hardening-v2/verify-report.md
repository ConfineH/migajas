# Verify: Compliance Hardening v2

- `npm test`: 311 passed (54 files)
- `npm run build`: pass
- New route: `GET /api/cron/purge-intake` (requires `CRON_SECRET` + Vercel cron)
- Set `CRON_SECRET` in Vercel env before deploy
