# The picker family contract

`ds-select`, `ds-multi-select` and `ds-autocomplete` are one family: a trigger, a portaled panel, a
list of options. They drifted apart because each was extended on its own, and the drift is not
cosmetic — a form built with one of them cannot be marked required, a brand that retunes the selected
row repaints two of the three, and a label that clips loses its glyph in one place and not another.

This file is the rule set that stops that. It is a contract, not a style guide: an addition that
breaks a rule here is wrong even when it works.

## 1. A member means the same thing in all three

The family shares one vocabulary. If a name exists on more than one picker it must mean the same
thing on each. Where a picker cannot honour the meaning, it does not take the name.

Measured 2026-08-31, before this file existed: `label` was the FIELD LABEL on `ds-select` and the
COMPACT TRIGGER CAPTION on `ds-multi-select`. Same input, two meanings, one release apart.

## 2. Difference is a decision, not an accident

A member may be absent from a picker only for a reason that can be stated in one line. Two lists,
kept honest by the audit in §6:

**Absent by design.** `multiple`, `allowCreate`, `create`, `showChevron`, `valueOverflow` —
autocomplete only, because they describe typing and a settled single value. `maxVisibleChips` and
`dsChipTemplate` — the two that render chips, because `ds-select` holds one value and has none.
`selectAll` and `triggerDisplay` — the multi-value pickers, because a single value has nothing to
select all of and nothing to count.

**Absent by accident, and therefore a defect.** Anything else. When this file was written that was:
`size`, `required`, `optional`, `readOnly`, `name`, `clearable` and `label` — form-contract members
that existed on `ds-select` and nowhere else.

## 3. The panel is one implementation

Every picker's panel renders through `styles/_dropdown-overlay.scss` and carries the
`ds-dropdown-panel` class on its pane. A component may add what only it has — a filter row, a
select-all row, a create row — and may map its own public tokens onto the shared panel. It may not
re-declare the shared geometry, the option row, or the `--ds-option-*` hooks.

Why it is a rule and not a preference: `ds-autocomplete` replaced the pane's default panel class with
a single argument and lost the shared partial silently. The result shipped for three releases with
`padding: 0` against the other two pickers' `--space-1`, square rows against their radius, and four
public theming hooks that did nothing.

## 4. Text the library invents is a slot, not a literal

Any string the component renders that is not passed in must be replaceable. Today that means a
projected template; when a `DS_INTL` provider lands it will mean both. A hardcoded literal with no
slot beside it is a defect, because a consumer has no way to change it at all.

The projection contract is fixed: **a template fills a region, it never replaces the element that
carries semantics.** `role="option"`, `aria-selected`, `aria-disabled`, the active-row class, the
checkbox, the check glyph and a chip's close button are the library's and are never projected.

## 5. One way to clip a line

Single-line text clips through `styles/_text-clip.scss`'s `single-line-ellipsis`. Not
`overflow: hidden` + `text-overflow` + `white-space` written out: the mixin uses `overflow: clip`
with an `overflow-clip-margin` because where the line box is tighter than the glyph box — which
`--line-height-flat` and `-tight` both are for Mulish — `hidden` eats the glyph and shaves every
label, not only the ones with descenders.

## 6. The audit that keeps this true

`tools/picker-parity.mjs` lists every input, output, model and slot across the three and prints the
ones that are not shared. Run it after touching any of them: a new row is either a line added to the
"absent by design" list in §2, or a defect to fix.

```bash
npm run picker-parity       # which members are not shared
npm run picker-capabilities # which behaviours are missing, and from whom
```

The second one probes for behaviour rather than API surface — value comparison, Home/End, a loading
state, a filter predicate, virtualisation, live announcements. It is how the sixteen proposals in
the decision deck were found, and it is the cheap way to check that a new picker does not arrive
missing the same things.
