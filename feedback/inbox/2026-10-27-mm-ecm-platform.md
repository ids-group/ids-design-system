# Auto-update feedback: mm-ecm-platform, DS 1.0.1 -> 1.0.2 (2026-10-27)

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: ds-table resize handle visible at rest (a line in --border-default on every handle)

Evidence:
- CHANGELOG.md:23 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)
- `dr verify DS-1.0.2 (mm-ecm-platform, scenario .dr/scenarios/ds102-update.mjs)` -> ECM Policyholders, dr verify DS-1.0.2: handle ::after background rgba(0, 0, 0, 0) on 1.0.1, rgb(229, 231, 235) on 1.0.2

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: ds-date-picker mask separators muted while the part before them is empty

Evidence:
- CHANGELOG.md:27 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)
- `dr verify DS-1.0.2 (mm-ecm-platform, scenario .dr/scenarios/ds102-update.mjs)` -> ECM carrier Audit history, dr verify DS-1.0.2: empty mask slash colour rgb(8, 11, 107) on 1.0.1, rgb(103, 106, 143) like the letters on 1.0.2

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: ds-time-picker non-looping column scrolls at the browser wheel speed (about three rows per notch instead of one)

Evidence:
- CHANGELOG.md:37 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: first and last ds-menu-item round their corners with the menu, focus ring drawn inside the row

Evidence:
- CHANGELOG.md:46 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)
- `dr verify DS-1.0.2 (mm-ecm-platform, scenario .dr/scenarios/ds102-update.mjs)` -> ECM Data Ingest row menu, dr verify DS-1.0.2: gap between ds-menu-item rows 2px on 1.0.1, 0px on 1.0.2 (gap part is covered by menu-gap-default-zero; the corner rounding is not)

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: ds-chart, ds-column-chart, ds-line-chart and ds-waterfall-chart size the value-axis gutter differently (a width change)

Evidence:
- CHANGELOG.md:68 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: column resize separators expose aria-valuenow, aria-valuemin and aria-valuemax at rest (a test counting or reading them sees new values)

Evidence:
- CHANGELOG.md:74 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## manifest:1.0.2 - should-fix (gap)

migrations/1.0.2.json has no item or informational entry for: keyboard-focused ds-table resize handle shows the standard focus ring instead of a 2px line

Evidence:
- CHANGELOG.md:78 (tag v1.0.2)
- `node -e "console.log(JSON.stringify(require('./migrations/1.0.2.json')))" | grep -c <key phrase>` -> 0 - the manifest names only button-loading, date-picker combobox role, menu gap, and four informational lines (dsPopoverTrigger, time-picker Now, looped selected copy, time-picker sizer spans)
- `dr verify DS-1.0.2 (mm-ecm-platform, scenario .dr/scenarios/ds102-update.mjs)` -> ECM Policyholders, dr verify DS-1.0.2: focused separator outline-style none on 1.0.1, solid on 1.0.2

Proposal: Add an informational { text, verify } entry for this rendering or behaviour change, so the consumer run routes it to a visual check instead of never seeing it.

## tool:check-manifest-coverage - should-fix (false-negative)

check-manifest-coverage passed v1.0.1..v1.0.2 while seven Changed/Fixed CHANGELOG entries that change rendering or behaviour have no manifest entry

Evidence:
- `npm run lint:all on DS dev before the 1.0.2 cut` -> check-manifest-coverage: Unreleased - 13 entr(ies) outside Added, every one that names public surface is covered by migrations/unreleased.json
- CHANGELOG.md:23, 27, 37, 46, 68, 74, 78 (tag v1.0.2)

Proposal: Count an entry as covered only when an item or informational entry names the same change (its component plus its subject), not when the component name appears anywhere in the manifest.

## agent:ds-recheck - should-fix (defect)

ds-recheck capped its own grep at head_limit 80 and reported that the tail of the ds-button [loading] list was not read, yet returned migrated:true at medium confidence

Evidence:
-  -> button-loading-spinner-in-icon-slot note: "The grep was bounded by head_limit 80, so the tail of the list was not read in full."

Proposal: Forbid a result cap on the whole-root grep in the agent definition, or require the agent to page through the rest before it returns a verdict.
