# Cloud-native, zero-cost CI/CD pipeline

We run the entire CI/CD pipeline on free, hosted services with nothing
self-hosted: **GitHub Actions** (GitHub-hosted runners) for checks,
**SonarCloud** + **CodeQL** + **Dependabot** for scanning, and **Vercel** for
deployment. The repository is **public**, which is what makes all of these free.

The flow: a feature branch opens a PR → Actions runs `lint`, `typecheck`, and
`vitest`; SonarCloud and CodeQL analyse and decorate the PR; Vercel publishes a
preview deployment. Merging to `main` triggers Vercel's production deploy, which
runs `prisma migrate deploy` against Neon before building. Branch protection on
`main` requires the Actions checks and the SonarCloud quality gate to pass.

Three services, one responsibility each: Actions = checks, SonarCloud/CodeQL =
scanning, Vercel = deploy.

## Considered Options

- **Self-hosted SonarQube + a co-located self-hosted Actions runner (rejected):**
  technically free and a genuine DevOps exercise. A self-hosted runner on the
  same box as SonarQube keeps the scanner→server hop on localhost and the
  runner→GitHub hop outbound-only, so nothing is exposed and the repo is not
  mirrored. Rejected as too much to operate and maintain (server, database,
  runner, upgrades) for a single-developer project, and SonarQube Community
  Edition has no PR decoration anyway.

- **SonarCloud, hosted (chosen):** free for public repos, zero maintenance, and
  it *does* decorate PRs and analyse branches — the capabilities the self-hosted
  Community edition lacks. The public-repo decision (taken to get free CodeQL and
  unlimited Actions minutes) makes this free as well.

- **Railway for hosting (rejected):** would keep the app and Postgres in one
  project, but it has no real free tier (~$5/month after a trial credit).

- **Vercel + Neon Postgres (chosen):** the natural home for Next.js. Vercel's
  native GitHub integration handles preview and production deploys with no deploy
  job to write; Neon supplies a free Postgres with a `production` branch and a
  `preview` branch so preview deployments never touch production data. Builds on
  the stack chosen in [ADR-0005](0005-unified-nextjs-typescript-stack.md).

- **End-to-end (Playwright) tests in the CI gate (deferred):** running them needs
  a live app plus a Postgres, which is the fiddliest and most flake-prone part of
  a pipeline. Deferred to keep the first iteration simple and green; the gate is
  `lint → typecheck → vitest`. Promoting e2e into CI is a planned follow-up.

## Consequences

- Scanning is intentionally split: **CodeQL** gates security per-PR in the cloud,
  while **SonarCloud** adds the quality/maintainability dashboard and its own PR
  decoration. A reader expecting a single scanner will see two — this is why.
- No deploy job exists in `.github/workflows`; deployment is owned by Vercel's
  GitHub integration, not Actions.
- Secrets live in their platforms, never the repo: `DATABASE_URL` and
  `AUTH_SECRET` in Vercel (per-environment), `SONAR_TOKEN` in GitHub if a
  CI-driven Sonar analysis is later preferred over Automatic Analysis.
- Database migrations run as part of the Vercel build command
  (`prisma migrate deploy && next build`), set in Vercel project settings rather
  than in `package.json`, so a local `npm run build` never migrates a real DB.
- Everything depends on the repo staying **public**; making it private would
  remove free CodeQL/SARIF upload and cap Actions minutes.
