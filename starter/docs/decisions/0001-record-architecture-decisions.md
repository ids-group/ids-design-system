# 0001 — Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

This starter captures a proven front-end architecture so new apps reproduce it
consistently. Code shows _how_ it's built; it doesn't explain _why_. Without the
why, future contributors silently undo deliberate choices.

## Options

1. **No records** — rely on code + tribal knowledge.
2. **One big ARCHITECTURE.md** — easy to start, hard to keep coherent as it grows.
3. **MADR ADRs** — one short markdown file per decision, in `docs/decisions/`.

## Decision

Use lightweight **MADR** ADRs, one per decision, indexed in `docs/decisions/README.md`.
A complementary prose overview lives in `docs/architecture/README.md`.

## Consequences

- **+** Each decision is small, dated, and reviewable; supers:eding is explicit.
- **+** Plain markdown in git — no tooling required (adr-tools / log4brains optional).
- **−** Discipline needed to add an ADR when a real decision is made.
