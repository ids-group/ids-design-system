# DS auto-update feedback - mm-ecm-platform, 0.15.3 -> 1.0.0 (2026-10-22)

## manifest:1.0.0#field-errors-shown-after-submit - false-negative, should-fix
The item's locators (`old` ds-input[errors], detect, searchHints) only find fields bound to a form model.
`appliesWhen` also names ds-date-picker's unparseable-date error, which 1.0.0 hides for a picker bound by
`[value]`/`(valueChange)` with no `[dsSubmitted]` host. In mm-ecm-platform all 13 `<ds-date-picker>` are
value-bound filters; no locator hits them, yet each lost its error.
Evidence: v1.0.0 src/lib/components/date-picker/date-picker.component.ts:287-310 (parseErrors as ownErrors);
v0.15.3 same file :286-302 (localError passed as `error`, shown at once); field-errors.ts resolveFieldMessage
`revealed` gate. Live: Playwright on /carrier/:id/audit-history, typed 99/99/9999 + blur -> no message,
aria-invalid null without the flag; "Enter a valid date (MM/DD/YYYY)", aria-invalid=true with [dsSubmitted]="true".
Proposal: add `<ds-date-picker` to `detect` (or a separate behavior item for value-bound date pickers).

## skill:auto-update-package - gap, nit
The skill dispatches named agents (ds-migration-planner, ds-usage-finder, ds-recheck, ...) that were not
registered in this session; the run did their work inline. Proposal: state the fallback when the agents are absent.
