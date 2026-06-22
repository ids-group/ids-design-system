# 0013 — Tooling: eslint/prettier/stylelint, strict tsconfig, CI, bun

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

A best-practices starter needs strict, consistent, automated quality gates from
day one.

## Decision

- **TypeScript:** max-strict — `strict` + `noUnusedLocals/Parameters`,
  `noImplicitReturns/Override`, and all Angular template-strict flags + `strictStandalone`.
- **Lint/format:** ESLint 9 flat config (typescript-eslint + angular-eslint +
  unicorn + Sheriff) · Prettier · Stylelint (standard-scss). `angular.json`
  schematic defaults: `standalone`, `OnPush`, `scss`.
- **CI:** `infrastructure/scripts/ci-validate.sh` (prettier + stylelint +
  eslint/Sheriff + build) wired by `bitbucket-pipelines.yml`; runs identically
  locally and in CI.
- **Git hooks:** lefthook pre-commit (prettier/stylelint/eslint on staged files).
- **Package manager:** bun primary (`bun.lock`); npm-compatible.

## Consequences

- **+** Drift is caught at commit + CI; output is deterministic.
- **−** Strictness can be friction early; the payoff is consistency at scale.
- **Note (Windows local dev):** `bun install` materializes the `file:../dist/ds`
  DS dependency; on Windows it must be **copied** into `node_modules` (a junction
  makes the DS resolve the repo's `@angular/core`, causing an InputSignal "brand"
  mismatch). On Linux/CI the `file:` install copies correctly.
