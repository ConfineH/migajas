# exercise-engine Specification

## ADDED Requirements

### Requirement: Answer grading

The system SHALL grade an exercise answer by comparing the selected value to `correctAnswer`.

#### Scenario: Correct multiple choice
- **GIVEN** an exercise with correctAnswer "1.5"
- **WHEN** user selects "1.5"
- **THEN** the result is correct

#### Scenario: Incorrect answer
- **GIVEN** an exercise with correctAnswer "1.0"
- **WHEN** user selects "2.0"
- **THEN** the result is incorrect

### Requirement: Level exercise selection

The system SHALL return exercises belonging to a given level, ordered by id.

#### Scenario: Level 1 exercises
- **GIVEN** the exercise catalog
- **WHEN** exercises for level "nivel-1" are requested
- **THEN** only level 1 exercises are returned

### Requirement: Minimum exercise types

Level 1 SHALL include at least 3 distinct exercise types.

#### Scenario: Type diversity
- **GIVEN** level 1 exercises
- **WHEN** types are collected
- **THEN** at least 3 unique types exist
