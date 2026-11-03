# DS auto-update feedback: bandsmith, 2026-11-03

## manifest:1.1.0#tree-row-div-treeitem (should-fix, gap)

ds-tree row change button -> div is only an informational entry, though the changelog names a consumer action (styles selecting the row as a button match nothing).

Evidence:
- CHANGELOG.md:174-176 (## 1.1.0)
- src/lib/components/tree/tree.component.html:2 at v1.0.3: <button class="row">
- src/lib/components/tree/tree.component.html:3 at v1.1.0: <div class="row">
- node -e "require('./migrations/1.1.0.json').items.some(i=>/tree/.test(i.id))" -> false

Proposal: Add a behavior item tree-row-div-treeitem, surface [style, typescript], detect ["ds-tree button","button.row","button[role=\"treeitem\"]"], action: select the row as [role="treeitem"] or .row; verify: no consumer selector or test targets a ds-tree row by button.

## manifest:1.0.2 (nit, gap)

Two Added entries of 1.0.2 have no informational line in the manifest.

Evidence:
- CHANGELOG.md:265-270 (ds-icon-button ariaHasPopup, controlRef)
- JSON.stringify(require('./migrations/1.0.2.json').informational).includes('ariaHasPopup') -> false

Proposal: Add informational entries for ds-icon-button ariaHasPopup and controlRef.

## manifest:1.0.2#date-picker-input-combobox-role (nit, ambiguity)

Locators getByRole('textbox') and role="textbox" live in spec/e2e TypeScript, but the item's surface is only template and it has no detect.

Evidence:
- migrations/1.0.2.json item date-picker-input-combobox-role: surface "template", searchHints include getByRole('textbox')

Proposal: surface ["template","typescript"], detect ["getByRole('textbox')","[role=\"textbox\"]"].

## agent:ds-usage-finder (should-fix, false-negative)

For dark-text-tertiary-overlay the finder missed rows of a child component rendered inside a ds-popover and a hover popover's rows; ds-recheck found 5 real misses. In the same run it missed one loading ds-button for button-loading-keeps-focus.

Evidence:
- desktop src/app/shared/diagrams/diagram-style-panel.component.scss .sp__note/.sp__from/.sp__chip--idle (component used only in ds-popover #styleMenu, mermaid-editor.component.html:265-269)
- desktop src/app/pages/calendar/calendar.page.scss .pop__eyebrow/.pop__hint (ds-popover #hoverPopover, calendar.page.html:440-511)
- desktop src/app/pages/artifacts/artifacts.page.html:42 ds-button [disabled]="pushing()" [loading]="pushing()" absent from the finder's 33 hits

Proposal: For overlay-scoped items, instruct the finder to follow child component selectors rendered inside each ds-popover / option template, and for ds-button items to grep every [loading] binding rather than sampling multi-line tags.

## skill:auto-update-package (nit, ambiguity)

Phase B step 9 prescribes one commit per version spanning edits and bump; a consumer whose rules require one change per commit splits it into a bump commit and edit commits, and the skill says nothing about verifying the intermediate tree.

Evidence:
- SKILL.md Phase B step 9
- git -C C:/Worktrees/bandsmith/ds-1-1-0-web log --oneline -3 -> 67cf67e2 style(overlays)..., 5c88dbe0 fix(teams-tab)..., 0fcdc199 chore(deps) v1.1.0

Proposal: Allow split commits per version (bump first, then each migration), each staged by pathspec, with the verify run on the final tree of the version.
