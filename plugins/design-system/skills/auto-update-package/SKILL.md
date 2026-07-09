---
description: Update @ids-group-ltd/ids-design-system in this repo from its installed version up to the latest, one version at a time, applying documented changelog migrations with checks and re-checks.
model: opus
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, WebFetch, Task, AskUserQuestion
---

# Auto-update the IDS design system (`/design-system:auto-update-package`)

You are the **orchestrator**. Walk THIS repo (the consumer) from its installed
`@ids-group-ltd/ids-design-system` version up to the latest published **stable** version, **one
version at a time, in release order (patches included)**. For each version: read that version's
changelog, apply the documented migrations, verify, and commit. Run **autonomously** to the
latest version; **stop** only when a version cannot be made green.

Dispatch subagents by name via the Task tool. Never do a subagent's job inline.

## Model tiering (dispatch these subagents)

- `ds-migration-planner` (opus) — changelog block → structured MigrationPlan.
- `ds-usage-finder` (haiku) — locate old-API usages. Parallel across items.
- `ds-migration-applier` (sonnet) — apply edits. Parallel, **one per file**.
- `ds-recheck` (sonnet) — independent re-check of every item, ALWAYS run (never skipped, even when
  your own verify was green and you fixed everything inline): grep for mechanical, semantic for
  behavioral. Parallel.

This workflow is **full-auto**: the applier attempts EVERY actionable change (mechanical AND
behavioral). Primary semantic verification is YOUR job (opus) — you own the final green/not-green
verdict, especially for behavioral fixes. Manual review is a LAST RESORT (Phase B step 9).

## MigrationPlan schema

{ "version": "X.Y.Z",
  "items": [ { "id", "kind", "old", "new", "note", "searchHints": [],
               "map": { "<oldValue>": "<newValue|null|markup>" } } ],
  "informational": [ "..." ] }

`kind` ∈ selector-rename | type-rename | input-rename | output-rename | token-rename |
class-rename | value-remap | scss-api | code-add | removed-api | behavior. Actionable items come
from Breaking + Changed. `new` is null for a removal or `behavior`; `map` is present only for
`value-remap`. The planner derives every specific FROM the changelog; when it can't confidently
fit a change to a mechanical kind it classifies it `behavior` (catch-all) so nothing is dropped.
`id` is a stable, unique slug.

