# Spec Delta: Variable Exams

## Requirements

### Requirement: Exam question pool

Each level exam SHALL define a pool of eligible exercise IDs and a count of questions to draw per attempt.

#### Scenario: Pool larger than exam
- **GIVEN** nivel-1 pool of 8 exercises and `questionsPerExam = 4`
- **WHEN** a user starts a new exam session
- **THEN** exactly 4 distinct exercises from the pool are selected

### Requirement: Session persistence

The system SHALL persist the active exam exercise set until the attempt completes or is abandoned.

#### Scenario: Resume exam
- **GIVEN** a user with an in-progress exam session for nivel-2
- **WHEN** they reopen `/learn/nivel-2/exam`
- **THEN** they see the same exercise IDs as when they started

### Requirement: Fresh draw on retake

After a failed exam, the next new attempt SHALL sample a new set from the pool.

#### Scenario: Failed retake
- **GIVEN** a user who failed the nivel-1 exam
- **WHEN** they start the exam again
- **THEN** a new exam session is created (previous session cleared)

### Requirement: Pass threshold unchanged

Mastery score SHALL be calculated on the drawn question set only, with pass threshold ≥60%.

#### Scenario: Pass on drawn set
- **GIVEN** 4 drawn questions and 3 correct
- **WHEN** the exam completes
- **THEN** mastery is 75% and level is passed
