# learning-analytics Specification

## Requirements

### Requirement: Lesson completed event

The system SHALL emit `lesson_completed` when a user marks a lesson complete via the guided API.

#### Scenario: First completion
- **GIVEN** a valid lesson id
- **WHEN** `complete-lesson` succeeds
- **THEN** a `lesson_completed` event is tracked with lesson and level ids

### Requirement: Exam passed event

The system SHALL emit `exam_passed` when a level exam is completed with ≥70% mastery.

#### Scenario: Pass threshold met
- **GIVEN** correct answers yielding ≥70%
- **WHEN** level progress is saved
- **THEN** an `exam_passed` event is tracked with level id and score

#### Scenario: Below threshold
- **GIVEN** correct answers yielding <70%
- **WHEN** level progress is saved
- **THEN** no `exam_passed` event is emitted

### Requirement: Free mode unlocked event

The system SHALL emit `free_mode_unlocked` once when nivel-1 exam is passed for the first time.

#### Scenario: First nivel-1 pass
- **GIVEN** free mode was not previously unlocked
- **WHEN** nivel-1 exam is passed
- **THEN** a `free_mode_unlocked` event is tracked

#### Scenario: Already unlocked
- **GIVEN** free mode was already unlocked
- **WHEN** nivel-1 exam is passed again
- **THEN** no duplicate `free_mode_unlocked` event is emitted

### Requirement: User progress milestones

The system MUST show recent learning milestones on `/progress` for authenticated users based on their stored learning events. `/analytics` MUST redirect to `/progress`.

#### Scenario: Signed-in user views milestones
- **GIVEN** an authenticated user with learning events
- **WHEN** they open `/progress`
- **THEN** they see a recent milestone timeline below level progress

#### Scenario: Legacy analytics URL
- **GIVEN** any visitor
- **WHEN** they open `/analytics`
- **THEN** they are redirected to `/progress`
