# Unified Next.js / TypeScript stack

We build the MVP as a single full-stack **Next.js (App Router)** app in
**TypeScript**, with **Postgres** + **Prisma** for persistence and **Auth.js**
for single-user accounts, deployed on **Vercel** with a managed Postgres
(Neon/Railway). The builder already knows React + TypeScript, so the only new
surface is server-side TS — the easy part — in the same language as the client.

## Considered Options

- **Python (FastAPI) backend + React (Vite) frontend (rejected):** would leverage
  the builder's core Python skill, and the two interact fine. Rejected for
  operational overhead — two services, CORS, split auth, two deploy targets — when
  the backend's only real logic (CRUD + Assignment composition) is simple enough
  to express in TS at negligible cost.
- **Unified Next.js/TS (chosen):** one language end-to-end, one deploy, ORM maps
  the domain entities directly.

## Consequences

- Backend logic (Capacity→Gear, breadth-peel, degrade) is written in TypeScript.
- No second service to operate for the MVP.
- Postgres fits the relational, snapshot-heavy data model (see ADR-0004).
