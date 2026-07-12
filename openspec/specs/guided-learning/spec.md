# guided-learning Specification

## Requirements

### Requirement: Guided learning sequence

The system SHALL present nivel-1 as an ordered sequence: lessons, linked practice steps, and a final exam.

#### Scenario: First visit
- **GIVEN** a new user who completed onboarding
- **WHEN** they open `/learn/nivel-1`
- **THEN** the first incomplete item is a lesson

#### Scenario: Sequence order
- **GIVEN** the nivel-1 guided path
- **WHEN** the sequence is built
- **THEN** it alternates lessons and practices and ends with an exam

### Requirement: Free mode gate

The system SHALL lock catalog and free practice until the user passes the nivel-1 exam (≥60%).

#### Scenario: Catalog blocked
- **GIVEN** a user without free mode
- **WHEN** they visit `/catalog`
- **THEN** they are redirected to the guided course

#### Scenario: Free mode unlocked
- **GIVEN** a user who passed the nivel-1 exam
- **WHEN** they visit `/catalog`
- **THEN** the catalog is accessible

### Requirement: Lesson progress

The system SHALL track completed lessons and practice steps separately from exam results.

#### Scenario: Complete lesson
- **GIVEN** a user finishes lesson content
- **WHEN** they mark the lesson complete
- **THEN** the lesson id is stored in progress

### Requirement: Exam gate

The exam SHALL only be available after all lessons and practices in the level are completed.

#### Scenario: Exam blocked early
- **GIVEN** incomplete lessons
- **WHEN** user tries the exam
- **THEN** they see a message to complete the course first
