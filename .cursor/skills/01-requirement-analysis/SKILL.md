---
name: requirement-analysis
description: Converts vague product ideas into structured requirements, user stories, acceptance criteria, and MVP scope for analytics dashboards and map-based UIs. Use when starting features, refining scope, planning MVPs, or when requirements are ambiguous.
---

# Requirement Analysis

## Purpose

Turn unclear product requests into actionable, testable requirements suitable for a Next.js analytics dashboard with charts (ECharts) and geospatial views (MapLibre GL, deck.gl).

## When to Use

- New feature, page, or dashboard module
- User describes goals without concrete UI or data needs
- Scope creep risk or unclear MVP boundaries
- Map or chart requirements need clarification before implementation

## Core Responsibilities

- Extract actors, goals, constraints, and data sources
- Define user stories with acceptance criteria
- Prioritize with Must / Should / Could
- Identify edge cases, assumptions, and open questions
- Define measurable completion criteria for MVP and follow-ups

## Process

1. **Inspect context** (read-only): skim `README.md`, existing routes, and similar features if the repo has code; note stack (App Router, charts, maps).
2. **Clarify the problem**: who uses it, what decision or action it supports, and what “done” looks like.
3. **Inventory UI surfaces**: KPI cards, tables, filters, charts, maps, detail panels, exports.
4. **Data requirements**: entities, time ranges, aggregations, geospatial layers, refresh cadence, permissions.
5. **Map-specific** (if applicable): basemap, layers, interactions (hover, click, draw), legend, viewport defaults, max feature counts.
6. **Chart-specific** (if applicable): metrics, dimensions, units, comparison periods, drill-down, empty/no-data behavior.
7. **Non-functional**: performance (dataset size), accessibility, responsiveness, auth roles, audit needs.
8. **Prioritize**: Must (MVP), Should (next), Could (later); explicitly defer out-of-scope items.
9. **Edge cases**: no data, partial data, slow API, invalid filters, unauthorized access, mobile layout.
10. **Document assumptions and open questions**; block implementation only when answers change architecture.

## Output Format

```markdown
# [Feature / Initiative Name]

## Problem statement
[1–3 sentences]

## Users and goals
- **Primary user**: …
- **Goal**: …

## User stories
### US-1: [Title]
As a [role], I want [capability] so that [outcome].

**Acceptance criteria**
- [ ] Given … when … then …
- [ ] …

## Functional requirements
| ID | Requirement | Priority (M/S/C) |
|----|-------------|------------------|
| FR-1 | … | Must |

## Dashboard / visualization requirements
### Charts
- Metric(s), dimensions, units, default range, interactions

### Maps (if any)
- Layers, CRS assumptions, interactions, controls, legends

## Data and integration
- Sources, APIs, caching, auth

## Edge cases
- …

## Assumptions
- …

## Open questions
- [ ] …

## MVP scope
**In**: …
**Out**: …

## Completion criteria (measurable)
- [ ] …
```

## Quality Checklist

- [ ] Every user story has testable acceptance criteria
- [ ] Chart and map needs specify units, labels, and empty states
- [ ] MVP is bounded; deferred items are explicit
- [ ] Performance expectations stated for large datasets
- [ ] Auth/permission expectations captured if relevant
- [ ] Open questions listed; assumptions labeled

## Anti-patterns / Do Not Do

- Do not start coding or picking libraries during pure requirements work
- Do not accept “build a dashboard” without metrics, filters, and success criteria
- Do not omit loading, error, and empty states from acceptance criteria
- Do not treat map/chart polish as Must without core data flow defined
- Do not hide unresolved questions inside vague bullet points
