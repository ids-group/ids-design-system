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
- `ds-recheck` (sonnet) — independent re-check of **mechanical (rename-type) items only**. Parallel.

Primary semantic verification is YOUR job (opus). Re-checks are the parallel `ds-recheck` agents.

## MigrationPlan schema

{ "version": "X.Y.Z",
  "items": [ { "id", "kind", "old", "new", "note", "searchHints": [],
               "map": { "<oldValue>": "<newValue|null|markup>" } } ],
  "informational": [ "..." ] }

`kind` ∈ selector-rename | input-rename | output-rename | token-rename | type-rename |
value-remap | removed-api | behavior. Actionable items come from Breaking + Changed. `new` is
null for `removed-api` / `behavior`. `map` is present only for `value-remap` (an attribute whose
name stays but whose values change, e.g. button `variant` / `size`). `id` is a stable, unique slug.

Split items into two buckets and treat them differently:
- **mechanical** = the five `*-rename` kinds + `value-remap` → auto-applied AND grep-re-checked by
  `ds-recheck` (value-remap: grep that no old `map` value remains on the attribute).
- **manual** = `removed-api` + `behavior` → the applier performs only a clear mechanical rewrite
  (else flags `needsReview`); these are **never** grep-re-checked (no deterministic old→new to
  grep) and ALWAYS surface in the final "needs manual review" report.

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
   `ds-migration-applier` per file with the items affecting it. Collect `applied` / `needsReview`.
   Track the union of touched files (for the commit pathspec).
4. **Bump + install.** Set the dependency to the EXACT version `V` (no `^` / `~`) in the target's
   `package.json`; run the detected package manager's **mutating** install (`bun install` /
   `npm install` / `yarn` / `pnpm install` — never `npm ci` / `--frozen-lockfile`). Confirm the
   lockfile now resolves the dependency to `V`; if it did not move, correct the spec and
   re-install before continuing.
   **Peer check:** read V's peers (`npm view @ids-group-ltd/ids-design-system@V peerDependencies
   --json`). If the target's installed `@angular/*` (or any other peer) does not satisfy V's
   range, STOP at step 9 with the distinct reason "peer dependency unsatisfied — bump <peer> to
   <range> first". Do NOT auto-upgrade Angular.
5. **Primary verify (you, opus).** Run the verify command; read the output. Confirm every
   mechanical item is applied or genuinely not-applicable, and spot-grep each mechanical item's
   `searchHints` to confirm no `old` pattern remains. Verdict: green, or a list of issues.
   **Note:** token/SCSS renames do NOT fail an Angular build (an unknown CSS custom property is
   not a compile error) — for those, rely on the grep here and the re-check in step 7, not the build.
6. **Auto-fix loop.** If not green, dispatch sonnet appliers to fix the specific issues and
   re-verify (increments `attempts`). Bounded by the 3-attempt cap above.
7. **Re-check (parallel, sonnet) — mechanical items only.** Dispatch `ds-recheck` for each
   mechanical item independently. If any returns `migrated:false` with unaccounted remaining
   usages, treat the version as not green and re-enter step 6 (still bounded by the cap). Manual
   items (`removed-api` / `behavior`) are NOT re-checked — they flow to the report as needs-review.
8. **Green → commit.** Stage EXACTLY the applier-touched files + the target's `package.json` + the
   lockfile, by explicit pathspec (never `git add -A`, never a bare directory). Commit
   `chore(deps): update @ids-group-ltd/ids-design-system to vV`, migration summary in the body
   (`-m` subject, `-m` body). Do not run any git command containing the word "push". Next version.
9. **Stuck (cap hit, re-check disagrees, or peer unsatisfied).** **Stop the run.** Leave the
   partial edits in the working tree (do NOT roll back). Report the version reached, the failing
   output / unresolved items / peer reason, and the `needsReview` list. Await the user.

## Phase C — Final report

- Per target: versions completed + committed (from→to), items applied, items not-applicable, and
  **needs manual review** (every `removed-api` / `behavior` item + any applier `needsReview`).
- If stopped: which target/version, why, what to look at.
- Suggested next step (review the branch / open a PR).

## Guardrails

- One `ds-migration-applier` per file — never two appliers on the same file concurrently.
- Never `git push`; never `git add -A`; stage only the exact pathspec from step 8.
- Never edit files under `node_modules`, `dist`, or build output.
- Pin the EXACT version `V`; use a mutating install (never a frozen/CI install).
- Accept a changelog source only if its body contains `## <semver>` headings.
- Prefer `AskUserQuestion` for setup decisions (which consumer, git strategy); else run autonomously.
