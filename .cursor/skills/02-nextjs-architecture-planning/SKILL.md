---
name: nextjs-architecture-planning
description: Plans Next.js App Router structure, server vs client boundaries, route handlers, module layout, and data-fetching boundaries for dashboard apps with charts and maps. Use when adding routes, restructuring folders, or deciding server vs client components.
---

# Next.js Architecture Planning

## Purpose

Design maintainable Next.js architecture for a TypeScript dashboard app, with safe boundaries for browser-only chart and map libraries.

## When to Use

- New app area, route group, or API surface
- Deciding Server vs Client Components
- Organizing features (analytics, maps, admin)
- Refactoring folder structure without behavior change

## Core Responsibilities

- Prefer **App Router** unless the repo clearly uses `pages/` (Pages Router)
- Define route groups, layouts, and loading/error boundaries
- Place Server Components by default; isolate Client Components for interactivity
- Plan route handlers (`app/api/...`) or server actions only when appropriate
- Keep ECharts, MapLibre, and deck.gl behind client-only boundaries
- Document env config and module boundaries without over-engineering

## Process

1. **Detect router mode**: `app/` → App Router; `pages/` → Pages Router. Note `src/` vs root-level `app/`.
2. **Map user journeys to routes**: list URLs, layouts, parallel routes if needed.
3. **Classify each UI block**:
   - Server: static shell, data fetch on server, SEO-safe content
   - Client: charts, maps, filters with heavy client state, browser APIs
4. **Data fetching**: server fetch in RSC/route handlers vs client fetch (TanStack Query, etc.)—pick per freshness and interactivity.
5. **API layer**: route handlers for dashboard/map aggregates; avoid leaking DB shapes.
6. **Feature modules**: colocate route-specific UI under route; shared UI in `components/`, domain logic in `lib/` or `features/<name>/`.
7. **Heavy libraries**: plan `'use client'` wrappers and optional `next/dynamic` with `ssr: false` for ECharts/MapLibre/deck.gl.
8. **Incremental plan**: smallest vertical slice first; defer micro-frontends and extra indirection.

### Default rules (App Router)

- Use **Server Components by default** when possible.
- Use **Client Components** only for interactivity, browser APIs, charts, maps, stateful UI, or event handlers.
- **Never** import MapLibre, deck.gl, or ECharts into Server Components.
- Keep reusable UI in `components/` or feature modules; keep route-only pieces near the route.
- Prefer route handlers for HTTP APIs; use server actions only when form/mutation UX fits.

## Output Format

```markdown
# Architecture plan: [Area]

## Current state
- Router: App Router | Pages Router
- Structure: src/ yes/no, styling, data libraries

## Route map
| Path | Layout | Server/Client | Data source |
|------|--------|---------------|-------------|

## Folder structure (proposed)
\`\`\`
app/
  (dashboard)/
  api/
components/
lib/
features/
\`\`\`

## Server vs client boundaries
- Server: …
- Client (charts/maps): …

## API / route handlers
- `GET /api/...` — purpose, DTO shape

## Environment
- Vars (names only, no secrets): …

## Migration / rollout steps
1. …

## Risks and simplifications
- …
```

## Quality Checklist

- [ ] Charts and maps have dedicated client entry points
- [ ] No browser-only imports in server files
- [ ] Data fetching ownership is clear per route
- [ ] Structure matches existing repo conventions if present
- [ ] Plan is incremental, not a big-bang rewrite

## Anti-patterns / Do Not Do

- Do not add abstraction layers (generic “data layer” frameworks) before repeated patterns exist
- Do not fetch large datasets in RSC only to pass them to client charts without aggregation strategy
- Do not mix Pages and App Router patterns in new code without explicit migration plan
- Do not put business logic inside `page.tsx` when it belongs in `lib/` or services
