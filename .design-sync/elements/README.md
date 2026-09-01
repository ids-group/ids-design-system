# design-sync via `@angular/elements` — the alternative to hand-porting

The committed sync (`.design-sync/react-bindings/`) re-implements 63 Angular
components as React, because `/design-sync` is React-only. This branch tests the
other route: **ship the real components** as custom elements and let a
*generated* React layer be the only thing in between.

```
src/lib/**/*.component.ts
        │
        ├── tools/gen.mjs ──► gen/elements.ts   register every ds-* as a custom element
        │                     gen/wrappers.tsx  one React component per element, typed
        │
        ├── ng build ds-elements ──► dist/browser/main.js  AOT templates + Ivy linker
        │                           dist/browser/styles.css  ds.scss + per-component styles
        │
        └── tools/build-bundle.mjs ─► dist/ds-bundle.js  IIFE, window.IdsDs, react external
                                      demo/dist/demo.js  same + React, for the proof page
```

Nothing in the chain is hand-maintained: `gen.mjs` reads the components' AST and
emits both the registration list and the wrappers, so a new component, a renamed
input or a changed union appears in the bundle on the next build. The parity gate
that the hand-port needs (`check-parity.mjs`) has nothing to guard here — there
is no second implementation to drift from.

## Build

```sh
node .design-sync/tools/bootstrap.mjs                  # esbuild + react into .ds-sync
node .design-sync/elements/tools/gen.mjs               # 85 elements, 625 inputs/outputs
ng build ds-elements                                   # Angular AOT (the slow step)
node .design-sync/elements/tools/build-bundle.mjs      # bundle + demo
npx serve .design-sync/elements/demo                   # open index.html
```

## How the wrapper binds

Angular's element strategy exposes each `input`/`model` as a DOM **property** and
each `output`/`modelChange` as a **CustomEvent**. So the wrapper (see
`runtime.tsx`) does exactly two things:

- assigns props as properties in a layout effect — attributes would stringify, so
  a `data` array of table rows has to be a property;
- attaches `addEventListener(<output>)` and forwards `event.detail` to the
  matching `on<Output>` prop.

Two details that are easy to get wrong and are handled: a property written
*before* the element upgrades would shadow the prototype setter forever (so the
runtime waits on `customElements.whenDefined`), and named content slots keep
working because Angular projects light-DOM children — `<div actions="">` lands in
`<ng-content select="[actions]">` unchanged.

## What this buys over the port

| | hand-written React port | this |
|---|---|---|
| source of truth | a second implementation, re-ported by hand | the shipped component |
| drift | possible, needs `check-parity.mjs` to catch it | structurally impossible |
| CSS | `build-css.mjs` textually re-scopes `:host`/`::ng-deep` onto tags | Angular emits its own component styles |
| CDK overlays, focus trap, scroll lock | not ported — overlays render inline | real |
| pointer interactions (table resize/reorder, slider drag) | not ported | real |
| type vocabulary | restated in the binding | imported from the DS's `*.types.ts` |
| hand-written lines | ~11 000 | ~90 (`runtime.tsx`) |

## Measured

Re-measured 2026-09-01 against `dev` at 0.11.1 (85 components), after merging a
month of upstream into both branches. Gzip is `gzip -9` over the built files.

| | React port | this branch |
|---|---|---|
| JS, minified | 251 KB raw / **51 KB gzip** | 1049 KB raw / **259 KB gzip** |
| CSS | 450 KB raw / **83 KB gzip** | 56 KB raw / **10 KB gzip** |
| total over the wire | **134 KB gzip** | **269 KB gzip** |
| hand-written component code | ~11 000 lines | 0 (+ 90 lines of `runtime.tsx`) |
| build | esbuild + tsc, seconds | `ng build` 7.8 s + esbuild |

So the Angular runtime and CDK cost about **+135 KB gzip** — the same delta the
first measurement found at 0.7.0 (+136 KB), so the framework's cost is flat while
the DS grows. The port is cheaper over the wire and gets relatively cheaper as the
component count rises, because its CSS is what scales, not its JS.

### What a month of drift cost each branch

The two branches sat open from 2026-07-31 to 2026-09-01 while the DS went 0.7.0 →
0.11.1. Merging `dev` into each was identical work — the same three conflicting
files, all mechanical. Bringing each one back to *correct* was not:

| | React port | this branch |
|---|---|---|
| `bun run check:design-sync` | **213 problems** | nothing to check — no second implementation |
| components whose source drifted | 53 of 80 | n/a |
| public props missing from the layer | 122 across 26 components | 0 |
| new components with no counterpart | 6 | 0 |
| manual work to make it correct | a re-port of 53 components | `node gen.mjs` |

