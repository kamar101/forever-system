# Forever System

A web app that keeps you making progress toward long-term goals by adapting each
day's expectation to your current capacity — so no day is ever a "zero day". See
[`CONTEXT.md`](./CONTEXT.md) for the domain language and [`docs/adr/`](./docs/adr)
for the architecture decisions.

## Stack

Next.js (App Router) + TypeScript, Postgres + Prisma, Auth.js (credentials).
See [ADR-0005](./docs/adr/0005-unified-nextjs-typescript-stack.md).

## Local development

Prerequisites: Node 20+, Docker (for local Postgres).

```bash
# 1. Install dependencies
npm install

# 2. Configure env (defaults match docker-compose.yml)
cp .env.example .env
npx auth secret            # writes a real AUTH_SECRET into .env

# 3. Start Postgres
npm run db:up

# 4. Apply migrations
npm run db:migrate

# 5. Run the app
npm run dev                # http://localhost:3000
```

## Tests

```bash
npm test          # domain unit tests (Vitest, table-driven)
npm run test:e2e  # Playwright smoke test (needs db:up + db:migrate)
npm run typecheck # tsc --noEmit
```

## Conventions

- **Domain layer** (`src/domain/`): pure functions, tested with the table-driven
  pattern (see `src/domain/capacity.test.ts`). New domain rules follow that shape.
- **Persistence**: Prisma models map domain entities directly; the client
  singleton lives in `src/lib/prisma.ts`.
- **Auth**: `src/auth.ts` (Node runtime, Credentials provider) +
  `src/auth.config.ts` (edge-safe, used by `middleware.ts`).
