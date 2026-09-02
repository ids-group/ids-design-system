# One line in `ng-package.json` is the whole bundle problem

> Written 2026-09-01 to answer a question asked directly: *"так что у нас как-то сервисы
> неправильно устроены, или у нас внутри библиотеки зависимости неверные, или у нас какие-то графы
> положений, компонентов, инжектов неверные? У нас не оптимизирован импорт библиотеки, не
> оптимизирован tree shaking, или что?"*
>
> The reason the question keeps coming back is that the finding has always been told as a story about
> a service — `NotificationService`, `ToastService`, `BodyScrollLockService`. **That framing is
> wrong**, and this document is mostly the measurement that shows why.
>
> Companion records: `packaging-chunking-audit.md` (the original investigation, its fixtures and
> §10/§11 measurements) and `basic-advanced-split-audit.md` (the component-weight side).
>
> **Every figure below went through an adversarial review on 2026-09-02 and some of them changed —
> `docs/packaging-record-review-2026-09-02.md` carries the evidence for each correction, and also for the five proposed
> corrections that did NOT survive.** The dated "CORRECTED"/"WITHDRAWN" blocks in this file are its
> output.

## The answer in one paragraph

Nothing is wrong with the services, the internal dependency graph, or the DI graph. Tree-shaking is
not unoptimised — it is working about as well as it can. The library declares **one** entry point, so
ng-packagr emits **one** ESM module containing all 71 component folders, and a module is the smallest unit a
bundler can place in a chunk. The consequence: the instant *any* runtime symbol from the library is
reachable before the first route resolves, the retained code of the **entire** library is placed in
the initial bundle — including components only a lazy route uses. It does not matter which symbol.

## Two different problems share one name

| | Question it answers | Our status |
| --- | --- | --- |
| **Tree-shaking** | is code nothing references deleted? | ✅ **working.** Entry cost 5.6 KB gzip; the 52 components a prototype never touches cost it 18.2 KB total |
| **Chunk placement** (code-splitting) | of the code that IS used, does it land in the startup chunk or a later one? | ❌ **broken.** One eager symbol puts everything in the startup chunk |

They are orthogonal, and almost every confusion about this topic comes from treating them as one
thing. Ours is entirely a placement problem. `"sideEffects": false` is set, the Angular compiler marks
every definition `/*#__PURE__*/`, and the library has no third-party runtime dependency beyond
`tslib` — the preconditions for tree-shaking are all met and measured.

## The mechanism: a module is the bundler's atom

esbuild (and Rollup) split code by **module**. For every module the bundler computes which entry
points can reach it, and modules sharing a reachability set are emitted as one chunk. A module
reachable from the eager entry goes into a chunk the eager entry statically imports. **Half a module
cannot go in one chunk and half in another.**

`ng-package.json` says:

```json
{ "lib": { "entryFile": "src/public-api.ts" } }
```

One `entryFile` → one `fesm2022/ids-group-ltd-ids-design-system.mjs` (1.73 MB) → **one module holding
all 71 component folders** behind a single `"."` export. So "reachable from eager" is a property of the whole
library, not of any component in it.

Tree-shaking still runs inside that module, which is why the eager chunk measures 755 kB and not
1.73 MB — genuinely unused code *is* dropped. What survives is everything the app uses **anywhere**,
placed eagerly.

## The evidence: what you import makes no difference

Probe at `.claude/local/bundle-probe/`, `dist/ds` 0.11.1, production build. The app has one eager root
and one `await import()` route holding eleven heavy components (table, date-picker, time-picker,
multi-select, autocomplete, color-picker, tree, stepper, dropzone, slider, otp-input). "Initial" is
`main.js` plus every chunk it statically imports.

| Eager anchor in the app root | Initial raw | Initial gzip | Lazy chunk | Heavy components in the initial bundle |
| --- | --- | --- | --- | --- |
| nothing from the DS | 178 723 B | 59 019 B | 566 761 B | **0 of 11** |
| `import type { DsStatus }` — type-only | 178 749 B | 59 034 B | 566 761 B | **0 of 11** |
| `provideDsTheme({ followSystem: true })` | 743 724 B | **192 392 B** | 189 B | **11 of 11** |
| `provideDsConfig({})` | 743 583 B | **192 342 B** | 189 B | **11 of 11** |
| one `<ds-button>` in the root shell | 743 355 B | **192 244 B** | 189 B | **11 of 11** |
| `inject(ToastService)` | 754 962 B | **194 763 B** | 189 B | **11 of 11** |

Read the bottom four rows together: **they are within 2.5 KB gzip of each other.** A theme provider, a
config provider, one button and a service all cost the same, because all four anchor the same single
module. The lazy chunk collapses to 189 bytes in every case — it re-imports its components from the
chunk `main` already pulled.

Two things follow that change how this should be talked about:

1. **The service was never the cause.** It was the anchor someone happened to notice.
2. **`provideDsTheme()` is in the documented setup for every consumer** (`provide-ds-theme.ts:25`
   shows it in `app.config.ts`). So *every* app using this library already has an eager anchor,
   whether or not it ever touches a service. There is no consumer for whom this is hypothetical.

Type-only imports do not anchor — 15 bytes of difference — because TypeScript erases them and no
runtime reference survives.

## Each hypothesis, tested

| Hypothesis | Verdict | Evidence |
| --- | --- | --- |
| the services are badly designed | **no** | a service that spawns its own overlay component is the normal shape (`MatSnackBar`, `MatDialog` do the same). Its closure is 11 of 77 groups, and behind an entry point that closure is the whole eager cost — 86.8 kB gzip of app, of which 56.1 kB is the DS (the rest is the bare-Angular floor), measured |
| internal dependencies are wrong / not separated | **no** | 77 groups over 254 files, **runtime edges only** (the qualifier matters — with type-only edges there was a third, four-way SCC, corrected below and broken by A3-pre on 2026-09-02): **two cycles**, `radio ↔ radio-group` and `time-columns ↔ time-picker`, both sibling pairs that belong together. `overlay` and `theme` import nothing outside themselves (`config` had three type-only edges out, and no longer exists as a group); `core → config`; `icons → core`. A computed 12-group `core` seed closes on itself with nothing extra pulled in |
| the DI / inject graph is wrong | **no** | DI is a runtime concern. It touches bundling only by making a symbol reachable eagerly, and the table above shows a plain `<ds-button>` does that just as well as any injector |
| the library import is not optimised | **no** | there is exactly one specifier to import from, and it is correctly declared: `exports`, `module`, `typings`, `sideEffects: false`, partial-Ivy FESM |
| tree-shaking is not optimised | **no** | 5.6 kB entry cost; 52 unused components cost 18.2 kB; unused exports are provably dropped (`packaging-chunking-audit.md` §3 fixtures) |
| **the packaging granularity is wrong** | **yes** | one `entryFile` for 71 component folders (85 exported component classes). Everything above is a consequence of it |

