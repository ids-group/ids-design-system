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

## The answer in one paragraph

Nothing is wrong with the services, the internal dependency graph, or the DI graph. Tree-shaking is
not unoptimised — it is working about as well as it can. The library declares **one** entry point, so
ng-packagr emits **one** ESM module containing all 95 components, and a module is the smallest unit a
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
all 95 components** behind a single `"."` export. So "reachable from eager" is a property of the whole
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
| the services are badly designed | **no** | a service that spawns its own overlay component is the normal shape (`MatSnackBar`, `MatDialog` do the same). Its closure is 11 of 77 groups, and behind an entry point that closure is the whole eager cost — 86.8 kB gzip, measured |
| internal dependencies are wrong / not separated | **no** | 77 groups over 254 files, runtime edges only: **exactly two cycles**, `radio ↔ radio-group` and `time-columns ↔ time-picker`, both sibling pairs that belong together. `overlay`, `config`, `theme` import nothing outside themselves; `core → config`; `icons → core`. A computed 12-group `core` seed closes on itself with nothing extra pulled in |
| the DI / inject graph is wrong | **no** | DI is a runtime concern. It touches bundling only by making a symbol reachable eagerly, and the table above shows a plain `<ds-button>` does that just as well as any injector |
| the library import is not optimised | **no** | there is exactly one specifier to import from, and it is correctly declared: `exports`, `module`, `typings`, `sideEffects: false`, partial-Ivy FESM |
| tree-shaking is not optimised | **no** | 5.6 kB entry cost; 52 unused components cost 18.2 kB; unused exports are provably dropped (`packaging-chunking-audit.md` §3 fixtures) |
| **the packaging granularity is wrong** | **yes** | one `entryFile` for 95 components. Everything above is a consequence of it |

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
`docs/secondary-entrypoints.md` on `main`, and a February 2026 guide, both current).

## The option space, with prices

| Option | What it does | Price | Eager DS cost after |
| --- | --- | --- | --- |
| **A — nothing** | consumers with all-lazy routes get the DS with route 1 rather than before it | zero | 135.7 kB gzip |
| **C — consumer-side `await import()` / `@defer`** | the consumer's eager root imports the DS lazily | none for us; costs the consumer ~50% of tree-shaking (the dynamic specifier becomes an entry point, so unused exports can no longer be dropped — measured, §3 variant C) and must be rediscovered by every consumer | ~0 eager, larger total |
| **B — one narrow services entry point** | ~~a `services` entry beside an unchanged root~~ | **impossible** — refuted 2026-08-05: the services' closure includes button, icon, spinner, modal-card, which every other component also needs, so the root would import from the services entry and ng-packagr forbids cycles between entry points | — |
| **D — layered entry points** | `core (12 groups) ← services (toast, modal) ← components (55 groups)`, root kept as a pure re-export facade | one internal refactor. **No consumer changes an import** — §10 measured `facade` and `deep` consumer variants as byte-identical down to the chunk hash | **27.8 kB gzip, −80%** |
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
- Whether the 55-group top layer wants to be one entry point or many.
- Whether `ds-docs` itself would benefit; it is a single eager app, so probably not, and it is not a
  reason to do or skip D.
