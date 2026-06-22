# 0010 — Forms: signal-based (DS form controls lack CVA)

- **Status:** Accepted
- **Date:** 2026-06-22

## Context

The intended approach was typed Angular **reactive forms** with a
DTO / FormModel / ListItem split. While building the demo form, we found that IDS
`ds-input` / `ds-select` expose `value = model<T>()` but do **not** implement
`ControlValueAccessor` — so `formControlName` / `[formControl]` / `[(ngModel)]`
don't bind to them.

## Options

1. Wait for / add CVA to the DS form controls, then use reactive forms.
2. **Signal-based forms** — bind `[(value)]` to component signals; keep the
   DTO / FormModel / ListItem split and mapper functions.

## Decision

**Signal-based forms** for now (the only approach that works with the DS as-is).
The DTO/FormModel/ListItem separation and `hasUnsavedChanges()` +
`unsavedChangesGuard` contract are preserved. The demo `item-form.page.ts` is the
reference.

## Consequences

- **+** Works today with the DS; integrates cleanly with signals/OnPush.
- **−** No reactive-forms validators/`FormGroup` ergonomics.
- **Follow-up (DS backlog):** add `ControlValueAccessor` to DS form controls so
  reactive forms bind; revisit this ADR if/when that lands.
