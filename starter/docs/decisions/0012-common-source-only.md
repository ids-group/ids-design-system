# 0012 — `common` is source-only (not an ng-packagr library)

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

PinkMoon's `common` is a buildable ng-packagr library. Here, the starter lives
**inside the IDS design-system repo** (whose own `ds` library is built at the repo
root). When `common` had its own `ng-package.json`, the repo's `ng build ds`
ng-packagr step scanned `starter/` and failed on the nested package.

## Options

1. Keep `common` a buildable ng-packagr library (breaks the host repo's DS build).
2. **Source-only, path-mapped library** — no `ng-package.json`; the app consumes
   `@app/common` via tsconfig `paths` (source), not a built artifact.
3. Restructure the host DS into `projects/ds/` (invasive change to the core package).

## Decision

`common` is **source-only**: tsconfig `paths` map `@app/common` /
`@app/common/config` to its `public-api.ts`; no library build target. The app
compiles `common` from source.

## Consequences

- **+** Host repo's `ds` build is untouched; standard pattern for app-internal
  shared code (consumers never publish `common`).
- **+** No separate build/watch for `common`.
- **−** `common` isn't independently publishable (not a goal here). A standalone
  starter repo could promote it to a real library if ever needed.
