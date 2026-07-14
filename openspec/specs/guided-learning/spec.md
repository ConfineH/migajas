# guided-learning Specification

## Requirements

### Requirement: Guided learning sequence

The system SHALL present each level as an ordered sequence: lessons, linked practice steps, level flashcards (fichas), and a final exam.

#### Scenario: First visit
- **GIVEN** a new user who completed onboarding
- **WHEN** they open `/learn/nivel-1`
- **THEN** the first incomplete item is a lesson

#### Scenario: Sequence order
- **GIVEN** a guided level path
- **WHEN** the sequence is built
- **THEN** it alternates lessons and practices, includes fichas before the exam, and ends with the exam

### Requirement: Level flashcards before exam

The system SHALL provide a **Fichas del nivel** step after lessons/practices and before the exam, covering essential foods from lessons and the exam pool.

#### Scenario: Complete fichas
- **GIVEN** a user who finishes all cards in the deck
- **WHEN** they complete the fichas session
- **THEN** the level is stored in `completedFlashcardLevels`

#### Scenario: Soft exam recommendation
- **GIVEN** fichas are incomplete
- **WHEN** the user opens the exam
- **THEN** they see a recommendation to complete fichas but can still take the exam

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

### Requirement: Multi-level course

The system SHALL provide guided lessons for levels 1 through 5, each with lessons, practice, and an exam.

#### Scenario: Level 2 unlock
- **GIVEN** a user who passed the nivel-1 exam
- **WHEN** they open `/learn`
- **THEN** nivel-2 is available

#### Scenario: Level content
- **GIVEN** any level from 1 to 5
- **WHEN** lessons are loaded
- **THEN** at least 2 lessons exist with linked practice and an exam

### Requirement: Nivel 3 clinical mode unlock

The system SHALL surface a clinical-mode opt-in prompt or settings entry only after the user has passed the nivel-3 guided exam (or higher). Enabling clinical mode MUST NOT bypass or replace the guided-course-first learning path.

#### Scenario: Opt-in offered after nivel 3 pass

- GIVEN an authenticated user who just passed the nivel-3 exam
- WHEN they return to `/learn` or home
- THEN they see a Spanish-language prompt or link to enable clinical mode in settings

#### Scenario: Opt-in not shown before nivel 3

- GIVEN an authenticated user who passed only nivel-2 exam
- WHEN they browse the app
- THEN no clinical-mode opt-in prompt or diary navigation is shown

#### Scenario: Guided flow preserved

- GIVEN a user at any learning stage
- WHEN they open `/learn/nivel-{n}` for an unlocked level
- THEN the lesson → practice → exam sequence remains the primary path and clinical features do not redirect them away from incomplete guided items

#### Scenario: Catalog gate unchanged

- GIVEN a user without free mode (nivel-1 exam not passed)
- WHEN they visit `/catalog`
- THEN they are still redirected to the guided course regardless of clinical mode settings
