# Auto-update feedback: angular-app, 1.0.3 -> 1.1.0 (2026-11-03)

## agent:ds-usage-finder - false-negative, should-fix
**Summary:** For `1.1.0#dark-text-tertiary-overlay` the finder ruled out `var(--text-tertiary)` hits by selector name instead of tracing which template renders them, and missed a class used both inline and inside a `ds-popover`.
**Evidence:** `projects/app/src/.../item-header.component.ts:858` (`.step--done { color: var(--text-tertiary) }`) styles the `dependency` template rows rendered at `:297` inside `<ds-popover #dependencies>`; the finder listed item-header:859 as page-level. `ds-recheck` caught it as a real-miss; fixed with `.ladder--menu .step--done`.
**Proposal:** For overlay-scoped items, require the finder to trace each candidate class to every template that renders it (ng-template outlets included) before excluding it.
