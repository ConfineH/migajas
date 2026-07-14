# Spec: Content Admin

## Requirements

### AUTH-1
Only users whose email is listed in `ADMIN_EMAILS` may access `/admin` routes.

### AUTH-2
Content writes use the Supabase service role server-side after admin verification.

### FOOD-1
Admins can update food name, category, portion, grams, carbs, difficulty, type and notes.

### LESSON-1
Admins can update lesson title and summary.

### EXAM-1
Admins can update exam title, description and exercise IDs per level.

### LESSON-2
Admins can update lesson step title and body content.

## Commercial Product Requirements

### Requirement: Anonymized organization metrics

The system MUST expose an admin-only view backed by a single aggregated query (e.g., RPC) returning organization-level metrics: total registered users, count of users active in the last 30 days, average number of guided levels passed per user, and MAY include an optional learning funnel (lessons started → exams passed → free mode unlocked).

#### Scenario: Admin views metrics dashboard

- GIVEN a user whose email is in `ADMIN_EMAILS`
- WHEN they open the admin metrics section
- THEN they see total users, 30-day active users, and average levels passed as aggregate numbers only

#### Scenario: Optional funnel displayed

- GIVEN admin metrics with funnel enabled
- WHEN the admin loads the dashboard
- THEN funnel stages show counts without user identifiers

#### Scenario: Non-admin denied

- GIVEN a signed-in user not in `ADMIN_EMAILS`
- WHEN they request admin metrics data
- THEN access is denied

### Requirement: No individual PII or intake in admin v1

Admin metrics and admin APIs in Phase 1 MUST NOT expose individual user email, name, profile fields, intake entries, or export history. Aggregates MUST be computed so no row-level user data is returned to the admin client.

#### Scenario: Metrics response has no PII

- GIVEN an admin fetching organization metrics
- WHEN the response is inspected
- THEN it contains only aggregate scalars and optional funnel counts with no user ids, emails, or health data

#### Scenario: No intake admin view

- GIVEN an admin user
- WHEN they browse all `/admin` routes available in Phase 1
- THEN there is no page or API to list or search individual users' diary entries
