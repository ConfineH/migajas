# lessons Specification

## Requirements

### Requirement: Lesson structure

Each lesson SHALL include a title, summary, and steps of types: explanation, example (with optional foodId), and practice (with exerciseId).

#### Scenario: Nivel-1 lesson count
- **GIVEN** the Spain nivel-1 curriculum
- **WHEN** lessons are loaded
- **THEN** at least 3 lessons exist covering ration basics, grams vs carbs, and basic foods

### Requirement: Visual examples

Example steps SHALL reference food items showing portion, carbs, and derived rations.

#### Scenario: Pan blanco example
- **GIVEN** lesson "¿Qué es una ración?"
- **WHEN** the example step references pan blanco
- **THEN** the UI shows portion, HC grams, and rations

### Requirement: Lesson-linked practice

Each lesson SHALL have at least one practice step using an exercise from the exercise catalog.

#### Scenario: Practice after lesson
- **GIVEN** a completed lesson
- **WHEN** the user continues
- **THEN** they enter a single-exercise practice for that lesson
