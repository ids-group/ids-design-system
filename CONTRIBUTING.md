# Contributing

Maintainer documentation for the IDS Design System. This file stays in the
repository and is **not** published to npm.

## Development

This repo contains the library (`src/`) and a documentation app (`ds-docs/`). The
docs app is published live at https://ids-ds.proto.ids-group.co.uk/.

Develop on the `dev` branch (the default). `main` is release-only — it changes
only through the release flow below, which also refreshes the live docs.

```bash
npm run build:lib    # build the library into dist/ds
npm start            # serve the docs app
npm run build:docs   # build the docs app
```

A ds-docs block reaches the Claude Design project only when its template marks it
`data-claude-design`; nothing is published by default. What to mark and how many:
[`.design-sync/CARDS.md`](.design-sync/CARDS.md).

## A `>` alone on a line is deliberate — do not tidy it away

`bracketSameLine` keeps the closing bracket of a multi-attribute tag on the last attribute line, so a
lone `>` is not prettier's normal line-breaking. Where one survives — 57 sites, all of them inline
`<code>`, `<span>` or `<strong>` — it is prettier protecting RENDERED whitespace:

```html
Entrance played with <code class="t-mono-inline"> {{ preset() }} </code>.
```

`<code>` is inline, so a break between `</code>` and the `.` would print a space before the period.
Prettier hides the break inside the tag instead, where whitespace is not rendered. Close it by hand
and the next `fix:all` puts it back; force it shut and the page gains a gap before its punctuation.

The setting that would remove the last 57 is `htmlWhitespaceSensitivity: "ignore"`, and it costs more
than it buys: measured over ds-docs it drops the count 741 → 684 on its own, and pushes 101 pieces of
punctuation onto their own line — the very space it was avoiding. `bracketSameLine` alone took the
same 741 down to 57 and rendered nothing differently.

## Adding a component means adding an entry point

Every component is its own ng-packagr entry point, so a new one needs three things and the build
tells you about none of them until it fails:

1. **`src/lib/components/<name>/index.ts`** — the barrel, naming what the component publishes.
2. **`src/lib/components/<name>/ng-package.json`** — `{ "lib": { "entryFile": "./index.ts" } }`.
   This file is what makes the folder an entry point; ng-packagr finds them by globbing for it.
3. **A line in `src/lib/public-api.ts`** naming the symbols the root should re-export. The facade
   names its exports rather than re-exporting whole entry points, which is what keeps the shared
   internals off the root — so a component that is not listed there is not public.

Two rules the entry-point boundary imposes on the code itself, both gated by
`node tools/check.mjs entry-point-imports`:

- **Reaching into another entry point is a package specifier, never a relative path.** Write
  `from '@ids-group-ltd/ids-design-system/core'`, not `from '../../core/size'`. A relative path
  across the boundary compiles here and makes ng-packagr copy the target into two bundles, which
  duplicates the class.
- **The short form is for `ds-docs` and the tools, never for the library.** `ds/core` resolves in
  the editor and then ships as an unresolvable external import in the FESM, because ng-packagr
  recognises an entry-point dependency only by the exact package name.

**Entry points may not form a cycle, and a type-only import still counts.** ng-packagr resolves
through TypeScript's own module resolution, which visits `import type` as well, so two entry points
that only exchange types still fail the build. Break it by moving the smaller side inside the
larger one — an entry point IS a directory, so sibling folders cannot be co-located — or by moving
the shared declaration down into `core`.

## An icon-only control takes a 24px target

A `<button>` or `<a>` whose only content is an icon takes the pointer over at least `--hit-xs` (24px,
WCAG 2.5.8), whatever size it is drawn. One mechanism, `styles/target`:

```scss
@use '../../styles/target' as target;

.clear-btn {
  @include target.min-size;
}
```