Every actionable item is **auto-applied**; items differ only in how they're VERIFIED:
- **mechanical** = the rename kinds + `value-remap` + `scss-api` + `code-add` → verified by grep
  (`ds-recheck`). Element-scoped items (a `value-remap` targeting `element[attr]`) MUST be
  searched/re-checked **scoped to that target element** — the same attribute or class name can exist
  on other components, so an unscoped grep false-positives on the wrong element and would wrongly
  stall the run — and a `map` value that keeps the same token stays valid (don't treat it as "old").
- **behavioral** = `removed-api` + `behavior` (incl. the catch-all) → the applier ATTEMPTS the
  migration the `note` describes (real code edits), verified **semantically** (opus reads the change
  vs what the changelog requires; `ds-recheck` gives a first-pass verdict + confidence). NOT skipped.
- **informational** = a documented change needing NO consumer code action (purely visual, nothing to
  edit) → not an item; the planner puts it in `informational` (an FYI line in the report).

**Manual review is a LAST RESORT, not a default bucket.** An item lands there only when the auto
attempt + auto-fix loop can't make it green (Phase B step 9): the build still fails, or opus can't
confirm the behavioral fix is correct after the attempts, or the change is genuinely too convoluted
to do safely. A behavioral change is NOT sent to manual just for being behavioral — it is attempted.

## Phase A — Run setup (do once)

1. **Confirm consumer + find targets.** Read `package.json`; find `@ids-group-ltd/ids-design-system`
   in dependencies/devDependencies. In a monorepo, search every `package.json` (skip
   `node_modules`) for the dependency. If none declares it → report "this repo does not depend on
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
5. **Verify command** from `package.json` scripts: prefer a build/typecheck (`build`, `build:*`,
   `ng build`, `tsc`, `typecheck`). If none, AskUserQuestion for the command that proves the app
   compiles. If the consumer has NO such command (pure token/SCSS consumer, no TS build) → declare
   the run **DEGRADED (grep-only)**: warn the user that input value/type and behavioral changes
   can't be auto-verified, and either apply mechanical items only and escalate every behavioral item
   to the report unattempted, OR proceed on explicit user opt-in. Never silently downgrade the net.
6. **Published versions:** `npm view @ids-group-ltd/ids-design-system versions --json`. Keep only
   **stable** `X.Y.Z` (drop any prerelease tag — `-beta`, `-rc`, etc.). Semver-sort. The chain =
   every stable version strictly greater than `current` up to and including the latest stable, in
   ascending order. If `current` is not a published stable, or is newer than every published
   stable (a local build ahead of npm), or the chain is empty → report "already up to date / ahead
   of published" and stop.
7. **Load the changelog** from the first source whose body actually contains version headings (a
   line matching `## <semver>`); otherwise fall through:
   (a) `<target>/node_modules/@ids-group-ltd/ids-design-system/CHANGELOG.md` — OR the **workspace-root**
       `node_modules/...` (hoisted monorepos install the dependency at the root, not under the target);
   (b) Bitbucket raw `https://bitbucket.org/itband/ids-design-system/raw/main/CHANGELOG.md`
       (WebFetch — a private repo may return a login page; reject any body with no `## <semver>`);
   (c) docs site `https://ids-ds.proto.ids-group.co.uk/` (Changelog section).
   The node_modules copy (a) is the OLD version's changelog, so for a multi-version chain it usually
   lacks the newest blocks. **Validate per-chain, not per-run:** accept a source only if it has a
   `## <semver>` heading for EVERY version in the computed chain — if any chain version's block is
   missing, fall through to the next source (don't settle for a source that merely has *some*
   headings, or a mid-chain version silently becomes a no-migration step). If no source covers the
   whole chain → report and stop. Parse each `## X.Y.Z — DATE` block (heading to the next `## ` or EOF).
8. **Ask the user (AskUserQuestion):** git strategy — feature branch `chore/update-ds-<latest>`
   vs commit to the current branch — and show the computed chain for confirmation. Create the
   branch if chosen.

## Phase B — Per-version loop (for each target, for each version V in the chain, ascending)

**Attempts cap (the sole termination guarantee).** Keep ONE integer `attempts` per (target,
version), starting at 0. It counts FIX cycles only — the initial verify (step 5) does NOT increment.
Increment by 1 at the top of every step-6 entry (whether reached from step 5's failed verify or a
step-7 re-check failure). Before starting a step-6 cycle, if `attempts` is already 3, do not retry —
go to step 9. So a version gets at most 3 fix attempts after the initial verify, then stops.

**Monorepo (shared lockfile).** Workspace targets share ONE root lockfile, so do NOT run this loop
independently per target (it double-touches the lockfile and interleaves half-migrated commits).
For a monorepo, invert the loop: for each version V, apply across ALL selected targets, bump every
target's `package.json` to V, run ONE install, build each target, and make ONE commit per version
spanning all targets. (Single-target repos: the plain per-target loop below is fine.)

1. **Plan.** Dispatch `ds-migration-planner` with V's changelog block. Parse the MigrationPlan. If
   `items` is empty → no-migration version: skip to step 4 (bump + verify only).
2. **Find (parallel, haiku).** Dispatch `ds-usage-finder` across items with the target's source
   root. Collect per-item `path:line` hits. Zero-hit items are not-applicable — record and drop.
3. **Apply (parallel, sonnet, one per file).** Group the finder's hits by file; dispatch one
   `ds-migration-applier` per file, passing it the items affecting that file **AND this file's finder
   hits** (`{loc, match, el, dynamic}`) so it edits the exact matched, element-scoped locations
   instead of re-deriving them (re-deriving reintroduces the wrong-element false-positive the finder
   exists to prevent). **This includes behavioral (`removed-api` / `behavior`) items — the applier
   ATTEMPTS them, not just mechanical ones.** For an item located by its `note` rather than by hits
   (e.g. a `code-add` to the app config or global styles), dispatch an applier for that described
   file. Collect `applied` / `needsReview`, and start the **touched-files union** (the commit
   pathspec) — it accumulates here AND across every step-6 fix cycle.
   Pass the planner's STRUCTURED item verbatim (its `map` / `old` / `new` / `note`) plus the finder's
   hits — do NOT paraphrase the migration into ad-hoc prose rules or a hand-authored value table in
   the applier prompt. Improvised prose is how a `value-remap` gets over-generalized to a value the
   `map` never listed (e.g. remapping a still-valid value that has no map entry); the applier's
   contract leaves absent-from-map values untouched, but only if it receives the real `map`.
4. **Bump + install.** Set the dependency to the EXACT version `V` (no `^` / `~`) in the target's
   `package.json`; run the detected package manager's **mutating** install (`bun install` /
   `npm install` / `yarn` / `pnpm install` — never `npm ci` / `--frozen-lockfile`). Confirm the
   lockfile now resolves the dependency to `V`; if it did not move, correct the spec and
   re-install before continuing.
   **Peer check:** read V's peers (`npm view @ids-group-ltd/ids-design-system@V peerDependencies
   --json`). If the target's installed `@angular/*` (or any other peer) does not satisfy V's
   range, STOP at step 9 with the distinct reason "peer dependency unsatisfied — bump <peer> to
   <range> first". Do NOT auto-upgrade Angular.
5. **Primary verify (you, opus).** Run the verify command and read the FULL output. Capture the
   build's REAL exit status — do NOT pipe it through `tail`/`head` (a pipe reports the filter's
   exit code and masks a failed build); redirect to a file or read the whole output. Confirm every
   mechanical item is applied or genuinely not-applicable, and spot-grep each mechanical item's
   `searchHints` (element-scoped) to confirm no removed `old` value remains. Verdict: green, or a
   list of issues.
   **Two change kinds verify differently:** input value/type changes DO surface as build type
   errors under strict templates — the build catches them. Token / CSS-custom-property / CSS-class
   renames do NOT fail the build (an unknown custom property or class is not a compile error) — for
   those rely on the element-scoped grep here + the re-check in step 7, not the build.
   **Behavioral items (you, opus) — the obligatory semantic verdict:** for each attempted
   `removed-api` / `behavior` item, read the applier's actual change and judge whether it correctly
   implements what the changelog `note` requires. The build won't catch a semantically-wrong-but-
   compiling edit — this is the safety net for full-auto, so hold a high bar: **a compiling edit is
   NOT a verified edit**; if you can't get positive evidence it's correct (only that it compiles and
   grep is clean), it is NOT green. Where an item's `old` is a token/class/SCSS symbol (no build
   signal), the element-scoped grep for the removed `old` is a HARD gate independent of build exit.
   An item left `needsReview`, or whose attempt you judge wrong/incomplete/unproven, feeds the
   auto-fix loop before escalation.
   **Customization drift (silent, not a changelog item):** a DS version can change its INTERNAL
   structure — private class names, DOM shape, internal/undocumented tokens — without a changelog
   line-item, silently breaking consumer customizations that reach into those internals (deep /
   `::ng-deep` selectors, styling a component's internal classes, overriding internal tokens). The
   build won't catch these and no MigrationItem exists for them, so they never enter the apply
   pipeline. After install, check whether the consumer's DS-targeting customizations still resolve
   against the newly-installed bundle (read the bundle to see what it now exposes); where one no
   longer does, reproduce its INTENT on this version's supported theming API where that's derivable —
   same visual result, **reproduce don't redesign, never guess brand intent** — then build and list
   it under "applied — human should eyeball". Escalate to manual review only the residue the new API
   genuinely cannot express, described precisely. Stay generic: read what the customization did and
   what the bundle now supports; don't hard-code assumptions about specific components.
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
   re-attaching its full MigrationItem by `id` from the plan (the applier's report is id-keyed only):
   grep for mechanical, semantic for behavioral (returns `migrated` + `confidence` + reasoned
   `remaining`). **Run this step unconditionally** — even when your step-5 primary verify was already
   green and even when you applied or fixed every item inline yourself. Re-check is an INDEPENDENT
   second pass, not a fallback for when you're unsure; never skip it because you're confident. Each
   `ds-recheck` greps the WHOLE source root for the item's `old` / `searchHints`, not just the finder's
   hits — so a file the finder never reported that still carries the old usage surfaces here as a
   real-miss. **A real-miss in an unreported file is a finder miss:** dispatch an applier for that file
   and re-verify before green — do not trust the finder's file set as complete. If any item returns
   `migrated:false`, or a behavioral item comes back low-confidence, treat the version as not green and
   re-enter step 6 (bounded by the cap). Only items still unresolved when the cap is hit become
   manual-review.
8. **Green → commit.** Stage EXACTLY the applier-touched files + the target's `package.json` + the
   lockfile, by explicit pathspec (never `git add -A`, never a bare directory). Commit
   `chore(deps): update @ids-group-ltd/ids-design-system to vV`, migration summary in the body
   (`-m` subject, `-m` body). Do not run any git command containing the word "push". Next version.
9. **Stuck — LAST RESORT (cap hit, re-check still disagrees, or peer unsatisfied).** Only reached
   after the auto attempt + auto-fix loop genuinely could not make the version green. **Stop the
   run.** Leave the partial edits in the working tree (do NOT roll back). Report the version reached,
   the failing output, and the specific items that couldn't be auto-resolved (with why) as the
   manual-review list. Await the user. (A peer-dependency mismatch stops here immediately — no
   applier can fix it.)

## Phase C — Final report

- Per target: versions completed + committed (from→to); items **auto-applied** (mechanical AND
  behavioral); items not-applicable.
- **Informational (FYI, no action):** documented changes needing no consumer code edit (from the
  plan's `informational`) — listed so the human is aware, NOT a to-do.
- **Applied — human should eyeball:** behavioral edits that were applied but whose correctness is
  only visual (no build/grep signal) — committed, but worth a quick visual check.
- **Needs manual review — should be EMPTY in a clean run:** ONLY the items the auto attempt +
  auto-fix loop could not resolve, each with why. These are the last-resort escalations, not every
  behavioral change.
- If stopped: which target/version, why, what to look at.
- Suggested next step (review the branch / open a PR).

## Guardrails

- One `ds-migration-applier` per file — never two appliers on the same file concurrently.
- Never `git push`; never `git add -A`; stage only the exact pathspec from step 8.
- Never edit files under `node_modules`, `dist`, or build output.
- Pin the EXACT version `V`; use a mutating install (never a frozen/CI install).
- Accept a changelog source only if its body contains `## <semver>` headings.
- Prefer `AskUserQuestion` for setup decisions (which consumer, git strategy); else run autonomously.
