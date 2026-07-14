# Proposal: Analytics Backfill on Login

## Intent

When a user logs in with existing progress (guest or pre-analytics), emit missing `learning_events` so Actividad timeline matches Progreso.

## Success Criteria

- [ ] Login backfill creates lesson/exam/free-mode events from progress
- [ ] Idempotent — no duplicate events on repeat login
- [ ] Domain tests for event derivation
