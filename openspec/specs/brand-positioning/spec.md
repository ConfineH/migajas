# Spec: brand-positioning

## Overview

Brand arc, canonical marketing copy, editorial compliance text, and forbidden phrase guardrails for Migajas (web + social).

## Requirements

### REQ-BRAND-001 — Product arc

- GIVEN any active marketing copy on landing or metadata
- WHEN describing Migajas value
- THEN prioritizes **entender → practicar → confiar** before product features or clinical mode

### REQ-BRAND-002 — Clinical mode secondary

- GIVEN copy about clinical diary or health data
- WHEN shown in primary marketing surfaces
- THEN clinical mode is optional/educational, not the headline promise

### REQ-BRAND-003 — Forbidden patterns

- GIVEN text validated with `findForbiddenMarketingPhrases`
- WHEN used in `ACTIVE_BRAND_SOURCES`
- THEN excludes insulin dosing, diabetes control claims, medical device framing, SaaS hype, and alarmist CTAs

### REQ-BRAND-004 — Territory rule

- GIVEN social/editorial guidance in `BRAND_EDITORIAL_SYSTEM.md`
- WHEN a piece includes food examples or ration numbers
- THEN it targets one territory (ES or RD), never mixed in one piece

### REQ-BRAND-005 — Editorial disclaimers

- GIVEN compliance copy constants
- WHEN used in social templates
- THEN short and long educational disclaimers are available without legal jargon

### REQ-BRAND-006 — Content library manifest

- GIVEN `CONTENT_LIBRARY_FILES`
- WHEN tests run
- THEN all listed starter library files exist under `docs/content-library/`
