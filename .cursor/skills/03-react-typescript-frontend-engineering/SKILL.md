---
name: react-typescript-frontend-engineering
description: Builds professional React TypeScript UI for SaaS-style dashboards—components, hooks, forms, tables, filters, layouts, and async UI states. Use when implementing or refactoring UI components, hooks, or dashboard screens.
---

# React & TypeScript Frontend Engineering

## Purpose

Deliver focused, typed React UI for analytics dashboards: clear props, separated data transformation, and explicit loading/empty/error/success states.

## When to Use

- New or updated components, hooks, pages (client boundaries)
- Forms, tables, filter bars, dashboard layouts
- Typing props, API models, and view models

## Core Responsibilities

- Small, single-purpose components with explicit TypeScript types
- Extract data transformation outside JSX
- Dashboard layouts with visual hierarchy and responsive behavior
- Local UI state by default; avoid unnecessary global state
- Memoization only when profiling or clear re-render cost exists

## Process

1. **Read surrounding code**: naming, folder patterns, UI primitives, styling (Tailwind/CSS modules).
2. **Define types**: props, domain DTOs, view models; prefer `type`/`interface` consistency with the repo.
3. **Split concerns**: presentational component + hook or pure functions for transforms.
4. **Implement states**: loading skeleton/spinner, empty message, error with retry, success content.
5. **Layout**: grid/flex for KPI row, main chart, sidebar filters; test mobile breakpoints.
6. **Tables**: sticky header, truncation, sort indicators, accessible row actions.
7. **Filters/search**: controlled inputs, debounced search where needed, clear “applied filters” affordance.
8. **Review**: unnecessary `useEffect`, prop drilling vs composition, dead code removed.

### Rules

- Prefer explicit props and types over `any`.
- Keep components small; extract when JSX or logic grows hard to scan.
- Avoid deeply nested ternaries in JSX—use early returns or small subcomponents.
- Do not create generic abstractions before patterns repeat twice.
- Do not add global state libraries for local UI-only state.

## Output Format

Deliverables depend on task:

- **Component**: file path, `'use client'` if needed, exported component + types
- **Hook**: `useX` with documented inputs/outputs and error handling
- **Brief note**: states covered, responsive behavior, dependencies on design tokens

## Quality Checklist

- [ ] All four async states handled where data is remote
- [ ] Props and return types explicit; no silent `any`
- [ ] Transform logic testable (pure functions)
- [ ] Responsive layout verified at common breakpoints
- [ ] Keyboard operable for interactive controls
- [ ] No debug `console.log` left in production paths

## Anti-patterns / Do Not Do

- Do not embed 50+ line data transforms inside JSX
- Do not `useMemo`/`useCallback` everything by default
- Do not duplicate server-fetched data into global client stores without reason
- Do not ship hardcoded mock datasets unless the user explicitly requested mocks
- Do not mix feature work with drive-by refactors in the same change
