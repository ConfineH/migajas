# guided-learning — Delta: Fichas del nivel

## ADDED Requirements

### Requirement: Level flashcards before exam

The system SHALL insert a **Fichas del nivel** step after all lessons and practices and before the level exam in the guided sequence.

#### Scenario: Sequence order with fichas

- **GIVEN** any guided level from 1 to 5
- **WHEN** the guided sequence is built
- **THEN** the penultimate item is fichas and the last item is the exam

#### Scenario: Fichas deck coverage

- **GIVEN** a level exam pool
- **WHEN** the fichas deck is built
- **THEN** every food referenced by a pool exercise appears in at least one card

### Requirement: Flashcard session

The system SHALL present three recall modes per essential food: standard portion, carbohydrate grams, and rations.

#### Scenario: Complete fichas session

- **GIVEN** a user who viewed all cards in the deck
- **WHEN** they finish the fichas session
- **THEN** the level id is stored in `completedFlashcardLevels`

#### Scenario: Revisit fichas

- **GIVEN** a user who completed fichas for a level
- **WHEN** they open the level path
- **THEN** fichas remain accessible for review

### Requirement: Soft exam recommendation

The system SHALL recommend completing fichas before the exam without hard-blocking the exam in v1.

#### Scenario: Exam warning

- **GIVEN** a user who can start the exam but has not completed fichas
- **WHEN** they open the exam page
- **THEN** they see a Spanish-language recommendation to complete fichas first

#### Scenario: Exam still available

- **GIVEN** fichas are incomplete
- **WHEN** the user starts the exam
- **THEN** the exam runs normally
