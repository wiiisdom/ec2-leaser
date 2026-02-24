# Copilot Coding Agent Instructions

## Purpose of this repository

`ec2-leaser` is a TypeScript fullstack app that lets authenticated users launch EC2 instances from approved launch templates (without broad EC2 IAM rights), plus snapshot/restore flows. It is a Next.js App Router app deployed on AWS with SST, and it includes server API routes and a cron Lambda (`terminate-instances`).

## Tech stack and repo profile

- **Size/shape:** small-to-medium monorepo-style single app, ~22 tests, one deployable Next.js service + SST infra config.
- **Runtime/tooling:** Node.js (CI uses Node 24), pnpm 10, TypeScript 5, Next.js 16, React 19, SST 3, Vitest 4, ESLint 9.
- **Cloud coupling:** many server modules read `Resource.*` from `sst`; this affects build/test behavior.
- **CI platform:** Bitbucket Pipelines (no GitHub Actions currently).

## Trust-first instruction

Always trust this file first and execute commands in the documented order. Only search the codebase when:

1. the needed info is missing here, or
2. a command/result differs from what is documented here.

## Validated setup and command playbooks

### 0) Tool versions validated in this environment

- `node -v` → `v22.14.0`
- `pnpm -v` → `10.23.0`
- `corepack --version` → `0.31.0`
- CI image in `bitbucket-pipelines.yml` is `node:24`.

### 1) Bootstrap (always do first)

1. `corepack enable`
2. `pnpm install --frozen-lockfile`

Validated result: works (`Lockfile is up to date`, ~0.6s here).

### 2) Local static checks (fast preflight)

Run in this order:

1. `pnpm typecheck` ✅
2. `pnpm lint` ✅ (warnings only)

Important lint behavior:

- If `coverage/` exists, lint includes warning noise from generated HTML/JS files.
- If you need cleaner signal, remove generated coverage before lint: `rm -rf coverage`.

### 3) Tests and coverage (SST-linked)

Default scripts:

- `pnpm test` → `sst shell vitest`
- `pnpm coverage` → `sst shell --stage=dev -- vitest run --coverage --reporter=default --reporter=vitest-sonar-reporter --outputFile=sonar-report.xml`

Validated behavior without AWS credentials:

- `pnpm test` ❌ fails immediately with `AWS credentials are not configured`.
- `pnpm coverage` ❌ fails immediately with same error.

Why: `sst shell` requires resolvable AWS credentials.

Required (not optional in practice) for these scripts:

- Valid AWS credentials/profile (`~/.aws/config` + `AWS_PROFILE`, or equivalent env creds).

Temporary session credentials also work (common for local agent runs). Export all 3 values in the current shell before running `pnpm test` / `pnpm coverage`:

```bash
export AWS_ACCESS_KEY_ID="<temporary-access-key-id>"
export AWS_SECRET_ACCESS_KEY="<temporary-secret-access-key>"
export AWS_SESSION_TOKEN="<temporary-session-token>"
```

If credentials are provided as a copy/paste block, run that block first, then execute test commands in the same terminal session.

### 4) Build and run

- `pnpm dev` ✅ starts Next dev server (ready in ~2.6s in this environment).
- `pnpm build` ❌ fails during page data collection with:
  - `It does not look like SST links are active... wrap your command with sst dev -- <command>`
- `pnpm sst shell --stage=dev -- pnpm build` ❌ still failed here because AWS credentials were missing.

Interpretation:

- Production build needs SST links + AWS-authenticated SST context.
- For local app iteration without full infra context, use `pnpm dev`.

### 5) Known timeout/misbehavior notes

- Long-running commands (`pnpm dev`, `pnpm sst dev`) should be started as background tasks in agent workflows to avoid timeout interruption.
- A foreground `pnpm dev` can pollute subsequent terminal commands; stop it (`Ctrl+C` / `pkill -f "next dev"`) before running tests/builds.

## Recommended agent command sequences

### Minimal safe validation for most PRs

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `rm -rf coverage` (optional but reduces lint noise)
4. `pnpm lint`

### Full CI-parity validation (requires AWS credentials)

1. `pnpm install --frozen-lockfile`
2. `pnpm typecheck`
3. `pnpm coverage`
4. `pnpm lint`

This mirrors the Bitbucket PR gate in `bitbucket-pipelines.yml`.

## CI / pre-check-in checks

Defined in `bitbucket-pipelines.yml` (`pull-requests` and `main`):

1. `pnpm typecheck`
2. `pnpm coverage`
3. Sonar scan pipe (`sonarsource/sonarcloud-scan`)
4. `pnpm lint`

On `main`, additional parallel jobs run:

- mirror push to GitHub,
- SST deploy to prod (`AWS_REGION=eu-central-1 pnpm sst deploy --stage prod`),
- SST deploy to demo (`AWS_REGION=us-east-1 pnpm sst deploy --stage demo`).

## Project layout and architecture map

### Root-level important files

- `package.json`: all scripts (`build`, `dev`, `start`, `typecheck`, `lint`, `test`, `coverage`)
- `bitbucket-pipelines.yml`: authoritative CI gates and deploy flow
- `sst.config.ts`: infra/resources, secrets, Next site, cron
- `vitest.config.ts`, `setup-tests.ts`: test config
- `eslint.config.mjs`: lint config
- `tsconfig.json`: TS strictness + path aliases
- `next.config.mjs`: Next config
- `README.md`: run/deploy overview

### Source structure

- `src/app`: Next.js App Router UI pages and route handlers
  - `src/app/api/**/route.ts`: API endpoints
  - `src/app/(main)/**`: authenticated app pages/layout/navbar
  - `src/app/signin/page.tsx`: sign-in page
- `src/auth.ts`: NextAuth + Microsoft Entra ID, reads SST `Resource` secrets
- `src/lib/*Utils.ts`: business logic for auth, DynamoDB, EC2
- `src/components/start/*`: EC2 launch/snapshot/restore form UX
- `src/cron/terminate-instances.ts`: scheduled EC2 cleanup Lambda
- `src/models`, `src/schemas`: typed domain + validation schema

### Tests

- `test/app/**`: page/layout/route tests
- `test/lib/**`: utility tests
- `test/cron/**`: cron behavior tests
- `test/components/**`: UI component tests

## High-value coding guidance

- Prefer editing in `src/lib/*` for core behavior and keep route handlers thin.
- For API changes, update matching tests under `test/app/api/**`.
- For UI behavior in start flow, check `src/components/start/*` and related tests.
- Be careful importing modules that read `Resource.*` (SST links required in build/test contexts).

## Practical workarounds that save time

- Always run `pnpm install --frozen-lockfile` before any validation.
- Always run `pnpm typecheck` before expensive/test commands.
- If lint output is noisy from generated coverage HTML/JS, run `rm -rf coverage` then lint.
- If a terminal session previously ran `pnpm dev`, always stop it before test/build commands.
- If `sst shell` commands fail, fix AWS credentials first; do not keep retrying command permutations.
- For temporary credentials, re-export `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_SESSION_TOKEN` when the session expires.

## Key README facts (quick extract)

- Local app: `pnpm install` then `pnpm dev`
- Local multiplexer (for cron/integration work): `pnpm install` then `pnpm sst dev`
- Deploy examples:
  - `AWS_REGION=eu-central-1 pnpm sst deploy --stage prod`
  - `AWS_REGION=us-east-1 pnpm sst deploy --stage demo`
- Cost centers/schedules are stored in DynamoDB config table (`{stage}-ec2-leaser-config`).
