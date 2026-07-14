# commercial-packaging Specification

## Purpose

Deliver a buyer-ready documentation kit so perpetual-license customers can deploy, operate, and legally position Migajas in their territory without vendor hand-holding for routine tasks.

## Requirements

### Requirement: Commercial documentation kit

The repository MUST include a `docs/commercial/` directory shipped with the licensed codebase containing buyer-facing operational and legal draft documents.

#### Scenario: Buyer locates kit

- GIVEN a licensee cloning the repository tag for their purchase
- WHEN they open `docs/commercial/`
- THEN they find the required documents listed in this specification

### Requirement: README-BUYER

The kit MUST include `README-BUYER.md` describing product scope (guided learning + optional clinical diary), Phase 1 vs Phase 2 roadmap, support boundaries, and perpetual-license overview placeholders.

#### Scenario: Buyer reads product overview

- GIVEN `README-BUYER.md`
- WHEN a clinic procurement lead reviews it
- THEN they understand guided-course-first flow, clinical opt-in at nivel 3+, and what is out of scope (AI, payments, EHR)

### Requirement: DEPLOYMENT runbook

The kit MUST include `DEPLOYMENT.md` with step-by-step instructions for Supabase (eu-west-1) and Vercel deployment: environment variables, migrations, seed execution, and smoke-test checklist.

#### Scenario: New environment bootstrap

- GIVEN a buyer with fresh Supabase and Vercel projects
- WHEN they follow `DEPLOYMENT.md` end to end
- THEN they can run migrations, seed content, and reach a working production URL

### Requirement: SCHEMA documentation

The kit MUST include `SCHEMA.md` documenting `user_profiles`, `intake_entries`, learning tables, RLS expectations, and how to apply future migrations post-license.

#### Scenario: Buyer reviews data model

- GIVEN `SCHEMA.md`
- WHEN an IT reviewer reads it
- THEN they see table purposes, key columns, and tenant data isolation rules without reading application source

### Requirement: ADMIN-GUIDE

The kit MUST include `ADMIN-GUIDE.md` covering admin access (`ADMIN_EMAILS`), content update workflows, anonymized metrics dashboard usage, and explicit boundaries (no per-user PII or intake visibility in admin v1).

#### Scenario: Content manager onboarding

- GIVEN a buyer's designated admin
- WHEN they follow `ADMIN-GUIDE.md`
- THEN they can update foods/lessons/exams and interpret org metrics without accessing individual patient logs

### Requirement: LEGAL drafts

The kit MUST include a `LEGAL/` subdirectory with draft templates: Data Processing Agreement, privacy policy, cookie notice, and health-data disclaimer marked as requiring qualified legal review before EU clinic use.

#### Scenario: Legal review handoff

- GIVEN buyer counsel reviewing `LEGAL/`
- WHEN they open each template
- THEN placeholders identify licensee name, territory, retention policy, and health-data processing roles

### Requirement: Territory licensing model

Documentation MUST state that España and República Dominicana are separate perpetual licenses over the same codebase, with region-specific catalog and ration rules activated via configuration and content seed—not separate forks.

#### Scenario: RD licensee clarity

- GIVEN a Dominican Republic buyer reading `README-BUYER.md`
- WHEN they review territory notes
- THEN they see RD requires its own license, uses 15 g ration rule and RD food catalog, and guided lessons may remain Spain-centric in Phase 1 with explicit positioning

#### Scenario: ES licensee clarity

- GIVEN a Spain buyer
- WHEN they review territory notes
- THEN they see España license covers ES catalog, 10 g ration rule, and primary guided curriculum
