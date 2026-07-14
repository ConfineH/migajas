# Delta for learning-analytics

## ADDED Requirements

### Requirement: User analytics dashboard

The system MUST show an analytics dashboard at `/analytics` for authenticated users based on their `learning_events` rows.

#### Scenario: Signed-in user views dashboard

- GIVEN an authenticated user with stored learning events
- WHEN they open `/analytics`
- THEN they see lesson count, exams passed, free-mode status, per-level funnel, and recent timeline

#### Scenario: Guest visits dashboard

- GIVEN no Supabase session
- WHEN they open `/analytics`
- THEN they see a prompt to sign in with Google
