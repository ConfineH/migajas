# Delta for guided-learning

## ADDED Requirements

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