Include it last in the rule, after the control's own `:focus-visible`. The box keeps its size, so the
layout and every fill stay as drawn: a transparent `::before`, centred on the box and
`max(100%, var(--hit-xs))` across, takes the pointer, and the focus ring is drawn on it, 24px across
under the default style. The ring follows `--focus-ring-offset`, so `[data-focus='edge']` and
`[data-focus='inset']` draw it inside the target. `$ring-on-target: false` leaves the ring on the
icon for a control a few pixels from running text; `$position: null` for one already positioned. A
control at least 24px by its own size writes `// target-size-guard: <token>, <size>` on the line
above its rule instead, or `<!-- target-size-guard: ... -->` right before a control with no class.

`node tools/check-target-size.mjs` (in `lint:all`) fails a template icon-only control that has
neither, and two controls side by side whose targets reach further into the gap between them than
the gap of their parent's rule: each target grows by half of `--hit-xs` less the box it draws. It reads static templates, so a control that is icon-only only for some inputs (a
`ds-breadcrumbs` item with an icon and no label) is covered by hand.

## Releasing

Releases follow [SemVer](https://semver.org): `fix` → patch, new backwards-compatible
features → minor, breaking changes (API or visual) → major. A new Angular major
always means a new package major. See `CHANGELOG.md` for history.

Before releasing, add your notes to the `## Unreleased` section of `CHANGELOG.md`
on `dev`. Then release one of two ways.

### Option A — one-click in Bitbucket (recommended)

In the Bitbucket UI: **Pipelines → Run pipeline → branch `dev` →** pick
`release-patch`, `release-minor`, `release-major`, or `release-beta`. CI merges
`dev` → `main`, bumps the version, stamps the CHANGELOG, commits, pushes `main` +
a `vX.Y.Z` tag, and back-merges `main` → `dev` — no local tooling needed. The tag
push triggers the `Publish to npm` pipeline, which publishes and then starts the
`after-release` pipeline — docs deploy plus the Claude Design bundle (three runs:
release, publish, after-release). `## Unreleased`
must be filled first; preflight fails the pipeline early otherwise.

### Option B — locally

Merge `dev` → `main` yourself first, then from a clean, in-sync `main`:

```bash
npm run release:patch   # 0.1.0 -> 0.1.1  bugfixes
npm run release:minor   # 0.1.0 -> 0.2.0  new components/inputs/tokens
npm run release:major   # 0.x   -> 1.0.0  breaking changes
npm run release:beta    # 0.2.0 -> 0.2.1-beta.1, then -beta.2  pre-release

git push origin main --follow-tags   # the tag push triggers CI publish
```

Each `release:*` runs preflight checks first (must be on a clean, in-sync `main`
with a non-empty `## Unreleased` CHANGELOG section, unless a stable release only promotes a
beta), bumps the version, stamps the
CHANGELOG (`## Unreleased` → `## x.y.z — date`, opening a fresh Unreleased), and
creates a `release: x.y.z` commit plus a `vX.Y.Z` git tag locally — it does **not**
publish. The tag push to Bitbucket runs `bitbucket-pipelines.yml`, which builds
`dist/ds` and publishes it through `infrastructure/scripts/publish.sh`. That script
refuses to publish if the tag does not match the built version or if the version is
already on npm.

Bypass preflight in emergencies with `SKIP_PREFLIGHT=1 npm run release:patch`.

CI auth uses two Secured repository variables: `NPM_TOKEN` (npm granular access
token, read+write on `@ids-group-ltd`, "Bypass 2FA" enabled) for publishing, and —
for the one-click pipelines only — two Bitbucket Repository Access Tokens:
`RELEASE_TOKEN` (`repository:write`, to push the bump commit, tag, and dev
back-sync) and `DOCS_DEPLOY_TOKEN` (`pipeline:write`, to start the `after-release`
pipeline after publish). Split so each carries only the scope it needs.

Manual publish (fallback, requires an authenticated npm session):

```bash
npm run publish:manual
```

Pre-releases: `npm run release:beta` (or `release-beta`) bumps a stable `x.y.z` to
`x.y.(z+1)-beta.1`, and a beta to the next counter (`-beta.2`). The matching tag publishes under
the `next` dist-tag (never `latest`) and stops there: no docs deploy, no Claude Design bundle,
because both show the version `latest` installs. A beta takes `## Unreleased` and
`migrations/unreleased.json` like any release. The next stable release MOVES every beta block and
manifest since the last stable into its own `## x.y.z` and `migrations/x.y.z.json`, so a consumer
stepping stable to stable reads each change once. Its `## Unreleased` may be empty when the stable
only promotes the beta.

## A claim about a past release is checked against that release

`migrations/<version>.json` and every `## <version>` block in `CHANGELOG.md` describe ONE version
boundary: what existed at the release before it, and what exists at it. **Today's source is evidence
for neither half**, and all three ways of being wrong read as a pass — a symbol removed two releases
later is absent from HEAD, one that never existed is also absent, and one re-introduced since is
present although the removal was correct.

```bash
git log main --oneline                        # main takes release commits only, so its log is the version list
git diff v<prev>..v<version> -- src/lib       # one version's change set
git archive v<version> src/lib | tar -xO      # the whole tree at a release, to grep
```

An `old` name must be PRESENT at the predecessor tag and ABSENT at the version's own; a `new` name
must be PRESENT at the version's own. Match on a word boundary: `--x-warn` is a prefix of
`--x-warning`, so a substring test reports that the old token survived its own rename.

**Only `## Unreleased` and `migrations/unreleased.json` are checked against HEAD**, because HEAD is
the version they describe.

Manifest-specific guidance, including the two failure shapes this catches that nothing else does, is
in `migrations/AUTHORING.md` under "Correcting a PUBLISHED manifest".

## What a release note says: what changed, and what to do

A `CHANGELOG.md` entry states what changed and what the reader does about it. It carries no
paragraph explaining why the library changed: the reader deciding whether to upgrade needs the
change and the cost, and a reason is one more thing to read past.

- A reason stays only when it changes what the reader does: "the old name is inert, so a
  declaration left behind sets nothing" tells them to search; "we split the control to share
  the value accessor" does not.
- Describing a defect is what changed, not a reason: a `### Fixed` entry says what was wrong
  and what is true now.
- A removal names what replaces it, or says nothing does.

Recognizers a reviewer can grep an entry for: a paragraph opening "This is because", "The
reason", "We", "To keep", "so that the library"; a second paragraph under a bold lead that
restates the motive.

The same rule governs a manifest item's `note` field (`migrations/AUTHORING.md`): optional,
and written only for a genuinely non-obvious reason the reader needs to act correctly - never
on every entry, and never history, archaeology or ADR-style narrative.

## Never in a published artefact

`CHANGELOG.md`, `README.md`, `design-system.md`, `components.md` and `migrations/` are
copied into the tarball, and the package publishes to the public npm registry; the
changelog is also a page on the docs site. So their reader is an external developer with
no access to this repository, our tracker, our decks or our other clients — and every
consumer reads about the others.

**`node tools/check.mjs --group release` runs once before a release, never on a branch**: it is the preflight of the cut. **`--group evidence`** (`upgrade-canary`, `render-evidence`) builds the docs twice and installs two apps, so CI never runs it: run it by hand before a release that touched rendering or the public API; `render-evidence --affected` is the branch-sized check for a rendering change.

**`node tools/check.mjs --affected` is the branch-sized run of the rest:** it runs only the checks the files changed since the merge-base with `dev` (committed, uncommitted and untracked) can move, and prints each path with the checks it chose. A path its table does not name runs the whole `lint` group.

**Run the release gates AFTER committing, not before.** `check-template-context-guard` and
`class-surface` compare `HEAD` against the last tag, so a change still sitting in the working tree
is invisible to them and they report OK.

`node tools/check.mjs changelog-lint` fails the PR gate on the mechanical half of this list. The
judgment half is yours.

**Never write, in an entry, a manifest field or a shipped comment:**

- **A consumer or client name.** Say "a consumer", "an app", "a consumer's fork". Never
  name a file inside their tree. Descriptive stand-ins ("the ports", "the field app")
  are the same disclosure with the name filed off.
- **An internal tracker key** — `MBP-…`, `PIN-…`, `MM-…`.
- **A person's name.** "Found by X testing on a phone" → "Found while testing on a phone".
- **A path outside the published tree.** `src/lib/…`, `tools/…`, `decks/…`,
  `docs/todo.md`, `.claude/…`, `migrations/AUTHORING.md`. The published tree holds
  `styles/`, `themes/`, `migrations/` and `schematics/`, plus the four root documents.
- **One of our npm scripts.** `npm run class-surface` does not exist for the reader —
  state the result, or an instruction they can follow, instead.
- **A symbol the package root does not export, or one tagged `@internal`.** The root facade is
  `src/lib/public-api.ts` and it names every export, so a name reaches a consumer only by being
  listed there. Plenty of names sit in an entry point’s `index.ts` without being API: an entry
  point has to export whatever another entry point imports, and those carry `@internal`. Naming
  either is allowed only where the text also says it is internal — a subclasser meets these names
  in their own compiler errors.
- **An internal rule id** (`M0…`), a commit hash, or `HEAD`.
- **A correction to one of our own records, as an entry of its own.** A manifest says what a
  consumer changes in THEIR code; a changelog says what changed in the library. Neither reports
  that we fixed a manifest, rewrote a note, or re-ran our own items. Correct the file so it reads
  as though it had always been right, and ship that — the reader wants the current instruction, not
  its history. Three releases in a row carried an entry of this shape before it was named here.

  When a published record turns out to have described something that never worked, one question
  settles it: **does anything the consumer DOES change?** If yes, it is an item with an `action` in
  the current release, in the library's voice — "the ring had no gap and has one now; if you set
  `--focus-ring-inner` to a colour to get one back, remove it". If no, say nothing, and correct the
  old file quietly if it still misleads. What never helps is a line announcing that our earlier note
  was wrong: where the release fixes the thing, the new entry already carries everything the reader
  acts on, and where it does not, the people at risk are the ones still on the old version, who are
  not reading this release either.

- **Decision archaeology.** How we chose, what we first believed, which alternative we
  rejected, that an earlier note of ours was wrong, that a note was added after the release.
  The line: describing the DEFECT is what a release note is for and stays — "an override
  written against the documented tokens did nothing there" is the entry. Describing OUR
  RECORD of it does not — how we found it, where we saw it break, that our own earlier
  wording was wrong. Cutting the first along with the second is the commoner mistake.
- **Our own process.** Release gates, the backlog, "the deck", "dogfooding", audits of
  our consumers, counts of our open items, self-criticism.
- **Measurement that proves we did the work.** Keep a number the reader needs to act on —
  a new default, a size that changed, a contrast floor, a before/after pair that shows
  the size of the defect. Cut the ones that only show we measured.
- **A change they cannot observe.** A docs-site-only fix is not an entry.

**Comments ship too.** `src/lib/styles` and `src/lib/themes` are copied verbatim, and a
`.ts` comment survives into the bundle with its JSDoc reaching the `.d.ts`. A component's
own `.scss` is the exception — its comments are compiled away.

Every rule above reaches those comments, archaeology included: a shipped comment saying what
a token USED to resolve to, or when a bug was fixed, is read by someone who never saw either.
State the constraint in the present tense, or say what breaks if it is ignored.

**Two rules for editing an existing entry:**

- **Excise the leak, never the entry.** A leak usually sits inside something useful. Cut
  the clause, keep the substance, then re-read the sentence and confirm it still tells
  the reader what to do.
- **Prefer a substitution to a deletion** where the fact is real but the reference is
  internal: our rule name becomes the public standard, our source path becomes the
  published specifier.

**A manifest is held to the same confidentiality bar but a different usefulness bar.**
Its reader is an agent upgrading someone else's repo, so anything that helps it FIND the
affected code stays — `old`, `searchHints` and `detect` are pooled as locators by
`migration-lint`. `changelog-lint` knows this: inside those fields, and inside a
`deleteList` entry's `find`, an unexported symbol is allowed, because a grep pattern does
not have to be importable. Every other rule still applies there — a client name in a
`searchHint` is the same leak it would be anywhere else. What does not belong in a
manifest is internal work with no consumer action: if we refactored and nobody has to do
anything, it is not a migration item.
