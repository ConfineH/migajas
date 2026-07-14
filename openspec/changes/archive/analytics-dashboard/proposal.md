# Proposal: Analytics Dashboard (Sprint 6)

## Intent

Give signed-in users a visual view of their learning milestones from `learning_events` — funnel per level and recent timeline.

## Scope

### In Scope
- `/analytics` page (Spanish UI)
- Domain aggregation (TDD)
- Fetch own events via RLS
- Login required; guests see CTA

### Out of Scope
- Admin cross-user analytics
- Charts library / external BI
- Guest event backfill

## Capabilities

### New Capabilities
- `analytics-dashboard`: aggregate and display user learning events

### Modified Capabilities
- `learning-analytics`: dashboard consumes persisted events

## Success Criteria

- [ ] Authenticated user sees funnel and timeline from Supabase events
- [ ] Domain aggregation tests pass
- [ ] Guests prompted to sign in
