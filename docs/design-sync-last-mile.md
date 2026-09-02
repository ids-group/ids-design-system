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

**Fix:** parse `ng-content select="[x]"` per template in `gen.mjs`, emit one optional
`React.ReactNode` prop per slot, and render it as a child wrapped in an element carrying that
attribute. The templates are the source of truth, so this stays as drift-proof as the rest of the
route. This is the one change that makes the generated surface at least as good as the port's.

### P2 — the per-prop documentation is dropped

Every Angular input carries a `/** */` describing it — `CardComponent.elevation` explains that
`interactive` makes the card clickable and that unset falls back to `DS_CONFIG.card.elevation`.
`CardProps` in the generated wrappers is three bare lines. The port's declarations carried a
description per prop.

**Fix:** carry the leading doc comment from each input/output into the generated interface.
Mechanical — the comment sits immediately above the declaration `gen.mjs` already reads.

### P3 — `@replaces` is gone, so the adherence lint cannot be regenerated

The project holds `_adherence.oxlintrc.json`, 136 KB, forbidding raw `<button>`, `<input>`,
`<select>`, `<table>`, `<textarea>`, `<ul>`, `<dialog>` in favour of the DS component, plus import
restrictions. It is what actually makes the agent use the system rather than hand-rolling markup.
Its input is the port's `@replaces button` annotation, and that native-element→component mapping
exists nowhere in this repo.

**Fix:** carry the mapping as data — a `replaces` field per component in `config.json`, or a small
`replaces.json` — and generate the oxlint config from it. The mapping is short and reconstructable
from the live file, which lists every rule we ever shipped.

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

**Fix:** `.design-sync/tools/build-cards.mjs`, one artefact type at a time, verified against the
live files before anything is uploaded.

### P5 — `viewport` is not derivable

`Icon.html` declares `viewport="900x440"` and that number is in no local file. The `DesignSync`
tool's `report_validate` takes `total`/`bad`/`thin`/`variantsIdentical`/`iterations` from a
`.render-check.json`, so the skill ran a measure-and-iterate loop over rendered cards.

**Fix:** carry `viewport` as data in `config.json` per component, measured once, and omit it when
absent so the pane defaults. Reproducing the render-check loop is a separate, much larger piece of
work and is not needed to publish.

### P6 — nothing gates the agent-facing docs against the real API

`docs/Button.md` describes `subtext` alongside `icon` and `trailingIcon` as though all three were
props; only two are, the third is a slot. `check-manual-surface` verifies that a doc and a preview
EXIST for every component, not that either is accurate. These files ship as the agent's
instructions, so a wrong claim there is executed rather than read.

**Fix:** a gate that cross-checks every prop name a doc mentions in backticks against the generated
interface for that component, and every slot name against the template. Same shape as
`check-docblock-drift`.

### P7 — CI cannot publish, by design

`finalize_plan` is a permission gate bound to the user's claude.ai login, and it shows the exact
write/delete list for approval. A pipeline cannot hold that approval. So CI's job is to GENERATE and
to fail when the artefacts drift; the upload stays a local step with a human approving the path
list. Not a defect — a boundary the design has to accept.

## The diff to publish, verified live

79 components remote against 85 local: **8 new** (`AppLayout`, `AuthLayout`, `CalendarDay`,
`FieldGroup`, `FieldMessage`, `FilterBar`, `PasswordRules`, `TimeColumns`) and **2 to delete**
(`AppShell`, renamed to `AppLayout`; `Tooltip`, a directive with no element to register). Every
other remote name exists in the new bundle's 85 wrappers, so the surviving cards keep working once
the bundle is replaced.

## Order of work

1. **P1** — slots in `gen.mjs`. Until this lands, a re-sync is a regression in what the agent can
   build, however current the bundle is.
2. **P2** — carry the input docs.
3. **P4** — `build-cards.mjs` for previews, card HTML, `.jsx`, `.prompt.md`, `_ds_sync.json`.
4. **P3** — the `replaces` mapping as data, and the oxlint config generated from it.
5. **P5** — `viewport` as data.
6. **P6** — the doc-versus-API gate.
7. **P7** — wire generation into `after-release`; publishing stays manual.

A repo-local skill carrying the publish procedure is worth writing regardless, so no future session
has to rediscover the order `list → finalize_plan → write → delete` or which CSS file ships.
