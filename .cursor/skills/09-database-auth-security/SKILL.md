---
name: database-auth-security
description: Guides schema design, migrations, indexing, auth, RBAC, and security practices including geospatial indexes and secret handling. Use when working with databases, Prisma/SQL, authentication, authorization, or security reviews.
---

# Database, Auth & Security

## Purpose

Secure, performant persistence and access control for dashboard and geospatial workloads—with server-side enforcement and safe operations.

## When to Use

- Schema changes, migrations, indexes
- Auth flows, sessions, JWT, OAuth
- RBAC, row-level access, API authorization
- Security review or incident hardening

## Core Responsibilities

- Normalized schema with migration discipline
- Indexes for filters, time ranges, and spatial queries
- Server-side authentication and authorization on every protected path
- Secret management via environment variables
- OWASP basics: injection, XSS, CSRF as applicable to stack

## Process

1. **Model entities** aligned to API DTOs, not raw UI tables.
2. **Migrations**: reversible when possible; review in PR; no manual prod drift.
3. **Indexes**: filter columns, foreign keys, `(timestamp)`, spatial/GiST where supported.
4. **Geospatial**: store CRS explicitly; use bbox queries; spatial index on geometry/geography.
5. **Auth**: session or token strategy consistent with Next.js (middleware, server session).
6. **Authorization**: role/permission checks in route handlers and server actions—not UI only.
7. **Secrets**: `.env.local` gitignored; document in `.env.example` without values.
8. **Logging**: structured logs without PII, tokens, or passwords.

### Rules

- Never rely only on frontend permission checks.
- Validate authorization server-side.
- Do not log sensitive data.
- Do not expose internal IDs or secrets unnecessarily in public APIs.
- For geospatial data, use spatial indexes or bounding-box queries where supported.

## Output Format

```markdown
## Change: [Schema / auth feature]

### Schema / migration
- Tables, columns, indexes

### AuthZ matrix
| Role | Resource | Action |

### Security notes
- Threats mitigated, env vars added

### Rollback
- …
```

## Quality Checklist

- [ ] Migrations tested locally; indexes for new query patterns
- [ ] All protected routes verify identity and permission
- [ ] Parameterized queries / ORM—no string-concat SQL
- [ ] `.env.example` updated; no secrets committed
- [ ] Spatial queries bounded and indexed when volume grows

## Anti-patterns / Do Not Do

- Do not store plaintext passwords or long-lived tokens in DB without hashing/rotation plan
- Do not expose stack traces or SQL errors to clients
- Do not skip auth on “internal” routes that are reachable from the browser
- Do not use client-only role checks to hide admin buttons as the only control
- Do not log full request bodies containing credentials
