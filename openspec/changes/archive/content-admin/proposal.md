# Proposal: Content Admin UI

## Intent

Allow trusted editors to update foods, lessons and level exams in Supabase without migrations or deploys.

## Problem

Content lives in Supabase but changes still require SQL seeds or scripts. Product iteration on copy, portions and lesson metadata is blocked.

## Approach

- `ADMIN_EMAILS` env (comma-separated) gates access server-side
- Service-role Supabase client for writes after admin check
- `/admin` hub with foods and lessons editors
- Re-hydrate content cache after successful saves

## Success Criteria

- [ ] Non-admin users get 403 on `/admin`
- [ ] Admin can edit food fields and lesson title/summary
- [ ] Domain validation tests pass
- [ ] Content cache refreshes after save

## Out of Scope

- Full lesson step JSON editor
- Multi-user role management UI
- Audit log
