# Auto-update feedback: mm-ecm-platform, 1.0.1 -> 1.0.3, plugin 1.19.0, 2026-10-28

## agent:ds-migration-applier - should-fix gap

A conditional behavior item (action "None, unless ...") was closed as no-op on 8 hits without opening any of the 5 files, so the unless-condition was never checked.

Evidence:
- Applier report: "I did not open any of the five files and made no edits." One tool call for 5 files.
- migrations/1.0.2.json#button-loading-spinner-in-icon-slot action

Proposal: Applier contract: a no-op on an item whose action names a condition ("None, unless") must cite, per hit, what in the file shows the condition does not hold; a no-op without having read the hit context is needsReview.

## manifest:1.0.2 - should-fix false-negative

Six rendering changes of the 1.0.2 changelog have no item and no informational { text, verify } line, so the run has nothing to send to a visual check for them.

Evidence:
- git show v1.0.2:CHANGELOG.md, block ## 1.0.2: Changed: resize handle shown at rest; empty date-picker mask separators muted; time-picker wheel speed. Fixed: first/last ds-menu-item rounds its corners; chart value-axis gutter sizing; keyboard-focused resize handle shows the focus ring.
- git show v1.0.2:migrations/1.0.2.json: informational holds 4 lines: dsPopoverTrigger, time-picker Now, looping column is-selected, time-picker sizer spans. None of the six above.

Proposal: Add an informational { text, verify } line for each changelog entry that changes rendering (AUTHORING: "fill verify whenever the line names a layout mechanism"), and a check that every ### Changed / ### Fixed bullet maps to an item or an informational line.

## skill:auto-update-package - nit gap

The skill does not say the orchestrator must not pass consumer-intent hints from outside the run into applier or recheck prompts; doing so makes a conditional item's verdict untestable.

Evidence:
- First applier wave of this run carried a product-owner decision in the prompt; all three returned no-op citing it. Re-run without it.

Proposal: Phase B step 3: the applier prompt carries the item verbatim, the hits and the trees; any judgement about the consumer comes from the consumer code alone.

## skill:auto-update-package - nit gap

Phase B step 5 dispatches ds-visual-check with "the app's base URL" but says nothing for a consumer whose screens need a running backend and a login; the run had no URL to give.

Evidence:
- skills/auto-update-package/SKILL.md, Phase B step 5, "Visual checks"
- This consumer serves screens only with its backend up and a signed-in session; no base URL existed for the run.

Proposal: Name the fallback: ask the user for a served URL, or record every rendering change as not-verified with that reason.