## Why no internal refactor can fix this

This is the part worth being blunt about, because it saves work that would not pay.

While there is one entry point, **restructuring the library's internals cannot move a single byte out
of the initial bundle.** Making `ToastService` not reference its region component, inverting the
dependency so the consumer hosts `<ds-toast-region>` themselves, splitting the table into directives —
none of it changes placement, because placement is decided per module and there is one module.

Internal refactors do two other useful things, and it is worth keeping them straight:

- **They can reduce what is RETAINED** (a tree-shaking win). If `ButtonComponent` stopped importing
  `FieldMessageComponent` and nothing else used it, field-message would be dropped for apps that use
  neither. That is real, and it is what the table's directive split buys — 18.9 kB gzip, measured.
- **They cannot change WHERE the retained code lands** (the placement problem). Only an entry-point
  boundary does that.

An internal dynamic `import()` inside the library does not help either: ng-packagr's FESM is a single
file, so rollup inlines internal dynamic imports rather than emitting a second chunk. A library cannot
create a chunk boundary inside its own entry point.

## What comparable libraries do

The Angular Package Format is explicit, and the wording is worth quoting because it is the standard
we are measured against:

> The general rule for APF packages is to use entrypoints for the smallest sets of logically connected
> code possible.

and

> Most libraries with a single logical purpose should be published as a single entrypoint.

`@angular/core` is one entry point because the runtime is an integrated whole. **Angular Material is
the opposite and publishes one entry point per component** — `@angular/material/button`,
`@angular/material/dialog` — precisely so each can be lazily loaded and placed independently.
`@angular/cdk` does the same, which we already rely on: we import `@angular/cdk/overlay`,
`@angular/cdk/portal` and `@angular/cdk/drag-drop` as three separate specifiers. PrimeNG moved the
same way.

A design system is not "a single logical purpose" in the APF sense — a button and a data grid are not
an integrated whole. By the format's own rule we are on the wrong side of it, and the anchor table
above is what that costs.

Secondary entry points are **not deprecated** and remain the recommended mechanism (ng-packagr's
`docs/secondary-entrypoints.md` on `main`; a second, secondary source was cited here as "a February
2026 guide" and is **withdrawn as evidence 2026-09-02** — it was never named or linked, so it cannot
be checked. The upstream doc stands on its own).

## The option space, with prices

