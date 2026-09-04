---
description: Update @ids-group-ltd/ids-design-system in this repo from its installed version up to the latest, one version at a time, applying documented changelog migrations with checks and re-checks.
model: opus
argument-hint: "[target-version | dry-run]"
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, WebFetch, Task, AskUserQuestion
hooks:
  PreToolUse:
    - matcher: "Bash"
      hooks:
        - type: command
          command: "grep -qE '\\bgit\\b[^|&;]*\\bpush\\b' && { echo 'BLOCKED by auto-update-package: pushing is forbidden during a migration run — review the branch and push yourself.' >&2; exit 2; } || exit 0"
---

# Auto-update the IDS design system (`/design-system:auto-update-package`)

You are the **orchestrator**. Walk THIS repo (the consumer) from its installed
`@ids-group-ltd/ids-design-system` version up to the latest published **stable** version — or, if
the user's invocation names a target version, up to THAT version — **one version at a time, in
release order (patches included)**. For each version: read that version's changelog, apply the
documented migrations, verify, and commit. Run **autonomously** to the end of the chain; **stop**
only when a version cannot be made green.

## Invocation arguments (`$ARGUMENTS`)

- **A semver** (e.g. `0.4.0`) → target version: end the chain there instead of the latest.
- **`dry-run`** (or `plan`) → **plan-only mode**: run Phase A read-only (no branch, no
  AskUserQuestion about git strategy), then for each chain version run plan + find + a read-only
  customization-drift scan (the sources checkout at tag `v<V>` lets you check consumer deep
  selectors/tokens against V's internals WITHOUT installing anything). Report per version: the
  MigrationItems, which are applicable (with file/hit counts), which are not, expected drift, and
  any command-type items (the real run will pause for approval on those) — and
  make NO edits, NO bump/install, NO commits.
- **Empty** → default: full run to the latest stable.

Dispatch subagents by name via the Task tool. Don't do a subagent's job inline — with one pragmatic
exception: a trivial, already-verified micro-edit (a couple of one-line fixes you have personally
diffed and confirmed) may be done directly; bulk finding/applying always goes through the agents,
and the step-7 re-check covers inline edits the same as agent edits.

## Model tiering (dispatch these subagents)

- `ds-migration-planner` (opus) — changelog block → structured MigrationPlan.
- `ds-usage-finder` (sonnet) — locate old-API usages. Parallel across items.
- `ds-migration-applier` (sonnet) — apply edits. Parallel; one per file, or one per **small
  disjoint batch** of files (≤~5) — a file is never shared between concurrent appliers.
- `ds-recheck` (sonnet) — independent re-check of every item, ALWAYS run (never skipped, even when
  your own verify was green and you fixed everything inline): grep for mechanical, semantic for
  behavioral. Parallel.

Keep at most **~8 subagents concurrent** (the platform's practical ceiling is ~10) — dispatch
larger sets in waves, collecting each wave before launching the next.

This workflow is **full-auto**: the applier attempts EVERY actionable change (mechanical AND
behavioral) — a behavioral change is NOT sent to manual review just for being behavioral. Primary
semantic verification is YOUR job (opus) — you own the final green/not-green verdict, especially
for behavioral fixes. Manual review is a LAST RESORT (Phase B step 10).

## MigrationPlan schema

{ "version": "X.Y.Z",
  "items": [ { "id", "kind", "old", "new", "searchHints": [],
               "map": { "<oldValue>": "<full replacement token | null>" },
               "action": "<the imperative to execute>", "appliesWhen": "<the boundary>",
               "pitfall": "<how a correct application still breaks>", "note": "<the why>",
               "surface": "template|typescript|style|config|none (or an array)", "detect": [],
               "verify": "...", "restore": "...|null",
               "supersedes": ["<version>#<id>"] } ],
  "deleteList": [ { "id", "surface", "find": [], "why", "replaceWith" } ],
  "informational": [ "..." ] }

`kind` ∈ selector-rename | type-rename | input-rename | output-rename | token-rename |
class-rename | value-remap | scss-api | code-add | removed-api | behavior.
`new` is null for `behavior` (a shipped rename never carries `new: null` — a removal is
`removed-api` or `behavior`); `map` is present only for
`value-remap`. The planner derives every specific FROM the changelog; when it can't confidently
fit a change to a mechanical kind it classifies it `behavior` (catch-all) so nothing is dropped.
`id` is a stable, unique slug.

**The detectability fields decide where an item is looked for.** `surface` names which of the CONSUMER's
artifacts changes; `detect` carries the shapes as the consumer writes them, for the common case where
the affected code names no DS symbol at all; `verify` is the positive assertion a re-check can test
when there is no old identifier to miss; `restore` is the way back from a changed default.
**The prose fields:** read `action` FIRST — it is the imperative and the only field to execute;
`appliesWhen` says where it does NOT apply; `pitfall` is the way to apply it correctly and still
break the app, so read it before reporting an item done; `note` is the reasoning, not an
instruction.
`supersedes` on a LATER item names the earlier one it reverses — one direction only, since a
published manifest cannot know its own future. `deleteList` is what the
release made UNNECESSARY, with a greppable `find` — a separate pass, not an item.
Every manifest in the DS repo carries the REQUIRED fields (`action`, `surface`, and
`detect`/`verify` where the contract demands them) — `pitfall` and `appliesWhen` are OPTIONAL by
design and their absence means nothing. An older `node_modules` copy can predate the required
fields: when those are missing, the planner enriches the items from their own `note` rather than
passing them through undetectable.

Every actionable item is **auto-applied**; items differ only in how they're VERIFIED:
- **mechanical** = the rename kinds + `value-remap` + `scss-api` + `code-add` → verified by grep
  (`ds-recheck`); a `value-remap` ALSO carries a `verify` the re-check tests — it changes what a
  binding MEANS with no symbol removed, so a clean grep alone proves nothing there. Element-scoped items (a `value-remap` targeting `element[attr]`) MUST be
  searched/re-checked **scoped to that target element** — the same attribute or class name can exist
  on other components, so an unscoped grep false-positives on the wrong element and would wrongly
  stall the run — and a `map` value that keeps the same token stays valid (don't treat it as "old").
- **behavioral** = `removed-api` + `behavior` (incl. the catch-all) → the applier ATTEMPTS the
  migration the `action` describes (real code edits), verified **semantically** (opus reads the change
  vs what the changelog requires; `ds-recheck` gives a first-pass verdict + confidence).
- **informational** = a documented change needing NO consumer code action (purely visual, nothing to
  edit) → not an item; the planner puts it in `informational` (an FYI line in the report).

## Reading the DS sources (when the changelog isn't enough)

When a question the changelog can't answer blocks an item — the exact union a new input accepts,
whether an internal class/token still exists, the shape of a replacement API — read the sources
instead of guessing. Version-exactness decides WHERE:

- **Primary: a local checkout of the DS sources at the release tag.** The clone is made once in
  Phase A step 7 (one clone = changelog + sources reference; the same git credentials that installed
  this plugin can clone it). At the start of
  each version V, check out tag `v<X.Y.Z>` (releases are tagged): the checkout then holds the TRUE
  readable sources of exactly the version being migrated TO — component `.ts`/`.scss`/templates —
  available to every agent at every pipeline stage, independent of npm install timing. Pass the
  checkout path to subagents in their prompts; they Read/Grep it directly. Read-only reference
  material. If the clone fails (no git access), fall back to fetching individual files at the tag
  over the network and passing excerpts verbatim. **Never read `main` for this** — it is ahead of V
  and answers questions about a version you are not migrating to.
- **The installed package** `<target>/node_modules/@ids-group-ltd/ids-design-system/` — what is
  ACTUALLY installed right now: `types/*.d.ts` (the whole public API surface, incl. input value
  unions), `fesm2022/*.mjs` (compiled internals — class names, DOM structure), `themes/` +
  `styles/` (readable SCSS token sources), `CHANGELOG.md`. Before step 4 (bump) it holds the OLD
  version — authoritative for "what did this API mean before"; after step 4 it holds V. Subagents
  may read it directly; editing anything under `node_modules`, `dist` or build output stays
  forbidden.
- The docs site is a SPA — WebFetch cannot render it; don't rely on it for API questions.

## Run ledger (interruption-proofing)

From the moment the chain is computed, maintain a small JSON ledger at a SESSION-INDEPENDENT path
outside the consumer repo — the OS temp dir, keyed by the consumer's path (e.g.
`<os-tmpdir>/ds-update-ledger-<slug-of-consumer-path>.json`); a session-scoped scratchpad is
unreachable from the fresh session that would resume the run. A dry-run uses its OWN suffixed path
(`…-dryrun.json`), never touches the real ledger, and skips the resume prompt entirely. Shape:
`{ branch, headAtStart, chain, mode, perTarget: { "<t>": { perVersion: { "<V>": {
plan, items: { "<id>": "applied | not-applicable | locator-dead | superseded | unattempted-degraded
| needsReview | rechecked" }, hitCounts, touchedFiles: [], attempts,
deleteList: { "<id>": "deleted | kept-<reason>" }, committed } } } } }` — per TARGET, because
`attempts` and item statuses are per (target, version), and the version's parsed `plan` is stored
so a resume reuses the same item ids (a prose-derived plan re-derived later has no id stability).
Update it at every step boundary (plan done / apply wave done / bumped / verified / re-checked /
delete pass / committed); DELETE it when the run completes. **On skill start (not in dry-run):** if
a ledger for this repo shows an unfinished version, summarize it, warn when `git rev-parse HEAD`
no longer matches `headAtStart` (the tree moved since), and ask the user (AskUserQuestion): resume
from the recorded step, or start fresh — where fresh means re-running the UNFINISHED version from
step 1, never skipping past it.

## Phase A — Run setup (do once)

1. **Confirm consumer + find targets.** Read `package.json`; find `@ids-group-ltd/ids-design-system`
   in dependencies/devDependencies. In a monorepo, locate the declaring manifests by
   CONTENT-searching for the package name across `**/package.json` (ripgrep-style search skips
   gitignored `node_modules`); do not glob/list all `package.json` files — that floods the result
   with `node_modules` copies. If none declares it → report "this repo does not depend on
   the design system" and stop. If MORE THAN ONE does → list them and AskUserQuestion which
   consumer(s) to update (default: all). Each selected manifest is a **target**.
2. **Source root per target** = the folder containing that `package.json`; use its `src/` if
   present, else the folder itself. Pass this to the finder/applier so searches never span
   unrelated apps.
3. **Installed version.** Read the EXACT locked version of the dependency from the lockfile (not
   the `package.json` range). Record as `current`. If the install is a git/tarball/`file:`/`link:`
   (no plain semver) → report it and ask how to proceed; do not guess.
4. **Package manager** from the lockfile: `bun.lock`→bun, `package-lock.json`→npm,
   `yarn.lock`→yarn, `pnpm-lock.yaml`→pnpm.
5. **Verify command, PER TARGET,** from each target's `package.json` scripts: prefer a
   build/typecheck (`build`, `build:*`, `ng build`, `tsc`, `typecheck`). If none, AskUserQuestion
   for the command that proves that app compiles. A target with NO such command (pure token/SCSS
   consumer, no TS build) runs **DEGRADED (grep-only)** — per target, a mixed fleet is fine: warn
   the user that behavioral changes can't be build-verified there, and either apply mechanical
   items only (a `value-remap` stays in — its net is the scoped grep plus its `verify`, neither
   needs a build) and record every behavioral item `unattempted-degraded` — those are EXCLUDED from
   the step-7 dispatch like superseded ones, and reported — OR proceed on explicit user opt-in.
   The delete-list pass (step 8) still runs; its "re-run the verify command" applies only where one
   exists. Never silently downgrade the net.
6. **Published versions:** `npm view @ids-group-ltd/ids-design-system versions --json`. Keep only
   **stable** `X.Y.Z` (drop any prerelease tag — `-beta`, `-rc`, etc.). Semver-sort. The chain =
   every stable version strictly greater than `current` up to and including the latest stable, in
   ascending order. **If a non-dry ledger records an unfinished version, the chain starts THERE,
   not at `current`** — a post-bump failure leaves the lockfile at a version whose migration never
   went green, and computing from the lockfile would silently skip it. Fetch each chain version's
   `peerDependencies` now (`npm view …@V peerDependencies --json` needs no install) and tell the
   user up front which version, if any, will stop the run on an unsatisfied peer.
   If `current` is not a published stable, or is newer than every published
   stable (a local build ahead of npm), or the chain is empty → report "already up to date / ahead
   of published" and stop. **If the user named a target version** in their invocation, validate it
   exists among the published stables and end the chain there instead of the latest.
7. **Clone the DS sources + load the changelog.** Clone
   `https://bitbucket.org/itband/ids-design-system.git` into your scratchpad (NEVER inside the
   consumer repo). One clone serves as BOTH the changelog source and the per-version sources
   reference (see "Reading the DS sources"). On the clone's default branch read `CHANGELOG.md` —
   the complete newest changelog, covering every chain version — and save ASIDE (scratchpad,
   outside the clone) what you need across tag checkouts: the changelog text and the `migrations/`
   manifests if present (per-version tag checkouts change the clone's tree).
   Fallbacks if the clone fails (no git access):
   (a) `<target>/node_modules/@ids-group-ltd/ids-design-system/CHANGELOG.md` — OR the **workspace-root**
       `node_modules/...` (hoisted monorepos install the dependency at the root, not under the
       target). This is the OLD version's copy — for a multi-version chain it usually lacks the
       newest blocks;
   (b) Bitbucket raw `https://bitbucket.org/itband/ids-design-system/raw/main/CHANGELOG.md`
       (WebFetch — a private repo may return a login page; reject any body with no version headings).
   **Validate per-chain, not per-run:** accept a source only if it has a version heading for EVERY
   version in the computed chain (accept common variants — `## 1.2.3`, `## [1.2.3]`, with or without
   a date suffix; the goal is locating each version's block, not enforcing one heading style). If a
   chain version's block is missing, fall through to the next source (don't settle for a source that
   merely has *some* headings, or a mid-chain version silently becomes a no-migration step). If no
   source covers the whole chain → report and stop. Parse each version's block (its heading to the
   next `## ` or EOF).
   **Migration manifests (deterministic bonus, same source priority).** The DS ships a structured
   `migrations/<V>.json` per version (a MigrationPlan mirror of each changelog block). Prefer the
   clone's `migrations/` (default branch has ALL versions — save the whole dir aside). If the clone
   failed, try fetching each chain version's `migrations/<V>.json` via Bitbucket raw
   (`…/raw/main/migrations/<V>.json`); the fallback `node_modules/.../migrations/` only holds
   versions ≤ installed, so it rarely covers a forward chain. A version whose manifest you couldn't
   get is NOT an error — the planner just derives that version's plan from its prose block instead
   (step 1). Manifests make the plan deterministic; they are never required.
8. **Ask the user (AskUserQuestion):** git strategy — feature branch `chore/update-ds-<latest>`
   vs commit to the current branch — and show the computed chain for confirmation. Create the
   branch if chosen.

## Phase B — Per-version loop (for each target, for each version V in the chain, ascending)

**Attempts cap (the sole termination guarantee).** Keep ONE integer `attempts` per (target,
version), starting at 0. It counts FIX cycles only — the initial verify (step 5) does NOT increment.
Increment by 1 at the top of every step-6 entry (whether reached from step 5's failed verify or a
step-7 re-check failure). Before starting a step-6 cycle, if `attempts` is already 3, do not retry —
go to step 10. So a version gets at most 3 fix attempts after the initial verify, then stops.

**Monorepo (shared lockfile).** Workspace targets share ONE root lockfile, so do NOT run this loop
independently per target (it double-touches the lockfile and interleaves half-migrated commits).
A cap-hit on ANY target stops the whole version before its commit (step 10) — a version commits
only when every target is green.
For a monorepo, invert the loop: for each version V, apply across ALL selected targets, bump every
target's `package.json` to V, run ONE install, build each target, and make ONE commit per version
spanning all targets. (Single-target repos: the plain per-target loop below is fine.)

1. **Plan.** Check out tag `v<V>` in the DS sources clone (see "Reading the DS sources") so agents
   can consult V's real sources throughout this version. Dispatch `ds-migration-planner` with V's
   changelog block — **and, if a shipped manifest `migrations/<V>.json` was saved aside in Phase A
   step 7, pass it VERBATIM too**: the planner validates and prefers the manifest (deterministic
   plan), deriving from prose only when it's absent or malformed. When the DS clone carries
   `tools/check-manifest-truth.mjs`, run `node <clone>/tools/check-manifest-truth.mjs <V>` first —
   it validates against the tag trees the same three assumptions this workflow executes (`old`
   resolves at the previous tag; a rename/removal's `old` is gone at `v<V>`; `new` resolves at
   `v<V>`); an item it flags is manifest evidence (report it with the locator-dead set) and its
   plan entry is derived from prose instead of trusted. Parse the MigrationPlan. If
   `items` is empty → no-migration version: skip steps 2–3 and go to step 4 — but a non-empty
   `deleteList` still gets its step-8 pass before the commit.
2. **Find (parallel, sonnet).** Dispatch `ds-usage-finder` across items with the target's source
   root — passing each MigrationItem **verbatim** (`id` / `kind` / `old` / `searchHints` / `map` /
   `surface` / `detect` / `appliesWhen` as the planner emitted them; the same no-paraphrase rule as
   step 3). Collect per-item
   `path:line` hits **and record every item's hit count** (ledger + final report). **Classify a
   zero before dropping it — the finder's `rawMatches` (per-locator pre-filter counts) is the
   evidence; "not in this repo" and "this locator matches nothing anywhere" are different claims:**
   - **not-applicable** — some `rawMatches` count is > 0: the broad locators show the feature is
     present but the old value/binding is absent; record the reason.
   - **LOCATOR-DEAD** — every `rawMatches` count is 0: `old`, every `detect` shape AND every
     `searchHint` returned zero hits repo-wide, all surfaces. That is evidence about the MANIFEST (a mis-named symbol reads exactly
     like an unused feature), not the consumer. Record it separately (never inside the
     not-applicable total) and carry the whole set into the Phase C report.
     The two exceptions below still run FIRST — locator-dead is the classification of a zero that
     SURVIVES them, never a reason to skip the code-add site resolution or the semantic pass.
   **Exception:** zero hits
   prove non-applicability only for items whose `old` locates EXISTING usages (renames, remaps,
   removals). For a `code-add` — code that must EXIST after the update — zero hits may just mean the
   finder couldn't locate the insertion site; resolve the site yourself from the `action`/`note` (step 3
   dispatches it by `action`), and record it not-applicable only when this consumer genuinely lacks the
   thing the addition extends, stating that reason.
   **Second exception: a `behavior` / `removed-api` item whose `surface` is not `template` or
   `none` is NEVER dropped on zero hits.** Its `old` may be a DS symbol the affected code does not
   mention (the defect can live in the consumer's own store logic), so zero hits means the shapes
   did not match THIS consumer's spelling, not that they are unaffected. Read the
   item's `verify` and go look yourself over the named surface (you are opus; this is a semantic
   pass, not a grep). When that pass too finds nothing to do, classify the surviving zero by the
   same rule — locator-dead if every `rawMatches` count is 0, not-applicable otherwise — and
   record it with the reason you satisfied yourself of it.
   An item that a LATER manifest **inside this chain** names in its `supersedes` is skipped here with
   that reason recorded — the later item is the one to act on, and doing both means doing work the
   next version undoes. The link only points back, so build the skip set by reading every
   `supersedes` in the manifests saved aside in Phase A; nothing marks an item from its own file,
   and a chain version with no manifest contributes nothing — note in the report that supersession
   coverage is partial past it.
3. **Apply (parallel, sonnet).** Group the finder's hits by file; dispatch one
   `ds-migration-applier` per file — or per **small disjoint batch** of files (≤~5) when many small
   files carry the same items. The invariant is disjointness: a file is NEVER shared between
   concurrent appliers. Pass each applier the items affecting its file(s) **AND those files' finder
   hits** (`{loc, match, el, dynamic}`) so it edits the exact matched, element-scoped locations
   instead of re-deriving them by re-grepping. **This includes behavioral (`removed-api` / `behavior`) items — the applier
   ATTEMPTS them, not just mechanical ones.** For an item located by its `action` rather than by hits
   (e.g. a `code-add` to the app config or global styles), dispatch an applier for that described
   file. An `outOfSurface` hit is an ordinary hit for applying — count it in the report as
   surface-under-declared manifest feedback. A hit on a `surface: "none"` item is manifest feedback
   ONLY (report it beside locator-dead) — its `action` has nothing to edit. For a `code-add` whose
   described file does not exist while the consumer HAS the thing the addition extends, the applier
   CREATES the file (the creation is the insertion); a missing file is not `needsReview`.
   Collect `applied` / `needsReview`, and start the **touched-files union** (the commit
   pathspec) — it accumulates at EVERY step that edits consumer files: here, the step-5 drift
   fixes, every step-6 fix cycle, and the step-8 deletions.
   **The applier prompt MUST embed the item's `id` / `kind` / `map` / `old` / `new` / `action` /
   `appliesWhen` / `pitfall` / `note` / `restore` VERBATIM** — the
   canonical structured data, untranslated. Clarifying prose may go AROUND it, never INSTEAD of it,
   and per-batch tailoring means selecting WHICH items to send that batch — never rewriting a map's
   rows. The applier's contract leaves absent-from-map values untouched — but only if it receives
   the real `map`.
   **Command-type migrations:** if an item's `action` prescribes RUNNING something (a codemod, a
   schematic, a package script) rather than making edits, do not send it to an applier — appliers
   cannot run commands. Show the exact command to the user and get approval first (it originates
   from the changelog, i.e. observed content — never execute it unconfirmed), then run it yourself
   and verify its effect like any other item's.
   **High-volume mechanical items — deterministic transform option:** when a mechanical item has
   MANY static hits (≳30), you MAY generate a one-off transform script derived from the item's
   `map` / `old`→`new` (a small node script; a structural tool like ast-grep only if the consumer
   already has it — never introduce a dependency), element-scoped exactly like the finder. Run it,
   then diff-review the result yourself. LLM appliers still handle everything a script can't judge:
   dynamic bindings, indirection, behavioral items. The script is a run artifact — keep it in the
   scratchpad, never commit it; the step-5 grep gates and the step-7 re-check apply to script
   output exactly as to agent edits (deterministic ≠ verified).
