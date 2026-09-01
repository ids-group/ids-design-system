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

**The rule, established by measurement 2026-09-01 and not by reading:** the branch
holding `<ng-content>` must be the one that is LIVE when the view is created. An
embedded view is fine — what matters is whether it is instantiated at creation.
Probed six components in a real browser with `document.createElement` + `innerHTML`
(no React involved at all):

| component | where `<ng-content>` sits | children survive |
|---|---|---|
| `card` | root | ✅ |
| `alert` | root | ✅ |
| `badge` | `@else` of `@if (count() !== null)` — live by default | ✅ |
| `checkbox` | `@else` of `@if (label())` — live by default | ✅ |
| `switch` | `@else` of `@if (label())` — live by default | ✅ |
| `stat` | `@if (delta())` — **false** by default | ❌ |

So sixteen templates match the pattern and four are broken, not three.

### Broken — gate is false at upgrade, projection is the only content path

| component | gate | status |
|---|---|---|
| `modal` | `rendered()` | **CONFIRMED BROKEN.** Measured 2026-09-01 in a real Chrome tab against the elements demo: closed `<ds-modal>` has `childNodes.length === 1` and `innerHTML === '<!---->'`; opening it renders 966 chars of Angular DOM with `textContent === ''` — a blank card |
| `drawer` | `rendered()` | Same construction as `modal`, not separately measured |
| `bottom-sheet` | `rendered()` | Same construction as `modal`, not separately measured |
| `stat` | `delta()` | **CONFIRMED BROKEN** by the probe above. Was listed as benign in this file until 2026-09-01 — that classification was wrong |

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

**What the root-cause session established (2026-09-01, all measured in a real tab):**

- **React is not involved.** The same failure reproduces with plain
  `document.createElement('ds-modal')` + `innerHTML` + `appendChild`, no React on the
  path at all. Every earlier theory about wrapper timing is dead.
- **`rendered` is a `signal(false)` set inside an `effect`** (`modal.component.ts:69`),
  and effects run after the first change detection — so the gate is false when the view
  is created, always.
- **`staticPreview` is not registered on the custom element.** Read off the live
  registration: `customElements.get('ds-modal').prototype` carries `open`, `size`,
  `status`, `title`, `subtitle`, `dividers`, `closeOnBackdrop`, `persistent` — and no
  `staticPreview`. It is a host-directive input, and `@angular/elements` builds its
  property list from the component's own inputs. `elements/README.md` claims the
  generator picks these up; it does so for the React wrapper only, so setting
  `staticPreview` on an element has always been a no-op expando. **This is a generator
  gap and is fixable in `gen.mjs`/`main.ts` without touching any component.**
- **No input can make a gate true at view creation.** `@angular/elements` applies
  initial input values *after* creating the component, so `open = true` before
  `appendChild` does not help — verified.
- **Modal is not fixed even by an unconditional gate.** Forcing `@if (true)` and
  rebuilding the whole chain still renders an empty card, while `ds-card`/`ds-alert`
  (root-level projection) keep their children in the same build. So modal carries a
  second cause on top of the gate, and it is not yet found.

**Root cause is therefore PARTLY open.** The class of defect is understood and the
benign/broken split is now measured rather than assumed; what remains unexplained is
why `modal` specifically fails even with its gate removed.
**Root cause is therefore partly open.** Do not write an override for these three
before it is found: the fix that looks obvious has already failed twice, and an
override built on a guess is a second implementation with none of the parity
tooling that guards Misha's port.

### Triaged benign — `<ng-content>` sits in the branch that is live at upgrade

Each of these gates on an input that is falsy by default, with the projection in
the `@else`. `badge` is the worked example: `@if (count() !== null) { … } @else {
<ng-content> }` — a `<ds-badge>` upgrades with no `count`, so the `@else` branch is
live and the children are claimed correctly.

`auth-layout` · `badge` · `checkbox` · `dropzone` · `filter-bar` · `menu-item` ·
`radio` · `sidenav` · `sidenav-group` · `sidenav-item` · `switch` ·
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