| Option | What it does | Price | Eager DS cost after |
| --- | --- | --- | --- |
| **A — nothing** | consumers with all-lazy routes get the DS with route 1 rather than before it | zero | 135.7 kB gzip |
| **C — consumer-side `await import()` / `@defer`** | the consumer's eager root imports the DS lazily | none for us; costs the consumer ~50% of tree-shaking (the dynamic specifier becomes an entry point, so unused exports can no longer be dropped — measured, §3 variant C) and must be rediscovered by every consumer | ~0 eager, larger total |
| **B — one narrow services entry point** | ~~a `services` entry beside an unchanged root~~ | **impossible** — refuted 2026-08-05: the services' closure includes button, icon, spinner, modal-card, which every other component also needs, so the root would import from the services entry and ng-packagr forbids cycles between entry points | — |
| **D — layered entry points** | `core (13 groups) ← services (toast, modal) ← components (62 groups)`, root kept as a pure re-export facade | one internal refactor. **No consumer changes an import** — §10 measured `facade` and `deep` consumer variants as byte-identical down to the chunk hash | **~50–56 kB gzip, ≈ −59%** (modelled — see the correction in `packaging-chunking-audit.md` §11(a)) |
| **D+ — per-component entry points** (Material's model) | maximum granularity | larger refactor; the graph nearly allows it already — only the two sibling cycles must be co-located | lowest possible |

**D is the recommendation, and A0 has now cleared its two unknowns:** the pipeline works end-to-end
through the Angular application builder (§10), and the real graph partitions (§11).

## A side finding, recorded not actioned

`ButtonComponent extends DsMessageBase` and imports `FieldMessageComponent`, `field-errors` and
`nextControlId` (`button.component.ts:19-26,62,78`) so that a button can render a validation message
inside a field group. That makes the cheapest component in the library reach into the field system —
one `<ds-button>` measures 32.1 kB gzip over a bare Angular app.

**Not measured:** how much of that 32.1 kB is the field-message closure rather than icons, config and
the shared component runtime. Worth a targeted ablation before anyone calls it a defect — and note it
is a *retention* question, not a placement one, so it is independent of everything above and does not
block D.

## Not verified

- No consumer repo was rebuilt. The probe models the all-routes-lazy shape; a consumer whose **eager**
  root needs a component rather than a service pays the same today and would still pay more than the
  services closure after D.
- ~~Whether the top layer wants to be one entry point or many.~~ **Answered below: per-component.**
- Whether `ds-docs` itself would benefit; it is a single eager app, so probably not, and it is not a
  reason to do or skip D.

## Three follow-up measurements (2026-09-01, same probe)

Asked for after the diagnosis landed. All three change something in the plan.

### 1. Granularity: one `components` entry is not enough

The three-layer partition (`core <- services <- components`) helps only a consumer whose eager root
touches nothing outside `core` and `services`. An eager **app shell** does touch the component layer —
that is what `ds-app-layout`, `ds-sidenav` and `ds-topbar` are for — and with a single `components`
entry that pulls the whole retained component layer back into the initial bundle.

Measured with a purpose-built fixture at `.claude/local/granularity-probe/`: a library in two shapes,
identical payload, consumed through the **root facade** both times. The app has an eager component
(`alpha`) and two lazy routes using `beta` and `gamma`.

| Library shape | Initial | `alpha` (eager) | `beta` (lazy A) | `gamma` (lazy B) | Lazy chunks |
| --- | --- | --- | --- | --- | --- |
| `core` + **one `components` entry** | 178 538 B | 500 markers | **500** | **500** | 101 B, 101 B — stubs |
| `core` + **one entry per component** | **125 651 B** | 500 markers | **0** | **0** | 26 819 B, 26 318 B — real |

With one `components` entry the eager component drags **both** lazy-only components into the initial
bundle and the lazy chunks collapse to 101-byte stubs. Per-component entries keep each in its own
chunk. **−52 887 B, −30%** on a fixture where the eager component is a third of the payload; in the
real library a shell is a handful of components out of 55, so the ratio is far more lopsided.

**Consequence for A3: the top layer has to be per-component (Angular Material's model), or at minimum
the shell components need an entry of their own, separate from the heavy ones.** A single `components`
entry would deliver the modelled −59% for an eager-service consumer and roughly nothing for an
eager-shell consumer.

### 2. The eager-component case does not argue against D — it argues for finer granularity

`packaging-chunking-audit.md` §7 named "a consumer whose EAGER root needs a component rather than a
service" as what would overturn option D. Measured, it does not.

| Eager anchor | Initial gzip today | Closure | Groups |
| --- | --- | --- | --- |
| the three services | 194 763 B | `core` + `services` | 11 of 77 |
| **an app shell** (`app-layout` + `sidenav` + `topbar` + `page-header`) | **201 283 B** | + `tooltip` | **9 of 77** |

The shell's closure is nine groups, five of them (`app-layout`, `sidenav`, `topbar`, `page-header`,
`tooltip`) outside the proposed `core`. Built on its own that closure is **101 108 B gzip**.

**CORRECTED 2026-09-02.** This paragraph used to conclude "so an eager-shell consumer stands to save
~98 kB gzip". That is the same cross-shape subtraction corrected in `packaging-chunking-audit.md`
§11(a): 201 283 comes from `scenarios/anchor_shell.ts`, which **has** the lazy route, and 101 108 from
`scenarios/shell_closure.ts`, which does **not**. Against its own control the shell closure is
101 108 − 30 646 = **70 462 B**, so the modelled post-A3 initial is ≈ 59 019 + 70 462 ≈ 129 kB and the
saving is **≈ 72 kB gzip, not ~98 kB** — nearly the ≈80 kB an eager-service consumer saves.
The catch is measurement 1: that saving is only reachable with per-component entries. Shell and
services together close over **16 of 77 groups**.

### 3. What one `<ds-button>` costs, and why

`ButtonComponent extends DsMessageBase` and imports `FieldMessageComponent`, `resolveFieldMessage` and
`trimmedText` so a button can render a hint/warning/error line under itself. Ablated on
`probe/button-field-message` (worktree `C:\wt-ds-table-split`), control re-measured on the same build:

| | JS raw | JS gzip | over bare Angular |
| --- | --- | --- | --- |
| bare Angular app | 92 686 B | 30 646 B | — |
| `+ ds-divider` (entry cost) | 107 723 B | 35 997 B | +5 351 B |
| **`+ ds-button` today** | 200 941 B | **62 733 B** | **+32 087 B** |
| **`+ ds-button` without field-message** | 158 610 B | **51 438 B** | **+20 792 B** |

**The field-message coupling is 11 295 B gzip — 35% of the button's cost**, paid by every consumer that
renders a single button, whether or not they ever bind `hint`, `warning` or `error`. The remaining
~20.8 kB is the entry cost plus icons, config, core and the button's own code.

**Entry points do not fix this one.** Even per-component entries keep `button -> field-message` as a
static edge, so the 11 kB arrives with any button. The only two ways out are to drop the feature from
`ds-button`, or to move it behind an opt-in directive — **the same seam pattern as the table**
(`basic-advanced-split-audit.md` §9). That is a design decision, not a defect, and it belongs in the
same lane as A1/A2 rather than in A3.

## Do we have to split? Yes — and per-component is nearly the cheapest option

Asked directly on 2026-09-01: *"пока entry point один, никакой внутренний рефакторинг не вынесет из
initial ни байта — нужно разделять?"* Every other lever has now been measured, so the comparison is
complete:

| Lever | What it moves out of the initial bundle | Catch |
| --- | --- | --- |
| internal refactor of any kind | **0 bytes** | placement is per module; there is one module |
| `DS_CONFIG.prototype: true` | **0 bytes** | a runtime flag cannot be folded at build time |
| basic/advanced as two packages | ~18 kB gzip of retention, 0 of placement | a second table to mirror forever |
| consumer-side `await import()` / `@defer` | most of it | costs the consumer ~50% of tree-shaking, and every consumer must rediscover it |
| **secondary entry points** | **~80 kB gzip** (eager service) / **~72 kB** (eager shell), both MODELLED | one internal refactor, sized below |

### The refactor is 318 import rewrites, and the number barely moves with granularity

ng-packagr requires a cross-entry-point import to go through the package's public specifier rather than
a relative path. **Recount it rather than trusting any figure here: `node tools/entry-point-graph.mjs`.** The tool was added 2026-09-02 because this number had already been recomputed by hand three times and come out different twice. At the commit before A3-pre it reports **320 cross-group statements (250 runtime, 70 type-only) over 77 groups**; after A3-pre, **319 (249 + 70) over 76**. The 318 recorded here counted imports only, excluding the two `export … from` crossings the shipped lint rule does count.

`src/lib` holds **318 cross-group import statements** (250 runtime,
69 type-only). How many need rewriting depends on where the boundaries fall:

| Partition | Entry points | Imports to rewrite |
| --- | --- | --- |
| **P1 — one per component** | 77 | **318** (250 runtime + 70 type-only; 320 counting exports) |
| P2 — six semantic clusters | 6 | 265 |
| P3 — three layers | 3 | 257 |

**Only 19% separates the finest partition from the coarsest**, because most cross-group imports point at
core-ish modules (`icons`, `core`, `field-message`) that cross a boundary under every partition. So
coarse clustering saves almost nothing on the refactor while giving up the whole eager/lazy win measured
in "Three follow-up measurements" §1.

### Semantic clustering is also structurally worse

A six-cluster attempt (`core`, `services`, `shell`, `fields`, `data`, `display`) contains a **real
cycle**, `data → fields → display → data`:

- `pagination → select` (data → fields)
- `autocomplete → tag`, `multi-select → tag`, `multi-select → badge` (fields → display)
- `empty-state → loading-overlay` (display → data)

Every one of those edges is a legitimate component-composes-component relationship — components do not
respect semantic categories. ng-packagr forbids cycles between entry points, so any semantic clustering
has to be de-cycled first. **Per-component has no such problem** — the whole graph has only the two
trivial sibling cycles (`radio ↔ radio-group`, `time-columns ↔ time-picker`).

Put together: per-component costs 61 more import rewrites than three layers (318 − 257; the 53 in an
earlier draft was the SIX-CLUSTER delta, 318 − 265), needs no partition design,
needs no cycle-breaking, and is the only granularity that delivers the win for an eager-shell consumer.
It is also what Angular Material and `@angular/cdk` do.

### What happens if a rewrite is missed

Tested in the fixture by replacing one public specifier with a relative path across an entry-point
boundary:

```
✔ Built probelib/core
✔ Built probelib/services
✖ Compiling with Angular sources in partial compilation mode.
  Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined.
```

The build **fails**, which is the good outcome: it does not silently bundle the same source into two
FESMs, which would give two class identities and a DI container resolving two different services.
Restoring the specifier makes it build again, so the causal link is confirmed by control. The bad part
is the diagnostic — an internal TypeScript error with nothing naming the cause. **Budget for that:** a
missed rewrite reads as a broken toolchain, not as a missed rewrite.

### Cost checklist for the eventual A3

- ~75 nested `ng-package.json` files (two lines each) plus a `public-api.ts` per folder
- 318 import rewrites, mechanical but easy to get subtly wrong — see the diagnostic above
- root `public-api.ts` becomes a pure re-export facade (measured twice as costing consumers nothing)
- `ds-docs` needs a path mapping per entry point in its tsconfig, since it compiles the library from source
- the tools that scan `src/lib` — `extract-component-api.mjs`, `extract-tokens.mjs`,
  `class-surface-diff.mjs`, `changelog-lint.mjs` — need checking against the new layout
- the two sibling cycles must be co-located in their entry points

## Thirteen open questions, investigated (2026-09-01)

A brainstorm produced a list of pitfalls, bottlenecks and candidate solutions; each was then measured
or researched. Two results **correct earlier conclusions in this repo** — they are marked.

### Tier 1 — could reshape the plan

**1. Does the root facade stay free at scale? YES.** Previously measured at 3–4 entry points only.
Fixture `.claude/local/scale-probe/`: 61 entry points (60 components + core), root `public-api.ts`
re-exporting all of them, an app with one eager component and two lazy routes.

| Consumer imports | Initial | Total | JS files | In the initial bundle |
| --- | --- | --- | --- | --- |
| **root facade** | 114 436 B | 269 452 B | 4 | only the eager component |
| **deep specifiers** | 114 436 B | 269 452 B | 4 | only the eager component |

Byte-identical, down to the chunk hash `chunk-24W5R2VQ.js`. The 49 unused components are gone
entirely. **"No consumer changes an import" now holds at 61 entry points, not just 3.**

**2. Can `theme` and `config` be zero-cost entry points? `theme` yes, `config` no.**
`provide-ds-theme.ts` imports only `@angular/core` and `@angular/common` — a true leaf, so
`provideDsTheme()`, the anchor sitting in every consumer's documented setup, becomes nearly free.
`ds-config.ts` cannot: it sits in a strongly-connected component with `core` and `icons` — see 3.

**3. Do type-only cross-entry imports need rewriting? YES — and this CORRECTS §11(b) of
`packaging-chunking-audit.md`.** Tested: a relative, `import type`-only import across an entry-point
boundary fails exactly like a runtime one, with the same
`Cannot destructure property 'pos' of 'file.referencedFiles[index]'`. ng-packagr treats an erased
import as an entry-point dependency, so the refactor is **318 rewrites, not 249**.

The consequence is larger than the count. The A0(b) cycle analysis excluded type-only edges and
reported two trivial cycles. **Re-run with them included, there is a third SCC of size four:**

```
components/card, config, core, icons

config/ds-config.ts               -> components/card/card.types.ts  (type: CardElevation, CardPadding)
config/ds-config.ts               -> core/size.ts                   (type: DsSize)
config/ds-config.ts               -> icons/icons.data.ts            (type: IconName)
core/config-defaults.ts           -> config/ds-config.ts
components/card/card.component.ts -> core/config-defaults.ts
core/option.ts                    -> icons/icons.data.ts
icons/icon.component.ts           -> core/config-defaults.ts
```

Every edge *out of* `ds-config.ts` is a type import, so the cycle exists because the config reaches
back into the modules that depend on it — not because of any runtime need. `components/card` is
dragged into the core by a single type import.

**The fix is cheap and improves the design regardless:** a leaf `types` module owning `IconName`,
`DsSize`, `CardElevation` and `CardPadding`, plus splitting `icons.data` (the map) from
`icons/icon.component`. Then `types` and `icons-data` are leaves, `config -> types + icons-data`,
`core -> config`, `icon.component -> core`, and `card` becomes an ordinary leaf component with its
own entry point.

### Tier 2 — costs and dev-loop risks

**4. Build time: a non-issue.** The same 61 components built two ways — **61 entry points 9 s**,
single entry point **5 s**. Each entry is tiny, so ngc is fast on it. Our real library builds
single-entry in ~7 s, so expect low teens at 77 entries.

**5. The `ds-docs` dev loop needs a generated paths map.** `tsconfig.json` currently maps
`"ds": ["./src/public-api.ts"]`. After the split the facade re-exports public specifiers, which must
resolve to *source* during docs development — one `paths` entry per entry point, ~77 of them. Every
`from 'ds'` in `ds-docs` keeps working through the facade, so no docs import changes. Generate the map
from disk, the way `tokens.generated.ts` and `component-api.generated.ts` already are, so it cannot
drift from the folder layout.

**6. Chunk explosion and duplication: neither.** Eight lazy routes with deliberately overlapping
component sets (route *i* uses components *3i…3i+5*; union 27 of 60):

| Library shape | Initial | Total | JS files | Components in the initial bundle |
| --- | --- | --- | --- | --- |
| one entry point | **517 674 B** | 518 827 B | 10 | **all 27** |
| one entry per component | **115 345 B** | 520 039 B | 18 | **1** |

**Initial −78%. Total within 1 212 B — 0.2%.** The same bytes are redistributed across 18 files
instead of concentrated in one eager chunk; there is no duplication penalty. 10 → 18 files for eight
routes is not the "chunk explosion" the esbuild issue describes, and over HTTP/2 the file count does
not matter.

### Tier 3 — independent wins, priced

**7. Splitting the icon map: NOT worth it.** `ICONS` is one const map of **86** icons (115 was a
typo carried down from the 115 345 B figure above; the map has held 86 at every tag back to
v0.10.0). Cut to 9 on
`probe/icons-map` and re-measured: `ds-button` 62 733 → **60 211 B gzip**. **The entire icon set is
2 522 B gzip** — SVG path strings compress to almost nothing. Per-icon exports would break
`IconName = keyof typeof ICONS` and `provideDsIcons` for at most ~2.3 kB. Hypothesis closed.

**8. A FIFTH of the global stylesheet is component-specific, and it is worth about half what this
section first said.** `styles/ds.scss` compiles to 58 293 B min / 10 282 B gzip (59 356 / 10 391 at
HEAD; four theme commits landed 2026-09-02). The component-ish partials are **11 703 B min** of it —
**19.7%, a fifth, not a third**.

**The gzip figure was wrong and is CORRECTED 2026-09-02 to 2 156 B.** The 3 409 B first published
here is the SUM of the ten partials gzipped SEPARATELY, and gzip is not additive. Minified bytes
are, which is why the 11 703 stands. Three different things, measured:

| what is measured | gzip |
| --- | --- |
| the ten partials gzipped separately, then added | 3 409 B |
| the ten partials gzipped as one concatenation | 2 568 B |
| **`ds.scss` with the ten `@forward` lines removed, ablated** | **2 156 B** |

The ablation is the right method because these do not ship as ten files: they ship inside one
stylesheet, sharing a compression dictionary with the other eleven partials as well as each other.
Removing them is exactly the change this item proposes, so measuring that removal is the prize.

| Partial | min | gzip | |
| --- | --- | --- | --- |
| `dropdown-overlay` | 4 346 | **1 043** | portaled panels: select, autocomplete, date-picker, menu |
| `overlay-motion` | 1 829 | 458 | portaled |
| `link` | 1 685 | 533 | |
| `page-grid` | 1 079 | 312 | |
| `scrollbar` | 774 | 297 | |
| `surface-motion` | 751 | 192 | |
| `layout-utils` | 706 | 184 | |
| `skeleton-shimmer` | 337 | 207 | |
| `icon-base` + `toast-overlay` | 196 | 183 | portaled |

A consumer rendering one button ships **2.1 kB** gzip of dropdown, toast and skeleton CSS. About
**1 018 B** of it (`link`, `page-grid`, `scrollbar`, `surface-motion`, `layout-utils`,
`skeleton-shimmer`, `icon-base` — ablated together, published as ~1.8 kB until 2026-09-02) could move
into the components' own SCSS, where it inlines into the
component definition and tree-shakes with it. The remaining **1 055 B** (published as ~1.6 kB, and as
1 592 B on decks 9 and 10) styles portaled panels, which
render outside the component's DOM and so cannot be component-scoped — but those can become **opt-in
global imports** (`@use 'styles/dropdown-overlay'`), so only a consumer using pickers pays.

**9. `@angular/cdk/overlay` is 17.3 kB gzip — about a third of the post-A3 eager cost.** Measured
alone: 159 434 B raw / 48 375 B gzip against bare Angular's 92 686 / 30 646. The services closure
measures 56 129 B gzip over bare Angular, so CDK is **~32%** of it. CDK already ships per-feature
entry points and is a peer dependency, so there is nothing to optimise — this is the floor A3 lands on.

**Read 17 729 B as a FLOOR on CDK's share, not the share.** `scenarios/cdk_only.ts` retains `Overlay`
plus a global position strategy and a backdrop. The services closure additionally retains
`@angular/cdk/portal` and `cdkTrapFocus` from `@angular/cdk/a11y` — `packaging-chunking-audit.md`
§"(a)" says so itself (`modal.service.ts` → `ModalConfirmComponent` → `CdkTrapFocus`) — plus flexible
connected positioning. `src/lib` imports four CDK entry points in all: overlay (12 statements),
portal (11), a11y (7), drag-drop (1). Nothing measured the closure's CDK subset directly, so the
true share is above 31.6% and unmeasured.

### Tier 4 — guardrails and solutions worth adopting

**10. The cryptic build failure can become a lint error.** `sheriff.config.ts` already exists, scoped
to `ds-docs/src/**` and explicitly *not* to `src/lib`. Sheriff's deep-import prevention is exactly the
guard needed: declare each component folder a module, and any import into another module's internals
is flagged. Independently, `eslint-rules/` already hosts a local plugin with three custom rules, so a
targeted "no relative import crossing a component-folder boundary" rule is a small, well-precedented
alternative. Either turns the worst execution risk — a missed rewrite reading as a broken toolchain —
into a checked rule. Angular's guidance confirms the constraint: imports crossing entry-point
boundaries must be specified by package name or the library build can fail.

**11. A curated `prototype` entry point.** Once entry points exist, one extra entry re-exporting a
light, opinionated set answers the original basic/advanced ask at zero cost — no second package, no
mirror, nothing duplicated. Worth proposing when A3 lands.

**12. A bundle-size gate in CI.** The ladder in `.claude/local/bundle-probe/` is already the
measurement; running it as a check would stop this regressing silently, which is how the current
state arose in the first place.

**13. The auto-update plugin may need to express import-path moves.**
`/design-system:auto-update-package` rewrites consumer code across versions. If a later change moves a
symbol between entry points, the migration format has to say so. Nothing to do while the root stays a
facade — every symbol is still importable from the root — but worth checking before any entry point
becomes the *only* path to a symbol.

## Six residual questions, closed (2026-09-01)

The last pass over what was still open. Two of these **correct earlier entries in this document** and
one found the single exception to "no consumer changes an import".

### C. Is the component-specific CSS shipped twice? No — and this CORRECTS item 8 above

Item 8 claimed ~1.8 kB gzip of the global sheet could "move into the components' own SCSS". Checked
what those partials actually define, and that is wrong for almost all of them:

| Partial | gzip | What it is | Can it move? |
| --- | --- | --- | --- |
| `link` | 533 | the **public** `.link` helper class for inline anchors in prose, documented as consumer API | no — it is API |
| `page-grid` | 312 | the **public** `.page-grid` class | no |
| `layout-utils` | 184 | the **public** `.grid-2` family | no |
| `scrollbar` | 297 | styles `html` and `::-webkit-scrollbar` — document level | impossible |
| `skeleton-shimmer` | 207 | deliberately one `:root` animation so every skeleton stays in lock-step | no, by design |
| `surface-motion` | 192 | `@keyframes ds-fade-in` / `ds-scale-in`; emulated encapsulation renames keyframes, which would break cross-component reference | no |
| `dropdown-overlay` | 1 043 | portaled panels, rendered outside the component's DOM | opt-in only |
| `overlay-motion` + `toast-overlay` | 549 | same | opt-in only |
| `icon-base` | 92 | `.icon` used inside components | yes, but 92 bytes |

**So the real lever is only making the portaled group (~1.6 kB gzip) opt-in**, and even that pays only
a consumer with no pickers, toasts or modals — rare. The prize is about HALF what item 8 reported:
1 055 B of 2 156 B measured by ablation (published as a third of 3 409 B until 2026-09-02, which was
47% even on those figures).

**No double-shipping**, which was the other thing worth checking: `press` (used by 20 component
stylesheets), `text-clip` (10) and `chip-row` (2) are mixin libraries that components `@use`, and they
are **not** forwarded by `ds.scss`. That pattern is already correct.

### H. Name collisions in a 77-way facade? None

131 exported declarations in the published `.d.ts`; the only repeated name is `DsConfig`, which is an
interface and an injection token in the same file — normal TypeScript, not a conflict. The current root
already does `export *` from every module and compiles, so the facade at 77 entry points carries
exactly the names it carries today. Closed by construction.

### B. The ceiling on the directive split: 18.9 kB < X < 31.0 kB, bounded rather than measured

Extending the ablation to row actions and inline cell editing was attempted on a throwaway branch and
abandoned after several rounds of imprecise line-range edits. It is not needed: the first ablation took
`ds-table`'s marginal cost from **31.4 kB to 12.1 kB**, and row actions and inline editing live inside
that remaining 12.1 kB. So the maximum additional saving is 12.1 kB and the realistic figure is a
fraction of it — sorting, selection, pagination, loading, sticky header and cell rendering all stay.
**18.9 kB is the floor, 31.0 kB the hard ceiling.** Precision here changes no decision.

### A. What the seam itself costs: a FIXED 923 B gzip

The open question behind A1 — does the contribution-registry seam eat the prize? Fixture at
`.claude/local/seam-probe2/`: a component owning a derived value, a per-instance registry service, and
one optional feature in three shapes — inline behind an input (today), behind a separately importable
directive, and deleted outright (the ablation floor).

| Feature size | `bare` (deleted) | `mono` (inline, input off) | `seam_off` (directive not imported) | Overhead | Recovered |
| --- | --- | --- | --- | --- | --- |
| 1.6 kB gzip | 32 965 B | 34 592 B | **33 888 B** | **923 B** | 704 B |
| 5.9 kB gzip | 32 965 B | 38 901 B | **33 888 B** | **923 B** | **5 013 B** |

`seam_off` is **byte-identical at both feature sizes**. The overhead is fixed — the service, its
`providers` entry, the composition point and the extra module boundary — while recovery scales 1:1 with
the feature. For the real table, 18.9 kB of features against one registry (a few contribution kinds in
one service, call it 1–2.5 kB) means **the seam keeps ~87–95% of the prize**. The honest trade: a
consumer who *does* use the feature pays about 1 kB more than today (`seam_on − mono` = 987 B).

### F. `@defer` through the facade does not defer — the one exception to "no consumer changes an import"

| `@defer` block, component imported from | Initial | Total | JS files | In the initial bundle |
| --- | --- | --- | --- | --- |
| **the root facade** | 153 764 B | 153 764 B | **1** | the eager one **and both deferred ones** |
| **deep specifiers** | **123 467 B** | 154 617 B | 4 | **only the eager one** |

Through the facade, nothing defers at all — a single `main.js`, no chunks. This is a known Angular
issue, [angular/angular#52554](https://github.com/angular/angular/issues/52554): a component imported
from a barrel gets no lazy chunk, because the bundler treats the barrel as one module and keeps its
exports together. The fix is to import from the component's own specifier.

**Consequence for A3's documentation.** The facade is free for *route-level* laziness — a separate file
behind `loadComponent` or `await import()`, measured four times, byte-identical. It is **not** free for
`@defer` inside an eagerly-loaded template. Consumer guidance after A3 has to say: **use the deep
specifier inside a `@defer` block.** That is the only place the "no consumer changes an import" claim
has an exception, and it should be in the docs before anyone hits it.

### E. Angular 22 changes none of the assumptions

The `probe/angular-22` branch (`7de133dc`, "what it takes to build this library on 22.1.3") touches
`bun.lock`, `package.json`, three tsconfigs and one signal-forms probe file. Nothing about packaging,
entry points or the FESM layout. Nothing to revisit.

## A build-time flag CAN remove bytes — measured 2026-09-01

> Raised by Stas: *"может стоит не прокидывать конфиг билда в DS-конфиг, а делать это раньше —
> условно в package.json или angular.json или tsconfig, или создать ещё один JSON-конфиг"*.
>
> **This CORRECTS the table in "Do we have to split?" above**, which listed
> `DS_CONFIG.prototype: true` as removing **0 bytes**. That row is right about `DS_CONFIG` — a
> runtime DI value cannot be folded — but the conclusion does not generalise to every flag. A
> **build-time** flag set in the consumer's `angular.json` does remove bytes, from an already
> published FESM.

### Both mechanisms are first-class `angular.json` options

From the installed `@angular/build:application` schema:

| Option | What the schema says |
| --- | --- |
| `define` | "Defines global identifiers that will be replaced with a specified constant value when found in any JavaScript or TypeScript code **including libraries**. The value will be used directly." |
| `conditions` | "Custom package resolution conditions used to resolve conditional exports/imports. Defaults to `['module', 'development'/'production']`." |

So a consumer configures this in a build config file, not through DI — exactly the shape asked for.
`define` is the byte lever; `conditions` would let `package.json` `exports` serve a *different FESM*
per condition, which is a larger design and only sensible once entry points exist.

### `define` works, and it reaches the published FESM

Fixture `.claude/local/define-probe/`: a library built by ng-packagr with an advanced branch of 500
grep-marked lines behind a build flag, consumed by an app with three `angular.json` configurations
that differ only in `define`.

| Configuration | Raw | gzip | Advanced markers in the bundle |
| --- | --- | --- | --- |
| `full` — no `define` | 123 498 B | 34 957 B | 500 |
| `prototype` — `define: { dsPrototype: "true" }` | **99 550 B** | **32 969 B** | **0** |

**−23 948 B raw / −1 988 B gzip**, and the branch is gone from a FESM that was compiled and published
before the consumer's build ran.

### The detail that decides whether it works at all

**The guard must sit directly on the branch.** The first attempt put it behind a module-level constant:

```ts
const ADVANCED = typeof dsPrototype === 'undefined' || !dsPrototype;
// ...
if (ADVANCED) { /* heavy */ }
```

That produced **500 markers in every configuration** — no saving. `define` had applied (the identifier
`dsPrototype` went from 2 occurrences to 0 in the output), but esbuild did not propagate the resulting
constant through the module-scope `const` into the `if`; the emitted code was `return jf && (…)` with
`jf` a live variable. Moving the guard inline fixed it completely:

```ts
if (typeof dsPrototype === 'undefined' || !dsPrototype) { /* heavy */ }
```

The `typeof` form is required, not stylistic: a consumer who never sets `define` leaves the identifier
undefined, and a bare `if (dsPrototype)` would throw. This is precisely the `ngDevMode` idiom.

### ~~A free win available today~~ — SHIPPED 2026-09-01 in `d8eb81c0`: dev warnings cost 1.6 kB gzip in production

`devWarn` guards itself with `isDevMode()` — a **function call**, which esbuild cannot fold, so the
call sites and their message closures ship to production. Measured by stripping all 14 call sites on
`probe/devwarn`, control re-measured on the same build:

| Rung | With `devWarn` | Stripped | Saving |
| --- | --- | --- | --- |
| prototype kit + `ds-table` | 191 988 B gzip | 190 398 B gzip | **1 590 B** |
| one `<ds-button>` | 62 733 B gzip | 61 906 B gzip | **827 B** |

**And this one needs no consumer configuration at all.** The installed builder already adds
`'ngDevMode': 'false'` to esbuild's `define` whenever script optimization is on — 
`@angular/build/src/tools/esbuild/application-code-bundle.js:465`. So rewriting each call site as

```ts
ngDevMode && devWarn(() => …);
```

folds the whole statement away in every consumer's production build, dropping the closure with it.
Fourteen one-token edits for 1.6 kB gzip, and it removes dead weight rather than capability.

### Where a `define` flag earns its place, and where it does not

The byte-removal roles now overlap, so it is worth being exact about which tool does what:

| Kind of code | Right tool |
| --- | --- |
| a whole component the app never uses | **entry points** (A3) — already free via tree-shaking, entry points fix its *placement* |
| a separable feature of a component the app does use | **an opt-in directive** (A1/A2) — measured seam overhead a fixed 923 B |
| a branch *inside* code the app must ship, with no seam to hang it on | **`define`** — dev warnings, assertions, showcase-only APIs, a coarse `prototype` mode |

So `define` does not replace A1–A3; it covers the cross-cutting remainder they cannot reach. Angular
uses it for exactly that (`ngDevMode`).

### Caveats to settle before shipping a `prototype` define flag

- **The public API does not change.** In prototype mode a consumer can still bind `resizableColumns`
  and it will compile and silently do nothing. That is a footgun and needs its own dev warning —
  itself behind the flag.
- **Two configurations, two bundles, one source.** A defect that reproduces only in prototype mode is
  harder to chase, and CI would need to build both to catch it.
- **`define` values are textual substitutions.** A typo in the identifier silently means "not set",
  with no error — so the flag name wants a test that proves the branch actually disappears.
- **Retrofitting is per-branch work.** Every advanced branch needs its own inline guard, which is the
  same enumeration effort as the directive split without needing a seam. Decide per feature which of
  the two it gets, rather than doing both.
- **`conditions` is the other half of the idea and stays unexplored.** Serving a different FESM per
  resolution condition is cleaner than sprinkling guards, but it means publishing two builds of the
  library and only makes sense after A3.

## Prior art, and two things it changed (2026-09-01)

Searched deliberately rather than reasoning from first principles, after the same instinct paid off
earlier in this document. Two libraries have solved our exact problem, and one tool answers the caveat
that was open on three decks.

### AG Grid 33 went from 25 packages to 2 — the opposite of the basic/advanced proposal

AG Grid's whole feature set used to ship as separate npm packages. In v33 they **collapsed 25 packages
into two** (`ag-grid-community`, `ag-grid-enterprise`) and made features tree-shakeable *from a single
bundled package* through a module-registration API:

```js
ModuleRegistry.registerModules([ClientSideRowModelModule]);            // global
createGrid(element, options, { modules: [CsvExportModule] });          // per grid
```

Reported: grids up to **40% smaller**, and a measured **43% reduction** in one application's bundle.
Their stated second reason is maintenance — "supporting 2 packages instead of 25 means better velocity".

This is independent, large-scale confirmation of the verdict in `basic-advanced-split-audit.md`: the
industry's biggest data-grid vendor moved *away* from package-per-feature towards tree-shaking inside
one package. Registering modules globally must happen before any grid is instantiated; the per-grid
form combines with the global set.

### TanStack Table v9 makes features opt-in — and narrows the type surface with them

```ts
const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});
const table = useTable({ features, columns, data });
```

A table registers only what it uses; sorting, filtering, pagination, selection and sizing are all
opt-in, and a small table starts around 5 kB. The library itself grew 14 → 25 kB, but the average table
shrank, which is the same shape as our own measurement.

The part worth stealing is not the size: **the registered feature set controls the TypeScript surface,
so an omitted feature's API does not exist on the table.** That closes the exact footgun this document
flags elsewhere — with directives or a build flag, a consumer can still bind `resizableColumns` and
have it silently do nothing.

**But it does not transfer to Angular as-is.** An Angular component's inputs are fixed on the class;
there is no way to make `resizableColumns` conditionally absent based on what a consumer registered. So
the type-narrowing benefit is unavailable to us, and the choice between shapes is about ergonomics, not
type safety. That is worth saying plainly so nobody plans around a benefit we cannot have.

### Angular's own feature pattern is the third shape, and it is documented

Angular's `provideRouter(routes, withComponentInputBinding(), withViewTransitions())` is the same idea
expressed as a provider factory: a function returning `EnvironmentProviders`, taking feature objects
that each carry a `kind` discriminator — and the `kind` exists precisely so **invalid combinations can
be validated**. It tree-shakes, works with lazy loading, and is explicitly recommended for libraries.

One constraint decides whether it fits: `EnvironmentProviders` is cross-cast specifically to prevent
component-scope use, so this pattern is **route- or app-scoped, not per-component-instance**. Every
table under that route would get the same feature set. For a data-grid route that is usually fine, and
it is simpler than per-instance wiring — but it is a real semantic difference from directives.

### AG Grid ships CSS inside the modules; for us that carries a CSP bill

AG Grid notes that keeping CSS in the code lets it split per module, which would make our portaled
overlay styles arrive with the feature instead of needing a consumer-side opt-in import.

**The catch is Content Security Policy.** Angular injects component styles as `<style>` tags at
runtime; before Angular 16 a strict CSP needed `unsafe-inline`, and 16+ adds nonces to runtime-injected
styles. Under SSR the static build-time `<style>` tags in `index.html` carry no nonce, so a strict CSP
blocks them — and a consumer "does not have control over how libraries handle their styling". So
injecting global CSS from our own code would push a CSP and SSR burden onto every consumer. That is a
real argument against copying AG Grid here, and it should be weighed rather than assumed away.

### `moduleResolution: "node"` — WITHDRAWN 2026-09-02, the breakage is not real

> **This section claimed a measured breaking change. It was not measured, and the fixtures next to
> it contradict it.** `@arethetypeswrong/cli` is not in `package.json`, is not installed, and no
> output was ever saved — the two grids below have no artifact behind them.
>
> **Re-derived 2026-09-02 with TypeScript 5.9.3's own `ts.resolveModuleName`**, against the real
> `shape-probe` packages copied into a real `node_modules`, with `shapelib-c/does-not-exist` as a
> negative control that failed in every run:
>
> | specifier | node10 | bundler | node16 |
> | --- | --- | --- | --- |
> | `shapelib-c/button` — ng-packagr's own output, **no** `typesVersions` | ✅ | ✅ | ✅ |
> | `shapelib-b/components/button` — stub + `typesVersions` | ✅ | ✅ | ✅ |
> | `shapelib-a/button` — a hand-added alias with **no directory** | ❌ | ✅ | ✅ |
>
> Ablations isolate the cause: removing `typesVersions` from dist-B changes nothing; removing the
> **on-disk directory stubs** as well is what breaks node10; and adding a `typesVersions` to dist-A
> turns its failing alias green.
>
> **ng-packagr emits a node10 compatibility stub per entry point** —
> `dist-C/button/package.json` is `{"module": "../fesm2022/…", "typings": "../types/…"}`. node10
> ignores `exports`, finds the directory, and reads `typings`.
>
> **So: a plain multi-entry build is NOT a node10 breaking change.** `typesVersions` is required
> only for **option E** — post-build short aliases, which have no directory on disk. That is a real
> and previously unpriced cost of E, and a cost B/C/D do not carry.
>
> Untested: the stubs carry `module` + `typings` but no `main`, so a node10 `require()` would still
> fail. Irrelevant for an Angular ESM library consumed by a bundler, and it is the row `attw` would
> have covered.
>
> The original section is kept below, struck, because deck 4 and deck 6 both cite it.

### ~~`@arethetypeswrong/cli` answers the caveat that was open on three decks~~ (WITHDRAWN)

`attw` runs a published artifact through every resolution mode TypeScript supports and reports which
ones return correct types. Run against the packed artifact, not the source tree — the tarball is what
consumers get.

**Baseline, today's package:**

| Entry | node10 | node16 (CJS) | node16 (ESM) | bundler |
| --- | --- | --- | --- | --- |
| `@ids-group-ltd/ids-design-system` | 🟢 | ⚠️ ESM, dynamic import only | 🟢 | 🟢 |

**A three-entry-point build of the same shape A3 would produce:**

| Entry | node10 |
| --- | --- |
| root facade | 🥴 internal resolution error |
| every subpath | 💀 resolution failed |

~~So **A3 as planned would break a consumer on legacy `moduleResolution: "node"`**~~ — **withdrawn, see
the box above.** The mechanism described is real *if* the per-entry-point directory stubs are absent;
ng-packagr emits them, so they are not. And the "caveat carried on decks 5 and 9" is itself wrong:
`grep untested` finds it only on deck 4 and deck 6. Decks 5 and 7 never carried it.

**And it is fully fixed by a generated `typesVersions` map:**

```json
"typesVersions": { "*": { "core": ["types/…-core.d.ts"], "components/button": ["…"] } }
```

With it, every row goes green — root and all subpaths under node10. It is one more generated field in
the same build step that writes the entry points, so the cost is a few lines. **Scope corrected
2026-09-02: it is required only for option E's short aliases, not for A3 as such.**

**Recommendation beyond the fix:** add `attw --pack ./dist/ds` to the release gate. The current package
passes, so it starts green and stays a real check rather than a formality.
