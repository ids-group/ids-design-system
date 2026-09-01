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

## 1. Projection through the element boundary — SOLVED

Two generator defects, both fixed 2026-09-01, **no component was changed**. Everything below
was measured in a real Chrome tab with `document.createElement` + `innerHTML` + `appendChild`,
so React is not on the path.

### Defect A — nested custom elements

[angular/angular#24536](https://github.com/angular/angular/issues/24536): a custom element
nested inside another custom element's template loses **both** its projected content and its
inputs. `ds-modal`'s template renders `<ds-modal-card>`, which the generator also registered,
so the inner element re-bootstrapped and took the card's bindings and projection with it. That
one fact explains the empty card, the empty `title`, and why four earlier hypotheses (React
wrapper timing, React 19, hoisting `<ng-content>` into an `<ng-template>`, widening the `@if`)
all failed.

**Fix, per upstream's own advice — do not nest them.** `gen.mjs` scans every
`*.component.html` and `*.component.ts` under `src/lib` for `<ds-…` tags; a component used
inside another component's template registers under an alias, `ds-x-<name>`, that no template
mentions, so Angular renders it as an ordinary component there. **31 of 85** take an alias.
The React wrapper emits the alias, so `<Modal>` and `<Button>` are unchanged for a caller and
the tag never surfaces in a preview or a design. Angular's component styles are
attribute-scoped, so the alias costs no CSS.

### Defect B — host-directive inputs were never registered

`createCustomElement` builds its property list from the component's **own** inputs, so an
input re-exposed through `hostDirectives` had no accessor at all and a write landed as a plain
expando. Read off the live registration before the fix: `ds-modal`'s prototype carried `open`,
`size`, `status`, `title`, `subtitle`, `dividers`, `closeOnBackdrop`, `persistent` — and no
`staticPreview`. So `staticPreview`, the documented way to render an overlay statically, had
**never** worked on any element; `elements/README.md` claimed the generator picked these up,
and it did — for the React wrapper only.

**Fix:** `gen.mjs` emits a `HOST_INPUTS` map and `defineDsElements` defines a forwarding
accessor per entry before `customElements.define`. Three components have such inputs today:
`ds-modal`, `ds-x-popover`, `ds-x-select`, all `staticPreview`.

This is what closed the last symptom. With `staticPreview` reaching the component, the card
renders at view creation, the projection is placed immediately, nothing is detached — and so
**registered elements nested inside a slot survive**, which they did not before. The mechanism
they were dying of is [angular/angular#38962](https://github.com/angular/angular/issues/38962):
a detached Angular element has its component destroyed after ~10 ms and its DOM node removed.

### Verified — full slot sweep

Every component with projection was probed with its real slot names, extracted from its own
template rather than guessed: **44 components, 36 green on the first pass.** All eight
remainders were then driven with the inputs their slots depend on:

| component | slot | verdict |
|---|---|---|
| `stat` | `[delta]` | ✅ works with the `delta` input set — the first sweep passed unnamed content to a component that has only named slots |
| `table` | `[empty]` | ✅ works with an empty `data` array |
| `table` | `[bulk-actions]` | inconclusive — needs the real selection API, no evidence of a defect |
| `sidenav`, `auth-layout` | `[dsBrandName]` | by design — gated on a `contentChild` query for the **directive**, and a directive cannot be applied through an element boundary (see §2) |
| `sidenav-item` | unnamed | by design — the template's own first comment says there is deliberately no default `<ng-content>` |
| `filter-bar` | unnamed | by design — it drops anything carrying neither slot attribute, and `dsProjectionDropped` warns about it at runtime |
| `tab` | unnamed | by design — `tab.component.html` is only `<ng-template #content><ng-content /></ng-template>`, stamped by `ds-tabs`; standalone it renders nothing |

Spot checks that now pass and previously did not: `ds-modal` (`title` + `[body]` + a nested
`ds-checkbox` + a nested `ds-x-button`), `ds-drawer` `[drawer-body]`, `ds-bottom-sheet`,
`ds-x-popover` with `staticPreview`, `ds-card` containing a registered `ds-checkbox`,
`ds-alert` `[actions]` containing a registered `ds-x-button`.

### The one rule that governs every slot (measured 2026-09-01)

**A slot works — including nested DS components inside it — as long as its gate is true by the
time the element connects.** Angular Elements applies initial input values immediately after
creating the component, inside the same microtask, so a gate driven by an initial prop is live
before anything is detached. Measured on `ds-modal` with a nested `ds-checkbox` in `[body]`:

| construction | plain markup | nested registered element |
|---|---|---|
| `staticPreview` set at creation | ✅ | ✅ |
| `open` set at creation | ✅ | ✅ |
| closed at creation, `open` set later | ✅ | ❌ |

Only the third row loses anything, and only the custom elements in it — the projected wrapper
and its plain markup survive. The mechanism is
[angular/angular#38962](https://github.com/angular/angular/issues/38962): a detached Angular
element has its component destroyed after ~10 ms and its node removed. Toggling a gate long
after upgrade is exactly that detach.

**So the contract for a preview is: pass the state as an initial prop, never toggle it after
mount.** A static design preview always satisfies this, because it renders with its props set.

`ds-table` `[bulk-actions]` was the one case that looked unfixable, because a selection normally
happens after mount. It obeys the same rule: with `selectedIds` passed as an initial prop the
bulk bar renders and the nested `ds-x-button` inside it survives — verified. Selecting a row
through the UI afterwards renders the bar and its plain content, and drops the nested component.

### What the manifest list means now

`manual-surface.json` records the 16 templates whose `<ng-content>` sits inside a control-flow
block. **That is a watch-list, not a defect list** — all 16 are green today. It exists because
the two defects above were invisible until someone looked, and a new component that gates its
projection deserves the same look. `check-manual-surface.mjs` fails when the list changes so
the look actually happens.

The sixteen, each with the gate its `<ng-content>` sits behind:

| component | gate | status |
|---|---|---|
| `modal` | `rendered()` | overlay; ✅ via staticPreview and via open |
| `drawer` | `rendered()` | overlay; ✅ |
| `bottom-sheet` | `rendered()` | overlay; ✅ |
| `auth-layout` | `letterGlyph()` | ✅ |
| `badge` | `count()` | projection in the live @else; ✅ |
| `checkbox` | `label()` | projection in the live @else; ✅ |
| `radio` | `label()` | projection in the live @else; ✅ |
| `switch` | `label()` | projection in the live @else; ✅ |
| `dropzone` | `files()` | ✅ |
| `menu-item` | `icon()` | ✅ |
| `sidenav` | `brandRoute()` | [dsBrandName] is directive-gated — see the sweep above |
| `sidenav-group` | `expandable()` | ✅ with label + expandable set |
| `sidenav-item` | `routerLink()` | no default slot by design |
| `stat` | `delta()` | ✅ with the delta input set |
| `table` | `exportButton()` | [empty] ✅; [bulk-actions] inconclusive |
| `filter-bar` | `collapsed()` | drops unslotted content by design |

`ds-modal-card` also has projection but does not appear here: its slots are at root level,
outside any block, and it is one of the 31 that register under an alias.
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
