# 0002 — Multi-project workspace (`app` + `common`)

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

Cross-cutting infrastructure (data layer, auth, interceptors, guards,
notification/error abstractions) should be shareable and clearly separated from
a single app's feature code — and ready for a second app without a rewrite.

## Options

1. **Single app**, layers as folders (`core/shared/features`) only.
2. **Multi-project workspace** — `projects/app` (application) + `projects/common`
   (shared library), with a typed boundary between them.

## Decision

Multi-project Angular workspace: `projects/app` + `projects/common`
(+ `projects/common/config` for environments). The app imports shared code via
`@app/common` / `@app/common/config`; `common` never imports the app
(enforced — see ADR-0005). Mirrors the proven PinkMoon.Frontend layout.

## Consequences

- **+** Clear, enforceable seam; a second app drops in beside the first.
- **+** Infra is reusable and independently reasoned about.
- **−** Slightly more setup than a single app (tsconfig paths, project config).
- See ADR-0012 for why `common` is source-only rather than an ng-packagr library.