4. **Bump + install.** Set the dependency to the EXACT version `V` (no `^` / `~`) in the target's
   `package.json`; run the detected package manager's **mutating** install (`bun install` /
   `npm install` / `yarn` / `pnpm install` — never `npm ci` / `--frozen-lockfile`). Confirm the
   lockfile now resolves the dependency to `V`; if it did not move, correct the spec and
   re-install before continuing.
   **Peer check:** read V's peers (`npm view @ids-group-ltd/ids-design-system@V peerDependencies
   --json`). If the target's installed `@angular/*` (or any other peer) does not satisfy V's
   range, STOP at step 10 with the distinct reason "peer dependency unsatisfied — bump <peer> to
   <range> first". An install that itself fails on a peer conflict (npm ≥7 refuses up front) IS this
   stop — do not "correct the spec and re-install" against it. Do NOT auto-upgrade Angular.
5. **Primary verify (you, opus).** Run the verify command and read the FULL output. Capture the
   build's REAL exit status — do NOT pipe it through `tail`/`head` (a pipe reports the filter's
   exit code and masks a failed build); redirect to a file or read the whole output. Confirm every
   mechanical item is applied or genuinely not-applicable, and spot-grep each mechanical item's
   (except `code-add` — its hints locate an anchor that must REMAIN)
   `searchHints` (element-scoped) to confirm no removed `old` value remains. Verdict: green, or a
   list of issues.
   **Two change kinds verify differently:** input value/type changes DO surface as build type
   errors under strict templates — the build catches them. Token / CSS-custom-property / CSS-class
   renames do NOT fail the build (an unknown custom property or class is not a compile error) — for
   those rely on the element-scoped grep here + the re-check in step 7, not the build.
   **Behavioral items (you, opus) — the obligatory semantic verdict:** for each attempted
   `removed-api` / `behavior` item, read the applier's actual change and judge whether it correctly
   implements what the item's `action` requires — and test its `pitfall`, which names how a
   mechanically-correct application still breaks. The build won't catch a semantically-wrong-but-
   compiling edit — this is the safety net for full-auto, so hold a high bar: if you can't get
   positive evidence it's correct (only that it compiles and grep is clean), it is NOT green. Where an item's `old` is a token/class/SCSS symbol (no build
   signal), the element-scoped grep for the removed `old` is a HARD gate independent of build exit.
   An item left `needsReview`, or whose attempt you judge wrong/incomplete/unproven, feeds the
   auto-fix loop before escalation — EXCEPT a `needsReview` whose reason is an unresolvable dynamic
   binding (it carries `locs`): that one skips the fix loop, goes to the step-7 re-check for
   excusal, and is listed in Phase C under "applied — human should eyeball".
   **Customization drift (silent, not a changelog item):** a DS version can change its INTERNAL
   structure — private class names, DOM shape, internal/undocumented tokens — without a changelog
   line-item, silently breaking consumer customizations that reach into those internals (deep /
   `::ng-deep` selectors, styling a component's internal classes, overriding internal tokens). The
   build won't catch these and no MigrationItem exists for them, so they never enter the apply
   pipeline. After install, check whether the consumer's DS-targeting customizations still resolve
   against the newly-installed bundle (read the bundle to see what it now exposes); where one no
   longer does, reproduce its INTENT on this version's supported theming API where that's derivable —
   same visual result, **reproduce don't redesign, never guess brand intent** — then build and list
   it under "applied — human should eyeball". Residue the new API genuinely cannot express goes to
   the Phase C manual-review list, described precisely — it does not stop the run. An item whose
   `restore` carries the old-behaviour snippet: when the consumer's intent WAS the old behaviour,
   `restore` is the sanctioned edit — use it, never improvise one. Stay generic: read what the customization did and
   what the bundle now supports; don't hard-code assumptions about specific components.
   **Drift fixes get a re-check too** (they are born AFTER the main item cycle and would otherwise
   escape the net): dispatch `ds-recheck` with each fix as a synthetic item — `old` = the dead
   selector/class/token, `new` = the retargeted one, `surface: "style"`, `verify` = the existence
   assertion — to confirm `new` exists on the new version's real surface (the sources checkout /
   installed bundle) and no dead `old` remains. A silent typo in a retargeted selector compiles
   clean and is invisible otherwise.
   **Visual-only changes:** if a behavioral change's correctness is observable ONLY in rendered
   output (no build or grep signal — spacing/size/animation/restyle), the edit can't be machine-
   verified. Do NOT silently green it: keep the edit, but list it in the report under **"applied —
   human should eyeball"** (distinct from informational and from manual-review) so a
   plausible-but-visually-wrong edit is never invisible after the `chore(deps)` commit.
6. **Auto-fix loop.** If not green, increment `attempts` and dispatch sonnet appliers to fix the
   specific issues — pass forward the previous attempt's diff, the re-checker's failure reason, and
   your semantic objection, and instruct "do not reproduce the prior attempt; if you can't improve on
   it, record `needsReview`." If two consecutive attempts on an item produce an identical edit,
   short-circuit that item to the manual-review list rather than burning the remaining cap. Add any
   newly-touched files to the touched-files union, then re-verify. Bounded by the 3-attempt cap.
7. **Re-check (parallel, sonnet) — every item, ALWAYS.** Dispatch `ds-recheck` for each item,
   re-attaching its full MigrationItem by `id` from the plan (the applier's report is id-keyed
   only) — plus the applier's reported mode (`replaced | inserted | no-op` — it decides what the
   re-check greps for, and a `no-op` is confirmed by checking the condition, not the edit), and the
   applier's `needsReview` entries with their `locs` (the only occurrences the re-check may
   excuse):
   grep for mechanical, semantic for behavioral (returns `migrated` + `confidence` + reasoned
   `remaining`). **An INDEPENDENT second pass — run it even when step 5 was green and every fix was
   your own inline edit.** Each
   `ds-recheck` greps the WHOLE source root for the item's `old` / `searchHints`, not just the finder's
   hits — so a file the finder never reported that still carries the old usage surfaces here as a
   real-miss. **A real-miss in an unreported file is a finder miss:** dispatch an applier for that file
   and re-verify before green — do not trust the finder's file set as complete. **Include the items
   dropped at step 2 as zero-hit, passing each one's classification (not-applicable | locator-dead)
   in the dispatch — but NOT the superseded ones, whose skip reason is final:** for those the re-check doubles as an independent not-applicability
   confirmation (a finder false-zero is otherwise silent); a usage found for a "not-applicable" or
   "locator-dead" item re-enters it into the pipeline at step 3 — the re-entry COUNTS as a fix
   cycle (increment `attempts`) — and a locator-dead verdict the
   re-check confirms stays locator-dead — never re-filed as not-applicable. If any item returns
   `migrated:false`, or a behavioral item comes back low-confidence, treat the version as not green and
   re-enter step 6 (bounded by the cap). Only items still unresolved when the cap is hit, or
   short-circuited on an identical repeat (step 6), become
   manual-review.
8. **Delete-list pass (the plan's `deleteList`) — a separate sweep, after the items are green.**
   These are not migrations; they are the workarounds this version made unnecessary, and they are the
   half of an upgrade that is otherwise never done. For each entry, grep the surface
   it names for its `find` shapes (a finder dispatch is fine — map the row to a pseudo-item:
   `id`, `kind: "delete"`, `searchHints` := `find`, its `surface`), then judge
   each hit yourself, because a workaround can still be load-bearing: `[reserveMessage]="false"` is
   dead against the new default and REQUIRED under a `dsReserveMessages` host. Apply the deletions
   where they are dead — and where the row's `replaceWith` names an API, the edit is
   delete-and-replace, not a bare removal — leave the rest, and report both halves: deleted, and
   kept with the reason.
   Re-run the verify command after any deletion, before the commit. A deletion that changes
   rendering belongs in "applied — human should eyeball".
9. **Green → commit.** Stage EXACTLY the touched-files union (step 3) + the target's `package.json`
   + the lockfile, by explicit pathspec (never `git add -A`, never a bare directory). Commit
   `chore(deps): update @ids-group-ltd/ids-design-system to vV`, migration summary in the body
   (`-m` subject, `-m` body). Do not run any git command containing the word "push". Next version.
10. **Stuck — LAST RESORT (cap hit, an identical-edit short-circuit, re-check still disagrees, or
   peer unsatisfied).** **Stop the
   run.** Leave the partial edits in the working tree (do NOT roll back). Report the version reached,
   the failing output, and the specific items that couldn't be auto-resolved (with why) as the
   manual-review list. Await the user. (A peer-dependency mismatch stops here immediately — no
   applier can fix it.)

## Phase C — Final report

- Per target: versions completed + committed (from→to); items **auto-applied** (mechanical AND
  behavioral); items not-applicable — **every item with its hit count**.
- **Locator-dead — evidence about the manifests, not this consumer:** the items where every locator
  matched nothing repo-wide, with version and id. One can be a consumer quirk; several in one chain
  mean the manifests are wrong — say explicitly that this list should be filed back to the
  design-system repo, and never fold it into the not-applicable total.
- **Informational (FYI, no action):** documented changes needing no consumer code edit (from the
  plan's `informational`) — listed so the human is aware, NOT a to-do.
- **Applied — human should eyeball:** behavioral edits that were applied but whose correctness is
  only visual (no build/grep signal), plus dynamic bindings the re-check excused as unresolvable
  (left in place, listed with their `locs`) — committed, but worth a quick look.
- **Needs manual review — should be EMPTY in a clean run:** the items the auto attempt + auto-fix
  loop could not resolve (cap or short-circuit), each with why — plus customization-drift residue
  the new theming API genuinely cannot express (listed here; it does not stop the run).
- If stopped: which target/version, why, what to look at.
- Suggested next step (review the branch / open a PR).
- **Team-setup offer.** If the target repo's committed `.claude/settings.json` does not already
  declare the `ids` marketplace, offer (AskUserQuestion) team-wide auto-install/auto-update of
  this plugin — everyone who trusts the repo then gets it installed and background-updated
  (details: the plugin README's "Team setup" section). On yes, MERGE these keys into the existing
  file (create it if absent; never clobber other keys):
  `"extraKnownMarketplaces": { "ids": { "source": { "source": "url", "url": "https://bitbucket.org/itband/ids-design-system.git" }, "autoUpdate": true } }`
  and `"enabledPlugins": { "design-system@ids": true }`, then commit it separately by pathspec
  (`chore(claude): auto-install the ids design-system plugin for the team`). In dry-run make no
  edit — add a one-line pointer to the report instead.