`gen.mjs` picked the month up on its own: 81 elements / 518 inputs-outputs became
**85 / 625**, `ng build ds-elements` is green, and the bundle builds. The port's
own build is *also* green — `build-css.mjs` emits 85/85 blocks and
`build-bindings.mjs` produces a bundle — which is the point: nothing in the port's
toolchain can tell that what it just built ships an API the DS no longer has. Only
the parity gate can, and it does.

## Verified in Chrome

Against the demo page, real browser, not a headless approximation:

- all sampled elements upgrade (`ds-button`, `ds-select`, `ds-table`, `ds-modal`,
  `ds-popover`, `ds-menu`) and carry real Angular output (`_ngcontent-*`);
- props reach the components — `<Select value="leeds">` renders "Leeds LS1 4AP"
  and `element.value === 'leeds'`;
- **the real CDK works**: opening `ds-select` creates a `.cdk-overlay-container`
  in `document.body` with a live `[role="listbox"]`, positioned under the field,
  the selected row check-marked; an outside click closes it;
- `ds-modal` opens with a backdrop and two `.cdk-focus-trap-anchor` nodes — the
  actual focus trap, not an approximation;
- `ds-table` renders selection checkboxes and sortable headers from a `data`
  array passed as a property (an attribute would have stringified it).

## The blocker found while verifying

**A component whose `<ng-content>` sits inside a conditional loses its projected
children.** `modal.component.html` wraps everything — including the `[body]`,
`[impact]` and `[actions]` slots — in `@if (rendered() || preview.staticPreview())`. When
the element upgrades in the closed state, Angular creates the view, finds no
projection slots, and the light DOM React handed it is **discarded from the DOM
permanently**; opening the dialog afterwards renders an empty card.

Tested on React 18.3.1 and 19.2.8 — identical. (19 was worth testing because it
assigns unknown props as *properties* on a detached element, i.e. before
`connectedCallback`; that fixes input timing, not projection.)

The fix is upstream and cheap, and the DS already knows the pattern — see the
comment at the top of `popover.component.html`: hold the projection in a
top-level `<ng-template #content><ng-content /></ng-template>` and stamp it with
`ngTemplateOutlet` inside the branches. Popover does this and keeps its children.
Modal, drawer and bottom-sheet don't.

**Still open on 0.11.1 (checked 2026-09-01).** `modal.component.html:1`,
`drawer.component.html:1` and `bottom-sheet.component.html:1` all still open with
`@if (rendered() …)` and hold their `<ng-content>` inside it; `popover.component.html`
still carries the top-level `<ng-template #content>` and the comment explaining why.
Nothing in the month's work touched this either way.

Until then, `staticPreview` is the way in: it makes the card render at view
creation, so the slots exist when the light DOM is claimed. The generator now
picks up host-directive inputs (`hostDirectives: [{directive: DsStaticPreview,
inputs: ['staticPreview']}]`), so the prop exists on the wrapper — the demo panel
that uses it is built but was not re-checked in the browser (the extension
dropped), so treat that one as expected-to-work rather than verified.

## Other limitations, verified

- **Imperative APIs don't cross the boundary.** Angular's element strategy
  publishes inputs and outputs, not methods, so `popover.toggle(trigger)` — how
  the DS opens a popover — is unreachable. Trigger-driven overlays need an
  input-based open state to be usable from a design.
- **Attribute directives have no element to register.** `dsTooltip`,
  `dsCellTemplate`, `[dsBrandName]`, `dsStaticPreview` and the CVA base are
  directives; the six of them are simply absent from the generated surface.
  `Tooltip` is the one that hurts — the React port has it because a port can
  reimplement a directive as a component.
- **`@angular/elements` is a new dependency** (first-party, locked to the Angular
  major already in use, dev-only — but still a dependency the DS repo didn't have).
- **Runtime acceptance is unproven.** The bundle satisfies the documented
  contract (one IIFE assigning React components to `window.IdsDs`), but nobody
  has run a bundle with a framework inside it through claude.ai/design, and
  `anthropics/claude-code#71523` shows the skill assumes React all the way down.

## Verdict

The generation half is a clear win: 625 inputs/outputs across 85 components come
out of the AST with their real types, and there is no second implementation to
keep in sync — the parity gate the port needs has nothing to guard here. The
runtime half is blocked on three upstream changes (hoist projection out of the
conditionals, add input-driven open state to popover/menu, wrap `dsTooltip` in a
host component) plus an unknown about the design app's tolerance for a non-React
bundle. None of those is hard; none of them is free either.
