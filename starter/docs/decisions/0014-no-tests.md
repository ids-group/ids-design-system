# 0014 — No automated tests in the starter (deferred)

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

A test harness (runner, config, example specs) is valuable but adds setup and
opinions (Vitest vs Jest, Playwright, etc.). For the initial starter it was
explicitly scoped out.

## Decision

Ship **no test harness** initially. The CLI's spec scaffolding was removed; the
quality gate is build + lint (incl. Sheriff). Adding tests is a deliberate later
step.

## Consequences

- **+** Smaller, opinion-light starter; no test framework lock-in baked in.
- **−** No test examples to copy yet; teams add their own runner.
- **Follow-up:** choose a stack (Vitest is the Angular-forward default; Karma is
  deprecated) and add example specs + a `test` CI step.
