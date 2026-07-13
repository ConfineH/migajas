# Proposal: Learning Analytics Events

## Intent

Track key milestones in the guided course so product decisions can be informed without guessing where users drop off.

## Scope

### In Scope
- Domain events: `lesson_completed`, `exam_passed`, `free_mode_unlocked`
- Server-side emission from existing API routes
- Structured event payload with timestamp and level context

### Out of Scope
- External analytics provider (Mixpanel, GA4)
- Dashboard UI
- User identification beyond anonymous session

## Capabilities

### New Capabilities
- `learning-analytics`: Event types, builders, server-side tracking hook

### Modified Capabilities
- None (behavior unchanged; observability only)

## Approach

Pure domain module for event shapes + validation. `trackLearningEvent()` logs structured JSON server-side (MVP). Wire into `/api/guided` and `/api/progress` on successful mutations.

## Success Criteria

- [ ] Three event types emitted at correct moments
- [ ] Domain tests cover event builders and gating logic
- [ ] No user-facing behavior change
