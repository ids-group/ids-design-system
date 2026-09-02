# design-sync: the last mile

Research, 2026-09-02, against the live project `455f9a87-1a6e-4b1d-a0e7-cf47ed772e63`
("IDS Design System", owner Mikhail, `canEdit: true`, last updated 2026-07-31).

Misha confirmed he updates the design system **through the CLI**, so the generated bundle is the
artefact he consumes and the upload is the delivery path. The build chain works and the bundle is
proven to load. What is missing is everything between the bundle and a published project.

## The skill is not obtainable

`/design-sync` exists on neither account, in no plugin, and in no marketplace cache — searched
`~/.claude` and `~/.claude-acc2` by name, and `installed_plugins.json`'s ten entries. The only hits
anywhere are this repo's own documents. The `DesignSync` tool's description references the skill, so
it is presumably bundled with builds we do not have.

It also could not be wired into a pipeline if we had it: a skill is instructions for a model, and
CI runs a shell. **The last mile has to become code in this repo.**

## What the published surface loses on the elements route

The route that replaced the hand-written port is the better engine — nothing drifts, everything
regenerates from source. But measured against what the port actually shipped, its published surface
is poorer in four specific ways, and three of them cost the design agent capability.

### P1 — named projection slots have no typed surface at all (the blocker)

`gen.mjs` has no notion of `ng-content`. `DsHostProps` is `children`, `className`, `style`, and no
generated interface declares a slot. In the templates there are **55 named-slot declarations across
26 components, 31 distinct names**:

| component | slots |
|---|---|
| `modal`, `modal-card` | `eyebrow`, `title-badge`, `body`, `impact`, `actions` |
| `page-header` | `breadcrumbs`, `title-badge`, `meta`, `actions`, `tabs` |
| `topbar` | `title`, `breadcrumbs`, `search`, `actions` |
| `page-footer` | `brand`, `nav`, `actions` |
| `auth-layout` | `brand`, `dsBrandName`, `dsAuthSupport` |
| `table` | `toolbar`, `empty`, `bulk-actions` |
| `app-layout` | `sidenav`, `topbar` |
| `input` | `dsInputPrefix`, `dsInputSuffix` |
| `autocomplete` | `dsAutocompletePrefix`, `dsAutocompleteSuffix` |
| `drawer` | `drawer-body`, `drawer-footer` |
| `list-item`, `sidenav-item` | `leading`/`trailing`, `icon`/`trailing` |
| `sidenav` | `brand`, `dsBrandName` |
| `stat` | `dsStatValue`, `delta` |
| `alert`, `banner`, `bottom-sheet`, `empty-state`, `toast` | `actions` |
| `accordion-item`, `dropzone`, `menu-item`, `button`, `filter-bar`, `sidenav-group` | `badge`, `hint`, `icon`, `dsButtonSubtext`, `dsFilterBarTrailing`, `ds-group-icon` |

The port declared these as node props and said which slot each fed — its `Button.d.ts` carries
`subtext?: React.ReactNode` documented as "the `[dsButtonSubtext]` slot". Ours carries neither, so an
agent reading our declarations cannot discover that a modal takes an `impact` block or a table a
`toolbar`, and TypeScript rejects the prop if it guesses. This is why the July previews that pass
`subtext` would silently render nothing against a current bundle: not because the prop was removed,
but because the elements route never had one.

**DONE** (`fc117ef8`): the generator reads `ng-content select="[x]"` per template and emits one
`React.ReactNode` prop per slot, rendered as a `display: contents` wrapper carrying the attribute —
neither a block nor an inline element is right everywhere, and a `div` inside `[dsButtonSubtext]`
would break the button's own line box. 55 slots across 26 components, six renamed where an input
already held the name: a component taking `brand` as a string and `[brand]` as markup now offers
`brand` and `brandContent`. Each doc names the attribute and, where the slot sits behind an `@if`,
the input that opens it.

Verified in a real browser against the built bundle: six slots claimed by the right internal element
(`alert` → `.a-actions`, `table` → `.toolbar-slot`, `stat` → `.value`, `button` → `.subtext-slot`,
`list-item` → `.leading`, `page-header` → `.actions`). The attribute is emitted lowercased on
purpose — React warns on any other case, HTML lowercases it regardless, and attribute names match
case-insensitively, so `[dsStatValue]` still claims a node carrying `dsstatvalue`.

**Input-gated slots work too, and one shared tick is why a probe can say otherwise.** A first probe
had `<Modal staticPreview actions={…}>` rendering nothing on React 18.3.1, which looked like the
known property-timing limitation. It was not: the same page rendered `<Table columns={[]}
rows={[]}/>`,
and `Table` requires `data`, so Angular threw NG0950. **Every element in the bundle shares one
`ApplicationRef` by design, so that exception aborted the tick the modal was waiting on.** Isolated,
the modal projects its `actions` correctly.

