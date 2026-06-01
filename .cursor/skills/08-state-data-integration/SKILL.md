---
name: state-data-integration
description: Manages server vs client state, API integration, caching, URL sync for filters, and chart/map view state in dashboard apps. Use when wiring data fetching, filters, pagination, or map/chart state across components.
---

# State & Data Integration

## Purpose

Keep data flow predictable: remote data as server state, UI state local or URL-backed, and chart/map view state coherent without duplication.

## When to Use

- Fetching, caching, or invalidating dashboard data
- Filter/search/pagination synced to URL
- Chart filters, map viewport, layer visibility
- Optimistic updates or mutation flows

## Core Responsibilities

- Distinguish server state (API) from ephemeral UI state
- Query keys, cache TTL, and invalidation strategy
- URL state for shareable filters and pages
- Map viewport and layer visibility conventions
- Graceful slow/failed request handling

## Process

1. **Classify state**:
   - Server: entities, aggregates, geo features
   - URL: filters, date range, page, sort, sometimes map center/zoom
   - Local: panel open, hover, draft form input
2. **Choose fetch layer**: RSC fetch, Route Handler + client fetch, TanStack Query/SWR—match repo.
3. **Define query keys** including filter dimensions; document invalidation triggers.
4. **URL sync**: `useSearchParams` + router updates; debounce text search.
5. **Chart filters**: derive query params from filter state; avoid duplicate fetches.
6. **Map state**: separate viewport from layer visibility; throttle viewport persistence if needed.
7. **Errors**: surface per-widget errors; global toast only when appropriate.

### Rules

- Treat remote data as server state.
- Keep UI-only state local unless shared widely.
- Store filter/search/page state in the URL when shareability matters.
- Keep chart and map view state predictable.
- Do not duplicate server state into global client state without a reason.
- Handle slow APIs and failures gracefully (retry, stale indicators).

## Output Format

- State diagram or table: state piece → storage → sync mechanism
- List of query keys and invalidation events
- URL param contract table

## Quality Checklist

- [ ] Single source of truth for remote data
- [ ] URL reflects shareable dashboard state where required
- [ ] No stale closure bugs in filter → fetch pipelines
- [ ] Loading/error per widget or section, not only global spinner
- [ ] Map/chart state resets documented when filters change

## Anti-patterns / Do Not Do

- Do not copy entire API responses into Redux/Zustand by default
- Do not store secrets or tokens in URL or client global state
- Do not refetch on every map pixel move without debouncing
- Do not fight the framework—duplicate RSC data on client without need
- Do not ignore race conditions on fast filter changes (abort or request id)
