---
name: refactoring-code-quality
description: Performs safe incremental refactors—extract components, improve types, remove duplication in chart/map builders—without mixing feature changes. Use when improving structure, names, or maintainability without changing behavior.
---

# Refactoring & Code Quality

## Purpose

Improve readability and maintainability while preserving behavior—especially separating chart/map logic from layout UI.

## When to Use

- Duplicated chart option or deck.gl layer builders
- Oversized components or hooks
- Type safety improvements, dead code removal
- Preparing code for new features without behavior change

## Core Responsibilities

- Small, reviewable diffs with unchanged external behavior
- Extract pure functions and focused components
- Preserve or update tests with refactors
- Do not mix refactors with new features unless explicitly requested

## Process

1. **Establish baseline**: run existing tests; note manual QA for affected screens.
2. **Identify smell**: duplication, long files, mixed concerns (fetch + option + JSX).
3. **Plan steps**: extract types → pure functions → subcomponents → rename.
4. **Refactor one concern per commit/PR slice when possible.
5. **Chart/map**: extract `buildXOption`, `createXLayers` modules shared by widgets.
6. **Types**: replace `any` with DTOs; use discriminated unions for layer types.
7. **Remove dead code**: unused imports, unreachable branches.
8. **Verify**: tests + quick manual check of charts/maps/filters.

### Rules

- Do not mix refactoring with feature changes unless explicitly requested.
- Do not rewrite working components from scratch without clear reason.
- Extract repeated chart option builders and map layer builders.
- Keep refactors small enough to review safely.

## Output Format

Brief summary:

- **Behavior**: unchanged (list any intentional exceptions)
- **Structure**: what was extracted/renamed
- **Risk areas**: chart resize, map lifecycle, query keys
- **Verification**: tests run, manual steps

## Quality Checklist

- [ ] No functional change unless agreed
- [ ] Public APIs/props stable or migration documented
- [ ] Tests still pass; new tests for extracted pure logic if valuable
- [ ] Chart/map lifecycle still disposes correctly
- [ ] No new `any` introduced

## Anti-patterns / Do Not Do

- Do not “refactor” by rewriting entire map/chart stacks in one PR
- Do not rename everything without tooling-assisted find/replace discipline
- Do not delete tests to make CI green
- Do not introduce new global state during a “cleanup”
- Do not change API contracts under the guise of refactor
