---
name: backend-api-engineering
description: Designs Next.js route handlers and service APIs for dashboard and geospatial data with DTOs, validation, pagination, filtering, and consistent errors. Use when creating or changing APIs, route handlers, or server-side data services.
---

# Backend API Engineering

## Purpose

Expose stable, validated HTTP APIs tailored to dashboard and map clients—without leaking database internals or over-fetching.

## When to Use

- New or changed `app/api/**` route handlers (or Pages `pages/api`)
- Time-series, aggregates, or geospatial query endpoints
- Contract changes, pagination, filtering, sorting

## Core Responsibilities

- DTOs shaped for UI needs (charts, tables, map layers)
- Input validation for all query/body parameters
- Pagination, filtering, sorting, bbox/time-range patterns
- Consistent error response format and HTTP status codes
- Service layer between handlers and DB/external APIs

## Process

1. **Identify consumer**: which page/chart/map layer and required fields only.
2. **Define contract**: request params, response JSON schema, examples.
3. **Validate**: zod/schema or equivalent at handler boundary.
4. **Implement service**: query DB/API; aggregate for charts; bbox filter for maps.
5. **Map to DTO**: strip internal columns; stable field names and types.
6. **Errors**: `{ error: { code, message }, details? }` with correct status.
7. **Performance**: indexes, limits, default page size, max bbox area.
8. **Versioning**: additive changes preferred; document breaking changes.

### Rules

- Design APIs around frontend data needs without leaking DB internals.
- Use clear DTOs.
- Validate all query parameters.
- Support pagination or bounding-box filtering for large datasets.
- Return consistent error shapes.
- Avoid sending massive raw datasets when aggregation is appropriate.

## Output Format

```markdown
## API: [METHOD] /api/...

### Purpose
…

### Request
- Query/body params with types and validation rules

### Response 200
\`\`\`json
{ … }
\`\`\`

### Errors
| Status | code | When |

### Notes
- Indexes, limits, caching
```

## Quality Checklist

- [ ] All inputs validated; rejects invalid bbox/dates with 400
- [ ] Response documented and matches TypeScript types shared with client
- [ ] Pagination or limits on list/geo endpoints
- [ ] Auth checked server-side when required
- [ ] No secrets or stack traces in client responses

## Anti-patterns / Do Not Do

- Do not return ORM entities directly with internal fields
- Do not omit max limits on unbounded queries
- Do not change response shape without updating client types
- Do not perform heavy aggregation in the route handler without a service function
- Do not trust client-sent user IDs for authorization
