---
name: testing-qa
description: Defines unit, integration, and E2E testing plus manual QA for dashboards, charts, maps, filters, and auth flows. Use when adding tests, preparing releases, or validating critical user journeys.
---

# Testing & QA

## Purpose

Protect critical dashboard behavior with focused automated tests and structured manual QA—especially data transforms, APIs, charts, and maps.

## When to Use

- New features needing regression coverage
- Bug fixes requiring reproduction tests
- Pre-release QA for analytics or map workflows
- Validating loading/empty/error states

## Core Responsibilities

- Unit test pure transforms (chart options, GeoJSON builders, formatters)
- Integration test API contracts and route handlers
- E2E test critical paths (login, filter → chart update, map interaction)
- Manual checklist for visual/chart/map behaviors hard to assert in CI

## Process

1. **Identify critical flows**: login, main dashboard load, filter apply, export, map click.
2. **Unit tests**: option builders, aggregations, coordinate validation, date parsers.
3. **API tests**: status codes, validation errors, pagination boundaries, auth denied.
4. **Component tests**: state rendering (loading/empty/error) with mocked data.
5. **E2E**: Playwright/Cypress per repo; stable selectors (`data-testid` where needed).
6. **Chart tests**: mock canvas/ECharts init if needed; assert option builder output.
7. **Map tests**: layer visibility toggles, mocked pick events, no-data UI.
8. **Manual QA checklist** before release (see Output Format).

### Rules

- Test data transformation logic separately from chart rendering.
- Test API contracts separately from UI.
- Test map layer visibility, hover/click, and no-data states where applicable.
- Verify loading, empty, error, and success states.
- Prioritize critical user flows over superficial snapshot-only tests.

## Output Format

### Manual QA checklist (template)

```markdown
- [ ] Dashboard loads with auth (if applicable)
- [ ] Filters update URL and data
- [ ] Chart: loading → data → empty dataset copy
- [ ] Chart resize on layout change
- [ ] Map: loads with height, pan/zoom, layer toggle
- [ ] Map: tooltip on hover/feature pick
- [ ] API errors show user-safe message
- [ ] Mobile layout: filters and map controls usable
```

## Quality Checklist

- [ ] Tests fail for the bug before fix (when fixing regressions)
- [ ] No dependence on production APIs or secrets in CI
- [ ] Flaky E2E minimized (waits on network idle/data attributes)
- [ ] AuthZ negative cases covered for protected routes

## Anti-patterns / Do Not Do

- Do not snapshot entire chart canvas as the only test
- Do not skip testing empty and error paths
- Do not test implementation details (internal state variable names) over behavior
- Do not add tests that require manual map tile keys in CI without mocks
- Do not mock so heavily that contract drift goes unnoticed
