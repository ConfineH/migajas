# ration-engine Specification

## ADDED Requirements

### Requirement: Ration calculation from carbs

The system SHALL calculate rations as `carbs_g / exchange_unit_g`, defaulting to 10g per ration for Spain.

#### Scenario: Standard food item
- **GIVEN** a food with 15g of carbohydrates
- **WHEN** rations are calculated for Spain (10g unit)
- **THEN** the result is 1.5 rations

#### Scenario: Zero carbs (protein modulator)
- **GIVEN** a food with 0g of carbohydrates
- **WHEN** rations are calculated
- **THEN** the result is 0 rations

### Requirement: Ration display format

The system SHALL format rations to one decimal place for display.

#### Scenario: Format half ration
- **GIVEN** 1.5 rations
- **WHEN** formatted for display
- **THEN** the string is "1.5"
