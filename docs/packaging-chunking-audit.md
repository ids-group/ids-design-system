# Why one entry point puts the whole library in a consumer's initial bundle

> Audit of the packaging claim filed as a `docs/todo.md` item on 2026-08-03, re-verified
> in depth on request (Stas: "перепроверить ещё раз. глубоко. детально. и в репе mm broker.
> почему зарепортали что не тришейкается").
> Method: read the source claim in `mm-broker-platform` verbatim, traced the eager
> injector graph there against real file:line, then reproduced the bundler behaviour
> with three controlled esbuild 0.27.3 fixtures (§3) rather than reasoning from docs.
> Measured against DS `0.7.0` (`dist/ds` built 2026-07-31, FESM 1 299 530 B, 73 component
> folders, `exports` = `"."` + styles/themes/package.json only).
> **Nothing was changed in the library. This is the record for the deferred decision.**

## Verdict

The reported problem is **real and structural**, but it is **not a tree-shaking failure** —
nobody claimed it was. Tree-shaking works exactly as the 2026-07-27 verification found.
What fails is **chunk placement**: a single FESM is a single module, a module is the
bundler's atom, so the moment an *eager* consumer graph touches one DS symbol, the chunk
carrying **every** DS symbol the app uses anywhere becomes a static import of `main`.

The two properties are orthogonal, and the fixtures below show them holding
simultaneously: unused exports are dropped (tree-shaking ✅) while lazy-only exports
still land in the eager chunk (placement ❌).

## 1. What mm-broker actually reported — and what it did not

Source: `mm-broker-platform/src/frontend/todo.md` §13g, verbatim:

> **The design system is in the initial bundle of both apps**, via
> `provideCommon → NotificationService → ToastNotificationService → ToastService`.
> Measured: `main` statically imports a 631 966-byte chunk carrying 336 distinct `ds-*`
> tokens, i.e. ~88% of the 720 kB initial total. The budget passes, but
> `common/README.md`'s claim that the guarantee is "structural, not a matter of
> discipline" is false as written. Fix: bind `NotificationService` in the two lazy root
> routes' `providers`, and add a `no-restricted-imports` rule (type-imports allowed) so
> the rule is checkable.

Three things follow that the 08-03 todo item got wrong:

1. **The word "tree-shaking" never appears.** The finding is about *initial-bundle
   placement*, nothing else.
2. **It is filed as their own architecture debt, not an upstream ask.** The complaint is
   that *their* `common/README.md` overstates a guarantee. Their §13f lists what they did
   file upstream during the same review: **one** item — the `ds-checkbox` projected-caption
   gap — and states explicitly that the four MBP-133 items already filed on 2026-07-31 were
   not duplicated. There is no upstream packaging request.
3. **Their prescribed fix is consumer-side** — and it does not work (§2).

Related, same file, §7a — their own earlier measurement of the same mechanism, which is
the strongest independent evidence for it:

> Putting components in `@common`'s barrel took platform-admin's initial bundle from
> **747 kB to 885 kB**, past its 800 kB budget, because the barrel drags the CDK and the
> DS in eagerly. […] its production initial is back to 755 kB.

## 2. Verified against their code

| Claim | Status | Evidence |
|---|---|---|
| Eager chain reaches `ToastService` | confirmed | `provide-common.ts:60` `{ provide: NotificationService, useClass: ToastNotificationService }` → `toast-notification.service.ts:2,9` `import { ToastService } from '@ids-group-ltd/ids-design-system'` |
| `ToastService` is the *only* eager DS anchor | confirmed | `platform-admin/src/app/app.routes.ts` — every route is `loadComponent`/`loadChildren`, including the layout shell |
| Their own fix works | **refuted** | `GlobalErrorHandler` takes `NotificationService` as a field initializer (`global-error-handler.ts:13`) and is bound at root (`provide-common.ts:63`); `errorInterceptor` is registered root-level (`app.config.ts:54`) and injects it too (`error.interceptor.ts:59`). Binding the implementation only in lazy route `providers` leaves both resolving from the root injector → `NullInjectorError`. |
| The 631 966 B / 720 kB figures | **not reproducible from artifacts on disk** | their `dist/broker-portal` is 2026-07-23 and has no lazy chunks at all; `dist/platform-admin` is 2026-07-29 and is a dev build. No production rebuild was run — measuring in another repo was out of scope. |
| They measured 0.7.0 | **can't tell** | `package.json` *and* `package-lock.json` both pin `0.7.0` — bumped `0.6.2 → 0.6.3 → 0.7.0` on 2026-08-03, the review day (`c401942f`, `b5965305`). But the `node_modules` copy on disk is still **0.6.2** (FESM 1 113 693 B, 2026-07-23), so a local measurement without a reinstall measured 0.6.2 while CI would measure 0.7.0. Structurally identical — one entry point either way — so the mechanism is unaffected; only the byte figures are in doubt. |

## 3. The bundler experiment

Three fixtures, identical payload, differing only in module layout and import style.
Each has one tiny eagerly-needed export (`toastService`, 3 payload lines) and three heavy
ones (400 lines each): `tableComponent` and `datePickerComponent`, used **only** by a
lazy route, plus `neverUsedComponent`, used by nobody. Payload lines are uniquely
labelled so the output can be grepped to prove where each landed.

```js
// fixture generator (condensed) — payload lines are grep markers, not realistic code
const filler = (name, count) =>
  Array.from({ length: count }, (_, index) =>
    `  const ${name}Local${index} = "${name}-payload-${index}".repeat(12);\n` +
    `  sink.push(${name}Local${index});`).join('\n');
// vendor.mjs: const sink = []; + export function <name>() { <filler> return sink.length }
//   toastService(3) · tableComponent(400) · datePickerComponent(400) · neverUsedComponent(400)
// lazy.mjs:   import { tableComponent, datePickerComponent } from './vendor.mjs'
// main.mjs:   import { toastService } from './vendor.mjs'   // variant A/B
//             + document.getElementById('go').addEventListener('click',
//                 async () => (await import('./lazy.mjs')).route())
```

```
esbuild src/main.mjs --bundle --splitting --format=esm --minify --outdir=out
```

| Variant | Module layout | Eager cost | Deferred chunk | Unused export dropped |
|---|---|---|---|---|
| **A — today** | one module, static eager import | `main.js` 157 B **+ a 40.1 kb chunk it statically imports** | — | ✅ |
| **B — secondary entry points** | two modules (`services.mjs` / `components.mjs`) | `main.js` **290 B**, no chunk import | 39.9 kb, in the lazy chunk | ✅ |
| **C — consumer-side `import()`** | one module, dynamic import in the eager root | `main.js` **202 B** | **60.6 kb** | ❌ |

Grep counts inside the chunk `main` statically imports, variant **A**:

```
toast-payload       3     ← eagerly needed, correct
table-payload     400     ← lazy-route-only, in the EAGER chunk
datePicker-payload 400     ← lazy-route-only, in the EAGER chunk
neverUsed-payload    0     ← tree-shaking works
```

Variant **A** emitted `main.js` as `import{a as t}from"./chunk-ITUI43BK.js";…` — a static
import — while the lazy chunk shrank to 95 B because it re-imports its components *from
that same eager chunk*. This is the mechanism, isolated: the lazy route contributes its
components to a chunk it does not own.

Variant **B** moved the entire 39.9 kb into the lazy chunk; `table-payload` count in
`main.js` is **0**, and `neverUsed-payload` in the lazy chunk is **0** — the split costs
nothing in tree-shaking.

Variant **C** is the consumer lever the 08-03 item claimed did not exist. It does: routing
the eager root through `await import('…')` keeps `main.js` at 202 B. But making the module
a dynamic-import target turns it into an entry point, so its unused exports can no longer
be dropped — `neverUsed-payload` reappears, 400 hits, and the chunk grows 40.1 → 60.6 kb
(**+50%**). At library scale that is the difference between deferring the ~632 kB retained
set and deferring the whole 1.25 MB FESM.

**Fixtures** lived in the session scratchpad (`…/scratchpad/split-test/{make,make-split,make-dynamic}.mjs`)
and are ephemeral — the generator above is the reproducible record.

## 4. Why the 2026-07-27 verdict is not refuted

`docs/todo.md` → "Packaging — secondary entry points" states, correctly:

> Verified 2026-07-27 via a linker+esbuild pseudo-build on `dist/ds`: bundle size scales
> with imports (Button-only < 6-component subset < whole lib), so unused components ARE
> dropped by a consumer's production build.

That is true and variant A reproduces it (`neverUsed-payload: 0`). It answered "are unused
components dropped?" — a different question from "can the retained ones be placed in
different chunks?". Both answers stand.

What did fail is that section's **revisit trigger list**, which names (a) component count
roughly doubling, (b) a consumer needing route-level lazy loading of a heavy component,
(c) wanting tree-shaking independent of bundler quality. None describes what actually
happened: *one eager service import drags the whole component layer into the initial
chunk*. That trigger was missing, so the item could not fire.

## 5. Scale to the real library

If a services entry point were carved out, its closure — not the whole FESM — is what an
eager root would pay:

- `toast.service.ts` → `toast-region.component` → `toast.component` → `IconComponent` +
  `SpinnerComponent` (+ `icons.data.ts`, 9 388 B)
- `modal.service.ts` → `ModalConfirmComponent` → `CdkTrapFocus` + `ButtonComponent` +
  `ModalCardComponent`
- `BodyScrollLockService` — no component deps

Tens of kB against the reported ~632 kB. Note the closure is **not** service-only: pulling
`ModalService` necessarily pulls `Button` and `ModalCard`, so a "services" entry point is a
small slice of the component layer too, and its exact boundary is part of the deferred
design work.

## 6. Corrections owed to `docs/todo.md`

Not yet applied — they belong to the backlog-actualization pass, recorded here so they are
not lost:

1. The 08-03 item's provenance reads as an upstream report. It was not: found during the
   MBP-133 review, kept in the consumer's own backlog. Reword.
2. "**The consumer has no lever**" is false — variant C, measured. Reword to "the lever
   costs tree-shaking".
3. "the verdict is overturned" overstates it — the 07-27 reasoning holds (§4). What needs
   rewriting is the revisit-trigger list, not the finding.
4. The repo now carries **two** sections about entry points with opposite verdicts — the
   08-03 item under "Component feature gaps" and the long "Packaging — secondary entry
   points" section. Merge into one.
5. The item's one **verified-correct** claim to keep: moving the provider to a lazy route
   does not help, because the root `ErrorHandler` and root HTTP interceptor resolve from the
   root injector (§2). This is also why the consumer's own prescribed fix fails.

## 7. Options for the deferred decision

- **A — do nothing.** Defensible: the mechanism is real but the consumer's routes are all
  lazy anyway, so the DS chunk arrives with the first route; there was no upstream ask; and
  a consumer-side lever exists.
- **B — one narrow services entry point** (`ToastService`, `ModalService`,
  `BodyScrollLockService`), root `public-api.ts` kept as a facade. Non-breaking, same
  symbols, no cross-entry deep-import refactor across 73 folders. Measured to be the only
  option that fixes placement *without* losing tree-shaking. **Recommended.**
- **C — leave it to consumers.** Costs them tree-shaking (§3) and has to be rediscovered by
  every consumer.
- **D — full per-component entry points.** Ideal end state, but forces every cross-entry
  deep import through public entries — a separate large refactor.

## 8. Not verified

- The 631 966 B / 720 kB / 336-token figures are second-hand; no production build was run
  in `mm-broker-platform` (out of scope — that repo is read-only here).
- Whether ng-packagr's secondary-entry-point output preserves the measured variant-B
  behaviour end-to-end through the Angular application builder. The fixtures prove the
  bundler semantics, not the ng-packagr → builder pipeline. Verify before committing to B.

## 9. Corrections owed to the consumer report

Written into the consumer's own backlog as `mm-broker-platform/src/frontend/todo.md` §13k on
2026-08-03 — **but that file is gitignored** (`src/frontend/.gitignore:7`), so the copy there
is local to one machine and cannot be relied on. This is the durable record. Two of the five
are ours to act on and are folded into `todo.md`; the rest are the consumer's.

1. **Their prescribed fix breaks error handling** — §2 above. Theirs to act on.
2. **Their §13e is stale**: it opens "`package.json` pins `0.6.2`", but the bump landed on the
   review day (`c401942f` → 0.6.3, `b5965305` → 0.7.0) and the lockfile agrees. Its
   consequences list is already actioned (`ids-data-table.component.html:375` binds
   `(currentPageChange)`). Theirs.
3. **The sidenav rail-tooltip item they filed on 2026-07-31 describes pre-0.7.0 behaviour.**
   The mechanism it names is what `0a804cc` fixed by closing the tip on activation — that
   commit and `8c92d50` are in **v0.7.0** (2026-07-30) and absent from **v0.6.2**
   (2026-07-21), the version installed there on 07-31. **Ours** → the `todo.md` item is
   annotated, not closed: a narrower residual case survives (if navigation removes the anchor
   before `click` dispatches, the close handler never runs), so it needs a real-browser check
   on 0.7.0 first.
4. **"`ds-table` sorts DISPLAY STRINGS lexically" overstates the blast radius.** `NUMERIC =
   /^-?\d+(\.\d+)?$/` (`table.component.ts:44`) is tried before `localeCompare` (`:632-641`),
   so bare numeric columns already sort correctly; the defect is scoped to *formatted* values.
   **Ours** → the P1 item's framing is narrowed; the `sortValue` ask is unchanged.
5. **The doc nit named two symbols, one is affected** — `cellTemplateMap`
   (`table.component.ts:203`) only. Ours, already split into its own `todo.md` item.

**Two suspicions raised here and disproved — do not re-open.** (a) The consumer's page-level
`(pageChange)` bindings on `<ids-data-table>` are valid and do fire: `ds-table` declares `page`
as `model<number>(1)` (`table.component.ts:168`), whose implicit output is exactly
`pageChange`. (b) Their lockfile is not mispinned; only the on-disk install is stale.

## 10. §8 answered — measured 2026-09-01

The one thing §8 left open ("whether ng-packagr's secondary-entry-point output preserves the
measured variant-B behaviour end-to-end through the Angular application builder") was tested with
a real ng-packagr build feeding a real `@angular/build:application` build. **It does — and the
result is better than option D was credited for.**

Fixture: a three-entry library (`core` leaf; `services` and `heavy` both importing `probelib/core`
by its public specifier) plus a root entry that is a pure facade — `export * from 'probelib/core'`
and the same for the other two, no source of its own. ng-packagr built all four entry points in
dependency order without complaint and emitted four separate FESM modules (root facade: 185 B) with
a correct `exports` map. Consumer: an eager root injecting `ProbeService`, a `await import()` of a
lazy module using `HeavyComponent` (600 grep-marked payload lines).

| Variant | Library shape | Consumer imports from | `main.js` | Chunk `main` statically imports | Heavy payload in the eager chunk |
|---|---|---|---|---|---|
| **ctl** | one entry point (today) | root | 12 689 B | **118 011 B** | **600 markers** |
| **facade** | layered entries + facade root | **root specifier** | 12 917 B | 85 800 B | **0** |
| **deep** | layered entries + facade root | deep specifiers | 12 917 B | 85 800 B | **0** |

- **The control goes red.** `ctl` reproduces the reported mechanism exactly: the lazy chunk shrinks
  to 100 B because it re-imports the components from the chunk `main` already pulled.
- **Eager cost drops 118 011 → 85 800 B** — the heavy payload moves into its own 32 121 B on-demand
  chunk.
- **No tree-shaking penalty.** Total emitted JS is 130 800 B (ctl) vs 130 838 B (facade) — 38 bytes
  apart, nothing like variant C's +50%.
- **`facade` and `deep` are byte-identical, down to the chunk hash `chunk-D7RWOFTZ.js`.** This is the
  finding that matters: **a consumer keeps importing from the root specifier and still gets correct
  placement.** Option D's headline cost in §7 — "changes how every consumer imports" — is not real
  when the root is kept as a pure re-export facade. The refactor is internal to the library.

**What this does NOT prove.** Only that the pipeline and the facade shape work. Whether *this*
library partitions into acyclic entry points is a separate question — ng-packagr forbids cycles
between entry points, which is what killed option B. The top-level edges look favourable: nothing in
`core/`, `icons/`, `overlay/` or `theme/` imports a component at runtime, and the single edge that
exists — `config/ds-config.ts:4` importing `CardElevation`/`CardPadding` — is an `import type`, so it
is erased and carries no runtime dependency. The `services` layer needs only button, spinner and icon
(`toast/` and `modal/` import nothing else from `../`). A full partition of all 95 component folders
has not been attempted.

Fixture: `.claude/local/entrypoint-probe/` (gitignored) — `lib/` layered, `lib-single/` control,
`app/scenarios/{ctl,facade,deep}.ts`.
