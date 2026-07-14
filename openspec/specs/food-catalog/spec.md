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

### Requirement: Diary food selection

When a user's clinical mode is enabled, the catalog (or an equivalent food-picker surfaced from the diary) MUST allow selecting catalog foods to create intake entries without making the catalog the primary app entry point.

#### Scenario: Pick food from diary

- GIVEN an authenticated user with clinical mode enabled on the intake diary
- WHEN they search and select "Pan blanco"
- THEN they can confirm meal slot and portion to create an intake entry

#### Scenario: Picker respects region

- GIVEN a user with profile region "República Dominicana"
- WHEN they open the diary food picker
- THEN only foods available for República Dominicana are selectable

#### Scenario: Clinical mode off hides picker

- GIVEN a user with free mode unlocked but clinical mode disabled
- WHEN they use the reference catalog at `/catalog`
- THEN foods are browsable for reference only and cannot be logged to intake from catalog alone

### Requirement: Phase 1 catalog expansion target

The seeded food catalog for Phase 1 MUST target approximately 80–100 items per country (España and República Dominicana), each validated for name, category, portion, grams, carbs, difficulty, and type consistent with existing catalog structure.

#### Scenario: Spain catalog size

- GIVEN the Phase 1 content seed for España
- WHEN foods are counted for region España
- THEN the count is between 80 and 100 inclusive

#### Scenario: RD catalog size

- GIVEN the Phase 1 content seed for República Dominicana
- WHEN foods are counted for region República Dominicana
- THEN the count is between 80 and 100 inclusive

#### Scenario: Expanded item displays correctly

- GIVEN a newly imported food in the expanded catalog
- WHEN shown in catalog or diary picker
- THEN it displays portion, grams, carbs, and region-correct derived rations like existing items
