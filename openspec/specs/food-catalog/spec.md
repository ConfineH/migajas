# food-catalog Specification

## Requirements

### Requirement: Food item structure

Each food item SHALL include: name, category, portion text, grams, carbs (g), derived rations, difficulty, and item type (base | mixed | modulator).

#### Scenario: Base food display
- **GIVEN** "Pan blanco" with portion "1 rebanada", 25g, 10g carbs
- **WHEN** displayed in catalog
- **THEN** user sees portion, grams, carbs, and 1.0 ration

### Requirement: Category filtering

The catalog SHALL support filtering food items by category.

#### Scenario: Filter by Pan
- **GIVEN** the full Spain catalog
- **WHEN** user filters by category "Pan"
- **THEN** only bread items are shown

### Requirement: Search

The catalog SHALL support simple text search by food name.

#### Scenario: Search manzana
- **GIVEN** the full catalog
- **WHEN** user searches "manzana"
- **THEN** "Manzana pequeña" appears in results

### Requirement: Reference mode (not primary entry)

The catalog SHALL be a **support reference**, accessible only after free mode is unlocked. It is NOT the primary app entry point.

#### Scenario: Gated access
- **GIVEN** a user who has not passed the nivel-1 exam
- **WHEN** they attempt to open the catalog
- **THEN** they are redirected to the guided course
