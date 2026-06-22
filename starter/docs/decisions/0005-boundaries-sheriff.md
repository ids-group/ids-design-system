# 0005 — Module boundaries via Sheriff (not Nx)

- **Status:** Accepted
- **Date:** 2026-06-22

## Context

The `common ↛ app` boundary (and, later, finer layer rules) must be enforced
mechanically, not by convention. We are not on an Nx monorepo and don't want to
migrate to one for a small team.

## Options

1. **tsconfig paths + eslint `no-restricted-imports`** — weak, easy to bypass.
2. **Nx** + `@nx/enforce-module-boundaries` — strongest, but requires migrating
   to an Nx workspace (overkill for team size).
3. **Sheriff** (`@softarc/eslint-plugin-sheriff`) — Nx-style tag/dependency rules
   on a plain Angular CLI workspace.

## Decision

**Sheriff**. `sheriff.config.ts` tags modules and declares `depRules`; the ESLint
plugin enforces them. Key setting: `barrelFileName: 'public-api.ts'` — Angular
libs use `public-api.ts` (not `index.ts`) as their public surface, so this makes
`common` a single module and treats nested `index.ts` files as ordinary tidy
imports, not module walls. Rule: `common: [sameTag]` forbids `common → app`
(verified it fires). The app is the unrestricted "root" project.

## Consequences

- **+** Real, lint-time boundary without an Nx migration; runs in CI.
- **−** Sheriff's module model is barrel-driven; the `barrelFileName` setting was
  essential to avoid per-folder fragmentation.
- **Follow-up:** finer intra-app layering (core/shared/features/layouts) is not
  yet enforced — the demo's entity store lives in `core/store` yet imports feature
  models (a core→feature edge) to resolve first.
