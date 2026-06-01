---
name: documentation-handoff
description: Produces and maintains README, architecture, API, chart/map component, data format, env, deployment, and troubleshooting docs aligned with code. Use when documenting features, onboarding developers, or project handoff.
---

# Documentation & Handoff

## Purpose

Leave practical documentation so future developers can run, extend, and operate the dashboard without tribal knowledge.

## When to Use

- New module, chart type, or map layer shipped
- Onboarding, handoff, or open-source readiness
- After API or data contract changes
- Post-incident runbook updates

## Core Responsibilities

- README: setup, scripts, stack overview
- Architecture: routes, server/client split, major modules
- API and data shape docs for charts and maps
- Env var and deployment docs
- Troubleshooting for common chart/map/auth issues

## Process

1. **Audience**: developer running locally vs operator in production.
2. **Update README**: prerequisites, install, dev, build, test, env pointer.
3. **Architecture sketch**: App Router map, feature folders, external services.
4. **Chart docs**: input schema, option builder location, empty/loading behavior.
5. **Map docs**: CRS, coordinate order, layers, env for style/tiles, controls.
6. **API index**: method, path, auth, request/response examples.
7. **Env table**: sync with `.env.example`.
8. **Deploy/troubleshoot**: link to deployment skill checklist items.
9. **Diff review**: docs updated in same PR as code when contracts change.

### Rules

- Document required data shapes for charts and maps.
- Document coordinate order and CRS assumptions.
- Document major routes, modules, and API contracts.
- Keep docs practical—examples over theory.

## Output Format

Use repo-appropriate locations (`README.md`, `docs/`, or inline module README):

```markdown
# [Component / API / Feature]

## Overview
…

## Usage
\`\`\`tsx
…
\`\`\`

## Data contract
| Field | Type | Description |

## Environment
- `VAR_NAME` — …

## Troubleshooting
- …

## Related
- Links to routes, tests, skills
```

## Quality Checklist

- [ ] New developer can run app from README alone
- [ ] Chart/map contracts include units and coordinate order
- [ ] Env vars documented without secret values
- [ ] Docs match current code (no stale endpoints)
- [ ] Breaking changes called out with migration notes

## Anti-patterns / Do Not Do

- Do not document aspirational features not yet built
- Do not duplicate entire code files in docs—link and summarize contracts
- Do not omit empty/error states from component docs
- Do not leave default Next.js README unchanged after real features exist
- Do not store credentials in documentation examples
