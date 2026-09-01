# The hand-maintained surface of the `@angular/elements` route

Everything in `.design-sync/elements/` is generated: `gen.mjs` reads the AST and
emits both the custom-element registrations and the typed React wrappers, so a
new component, a renamed input or a changed union appears in the bundle on the
next build. **This file is the list of things that generation cannot cover**, and
it exists because that list grows silently — the attribute-directive count went
from 6 to 15 in a single month with nobody noticing.

`manual-surface.json` is the machine-readable half; `check-manual-surface.mjs`
recomputes both lists from `src/lib` and fails when they diverge from what is
recorded here. After triaging a new entry, add it below and re-record with
`--bless`. The gate also fails on an entry this file never mentions: an
unexplained entry is an excuse, not a record.

## 1. Projection inside a control-flow block

`@angular/elements` hands the host element's light DOM to Angular as
`projectableNodes` when the view is created in `connectedCallback`. If the
`<ng-content>` that would receive them does not exist at that moment — because it
sits inside an `@if` whose condition is false — the nodes are consumed and never
placed. Opening the block afterwards renders an empty shell.

**What makes an entry broken is not the pattern, it is whether the gate is false
at upgrade time.** Sixteen templates match the pattern; three of them are gated on
`rendered()`, which is false until the overlay opens, and those three are the real
blocker. The rest gate on an input whose falsy default puts `<ng-content>` in the
live branch, so their children survive the upgrade.

### Broken — gate is false at upgrade, projection is the only content path

| component | gate | status |
|---|---|---|
| `modal` | `rendered()` | **CONFIRMED BROKEN.** Measured 2026-09-01 in a real Chrome tab against the elements demo: closed `<ds-modal>` has `childNodes.length === 1` and `innerHTML === '<!---->'`; opening it renders 966 chars of Angular DOM with `textContent === ''` — a blank card |
| `drawer` | `rendered()` | Same construction as `modal`, not separately measured |
| `bottom-sheet` | `rendered()` | Same construction as `modal`, not separately measured |

**Two fixes were tried and neither worked** (2026-09-01, both reverted):

- **Hoisting projection into a top-level `<ng-template>` + `ngTemplateOutlet`**,
  the pattern `popover.component.html` uses deliberately and documents in its own
  comment. Applied to all five of modal's slots, `NgTemplateOutlet` added to
  `imports`, full chain rebuilt. Light DOM retention improved (`childCount` 1 → 6)
  but those are the template anchors — the children were still consumed and the
  opened card was still empty. The template is a blueprint: an `<ng-content>`
  inside one is not instantiated until the outlet stamps it, which is still inside
  the `@if`.
- **`staticPreview`**, named in `elements/README.md` as the interim way in. The
  demo's `<ds-modal staticPreview>` renders `0×0` with no children — measured on
  pristine sources, so this is not a side effect of the first attempt.

**And it is not input timing.** `runtime.tsx` falls back to effect-only property
assignment below React 19, so the hypothesis was that inputs land after
`connectedCallback` and React 19 (which assigns properties while the element is
detached) would fix it. Tested with react/react-dom 19.2.8 — `"19.2.8"` verified
present in the built demo bundle — and the result is identical. `.ds-sync` was
restored to the pinned 18.3.1.

**Root cause is therefore still open.** Do not write an override for these three
before it is found: the fix that looks obvious has already failed twice, and an
override built on a guess is a second implementation with none of the parity
tooling that guards Misha's port.

### Triaged benign — `<ng-content>` sits in the branch that is live at upgrade

Each of these gates on an input that is falsy by default, with the projection in
the `@else`. `badge` is the worked example: `@if (count() !== null) { … } @else {
<ng-content> }` — a `<ds-badge>` upgrades with no `count`, so the `@else` branch is
live and the children are claimed correctly.

`auth-layout` · `badge` · `checkbox` · `dropzone` · `filter-bar` · `menu-item` ·
`radio` · `sidenav` · `sidenav-group` · `sidenav-item` · `stat` · `switch` ·
`table`

`checkbox`, `radio` and `switch` are the `[label]`-input family that
`dsProjectionDropped` already warns about at runtime — passing children there
renders nothing in plain Angular too, so the elements route inherits a documented
behaviour rather than a new defect.

**Benign here means "not broken by the upgrade", not "verified in the browser".**
Only `modal` has been driven in a real tab. Re-triage any entry whose gate changes
to something true-by-default.

## 2. Attribute directives — no element to register

A directive has no tag, so `@angular/elements` has nothing to define and it is
absent from the generated surface entirely. Fifteen of them:

`[dsBrandName]` · `[dsCellTemplate]` · `[dsChipTemplate]` · `[dsCreateTemplate]` ·
`[dsEmptyTemplate]` · `[dsFieldClickFocus]` · `[dsGroupLabelTemplate]` ·
`[dsOptionTemplate]` · `[dsPanelFooterTemplate]` · `[dsPanelHeaderTemplate]` ·
`[dsPickerTrigger]` · `[dsProjectionDropped]` · `[dsRailTrigger]` ·
`[dsReserveMessages]` · `[dsTooltip]`

Most are template-slot markers for the picker family (`dsOptionTemplate`,
`dsPanelHeaderTemplate`, …) and are meaningless without an Angular template
anyway, so a design tool has no use for them. **`[dsTooltip]` is the one that
hurts** — it is a real feature a design would want, and the React port has it
because a port can reimplement a directive as a component. Covering it on this
route needs a host component wrapping the directive.

`[dsProjectionDropped]` is dev-only and never ships a node in production.

## 3. Imperative APIs that do not cross the boundary

Angular's element strategy publishes inputs and outputs, not methods. So
`popover.toggle(trigger)` — how the DS opens a popover — is unreachable from a
React wrapper, and the same holds for menu open/close. Trigger-driven overlays
need an input-based open state before a design can use them.

## Keeping this honest

Run `bun run check:manual-surface` (wired into `infrastructure/scripts/ci-pr.sh`
next to the parity gate). It fails when a new component starts projecting inside
a control-flow block, when a new attribute directive appears, when a recorded
entry disappears, or when a recorded component is not mentioned in this file.
Triage first, edit this file, then `--bless`.
