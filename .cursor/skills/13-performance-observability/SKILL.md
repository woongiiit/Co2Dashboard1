---
name: performance-observability
description: Optimizes frontend bundle, chart/map rendering, API and database performance, caching, logging, and health checks for dashboard apps. Use when addressing slowness, large datasets, bundle size, or adding observability.
---

# Performance & Observability

## Purpose

Keep dashboard, chart, and map experiences responsive at scale—with measurable signals and safe logging.

## When to Use

- Slow pages, janky map panning, chart lag
- Large API payloads or DB queries
- Bundle analysis, Core Web Vitals concerns
- Adding metrics, tracing, or health endpoints

## Core Responsibilities

- Right-size data before it hits the client
- Dynamic import for heavy browser libraries
- Reduce unnecessary React re-renders on map/chart updates
- API/DB caching, indexes, pagination, bbox limits
- Structured logs and health checks without sensitive data

## Process

1. **Measure**: Lighthouse, React Profiler, Network tab, server timings, DB explain.
2. **Frontend bundle**: analyze imports; `next/dynamic` for ECharts/MapLibre/deck.gl.
3. **Data volume**: aggregate on server; paginate tables; simplify geometries.
4. **Charts**: sampling, dataZoom, decimation; avoid re-init on every prop tick.
5. **Maps**: deck.gl layers vs DOM markers; cluster; fetch by viewport bbox.
6. **React**: stabilize props; throttle viewport URL updates; split context.
7. **Backend**: query limits, indexes, cache headers, CDN for static tiles/assets.
8. **Observability**: request IDs, route timing logs, `/api/health`, error tracking hooks.

### Rules

- Use dynamic import or client-only boundaries for heavy chart/map libraries when appropriate.
- Avoid rendering huge datasets directly on the client.
- Aggregate or simplify data when possible.
- Avoid excessive React state updates during map movement.
- Use bounding boxes, tiling, clustering, aggregation, or pagination for geospatial data.
- Add useful logs and health checks without leaking sensitive information.

## Output Format

```markdown
## Performance work: [Area]

### Baseline
- Metric: value (how measured)

### Findings
- …

### Changes
- …

### Expected impact
- …

### Follow-up
- …
```

## Quality Checklist

- [ ] Improvement verified with before/after measurement
- [ ] No regression in empty/error/loading paths
- [ ] Server build still passes (`next build`)
- [ ] Logs/metrics exclude secrets and PII
- [ ] Limits documented for API/geo endpoints

## Anti-patterns / Do Not Do

- Do not optimize prematurely without measurement
- Do not ship client-side clustering of 1M points without server strategy
- Do not disable React Strict Mode solely to hide double-mount issues
- Do not log full GeoJSON payloads in production
- Do not cache personalized responses in public CDN caches
