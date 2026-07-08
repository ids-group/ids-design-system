---
description: Update @ids-group-ltd/ids-design-system in this repo from its installed version up to the latest, one version at a time, applying documented changelog migrations with checks and re-checks.
model: opus
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, WebFetch, Task, AskUserQuestion
---

# Auto-update the IDS design system

You are the **orchestrator**. Walk THIS repo (the consumer) from its installed
`@ids-group-ltd/ids-design-system` version up to the latest published version, **one version at
a time, in release order (patches included)**. For each version, read that version's changelog,
apply the documented migrations, verify, and commit. Run **autonomously** to the latest version;
**stop** only when a version cannot be made green.

Dispatch subagents by name via the Task tool. Never do a subagent's job inline.

## Model tiering (dispatch these subagents)

- `ds-migration-planner` (opus) — changelog block → structured MigrationPlan.
- `ds-usage-finder` (haiku) — locate old-API usages. Dispatch in parallel across items.
- `ds-migration-applier` (sonnet) — apply edits. Dispatch in parallel, **one per file**.
- `ds-recheck` (sonnet) — independent per-item re-check. Dispatch in parallel across items.

Primary semantic verification is YOUR job (you run on opus). Re-checks are the parallel
sonnet `ds-recheck` agents.

## MigrationPlan schema

{ "version": "X.Y.Z",
  "items": [ { "id", "kind", "old", "new", "note", "searchHints": [] } ],
  "informational": [ "..." ] }

`kind` ∈ selector-rename | input-rename | output-rename | token-rename | type-rename |
removed-api | behavior. Actionable items are Breaking + Changed; `new` is null for
`removed-api` / `behavior`.

## Phase A — Run setup (do once)

1. **Confirm this is a consumer repo.** Read `package.json`; find `@ids-group-ltd/ids-design-system`
   under dependencies/devDependencies. If absent, report "this repo does not depend on the design
   system" and stop.
2. **Installed version.** Prefer the exact version in the lockfile; else the `package.json` range's
   resolved base. Record it as `current`.
3. **Detect package manager** from the lockfile: `bun.lock`→bun, `package-lock.json`→npm,
   `yarn.lock`→yarn, `pnpm-lock.yaml`→pnpm.
4. **Detect verify commands** from `package.json` scripts: a build script (`build`, `build:*`) and
   a typecheck if present (`tsc`, `typecheck`, `ng build`). If none found, ask the user for the
   command that proves the app compiles.
5. **List published versions:** `npm view @ids-group-ltd/ids-design-system versions --json`. Sort
   by semver. Compute the ordered chain `(current, latest]`. If empty, report "already up to date"
   and stop.
6. **Load the changelog** from the first available source, in order:
   (a) `node_modules/@ids-group-ltd/ids-design-system/CHANGELOG.md`;
   (b) Bitbucket raw (`https://bitbucket.org/itband/ids-design-system/raw/main/CHANGELOG.md` via
   WebFetch); (c) docs site `https://ids-ds.proto.ids-group.co.uk/#changelog`. If all fail, report
   and stop. Parse `## X.Y.Z — DATE` headings into per-version blocks.
7. **Ask the user (AskUserQuestion):** git strategy — create feature branch
   `chore/update-ds-<latest>` vs commit to the current branch — and show the version chain for
   confirmation. Create the branch if chosen.

## Phase B — Per-version loop (for each version V in the chain, in order)

1. **Plan.** Dispatch `ds-migration-planner` with V's changelog block. Parse the returned
   MigrationPlan. If `items` is empty, this is a no-migration version — skip to step 6 (bump +
   verify only).
2. **Find (parallel, haiku).** Dispatch `ds-usage-finder` across the items (batch or one per
   item) with the consumer source roots. Collect per-item `path:line` hits. Items with zero hits
   are not-applicable — record and drop from the apply set.
3. **Apply (parallel, sonnet, one per file).** Group all hits by file. For each file, dispatch one
   `ds-migration-applier` with that file and the items affecting it. Collect `applied` /
   `needsReview`.
4. **Bump + install.** Set `@ids-group-ltd/ids-design-system` to `V` in `package.json`; run the
   detected package manager's install so the lockfile + `node_modules` match.
5. **Primary verify (you, opus).** Run the detected build/typecheck. Read the output. Confirm:
   every planned item is applied or genuinely not-applicable, and no `old` pattern remains
   (spot-grep the `searchHints`). Produce a verdict: green, or a list of issues.
6. **Auto-fix loop.** If not green, dispatch sonnet appliers to fix the specific issues and
   re-run verify. Cap at **3 attempts** total for this version.
7. **Re-check (parallel, sonnet).** Dispatch `ds-recheck` for each actionable item independently.
   If any returns `migrated:false` with unaccounted remaining usages, treat the version as not
   green and go back to step 6 (subject to the 3-attempt cap).
8. **Green → commit.** Stage the changed files with explicit pathspecs (never `git add -A`) and
   commit: `chore(deps): update @ids-group-ltd/ids-design-system to vV`, with a one-line-per-item
   migration summary in the body (`-m` subject, `-m` body). Never run a command containing the
   word "push". Proceed to the next version.
9. **Stuck (still red after 3 attempts, or re-check disagrees).** **Stop the run.** Leave the
   partial edits in the working tree (do NOT roll back or revert). Report the version reached,
   the failing build output / unresolved items, and the `needsReview` list. Await the user.

## Phase C — Final report

When the chain completes (or the run stops), print:
- Versions completed and committed (with the from→to range).
- Per version: items applied, items not-applicable, items needing manual review.
- If stopped: which version, why, and what to look at.
- Suggested next step (review the branch / open a PR).

## Guardrails

- One `ds-migration-applier` per file — never let two appliers touch the same file concurrently.
- Never `git push`; never `git add -A`.
- Never edit files under `node_modules`, `dist`, or build output.
- If any changelog source is unreachable, fall through to the next before giving up.
- Prefer `AskUserQuestion` for the one setup decision (git strategy); otherwise run autonomously.
