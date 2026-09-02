# design-sync notes — @ids-group-ltd/ids-design-system
> **The React port these notes describe was deleted on 2026-09-01** — the elements route replaced it,
> and `git log -- .design-sync/react-bindings` recovers the code. This file is kept because much of it
> is route-independent and was paid for: the preview conventions, the upstream defects the porting pass
> surfaced, the toolchain pins, and the render-warning triage all still apply. Anything naming
> `react-bindings/`, `build-css.mjs`, `build-bindings.mjs` or the parity gate is history, not
> instruction.


- **Target project:** "IDS Design System" (455f9a87-1a6e-4b1d-a0e7-cf47ed772e63), created 2026-07-24. First sync ran the incremental path (project created empty this run).
- **Package manager: bun** (`bun install --frozen-lockfile`). Both `bun.lock` and `package-lock.json` exist; bun is authoritative — CI (`infrastructure/scripts/_setup.sh`) uses bun because `npm ci` fails under alpine/musl on `@emnapi/*` optional deps. Node 22 in CI.
- **No Storybook.** Zero `*.stories.*` files on `main` (stories existed only on the stale `a11y` branch). Package shape. The `ds-docs` Angular app (`ng serve ds-docs --port 4300` / `bun run build:docs`) is the repo's own showcase.
- **Visual reference:** `c:\Documents\proposals\CompanyKnwoledgeBase\ids-ds-snapshot\` — a prerendered `ds-docs` build snapshot (2026-07-24, same-day as the synced commit). ~59 component pages, tokens CSS (`styles-KQKWN7OR.css`), fonts in `media/`. Component CSS in the snapshot pages is inlined per page and Angular-scoped (`_ngcontent-*`); the unscoped truth is `src/lib/**/*.scss`.
- **Angular 21 library (ng-packagr)** — outside the React/esbuild converter envelope. The JS layer for Claude Design is authored React bindings that emit the DS's real markup/classes over the real compiled CSS; per-component truth lives in `src/lib/components/<name>/<name>.component.html|scss|ts` + `*.types.ts`.
- Repo has its own extraction tooling worth reusing: `tools/extract-tokens.mjs`, `tools/extract-component-api.mjs` (both run via `bun run extract-docs`).
- User history: originally asked to sync from the stale snapshot dir name (`ids-ds-snaphshot`); after a `git pull` redirected to the Angular repo as primary source (2026-07-24). 66 component dirs in `src/lib/components/` on main @ v0.6.2.

## Architecture of this sync (first run, 2026-07-24) — SUPERSEDED, kept as a record

> Everything in this section describes the deleted React port: the bindings, `build-css.mjs`, the
> `no portals` rule and the `react-bindings/`-relative `entry`/`cssEntry` bases. The live shape is
> in `COMMANDS.md`. Read this for how it worked, never for what to do.
- **React binding layer** at `.design-sync/react-bindings/` (durable, committed): thin React components rendering the exact Angular template markup/classes, host tags included (`ds-button` etc. as real custom elements). Built by `.design-sync/tools/build-bindings.mjs` (esbuild bundle + tsc declarations; regenerates `src/lib/icons.gen.ts` from the repo's icons.data.ts, and mirrors the DS's framework-free util modules — `color-picker.utils.ts`, `date.util.ts`, `time.util.ts` — into the gitignored `src/generated/`, so the bindings run the DS's own colour/date-mask/time logic instead of a copy of it). The public prop TYPES stay declared in the bindings: they are the contract the design agent reads out of `<Name>.d.ts`, and keeping them local is what lets the parity gate compare them against upstream.
- **CSS** built by `.design-sync/tools/build-css.mjs`: compiles `ds.scss` (global layer, verbatim) + every `*.component.scss` re-scoped from Angular emulated encapsulation onto the `ds-*` host tag (`:host`→tag, `:host-context(X)`→`X tag`, `::ng-deep`→descendant pass-through, everything else descendant-prefixed). Output `.design-sync/react-bindings/dist/ds-all.css` + fonts copied next to it. Inline-styles components are found by scanning each `*.component.ts` (today: accordion, tab as a single-quoted string, icon with ViewEncapsulation.None → unscoped).
- **No portals** in bindings: overlay/panel content renders inline inside the host tag (re-scoped CSS only matches host descendants). Previews show open states inline.
- Converter runs with `--node-modules .ds-sync/node_modules` (react 18.3.1 installed there); entry = `react-bindings/dist/index.js` (cwd-relative in config); cssEntry/docsDir package-relative to react-bindings/.
- `cfg.docsDir ../docs` = `.design-sync/docs/` — one .md per component, frontmatter `category:` = the ds-docs nav group (Actions, Forms & inputs, Navigation, Data display, Feedback & status, Overlays, Page structure, Layout).
- **Playwright pin**: cached chromium build is 1223 → playwright(-core) 1.60.0 in `.ds-sync` (1.61 pins 1228 and fails to launch).
- Package manager quirk: `bun install` does NOT install `@fontsource/*` (peer deps) — irrelevant; fonts are self-hosted at `src/lib/styles/fonts/` and referenced by `_fonts.scss`.

## Binding conventions (folded from Wave 1 learnings)
- **Uncontrolled seeding**: every stateful binding accepts its state prop WITHOUT the matching `on*Change` to seed internal state (SplitButton `open`, Segmented `value`, ToggleButton `pressed`, Input `value`) — this is how previews render static states. Passing the callback switches to fully-controlled.
- CVA plumbing (formDisabled/markTouched) is deliberately NOT ported — `disabled` prop only, everywhere.
- React <19 sets `on*` props on custom elements as properties, not listeners — event handlers go on inner real elements (e.g. RadioGroup's keydown on `.radios` div), except simple onClick on hosts (Tag) which works via React's delegation.
- `input.indeterminate` is a DOM property → ref + useEffect (Checkbox).
- Slots that collapse via CSS `:empty` must render the element with NO whitespace children when unset (Alert/Banner actions).
- `lib/Icon.tsx` takes `className`/`style` applied to the `ds-icon` host (Angular templates put scoped classes there). Older W1 workarounds (wrapper spans in Alert/Banner, cloneElement) still render correctly.
- Textarea `autosize` is pure CSS (`field-sizing: content`) — no JS port needed; freezes to rows-based in Firefox/Safari.
- Icon key names in icons.gen.ts are mixed camelCase/kebab (`chevronDown` vs `'eye-off'`) — always copy from the file.
- IconButton renders `variant`/`size` class parts unconditionally (unlike Button which omits defaults) — per the Angular sources.
- Search is flat standalone markup, NOT an Input composition.

## Preview conventions (folded from Wave 1 learnings)
- Keep a story's natural height under ~650px (default 900×700 story viewport) or request a viewport override.
- Glue text inherits `--font-sans` from the bundle's `html, body` rule; the bundle also ships docs typography utilities (`.t-overline`, `.t-h5`, `.t-s`, `.link`) — safe for realistic compositions.
- StatusDot/Badge colour variety in previews: set `--ds-status-dot-color` / `--ds-badge-bg-color` inline on a wrapper (no `[data-status]` CSS is shipped by design).
- Remote image URLs are blocked in capture; skip `imageUrl`-type stories (initials/fallback states cover visuals).
- Animations (spinner, progress indeterminate, shimmer) freeze at a frame in capture — expected, gradeable.
- SplitButton's open menu flows beside the control (`ds-popover` is `display:contents`) — fully visible, no card override needed.

## Upstream findings (report to DS maintainers someday)
- Stat: `variant="error"` never recolours `.value` — `:host(.error) .value` ties on specificity with the later `.stat .value` rule and loses on source order (stat.component.scss:19). Port is parity.
- Banner: source close button lacks an aria-label (binding adds `aria-label="Dismiss"`).
- Disabled RadioGroup leaves the group label at full strength (no `.group-label` disabled rule) — by design or gap, matches DS CSS.

## Binding conventions (folded from Waves 2–3)
- **Binding-only API extensions** (deliberate, keep on re-port): Autocomplete `query`, Pagination `sizeSelectOpen`, TimePicker `openSegment`, DatePicker `month` (deterministic visible month), BottomSheet `activeSnapIndex`, Modal `staticPreview` (mirrors the DS's own DsStaticPreview branch). All exist so static previews/designs can render open/filtered states.
- Pagination inlines an internal PageSizeSelect with ds-select markup (Select binding didn't exist yet); could delegate to Select on a future pass.
- `build-css.mjs` walks `*.component.ts` under all of `src/lib` (so `icons/` and any new directory come along) and emits each `styleUrl` sheet under EVERY referencing component's selector (Angular gives each component its own scoped copy — modal-card/modal share modal.component.scss). Inline `styles: [...]` are discovered per file, not from a list. A component whose selector or stylesheet can't be parsed is now **fatal** (exit 1) rather than a `!` line to notice: shipping a silently unstyled component is worse than a failed build. The summary line carries the counts to sanity-check (currently 81 blocks / 81 components / 0 styleless).
- Container (`ds-container`) uses `margin-inline: auto` — it shrink-wraps inside flex/grid parents; compose it in block flow.
- AppLayout height in previews/designs: set `--ds-app-layout-height` inline (defaults to viewport-ish).
- PageHeader `tabs` slot must be wrapped `<div tabs="">` (CSS `:has(> [tabs])` contract) — the binding does this internally.
- Intentionally not ported anywhere (CDK/runtime-only): outside-click/Escape close, focus traps, scroll lock, menu type-ahead, toast queue animations, Table drag resize/reorder + CSV export + popover sub-UIs (render trigger buttons only), collapsed-sidenav hover tooltip, routerLink (→ `onNavigate`/plain callbacks).
- DescriptionList's copy button is hover-revealed by DS CSS (`opacity:0` until `:host(:hover)`) — invisible in static captures, by design.

## Parity gate (`tools/check-parity.mjs`, `bun run check:design-sync`)
- **Angular drift is now detected, not prevented.** The driver's own diff tracks the React binding sources, not `src/lib/**`, so this gate does it instead: it hashes each `<x>.component.ts`/`.html` into `.design-sync/parity.json`, checks that every public `input`/`output`/`model` has its matching prop, and compares literal unions declared on both sides. Hard gate in `infrastructure/scripts/ci-pr.sh`.
- **Workflow after an upstream component change:** the gate names the changed source and the binding to diff it against. Re-port the binding, then `node .design-sync/tools/check-parity.mjs --bless` to re-record the hashes. Blessing without reading the diff defeats the whole mechanism.
- Deliberate API gaps live in `parity.json` → `allow`, keyed by the missing prop, each with a reason. Stale entries fail the gate, so the excuse list can't outlive what it excuses.
- What the gate cannot see: template markup that changed WITHOUT changing the file hash is impossible, but a re-port that is wrong in substance still passes — it only proves someone looked.

## Re-port log
- **2026-07-29, merge of `main` into this branch.** The parity gate caught two things the merge brought in. `ds-avatar` gained `seed` + `avoidHues` (OKLCH seeded tint) — ported, with `avatar-tint.ts` added to the mirrored modules so the React side runs the DS's own hashing/hue-avoidance. `ds-app-shell` was renamed to `ds-app-layout` (breaking, `e282b99`) — binding, preview, doc and the `cfg.overrides` key renamed, host class `app-shell` → `app-layout`, `--ds-app-shell-*` → `--ds-app-layout-*`. The rename also exposed a hole in the gate: a binding whose component disappears upstream was invisible to it, since the check only walked components that still exist. Fixed.

- **2026-09-01, merge of `dev` into this branch — the branch is NOT re-ported, and the gate says so.**
  A month open (0.7.0 → 0.11.1) cost **213 parity problems**: 53 of 80 bindings sit on a changed
  `.component.ts`/`.html`, 26 are missing 122 public props between them, 6 new components
  (`ds-auth-layout`, `ds-calendar-day`, `ds-field-group`, `ds-filter-bar`, `ds-password-rules`,
  `ds-time-columns`) have no binding at all, `FieldMessageState` gained `warning` on the Angular side
  only, and `react-bindings/package.json` still says 0.7.0. The version stays 0.7.0 deliberately —
  bumping it would assert a parity that does not exist, and the gate's version check is the last
  thing still telling the truth about this tree.
  **What did NOT break, and why that is the warning:** `build-css.mjs` emits 85/85 blocks and
  `build-bindings.mjs` produces `dist/index.js` — both green. A green build here means the generated
  halves regenerated, not that the hand-written half is right. Only `bun run check:design-sync`
  separates the two.
- **2026-09-01, the React port and its gate were DELETED.** The `@angular/elements` route was
  chosen after two generator fixes closed the overlay blocker (see `../MANUAL-SURFACE.md` §1), and
  the port went with `5a2115c4` / `c69bab61` — `react-bindings/`, `build-css.mjs`,
  `build-bindings.mjs`, `check-parity.mjs` and `parity.json`, 73 files. It was correct against
  0.7.0 and 213 divergences behind 0.11.x, so as a fallback it would have needed 53 components
  re-ported before it could be used: it misled rather than insured. `git log --
  .design-sync/react-bindings` returns all of it. **Everything below this line about the port, the
  parity gate or `check:design-sync` is a record of how it worked, not a description of this
  tree.**
## Re-sync risks (watch-list for the next run)
- Binding-only props (list above) must survive any re-port from upstream.
- `icons.gen.ts` regenerates from `icons.data.ts` on every build-bindings run — no drift, but new icon names only appear after a rebuild.
- Toolchain pins: repo deps via `bun install --frozen-lockfile`; the committed tools' own deps via `node .design-sync/tools/bootstrap.mjs` (esbuild, sass, postcss, react/react-dom 18.3.1, **@types/react(-dom) 19** — it also recreates the junction). Runtime 18 + types 19 is deliberate: 18.3.1 is what the design host vendors as `_vendor/react.js` (read from the live project 2026-09-01), and `inert` (accordion panel, collapsed sidenav) never landed in @types/react 18.3.x, so an `^18` types pin fails the declaration emit. The converter's own staging stays the skill's job: ts-morph, playwright(-core) **1.60.0** — pinned to cached chromium-1223.
- `react-bindings/package.json` restates the DS's `name`/`version`; the parity gate fails when they diverge from the root `package.json`. A release bump has to touch both.
- The 5-component calibration batch was first uploaded under `components/general/` and later regrouped — stale paths already deleted remotely; close-out reconciliation re-checks.

## Known render warns (triaged legitimate)
- `[RENDER_THIN] ModalCard, ModalConfirm` — their preview roots use the DS's `.modal-static` `display:contents` branch, so root offsetHeight is 0 by construction; the cards render fully (verified on sheets 2026-07-25). False positive of the height heuristic.
- `[RENDER_THIN] AccordionItem` — derived card is a single collapsed accordion row (~40px), legitimately short.
- `[TOKENS_MISSING] --error-strong, --success-strong, --warning-strong, --icon-disabled, --border-error` — upstream token gaps in the DS itself: the `[ds-color]` zone map in `_ds-color.scss` references `--<family>-strong` for status families that never define it, and `accordion-item.component.scss` uses `--icon-disabled` which nothing defines. Present in the production docs CSS too. Report upstream someday; not a sync defect.

## First-sync progress log
- Project "IDS Design System" 455f9a87-1a6e-4b1d-a0e7-cf47ed772e63, incremental path, plan approved 2026-07-24.
- Batch 1 pushed (calibration): Button, Badge, Input, Icon, Spinner — all cells graded good. NOTE: pushed under `components/general/` BEFORE docsDir regrouping landed; the regrouped paths (actions/, forms-inputs/, …) upload with the next batch and the stale `general/` paths must be deleted then (or at close-out reconciliation at latest).
