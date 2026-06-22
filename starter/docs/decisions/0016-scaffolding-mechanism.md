# 0016 — Scaffolding mechanism: template + schematics (Nx rejected)

- **Status:** Accepted
- **Date:** 2026-06-19 (schematics implemented 2026-06-22)

## Context

New apps must spin up fast and stay consistent over time, sharing the DS package
and inheriting this enforced architecture.

## Options

1. **degit / "Use this template"** — copy `starter/`. Instant; no drift protection
   after copy; no per-feature generation.
2. **Angular schematics + `ng add`** — Angular-idiomatic; `ng add` wires the DS +
   providers, `ng generate` does per-feature scaffolds; ships centrally.
3. **Nx generators / monorepo** — strongest enforcement, but requires migrating to
   Nx; overkill for a small team not already on it.
4. **Bespoke CLI** — converges on re-implementing schematics; high maintenance.

## Decision

**Layer the first two; reject Nx.** Use this `starter/` as the degit template for
app-init, then (Phase 2) a publishable Angular **schematics** library in the DS
package: `ng add @ids-group-ltd/ids-design-system` (wire DS + Sheriff + providers
+ paths + lefthook) and `ng g feature|store|data-access|page|ui`. Sheriff (ADR-0005)
provides Nx-level boundary enforcement without Nx.

## Consequences

- **+** Fast start (template) + drift-resistant recurring scaffolds (schematics) +
  enforced boundaries (Sheriff), no monorepo migration.
- **−** The schematics collection is additional code to build/maintain.
- **Implemented (2026-06-22):** collection in the DS repo's `schematics/`, compiled
  into `dist/ds/schematics` by `tools/build-schematics.mjs` (now part of `build:lib`,
  so it ships). Generators: `ng-add` (wire DS styles), `feature`, `store`,
  `data-access`, `page`, `ui` — all verified to emit eslint+Sheriff+prettier-clean
  code. **Note:** when the starter is extracted to its own repo, revisit whether the
  schematics live with the starter or stay in the DS package.
