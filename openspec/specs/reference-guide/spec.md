# Spec: Reference Guide

## Requirements

### Requirement: Onboarding gate

The reference guide SHALL be accessible after onboarding is completed.

#### Scenario: Before onboarding
- **GIVEN** a user without completed onboarding
- **WHEN** they visit `/guia`
- **THEN** they are redirected to onboarding

### Requirement: Conversion rules

The guide SHALL display Spain ration rules and a grams-to-rations conversion table.

### Requirement: Food search

The guide SHALL allow searching foods with portion, grams, carbs, and rations.

### Requirement: Bidirectional calculator

The guide SHALL convert grams of carbohydrates to rations and rations to grams.
