# 0011 — Six typed environments + DI tokens

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

The app targets several deployment tiers and must surface per-environment config
(API URL, feature flags) in a typed, testable way.

## Decision

Six typed environments — `development` (default), `test`, `uat`, `staging`,
`prototype`, `production` — each conforming to the `Environment` interface
(`@app/common`). The build swaps `environment.ts` per configuration via
`angular.json` `fileReplacements`. Values reach DI through tokens
(`BASE_URL`, `ENVIRONMENT_NAME`) provided in `app.config.ts` — components inject
tokens, never import an environment file directly.

## Consequences

- **+** Typed, build-time-selected config; DI tokens keep components decoupled.
- **+** Adding a tier = one env file + one `fileReplacements`/`serve` entry.
- **−** Six files to keep in sync with the `Environment` shape (the type guards it).
