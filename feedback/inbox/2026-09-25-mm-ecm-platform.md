# Auto-update feedback: mm-ecm-platform, 0.14.0 to 0.14.2

Plugin 1.9.0, 2026-09-25. 3 entries: 1 open, 2 done. Entries: `2026-09-25-mm-ecm-platform.json`.

## tool:check-manifest-truth

**should-fix, false-positive, open** - A bare input name as `old` is reported declared at neither
tag.

- `node tools/check-manifest-truth.mjs 0.14.2` prints `pinOnClick` "declared at neither tag" for
  `chart-pin-on-click-default-true` and `chart-pin-inputs-widened`, and `staggerMs` for
  `chart-stagger-default-on`.
- Both are declared at both tags: `v0.14.1:src/lib/components/chart/line-series.component.ts:115`
  and `:141`, `v0.14.2:src/lib/components/chart/line-series.component.ts:129` and `:166`.
- Cause: `claims()` turns a bare camelCase value into a `symbol` claim
  (`tools/check-manifest-truth.mjs:420`), and a symbol resolves only against exported names
  (`:481`). The member regex (`:238`) already reads `input<T>(...)` and a wrapped initializer.

Proposal: before `declaredAtNeither` reports a bare camelCase `old`, look it up among the members
of every element at each tag and resolve it when one declares it.

## skill:auto-update-package

**should-fix, gap, done** - A rendering change filed informational can regress a screen while the
chain is green.

- `v0.12.2:src/lib/components/table/table.component.scss:396` puts `display: grid` on the
  `.expand-panel-cell` `<td>`; `v0.12.1:...table.component.scss:376` has no such rule. A cell that
  is not `table-cell` drops its colspan.
- The consumer measured the panel 24px wide in a 1559px row
  (`.claude/local/todo/ds-update-0.13.3.md:1355` in the consumer).
- `migrations/0.12.2.json:260` carried the right `verify`; nothing in the workflow performed it.

Addressed in plugin 1.10.0 by `ds-visual-check`.

## tool:class-surface-diff

**should-fix, defect, done** - A class field whose initializer wraps to the next line is invisible.

- `src/lib/components/tabs/tabs.component.ts:123` is `private readonly tablist =` with the
  initializer on the next line; `FIELD` required a space after the `=` and never matched it.

Fixed on dev by `fix/class-surface-wrapped-field` (merge 2819f48b): the pattern ends on `=\s`
(`tools/class-surface-diff.mjs:65`).