Measured directly on the element afterwards, all four routes agreed: setting `staticPreview` as a
PROPERTY works both before and after insertion, and the attribute route does not work at all in
either case — `observedAttributes` on `ds-modal` is
`["open","size","status","title","subtitle","dividers","close-on-backdrop","persistent"]`, and a
host-directive input is not among them because `getComponentInputs` reads the component's own inputs
only. That is also why `elements.ts` patches the accessor by hand.

The caveat worth carrying: a preview that leaves a required input unset can blank OTHER components
on
the same page. In the product each card is its own page with its own bundle instance, so the blast
radius there is one card — but a multi-component probe page is exactly where this misleads.

### P2 — the per-prop documentation is dropped

Every Angular input carries a `/** */` describing it — `CardComponent.elevation` explains that
`interactive` makes the card clickable and that unset falls back to `DS_CONFIG.card.elevation`.
`CardProps` in the generated wrappers is three bare lines. The port's declarations carried a
description per prop.

**DONE** (`fc117ef8`): every input's and output's own doc comment is carried into the generated
interface, flattened to one line. A host-directive input takes the comment from the directive that
declares it.

### P3 — `@replaces` is gone, so the adherence lint cannot be regenerated

The project holds `_adherence.oxlintrc.json`, 136 KB, forbidding raw `<button>`, `<input>`,
`<select>`, `<table>`, `<textarea>`, `<ul>`, `<dialog>` in favour of the DS component, plus import
restrictions. It is what actually makes the agent use the system rather than hand-rolling markup.
Its input is the port's `@replaces button` annotation, and that native-element→component mapping
exists nowhere in this repo.

