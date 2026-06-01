---
name: maplibre-deckgl-geospatial
description: Implements MapLibre GL and deck.gl in Next.js client components with layer composition, GeoJSON handling, viewport state, legends, and geospatial performance patterns. Use when building maps, layers, clustering, or fixing map rendering and interaction bugs.
---

# MapLibre GL & deck.gl Geospatial

## Purpose

Build reliable, performant map experiences with correct CRS/coordinate handling, clear UX, and safe client-only boundaries.

## When to Use

- New map pages, layers, or controls
- GeoJSON ingestion, clustering, heatmaps, 3D layers
- Map performance, tooltip/hover, legend, basemap config

## Core Responsibilities

- Client-only map rendering; never import MapLibre/deck.gl in Server Components
- Separate geospatial data transformation from map render components
- Validate coordinate order (typically `[lng, lat]` for GeoJSON) and CRS assumptions
- deck.gl for large or GPU-friendly layers; avoid thousands of DOM markers
- Loading, empty, error, and no-data map states; legends and controls

## Process

1. **Client shell**: `'use client'` map component; fixed-height or flex parent (zero height breaks maps).
2. **Basemap**: style URL from env; no hardcoded tokens in source.
3. **State**: viewport (center, zoom, bearing, pitch) in React state or URL when shareable.
4. **Data pipeline**: fetch → validate → transform to GeoJSON/layer props in pure functions.
5. **MapLibre**: base map, optional native layers for light overlays.
6. **deck.gl**: `MapboxOverlay` or equivalent; compose layers (Scatterplot, GeoJson, Heatmap, etc.).
7. **Interactions**: pick/hover tooltips, click handlers, layer visibility toggles.
8. **Performance**: clustering, tile sources, bbox-filtered APIs, simplify geometries.
9. **UX**: legend, scale, layer list, mobile-friendly controls.

### Rules

- **Do not** import MapLibre or deck.gl into Server Components.
- Isolate map rendering inside Client Components.
- Keep map data transformation separate from rendering components.
- Validate coordinate order and CRS assumptions explicitly.
- Prefer GeoJSON-compatible structures when appropriate.
- Use deck.gl layers for large or interactive geospatial visualization.
- Avoid rendering too many DOM markers.
- Add legends, tooltips, and interaction states.
- Avoid hardcoded map tokens; use environment variables.
- Handle loading, empty, error, and no-data states.
- Keep controls usable on desktop and mobile.

## Output Format

- `MapView.tsx` (client), `layers/*.ts` builders, `types/geo.ts`
- Doc: CRS, coordinate order, env vars for style/tiles, layer list and defaults

## Quality Checklist

- [ ] Map container has explicit height
- [ ] CSS for maplibre-gl imported in client bundle
- [ ] Coordinates documented and validated
- [ ] Secrets only via env; `.env.example` updated if new vars
- [ ] Large datasets use aggregation, clustering, or bbox queries
- [ ] Legend and layer visibility understandable

## Anti-patterns / Do Not Do

- Do not assume `[lat, lng]` without checking API contract
- Do not re-create the full map instance on every minor prop change without need
- Do not update React state on every `move` event for heavy trees—throttle or lift state carefully
- Do not commit API keys for tile providers
- Do not use DOM markers for tens of thousands of points
