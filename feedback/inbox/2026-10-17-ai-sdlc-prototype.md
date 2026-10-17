# DS auto-update feedback - ai-sdlc-prototype, 0.12.1 -> 0.15.2, plugin 1.14.1, 2026-10-17

## tool:apply-mechanical - should-fix false-negative

0.13.4 table-sort-dir-spelled-out reported applied with an empty left list while a root-entry `import type { SortDir }` and `computed<SortDir>` stayed unrenamed

**Evidence**
- `node scripts/apply-mechanical.mjs projects migrations/0.13.4.json` -> 0.13.4#table-sort-dir-spelled-out: applied - 1 edit(s): app/src/app/features/items/pages/item-list/item-list.page.html (1)
- projects/app/src/app/shared/utils/use-list-url.ts:6 `  SortDir,` inside `import type { SortChangeEvent, SortDir } from '@ids-group-ltd/ids-design-system'`
- projects/app/src/app/shared/utils/use-list-url.ts:106 `computed<SortDir>`

**Proposal:** When an item's action names an exported type rename (SortDir -> SortDirection), either rewrite type imports from the package root or list every occurrence it did not rewrite under `left`, so `applied` with no left really means done.

## manifest:0.15.1#line-chart-rescale-on-hide-bare - should-fix defect

deleteList row `find` is a string ("rescaleOnHide") where every other row carries an array

**Evidence**
- `node -e "console.log(typeof require('./migrations/0.15.1.json').deleteList.find(i=>i.id==='line-chart-rescale-on-hide-bare').find)"` -> string

**Proposal:** Make it ["rescaleOnHide"] and add a schema check that `find` is an array; a consumer iterating it greps single characters.

## skill:auto-update-package - should-fix cost

a 19-version chain with 337 items against a consumer with 112 source files would need ~19 planners + ~90 finder and ~90 recheck dispatches; 9 items had any hit

**Evidence**
- `node apply-mechanical.mjs projects <19 manifests> --dry-run` -> { untouched: 144, applied: 2 }
- `node lint-step.mjs --from 0.12.1 --to 0.15.2` -> 1 hit (0.13.4#table-sort-dir-spelled-out)

**Proposal:** Add a cheap whole-chain pre-pass (dry-run script + lint over the full range + one finder per version range) and dispatch per-item planners/finders/rechecks only for items with rawMatches > 0; the run here used 6 range finders and rechecked only the 6 applied items.

## manifest:0.14.0#switch-confirm-wrapper - nit false-positive

bare `preventDefault()` find shape hits ordinary form-submit handlers

**Evidence**
- projects/app/src/app/features/auth/pages/login/login.page.ts:37 event.preventDefault() in onSubmit
- projects/app/src/app/features/items/pages/item-form/item-form.page.ts:91 event.preventDefault() in save

**Proposal:** Drop the bare shape or pair it with `emit(!this.checked())` / a ds-switch host.

## tool:drift-scan - nit false-positive

drift-scan reports gone class `html` on a SCSS comment line that names the <html> element

**Evidence**
- `node scripts/drift-scan.mjs ds-src/v0.12.1 ds-src/v0.15.2 projects` -> hits [{file: projects/app/src/styles.scss, line: 7, name: html}]
- projects/app/src/styles.scss:7 `// The brand layer (2-5) activates via <html data-brand="app"> (see index.html).`

**Proposal:** Skip comment lines and match class names only in a `.name` selector position.

