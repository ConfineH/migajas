# Spec Delta: Reference Guide

## Requirements

### Requirement: Always-available reference

The reference guide SHALL be accessible during the guided course, without requiring free mode.

#### Scenario: Before nivel-1 exam
- **GIVEN** a user in guided mode without free mode
- **WHEN** they open `/guia`
- **THEN** the guide loads with rules and food search

### Requirement: Conversion rules

The guide SHALL display Spain ration rules and a grams-to-rations conversion table.

#### Scenario: Conversion table
- **GIVEN** the rules section
- **WHEN** the user views conversions
- **THEN** they see that 10 g carbohydrates equals 1 ration with examples (10 g → 1, 20 g → 2)

### Requirement: Food search in guide

The guide SHALL allow searching foods by name with portion, grams, carbs, and rations.

#### Scenario: Search pan
- **GIVEN** the food reference tab
- **WHEN** user searches "pan"
- **THEN** matching bread items appear with full macro display

### Requirement: Quick calculator

The guide SHALL provide a calculator to convert grams of carbohydrates to rations (and reverse).

#### Scenario: Calculate rations
- **GIVEN** user enters 25 g carbohydrates
- **WHEN** they view the result
- **THEN** the app shows 2.5 rations (Spain rule)
