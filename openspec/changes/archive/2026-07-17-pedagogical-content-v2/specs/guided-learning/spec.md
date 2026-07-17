## MODIFIED Requirements

### Requirement: Multi-level course

The system SHALL provide guided lessons for levels 1 through 5, each with lessons, practice, fichas, and an exam. Spain curriculum v2 distributes content as: nivel-1 (5 lessons), nivel-2 (3), nivel-3 (2), nivel-4 (3), nivel-5 (3) — 16 lessons total.

#### Scenario: Level 2 unlock
- **GIVEN** a user who passed the nivel-1 exam
- **WHEN** they open `/learn`
- **THEN** nivel-2 is available

#### Scenario: Level content
- **GIVEN** any level from 1 to 5
- **WHEN** lessons are loaded
- **THEN** the expected lesson count exists for that level with linked practice and an exam

#### Scenario: Nivel 1 fundamentals
- **GIVEN** the Spain guided course
- **WHEN** nivel-1 lessons are listed
- **THEN** lessons cover modulators (zero-carb foods) and fiber before nivel-5 integration topics

## ADDED Requirements

### Requirement: Expanded variable exams

Each level exam SHALL draw questions from an expanded pool sized for curriculum coverage: nivel-1 (5 of 12), nivel-2 (4 of 10), nivel-3 (4 of 10), nivel-4 (4 of 12), nivel-5 (6 of 15).

#### Scenario: Nivel 1 exam size
- **GIVEN** a user starting the nivel-1 exam
- **WHEN** the exam session is created
- **THEN** exactly 5 questions are drawn from a pool of at least 12 exercises

#### Scenario: Pool integrity
- **GIVEN** any level exam configuration
- **WHEN** pool exercise ids are resolved
- **THEN** every id maps to an existing exercise in `exercises.json`

### Requirement: Lesson practice exercises

Each lesson SHALL end with exactly one practice step linked to a dedicated exercise id (`ex-l{n}-{m}-*`).

#### Scenario: Practice linkage
- **GIVEN** any lesson in the guided course
- **WHEN** its steps are inspected
- **THEN** one practice step references an exercise that exists and matches the lesson level
