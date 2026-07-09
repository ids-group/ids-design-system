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
- `ds-recheck` (sonnet) — independent re-check of every item: grep for mechanical, semantic for
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
   compiles.
6. **Published versions:** `npm view @ids-group-ltd/ids-design-system versions --json`. Keep only
   **stable** `X.Y.Z` (drop any prerelease tag — `-beta`, `-rc`, etc.). Semver-sort. The chain =
   every stable version strictly greater than `current` up to and including the latest stable, in
   ascending order. If `current` is not a published stable, or is newer than every published
   stable (a local build ahead of npm), or the chain is empty → report "already up to date / ahead
   of published" and stop.
7. **Load the changelog** from the first source whose body actually contains version headings (a
   line matching `## <semver>`); otherwise fall through:
   (a) `<target>/node_modules/@ids-group-ltd/ids-design-system/CHANGELOG.md`;
   (b) Bitbucket raw `https://bitbucket.org/itband/ids-design-system/raw/main/CHANGELOG.md`
       (WebFetch — a private repo may return a login page; reject any body with no `## <semver>`);
   (c) docs site `https://ids-ds.proto.ids-group.co.uk/` (Changelog section).
   The node_modules copy (a) is the OLD version's changelog, so for a multi-version chain it will
   usually lack the newest blocks — fall through to (b) when a needed version is missing. If no
   source yields real markdown with version headings → report and stop. Parse each
   `## X.Y.Z — DATE` heading's block (heading through the next `## ` heading or EOF).
8. **Ask the user (AskUserQuestion):** git strategy — feature branch `chore/update-ds-<latest>`
   vs commit to the current branch — and show the computed chain for confirmation. Create the
   branch if chosen.

## Phase B — Per-version loop (for each target, for each version V in the chain, ascending)

Keep ONE integer `attempts` per (target, version), starting at 0. **Every** build/typecheck run
(steps 5, 6, and any re-entry from 7) increments it. The moment `attempts` reaches **3** and the
version is still not green, go straight to step 9. This is a hard per-version cap.

1. **Plan.** Dispatch `ds-migration-planner` with V's changelog block. Parse the MigrationPlan. If
   `items` is empty → no-migration version: skip to step 4 (bump + verify only).
2. **Find (parallel, haiku).** Dispatch `ds-usage-finder` across items with the target's source
   root. Collect per-item `path:line` hits. Zero-hit items are not-applicable — record and drop.
3. **Apply (parallel, sonnet, one per file).** Group hits by file; dispatch one
   `ds-migration-applier` per file with the items affecting it. **This includes behavioral
   (`removed-api` / `behavior`) items — the applier ATTEMPTS them, not just mechanical ones.** For an
   item located by its `note` rather than by hits (e.g. a `code-add` to the app config or global
   styles), dispatch an applier for that described file. Collect `applied` / `needsReview`, and track
   the union of touched files (for the commit pathspec).
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
   implements what the changelog `note` requires (the build won't catch a semantically-wrong-but-
   compiling edit — this is the safety net for full-auto). An item the applier left `needsReview`
   (couldn't do), or whose attempt you judge wrong/incomplete, is NOT green → it feeds the auto-fix
   loop (retry with more guidance) before any escalation.
6. **Auto-fix loop.** If not green, dispatch sonnet appliers to fix the specific issues and
   re-verify (increments `attempts`). Bounded by the 3-attempt cap above.
7. **Re-check (parallel, sonnet) — every item.** Dispatch `ds-recheck` for each item: grep for
   mechanical, semantic for behavioral (it returns `migrated` + `confidence`). If any returns
   `migrated:false`, or a behavioral item comes back low-confidence, treat the version as not green
   and re-enter step 6 (still bounded by the cap) — dispatch appliers to redo/repair that item using
   the re-checker's feedback. Only items still unresolved when the cap is hit become manual-review.
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
