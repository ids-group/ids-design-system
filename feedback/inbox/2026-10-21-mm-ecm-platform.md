# DS auto-update feedback: mm-ecm-platform 0.15.2 -> 0.15.3 (2026-10-21)

## changelog:0.15.3 (gap, should-fix)

A patch release flips ds-table's default layout back from 'fixed' to 'auto': a consumer that tuned columns for 0.15.1 (kind, minWidth) gets every table's widths changed with no build signal, and the changelog offers the pin only as an aside while 'auto' itself stays deprecated, so the consumer must choose twice.

Evidence: th widths at 1680px, ECM on 0.15.2 vs 0.15.3 with no layout set, 8 tables on 6 screens -> 8 of 8 tables changed, e.g. audit Details 262 -> 509 px, policyholders Journey Step 190 -> 330 px; same, ECM on 0.14.8 vs 0.15.3 with no layout set -> 5 of 8 tables equal widths; the other 3 differ by app changes since; v0.15.2 table.component.ts:378 vs v0.15.3 table.component.ts:393

Proposal: Say in the 0.15.3 block which consumers see a change (those who upgraded through 0.15.1 and set no layout) and state the planned end state of 'auto' (removal version or un-deprecation), so a consumer pins once.

## manifest:0.15.3#table-layout-default-auto (gap, should-fix)

The item's action says to delete layout: 'auto' / layout="auto", but deleteList is empty.

Evidence: migrations/0.15.3.json items[table-layout-default-auto].action; `deleteList.length` -> 0

Proposal: Add a deleteList row with find ["layout=\"auto\"", "layout: 'auto'"] and the paired CHANGELOG 'What you can now DELETE' line.

## manifest:0.15.3 (gap, nit)

Four changelog entries are missing from informational: printHeading/printHeadingNote, highlightActive, pinned mark no longer brightened, stylesheet kept for the life of the app.

Evidence: `node -e "JSON.stringify(require('./migrations/0.15.3.json').informational).includes('printHeading')"` -> false (same for highlightActive, pinned, life of the app)

Proposal: Append four bare-string informational entries.

## manifest:0.15.3 (gap, nit)

Informational entry on the focus ring says a border-radius: 0 added to undo the rounding can go, with no deleteList row.

Evidence: migrations/0.15.3.json informational[5]

Proposal: Add a deleteList row scoped to :focus/:focus-visible rules, with the paired CHANGELOG table line.

## agent:ds-migration-planner (ambiguity, nit)

The manifest carries an evidence field on an item and an informational object that the planner schema does not list.

Evidence: migrations/0.15.3.json items[4].evidence, informational[0].evidence

Proposal: Document evidence as an optional pass-through field.

## skill:auto-update-package (gap, nit)

The lint step was skipped: the consumer has no eslint/stylelint, and the tools-dir download needs a separate approval the run did not ask for, for a chain whose items were all behavior kinds.

Evidence: `ls src/frontend/node_modules | grep -E "^(eslint|stylelint)$"` -> (empty)

Proposal: Say the lint step may be skipped without asking when every chain item is behavior and the lint data holds no entry for the range.