**DONE** (`5d18f76b`): the mapping is a `replaces` field per component in `config.json`, and
`build-adherence.mjs` writes the whole config from it — 10 forbidden elements, one import
restriction, the hex/px/font rules, and a prop allowlist per component derived from `surface.json`
(so the 55 slots are allowed, which the port's own allowlist also did).

One defect found while writing it, and it would have shipped: extracting token names from
DECLARATIONS alone lost all 120 public `--ds-*` hooks, because those appear only inside the `var()`
that reads them. The knobs a consumer sets were exactly the ones missing from the list handed to the
agent. Declared plus referenced is 794.

### P4 — nothing in the repo emits the per-component artefacts

`.design-sync/tools/` holds `bootstrap.mjs` and `check-manual-surface.mjs`; `elements/tools/` holds
`gen.mjs` and `build-bundle.mjs`. None of them writes `_preview/<Name>.js`, `<Name>.html`,
`<Name>.jsx`, `<Name>.prompt.md`, `_ds_sync.json` or `_adherence.oxlintrc.json`.

All of it is recoverable from the live project, read 2026-09-02:

- **`_preview/<Name>.js`** — esbuild IIFE assigning `__dsPreview`, with two shims visible in the
  compiled output: `ds-shim:ds` resolves to `module.exports = window.IdsDs`, and `shim:react-shim`
  to `window.React` plus its own `jsx`/`jsxs`/`jsxDEV`/`Fragment`. Route-agnostic by construction,
  which is why the elements bundle drops into the existing project at all.
- **`<Name>.html`** — ONE fixed template. `Button.html` and `Icon.html` differ in exactly five
  values: the `@dsCard` `group`, its optional `viewport`, `var MODE`, `var PRIMARY`, and the
  `_preview/<Name>.js` path. Everything else is byte-identical.
- **`<Name>.jsx`** — two lines: `Object.assign(window, { Name: window.IdsDs.Name })`.
- **`<Name>.prompt.md`** — derived from `docs/<Name>.md`, all 85 of which we have.
- **`_ds_sync.json`** — bookkeeping whose fields `COMMANDS.md` already documents (`styleSha`,
  `renderHashes`, `sourceKeys`, `sourceHashes`, `keyRecipe`, `bundleSha12`).

`config.json` already holds the two inputs the card template needs — `cardMode` and `primaryStory`
for 33 components — and they match what is live: `Icon` is `cardMode: column` in the config and
`var MODE="column"` in `Icon.html`. `group` comes from each doc's `category` front matter.
`_ds_manifest.json` is NOT ours: the app compiles it from the `@dsCard` markers.

**DONE** (`6111d746`): `build-cards.mjs` writes the card, the re-export, the declaration and the
prompt for every component, and compiles each preview against the host globals. The declarations are
better than the port's: real unions rather than `unknown` (aliases are inlined by `gen.mjs`), a doc
per prop, the icon union trimmed to 15 names plus `string & {}` the way the port trimmed it, and all
55 slots.

`_ds_sync.json` is deliberately NOT written. Its hash recipes are unknown (`keyRecipe: 7`) and a wrong value is worse than a stale one: a hash that happens to match makes the next skill-driven sync SKIP a file that did change.

### P5 — `viewport` is not derivable

`Icon.html` declares `viewport="900x440"` and that number is in no local file. The `DesignSync`
tool's `report_validate` takes `total`/`bad`/`thin`/`variantsIdentical`/`iterations` from a
`.render-check.json`, so the skill ran a measure-and-iterate loop over rendered cards.

**DONE** (`f33f67a4`): all 36 measured heights were recovered from the live `_ds_manifest.json` and
carried in `.design-sync/viewports.json` — 34 of them, minus `AppShell` and `Tooltip`, which are
being deleted. A component absent from the file gets the pane's default, so `AppLayout` and the
other seven new ones need measuring once. The render-check loop is not reimplemented.

### P6 — nothing gates the agent-facing docs against the real API

`docs/Button.md` describes `subtext` alongside `icon` and `trailingIcon` as though all three were
props; only two are, the third is a slot. `check-manual-surface` verifies that a doc and a preview
EXIST for every component, not that either is accurate. These files ship as the agent's
instructions, so a wrong claim there is executed rather than read.

**DONE** (`f33f67a4`): `check-doc-api.mjs` checks every prop used in a ```tsx fence in the docs AND
in every preview, because a preview is COMPILED into a card and esbuild does not type-check — a
dropped prop renders an empty card in silence.

It found 20, and split them into two very different causes.

**Eight were the generator's fault, and this is the bigger find of the two.** `classApi` read a
class's OWN members only, so every INHERITED input was missing from every wrapper — `hint`, `error`,
`warning`, `errors`, `invalid`, `touched`, `reserveMessage` and `messageIcon` reach fifteen field
components from an internal base, and Angular publishes an inherited input on the element exactly
like an own one. The elements accepted them, the docs used them, only the wrappers denied it. **630
inputs/outputs became 769** — 139 members that no declaration named.

**The rest were written against the deleted React port and never updated.** `Popover` had an `open`
prop there and has none here; `ToastRegion` took `toasts` and `onClosed` where the Angular region
takes only `maxVisible` and the service owns its content; `DatePicker` had `month`; `Table`'s input
is `cellTemplateMap`; `MenuItem.tabbable` is a signal `ds-menu` owns through its roving tabindex, so
the doc told an agent to fight a mechanism the parent runs. Worst of them: **`ModalConfirm`'s
preview passed six props to a component that declares none** — it reads its content from an injected
`MODAL_CONFIRM_DATA` token, so `ModalService.confirm()` is the only thing that can build one.
Nothing declarative to preview, so it joins `PREVIEW_EXEMPT` and its card goes.

One limitation, recorded because the attempt failed: boolean shorthand is not checked. Accepting a
bare word turned 16 findings into 484, nearly all prose — any `>` inside a tag ends the match early
and the following sentence reads as attributes. So `<Autocomplete open>` had to be found by hand.
The gate can fail to report; it will not invent a prop.

### P7 — CI cannot publish, by design

`finalize_plan` is a permission gate bound to the user's claude.ai login, and it shows the exact
write/delete list for approval. A pipeline cannot hold that approval. So CI's job is to GENERATE and
to fail when the artefacts drift; the upload stays a local step with a human approving the path
list. Not a defect — a boundary the design has to accept.

**DONE** (`f33f67a4`): `build-design-sync.sh` now runs `check-doc-api`, then `build-cards` and
`build-adherence`, and asserts both artefacts exist and that the card count equals the preview count
— a card whose preview script is missing renders a warning instead of a component, which is how nine
of them shipped.

## The diff to publish, verified live

79 components remote against 85 local: **8 new** (`AppLayout`, `AuthLayout`, `CalendarDay`,
`FieldGroup`, `FieldMessage`, `FilterBar`, `PasswordRules`, `TimeColumns`) and **3 to delete** —
`AppShell` (renamed to `AppLayout`), `Tooltip` (a directive with no element to register), and
`ModalConfirm` (no declarative surface at all). Every other remote name exists in the new bundle's
85 wrappers, so the surviving cards keep working once the bundle is replaced.

**Nine remote cards cannot render today**, and the upload should drop their `.html` too:
`AccordionItem`, `DescriptionItem`, `ListItem`, `MenuItem`, `SidenavGroup`, `SidenavItem`, `Tab`,
`TimelineItem` and `TooltipPanel` each have a card page whose `_preview/<Name>.js` does not exist,
so the page reports `no PascalCase exports`. They are on `PREVIEW_EXEMPT` because each only ever
appears inside its parent's preview; a card was never wanted. The new build writes no page for a
component with no preview, and CI now asserts the two counts match.

## Order of work

Everything above is done — P1 and P2 in `fc117ef8`, P4 in `6111d746`, P3 in `5d18f76b`, and P5, P6,
P7 plus the inherited-input fix in `f33f67a4`.

What is left is not code:

1. **Measure the eight new components' card heights** and add them to `viewports.json`. Until then
   those cards take the pane's default and may clip.
2. **Run the upload.** `list_files` first, then a `finalize_plan` naming the writes, the three
   deletions and the nine dead `.html` pages, then `write_files` from `.design-sync/upload/`. It
   has never run, and the project is Misha's.
3. **Run the first `after-release` pipeline** - the only proof the chain works on alpine rather
   than on this machine.

A repo-local skill carrying the publish procedure is worth writing regardless, so no future session
has to rediscover the order `list → finalize_plan → write → delete` or which CSS file ships.
