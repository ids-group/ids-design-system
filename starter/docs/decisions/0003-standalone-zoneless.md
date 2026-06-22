# 0003 — Standalone-only, `app.config.ts` composition root, zoneless

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

Angular (v17+) defaults to standalone components; NgModules are legacy. Zoneless
change detection (stable in v20+) removes zone.js overhead and is the forward path.

## Options

1. NgModule-based bootstrap (`AppModule`).
2. **Standalone** components + `ApplicationConfig` (`app.config.ts`) bootstrap.
3. Zone-based vs **zoneless** change detection.

## Decision

Standalone-only — no NgModules anywhere. `app.config.ts` is the single
composition root (providers, router, interceptors, app initializers). Zoneless
change detection via `provideZonelessChangeDetection()`; all components use
`OnPush` (enforced by the `angular.json` schematic default).

## Consequences

- **+** Modern, less boilerplate, smaller runtime; matches CLI generators.
- **+** Generators (`ng g`) produce standalone + OnPush by default.
- **−** Every component must use signals / explicit change detection (no zone
  auto-magic) — already the idiom here.
