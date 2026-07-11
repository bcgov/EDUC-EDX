# AGENTS.md

Monorepo for the BC EDX (Education Data Exchange) app. Three independent npm
projects with no root workspace — install and run commands inside each subdir.

## Layout
- `backend/` — Node.js + Express API (auth, sessions, proxy to downstream EDX
  services). Entry: `src/server.js`. Runs on port **8080**. Requires a local
  **Redis** instance.
- `frontend/` — Vue 3 + Vite + Vuetify 3 SPA. Dev server on port **8081**,
  proxies `/api` → `http://localhost:8080` (see `vite.config.js`).
- `tests-e2e/` — Cypress E2E suite. Targets the dev environment by default.
- `tools/` — OpenShift templates and onboarding config. Not an npm project.

## Workflow
- Branch from `master` and prefix with `feature/**` or `fix/*` (these are the
  patterns CI triggers on). PRs target `master`.

## Backend
- Config is env-driven via `nconf` + `dotenv` (`src/config/index.js`). It loads
  `src/config/${NODE_ENV}.json` then merges env vars. You **must** obtain a
  `local.json` from a teammate and place it in `src/config/` before `npm run
  serve` will work. Without it the app cannot resolve downstream API endpoints.
- **Never read `local.json` or print/log its contents.** It holds live secrets
  and downstream-service credentials. Do not paste it into chat, commits, PRs,
  logs, or any network-facing location. `opencode.json` already denies reads of
  `*.local.json`; respect that and ask the user if you think you need its
  contents.
- Set `NODE_ENV` explicitly: `local` for dev, `test` for unit tests. On Linux
  use the `*-linux` / `test-linux` scripts (e.g. `npm run test:unit-linux`)
  since the default scripts use Windows-style `set NODE_ENV=...`.
- `npm test` runs **lint then jest** (the `pretest` hook runs `npm run lint`).
  Tests are in `tests/unit/`. Run a single test with `npx jest <path-or-pattern>`.
- Babel config enables `babel-plugin-rewire`, so unit tests use `__get__` /
  `__set__` to access private internals. Don't be surprised by rewire usage.
- Lint: 2-space indent, single quotes, semicolons, enforced EOL newline
  (`eslint:recommended` + custom rules in `package.json`).

## Frontend
- Scripts: `serve`, `build`, `lint:fix` only. There is **no test script** —
  `frontend/README.md` mentions `npm run test:unit` but that line is stale.
- `npm run serve` from `frontend/` expects the backend up on 8080 (the proxy
  target). Bring backend up first.
- Lint config is in `package.json` (`eslint:recommended` +
  `plugin:vue/vue3-recommended`). Same indent/quote/semi rules as backend.

## E2E (Cypress)
- Default `baseUrl` is the remote dev env
  `https://dev.educationdataexchange.gov.bc.ca`. To run against local, change
  `baseUrl` in `cypress.config.ts` and `base_url` in `cypress.env.json` to
  `http://localhost:8081`.
- Requires a `cypress.env.json` obtained from a teammate (gitignored).
- Local tooling is provided via direnv + Nix (`shell.nix` / `.envrc`); run
  `direnv allow` in `tests-e2e/` if you use it.
- Data seeding is shared — coordinate with teammates before/after runs to
  avoid interfering with results.
- Run: `npm run cypress` (headless) or `npm run cypress:open` (UI).

## OpenCode config
`opencode.json` denies read access to `*.env`, `*.env.*`, `*.local.json`,
`*.direnv`, `shell.nix`, and `*.application-local*`. Treat these as
off-limits and **never expose their contents externally** (chat, commits,
logs, anywhere network-reachable). If you need their contents, ask the user.

## CI
- Backend CI uses Node 18.x and runs `npm run lint:fix` (working dir
  `backend/`).
- Frontend CI uses Node 14.x and runs `npm run lint:fix` (working dir
  `frontend/`).
- Cypress runs via `workflow_dispatch` only and writes `cypress.env.json`
  from the `CYPRESS_ENV_CI` secret.

## Deploy
OpenShift only, via templates in `tools/openshift/` and workflows under
`.github/workflows/deploy-to.openshift-*`. No local deploy step.