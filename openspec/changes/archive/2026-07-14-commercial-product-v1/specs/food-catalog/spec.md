# Delta for food-catalog

## ADDED Requirements

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
