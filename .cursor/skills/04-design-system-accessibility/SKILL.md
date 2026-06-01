---
name: design-system-accessibility
description: Applies design tokens, typography, spacing, color, and accessibility practices for readable dashboards, tables, charts, maps, and filter panels. Use when styling UI, defining tokens, or improving a11y and visual hierarchy.
---

# Design System & Accessibility

## Purpose

Keep dashboard UIs professional, readable, and accessible—consistent tokens, clear hierarchy, and usable charts/maps for all users.

## When to Use

- New screens, components, or design tokens
- Chart/map legend and tooltip readability issues
- Accessibility audits, keyboard nav, contrast fixes
- Filter panels and dense data tables

## Core Responsibilities

- Typography and spacing scales; consistent component states
- Color with sufficient contrast; never color-only meaning
- Keyboard navigation and focus visibility
- ARIA only when native semantics are insufficient
- Chart, table, and map legend readability

## Process

1. **Inventory existing tokens**: CSS variables, Tailwind theme, component library if any.
2. **Hierarchy**: page title → section → widget title → data labels; limit competing accents.
3. **Spacing**: use scale (4/8px or project equivalent) for padding, gaps, section rhythm.
4. **Color**: semantic roles (primary, muted, danger, success); test contrast (WCAG AA target for body text).
5. **Interactive states**: hover, focus, active, disabled, selected filters clearly visible.
6. **Tables**: row hover, zebra optional, numeric alignment, header scope.
7. **Charts**: legible axis ticks, tooltips, legend placement; reduce grid noise.
8. **Maps**: legend, control size, touch targets on mobile.
9. **Keyboard**: tab order, Escape to close overlays, skip links for main content if needed.

### Rules

- Avoid visually noisy dashboards—whitespace and grouping beat decoration.
- Make legends, labels, tooltips, and units readable at default zoom.
- Ensure selected filters and active layers are obvious.
- Do not use color as the only way to convey meaning (add icons, patterns, or labels).

## Output Format

```markdown
## Design / a11y notes: [Screen or component]

### Tokens used
- Typography: …
- Spacing: …
- Colors: …

### Hierarchy
- …

### Accessibility
- Contrast: …
- Keyboard: …
- ARIA (if any): …

### Chart/map readability
- …
```

## Quality Checklist

- [ ] Text meets contrast targets for normal and large text
- [ ] Focus rings visible on interactive elements
- [ ] Filter/selection state visible without color alone
- [ ] Chart axes and legends readable; tooltips not clipped
- [ ] Map controls usable on mobile
- [ ] Consistent with existing design system if present

## Anti-patterns / Do Not Do

- Do not add one-off hex colors when tokens exist
- Do not shrink chart fonts below readable sizes to “fit more”
- Do not rely on `title` attributes alone for critical info
- Do not overload dashboards with competing chart types and neon colors
- Do not skip focus styles for aesthetic minimalism
