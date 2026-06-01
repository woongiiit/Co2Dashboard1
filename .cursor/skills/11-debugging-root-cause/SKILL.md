---
name: debugging-root-cause
description: Systematically debugs Next.js hydration, client/server boundary, ECharts, MapLibre/deck.gl, and API data mismatches with reproduction steps and minimal root-cause fixes. Use when investigating bugs, errors, or unexpected dashboard/map/chart behavior.
---

# Debugging & Root Cause Analysis

## Purpose

Find and fix root causes—not symptoms—for dashboard, chart, map, and API issues in Next.js + React apps.

## When to Use

- Runtime errors, blank charts/maps, wrong data
- Hydration warnings, build failures involving browser libraries
- Performance regressions after a specific change

## Core Responsibilities

- Reproduce reliably; narrow scope with evidence
- Rank hypotheses; verify with logs, network, minimal experiments
- Distinguish workaround vs root-cause fix
- Verify fix across loading, error, and success paths

## Process

1. **Capture symptoms**: exact error text, route, browser, steps, screenshots if provided.
2. **Reproduce**: minimal steps; note server vs client-only execution.
3. **Check boundaries**: Server Component importing `echarts`, `maplibre-gl`, `deck.gl`?
4. **Network**: API status, response shape vs TypeScript types.
5. **DOM/layout**: map/chart container dimensions, CSS imports.
6. **Data**: coordinate order, nulls, timezone, pagination limits.
7. **Hypothesis list**: rank by likelihood; test one change at a time.
8. **Fix minimally**; add test or guard if regression-prone.
9. **Verify**: `next build`, affected flows, no new hydration warnings.

### Common issue areas

| Symptom | Likely cause |
|---------|----------------|
| Build error on map/chart import | Browser library in Server Component |
| Hydration mismatch | Client-only random/date formatting in SSR |
| Map blank | Container height 0; missing CSS |
| Chart tiny/wrong | No resize on container change |
| Wrong location | `[lat,lng]` vs `[lng,lat]` |
| Tab freeze | Too many markers; no aggregation |
| Env undefined | `NEXT_PUBLIC_*` vs server-only var misuse |
| UI shows stale/wrong values | API shape mismatch; cache key wrong |

## Output Format

```markdown
## Debug report: [Issue]

### Reproduction
1. …

### Observed vs expected
- …

### Evidence
- Logs, network, stack trace

### Root cause
…

### Fix
- Files changed, why this is root cause (not workaround)

### Verification
- [ ] …
```

## Quality Checklist

- [ ] Root cause stated, not only symptom patched
- [ ] Fix scoped; unrelated refactors avoided
- [ ] Client/server boundary respected after fix
- [ ] Verified in production-like build when relevant

## Anti-patterns / Do Not Do

- Do not apply `suppressHydrationWarning` without understanding mismatch
- Do not disable TypeScript or ESLint to “fix” build
- Do not add arbitrary `setTimeout` retries without diagnosis
- Do not commit secrets while debugging tile providers
- Do not close issue with “works on my machine” without reproduction steps documented
