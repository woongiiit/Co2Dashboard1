---
name: deployment-devops
description: Covers Next.js build/deploy, environment variables, Docker, map tile configuration, CI/CD checks, health endpoints, and operational troubleshooting. Use when preparing releases, containers, pipelines, or production configuration.
---

# Deployment & DevOps

## Purpose

Ship the Next.js dashboard reliably with documented env config, reproducible builds, and operational runbooks.

## When to Use

- First production deploy or new environment
- Docker/CI setup, `next build` failures
- Configuring map tiles, API URLs, feature flags
- Rollback or incident troubleshooting in deployed environments

## Core Responsibilities

- Document required env vars in `.env.example` (no secret values)
- Verify production builds include only safe server/client env usage
- Container or platform deploy checklist
- Health checks and basic operational commands

## Process

1. **Inventory env vars**: `NEXT_PUBLIC_*` vs server-only; map style URLs; API base URLs.
2. **Build locally**: `npm|pnpm|yarn|bun run build` using repo’s package manager.
3. **Browser-only libs**: confirm no SSR import errors for charts/maps.
4. **Assets**: `public/`, static map sprites if any; CDN strategy.
5. **Docker** (if used): multi-stage build, non-root user, `NODE_ENV=production`.
6. **CI**: lint, typecheck, test, build; cache dependencies per lockfile.
7. **Deploy**: platform-specific (Vercel, K8s, VM); set secrets in vault/UI.
8. **Post-deploy**: smoke test dashboard, map tiles, auth, health endpoint.
9. **Rollback plan**: previous image/tag; DB migration compatibility.

### Rules

- Document required environment variables.
- Never commit secrets.
- Verify `next build` before merge/release.
- Ensure browser-only libraries do not break server-side builds.
- Document map tile URLs or provider token configuration (env-based).
- Include operational troubleshooting steps in handoff docs.

## Output Format

```markdown
## Deployment checklist: [Release]

### Prerequisites
- Node version, package manager

### Environment variables
| Name | Scope | Required | Description |

### Build & test
- [ ] install
- [ ] lint / typecheck
- [ ] test
- [ ] next build

### Deploy steps
1. …

### Smoke tests
- [ ] …

### Rollback
- …

### Troubleshooting
- Symptom → check → fix
```

## Quality Checklist

- [ ] `.env.example` matches required vars
- [ ] Secrets only in platform secret store
- [ ] `next build` succeeds in CI
- [ ] Map/chart pages work in production mode locally (`next start`)
- [ ] Health endpoint or equivalent documented

## Anti-patterns / Do Not Do

- Do not commit `.env` with real credentials
- Do not use `NEXT_PUBLIC_` for secrets
- Do not skip build in CI and deploy failing main
- Do not hardcode production API URLs in source
- Do not deploy DB migrations without backup/rollback plan
