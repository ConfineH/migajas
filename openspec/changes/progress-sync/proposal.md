# Proposal: Progress Sync for Authenticated Users

## Intent

Persist learning progress and attempts in Supabase when signed in, and merge guest cookie data on login so users keep progress across devices.

## Scope

### In Scope
- `user_learning_state` table (progress + attempts JSONB, RLS)
- Domain merge logic (TDD in `test/domain/`)
- Auth-aware read/write in storage layer
- Merge on OAuth callback after login
- Guest mode unchanged (cookies only)

### Out of Scope
- Onboarding state sync
- Real-time multi-device conflict resolution
- Analytics per-user identification

## Capabilities

### New Capabilities
- `progress-sync`: merge guest progress with account, persist to Supabase

### Modified Capabilities
- `user-auth`: post-login sync step in callback

## Approach

Single JSONB row per user. On login: merge cookie → remote → save both DB and cookies. Authenticated reads/writes use Supabase; guests use cookies.

## Success Criteria

- [ ] Guest progress merges into account on first login
- [ ] Authenticated user sees same progress on second device
- [ ] Domain merge tests pass
- [ ] RLS blocks cross-user access
