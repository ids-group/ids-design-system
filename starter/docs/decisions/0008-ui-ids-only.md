# 0008 — UI = IDS design system only (PrimeNG dropped)

- **Status:** Accepted
- **Date:** 2026-06-19

## Context

PinkMoon.Frontend (the architecture source) leans on PrimeNG. This starter is the
IDS design-system exemplar — it should dogfood `@ids-group-ltd/ids-design-system`,
not a third-party kit.

## Options

1. Keep PrimeNG (matches the source app).
2. **IDS DS only** — drop PrimeNG; use `ds-*` components + DS tokens/themes.
3. IDS DS + PrimeNG opt-in for gaps.

## Decision

**IDS DS only.** Shell (`ds-topbar`/`ds-sidenav`), forms (`ds-input`/`ds-button`),
display (`ds-card`), toasts (`ds-toast`). Styles via one import:
`@use '@ids-group-ltd/ids-design-system/styles/ds'`.

## Consequences

- **+** Pure IDS reference; brand theming flows through DS tokens.
- **− Gaps surfaced (logged in the DS backlog):** no advanced data-grid (the demo
  uses a lean table); form controls lack `ControlValueAccessor` (see ADR-0010);
  no confirm-dialog (see ADR-0007). These are DS feature requests, not starter bugs.
