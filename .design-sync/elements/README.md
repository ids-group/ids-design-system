# design-sync via `@angular/elements`

`/design-sync` is React-only, so something has to stand between the design agent
and an Angular library. Until 2026-09-01 that was a hand-written React port of 63
components; it was deleted, and this is what replaced it: **ship the real
components** as custom elements and let a _generated_ React layer be the only
thing in between.

```
src/lib/**/*.component.ts
        │
        ├── tools/gen.mjs ──► gen/elements.ts   register every ds-* as a custom element
        │                     gen/wrappers.tsx  one React component per element, typed
        │
        ├── ng build ds-elements ──► dist/browser/main.js  AOT templates + Ivy linker
        │                           dist/browser/styles.css  ds.scss + per-component styles
        │
        └── tools/build-bundle.mjs ─► dist/ds-bundle.js   IIFE, window.IdsDs, react from window
                                      dist/ds-bundle.css  the upload copy: font URLs → fonts/
                                      dist/types/**       the wrappers, type-checked
                                      demo/dist/demo.js   same + React, for the proof page
```

Nothing in the chain is hand-maintained: `gen.mjs` reads the components' AST and
emits both the registration list and the wrappers, so a new component, a renamed
input or a changed union appears in the bundle on the next build. There is no
second implementation to drift from, which is why the port's parity gate went
away with it rather than being carried over.

## Build

