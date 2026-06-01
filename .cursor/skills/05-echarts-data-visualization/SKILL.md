---
name: echarts-data-visualization
description: Integrates ECharts in React/Next.js client components with responsive resize, option builders, formatting, and large-dataset strategies. Use when building or fixing charts, tooltips, legends, or chart performance.
---

# ECharts Data Visualization

## Purpose

Implement clear, performant ECharts visualizations in a Next.js dashboard with proper client boundaries and separated data transformation.

## When to Use

- New chart widgets or dashboard analytics views
- Chart bugs (resize, labels, tooltips, empty state)
- Large dataset or performance tuning for charts

## Core Responsibilities

- Client-only ECharts rendering (`'use client'`, optional dynamic import)
- Separate raw data transformation from `option` construction
- Title, units, tooltips, legends, and empty states
- Responsive `resize` on container changes
- Sampling, aggregation, or progressive rendering for large data

## Process

1. **Confirm client boundary**: chart component must not be imported by Server Components.
2. **Define the question**: one primary insight per chart; avoid decorative charts.
3. **Types**: input series schema, view model for option builder.
4. **Transform** (pure functions): filter, aggregate, sort, format dates/numbers.
5. **Build option**: axes, series, legend, grid margins, `tooltip.formatter`.
6. **Wrapper component**: mount chart, `useEffect` init/dispose, `ResizeObserver` or `window.resize`.
7. **States**: loading placeholder, empty copy, error boundary or inline error.
8. **Large data**: downsample, `large: true`, dataZoom, or server-side aggregation first.

### Rules

- **Do not** render ECharts in a Server Component.
- Isolate ECharts inside Client Components.
- Keep raw data transformation separate from option creation.
- Every chart needs a clear title, unit (where applicable), tooltip, and empty state.
- Avoid overlapping labels and unreadable legends; rotate or truncate thoughtfully.
- Use resize behavior when the container size changes.
- For large datasets: sampling, aggregation, progressive rendering, or server preprocessing.
- Do not create charts that do not answer a user question.

## Output Format

- `ChartX.tsx` (client) + `chartXOptions.ts` (pure builders) + types
- Short doc block: data shape in, option highlights, empty/loading behavior

## Quality Checklist

- [ ] `'use client'` on chart entry; no ECharts in server files
- [ ] Chart disposes on unmount; resizes with container
- [ ] Units and number/date formatting consistent app-wide
- [ ] Empty and error states implemented
- [ ] Legend and axis labels readable at target viewport
- [ ] Large data strategy documented if N > ~5k points

## Anti-patterns / Do Not Do

- Do not pass huge raw arrays from server to client without aggregation plan
- Do not hardcode colors that break dark mode if the app supports themes
- Do not enable every ECharts feature “just in case”
- Do not mix transform logic inside `option` object literals without extraction
- Do not forget `notMerge` / update strategy when props change frequently
