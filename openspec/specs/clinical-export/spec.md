# clinical-export Specification

## Purpose

Let authenticated users with intake history download aggregated carbohydrate reports for personal or clinical review. Exports are educational, not medical advice.

## Requirements

### Requirement: User-initiated export only

The system MUST generate clinical exports only when the authenticated user explicitly requests a download; no scheduled or admin-initiated export of user intake is required in Phase 1.

#### Scenario: User requests CSV export

- GIVEN an authenticated user with clinical mode enabled and intake entries in the last 7 days
- WHEN they choose CSV format and range "last 7 days"
- THEN the system returns a downloadable CSV file

#### Scenario: Unauthenticated export rejected

- GIVEN no Supabase session
- WHEN a client calls the export endpoint
- THEN the response is 401 Unauthorized

### Requirement: Export formats

The system MUST support CSV and PDF export formats for the same underlying report data.

#### Scenario: PDF download

- GIVEN an authenticated user with intake data in the selected range
- WHEN they request PDF export
- THEN they receive a branded PDF document suitable for printing or sharing

#### Scenario: CSV structure

- GIVEN an authenticated user exporting CSV for a date range
- WHEN the file is generated
- THEN it includes machine-readable daily totals and meal-slot breakdown rows

### Requirement: Date range selection

The system MUST offer preset ranges of last 7 days and last 30 days, plus a custom start/end range validated to span at most 90 days inclusive.

#### Scenario: Custom range within limit

- GIVEN an authenticated user selecting custom dates 45 days apart
- WHEN they submit export
- THEN the report covers exactly those dates

#### Scenario: Custom range over limit rejected

- GIVEN an authenticated user selecting a custom range of 91 days
- WHEN they submit export
- THEN the request is rejected with a validation error

### Requirement: Report contents

Each export MUST include daily carbohydrate totals for the range, weekly and monthly roll-up summaries where the range permits, per-meal-slot breakdown, and goal comparison when `daily_carb_goal_g` is set on the user profile. The system MAY include a top-foods section ranked by total carbs logged.

#### Scenario: Goal comparison included

- GIVEN a user with `daily_carb_goal_g` 180 and intake on 3 days in range
- WHEN they export PDF
- THEN each of those days shows logged carbs versus goal 180

#### Scenario: No goal set

- GIVEN a user with no `daily_carb_goal_g`
- WHEN they export
- THEN totals and meal breakdown appear without goal comparison columns or sections

#### Scenario: Top foods section optional

- GIVEN a user with repeated foods in the range
- WHEN they export with top foods enabled
- THEN the report lists foods ranked by total carbs with portion counts

### Requirement: Educational disclaimer on PDF

Every PDF export MUST include a fixed educational disclaimer stating the report is for learning and self-tracking only and is not clinical advice, diagnosis, or treatment.

#### Scenario: Disclaimer visible

- GIVEN any successful PDF export
- WHEN the user opens the document
- THEN the disclaimer appears on the first or last page in Spanish

### Requirement: Own-data-only access

The system MUST restrict exports to intake entries belonging to the requesting authenticated user.

#### Scenario: User cannot export another user's data

- GIVEN user A is authenticated
- WHEN they attempt export scoped to user B's identifier
- THEN the system returns only user A's data or rejects the request