```sh
node .design-sync/tools/bootstrap.mjs                  # esbuild + react into .ds-sync
node .design-sync/elements/tools/gen.mjs               # 85 elements, 630 inputs/outputs
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
_before_ the element upgrades would shadow the prototype setter forever (so the
runtime waits on `customElements.whenDefined`), and named content slots keep
working because Angular projects light-DOM children — `<div actions="">` lands in
`<ng-content select="[actions]">` unchanged.

## What this bought over the port

|                                                          | the deleted React port                                            | this                                   |
| -------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| source of truth                                          | a second implementation, re-ported by hand                        | the shipped component                  |
| drift                                                    | possible, needs `check-parity.mjs` to catch it                    | structurally impossible                |
| CSS                                                      | `build-css.mjs` textually re-scopes `:host`/`::ng-deep` onto tags | Angular emits its own component styles |
| CDK overlays, focus trap, scroll lock                    | not ported — overlays render inline                               | real                                   |
| pointer interactions (table resize/reorder, slider drag) | not ported                                                        | real                                   |
| type vocabulary                                          | restated in the binding                                           | imported from the DS's `*.types.ts`    |
| hand-written lines                                       | ~11 000                                                           | ~90 (`runtime.tsx`)                    |

## Measured

Re-measured 2026-09-01 against `dev` at 0.11.1 (85 components), after merging a
month of upstream into both branches. Gzip is `gzip -9` over the built files.

|                             | React port                  | this branch                     |
| --------------------------- | --------------------------- | ------------------------------- |
| JS, minified                | 251 KB raw / **51 KB gzip** | 1052 KB raw / **259 KB gzip**   |
| CSS                         | 450 KB raw / **83 KB gzip** | 57 KB raw / **10 KB gzip**      |
| total over the wire         | **134 KB gzip**             | **269 KB gzip**                 |
| hand-written component code | ~11 000 lines               | 0 (+ 90 lines of `runtime.tsx`) |
| build                       | esbuild + tsc, seconds      | `ng build` 7.8 s + esbuild      |

So the Angular runtime and CDK cost about **+135 KB gzip** — the same delta the
first measurement found at 0.7.0 (+136 KB), so the framework's cost is flat while
the DS grows. The port is cheaper over the wire and gets relatively cheaper as the
component count rises, because its CSS is what scales, not its JS.

### What a month of drift cost each branch

The two branches sat open from 2026-07-31 to 2026-09-01 while the DS went 0.7.0 →
0.11.1. Merging `dev` into each was identical work — the same three conflicting
files, all mechanical. Bringing each one back to _correct_ was not:

|                                     | React port                 | this branch                                 |
| ----------------------------------- | -------------------------- | ------------------------------------------- |
| `bun run check:design-sync`         | **213 problems**           | nothing to check — no second implementation |
| components whose source drifted     | 53 of 80                   | n/a                                         |
| public props missing from the layer | 122 across 26 components   | 0                                           |
| new components with no counterpart  | 6                          | 0                                           |
| manual work to make it correct      | a re-port of 53 components | `node gen.mjs`                              |

`gen.mjs` picked the month up on its own: 81 elements / 518 inputs-outputs became
**85 / 630**, `ng build ds-elements` is green, and the bundle builds. The port's
own build is _also_ green — `build-css.mjs` emits 85/85 blocks and
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

## The blocker, and how it was closed

**Both causes were generator defects. No component was changed.** Full detail, with the
measurements, in `../MANUAL-SURFACE.md` §1.

1. **Nested custom elements** — [angular/angular#24536](https://github.com/angular/angular/issues/24536).
   A custom element inside another custom element's template loses its projected content _and_
   its inputs. `ds-modal` renders `<ds-modal-card>`, which was also registered. `gen.mjs` now
   registers a component used inside another component's template under an alias, `ds-x-<name>`,
   which no template mentions (count in `../MANUAL-SURFACE.md`). The React wrapper emits the alias, so callers are
   unaffected.
2. **Host-directive inputs were never on the element.** `createCustomElement` reads the
   component's own inputs only, so `staticPreview` — re-exposed via `hostDirectives` — had no
   accessor and every write became a plain expando. `gen.mjs` now emits `HOST_INPUTS` and
   `defineDsElements` defines a forwarding accessor per entry.

With (2) in place the card renders at view creation, the projection is placed immediately and
nothing is detached — which is also what stopped registered elements inside a slot from being
destroyed by [angular/angular#38962](https://github.com/angular/angular/issues/38962) (a
detached Angular element loses its component after ~10 ms and its node is removed).

**What did not work, recorded so nobody repeats it:** hoisting projection into a top-level
`<ng-template>` + `ngTemplateOutlet` (twice — before and after fix 1), widening the `@if` to
include `open()`, forcing the gate to `@if (true)`, setting inputs as properties or attributes
before `appendChild`, and React 19's detached-property assignment. All measured, all reverted.

**The lesson, and it is the cheap one:** four self-generated hypotheses cost several rounds;
one web search for the symptom returned #24536 on the first page.

## Other limitations, verified

- **A gate toggled long after upgrade drops the custom elements in its slot.** The projected
  wrapper and its plain markup survive; a `<ds-checkbox>` inside it does not
  ([angular/angular#38962](https://github.com/angular/angular/issues/38962) — a detached element
  loses its component after ~10 ms). Pass the gate's state as an initial prop and everything
  works, nested components included; a preview does that by construction. See
  `../MANUAL-SURFACE.md` for the measured table.
- **Imperative APIs don't cross the boundary.** Angular's element strategy
  publishes inputs and outputs, not methods, so `popover.toggle(trigger)` — how
  the DS opens a popover — is unreachable. Trigger-driven overlays need an
  input-based open state to be usable from a design.
- **Attribute directives have no element to register.** Listed in `../MANUAL-SURFACE.md` §2 - mostly template-slot markers for
  the picker family, which are meaningless without an Angular template anyway. **`dsTooltip` was called the one that hurts; on a
  second look it does not** — a tooltip is hover-revealed, and a static design card has no hover,
  so an agent gets nothing from it either way (`../MANUAL-SURFACE.md` §2). Covering it at all would
  need a host component wrapping the directive. Note `dsStaticPreview` is NO LONGER in this bucket — its input is now
  published on the element (see fix 2 above); the directive itself is still not registrable, but
  nothing needs it to be.
- **`@angular/elements` is a new dependency** (first-party, locked to the Angular
  major already in use, dev-only — but still a dependency the DS repo didn't have).
- **The host contract, read off the live project 2026-09-01 and satisfied.** The agent's code does
  `window.IdsDs.<Component>` with `React` taken from a global, and React is vendored as a separate
  file rather than expected inside the DS bundle — which is exactly what `build-bundle.mjs` emits
  (IIFE, `window.IdsDs`, react from window). Nothing inspects the framework riding along.
  A **card** takes the other path and needs no React at all: it sets `window.__dsSectionsOnly` and
  holds one `ds-docs-*` element, the ds-docs section documenting the component. See
  `../COMMANDS.md`.

## Verdict

The generation half was always the win: 630 inputs/outputs across 85 components come out of the
AST with their real types, and there is no second implementation to keep in sync — the parity
gate the hand-port needs has nothing to guard here. **The runtime half is no longer blocked.**
Projection, inputs and nested composition all work; the remaining limits are the fifteen attribute
directives (of which only `dsTooltip` hurts, and a static card has no hover), the imperative overlay APIs, and the untested
question of whether claude.ai/design accepts a bundle with a framework inside it — the contract
itself is satisfied, since it asks only for React components on `window.IdsDs` with React
supplied externally.

Costs, re-measured at 0.11.1: **+135 KB gzip** over the port, the same delta as at 0.7.0.
