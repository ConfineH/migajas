# Design: Analytics Dashboard

## Approach

Pure `analytics-dashboard.ts` aggregates `LearningEvent[]` into funnel + timeline. Page fetches via Supabase RLS, renders mobile-first cards.

## File Changes

| File | Action |
|------|--------|
| `src/lib/domain/analytics-dashboard.ts` | Create — aggregation |
| `test/domain/analytics-dashboard.test.ts` | Create — TDD |
| `src/lib/supabase/analytics-events.ts` | Create — fetch events |
| `src/app/analytics/page.tsx` | Create — UI |
| `src/components/NavBar.tsx` | Modify — link |

## Testing

Unit tests for aggregation; manual check with signed-in user who completed lessons.
