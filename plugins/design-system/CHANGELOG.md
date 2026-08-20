# design-system plugin — changelog

Versioning: **patch** = instruction/prompt fixes; **minor** = new capability (pipeline step,
source, agent); **major** = a change to the workflow's behavior contract. Bump `plugin.json` +
`marketplace.json` together on every published change.

## 1.4.0 — 2026-08-20

(Absorbs an unpublished 1.3.2 — the dedup pass and README corrections below never shipped alone.)

### Added
- **Phase C team-setup offer**: at the end of a run, if the consumer repo's committed
  `.claude/settings.json` does not declare the `ids` marketplace, the orchestrator offers to merge
  in `extraKnownMarketplaces` (+`autoUpdate: true`) + `enabledPlugins` and commit it — after which
  the whole team gets the plugin auto-installed and background-updated. Idempotent (silent when
  already configured); dry-run only reports the pointer, no edit.
- README "Team setup" section: the same recipe documented for hand-rolling — possible because the
  plugin is a relative-path marketplace source.

### Changed
- Private-repo auth note corrected: `BITBUCKET_TOKEN` is not a documented mechanism for
  marketplace fetches; the working paths are the credentialed re-clone fallback (default
  credential-manager setups), an SSH marketplace URL, or a scoped git URL-rewrite token.
- Dedup pass over SKILL.md and the agent prompts, no behavior change: the Guardrails recap section
  removed (every rule already lives at its point of use; the unique `dist`/build-output clause
  folded into the sources bullet), the step-7 re-check triple emphasis compressed to one sentence,
  the two "manual review is a last resort" paragraphs merged into the full-auto paragraph, and six
  remaining single-line repeats trimmed across SKILL.md, the applier and the planner.

## 1.3.1 — 2026-07-13

### Changed
- Migration-manifest source priority made symmetric with the changelog's: prefer the clone's
  `migrations/<V>.json`, fall back to Bitbucket-raw per chain version, and treat a missing manifest
  as "derive that version from prose" rather than losing determinism silently when the clone fails.

## 1.3.0 — 2026-07-10

Deep-review round with external research (codemod prior art, ng-update conventions, Claude Code
plugin capability audit).

### Added
- **Shipped migration manifests.** The DS now publishes `migrations/<version>.json` — a structured
  MigrationPlan mirror of each changelog block (schema in `migrations/README.md`), shipped in the
  npm package and readable from the repo clone; 0.4.0 and 0.5.0 authored retroactively. The
  planner validates and PREFERS a manifest, deriving from prose only when absent/malformed —
  deterministic plans instead of per-run prose parsing.
- **Invocation arguments** — `/design-system:auto-update-package [target-version | dry-run]`:
  pin where the chain ends, or run a read-only plan + find + drift report with zero edits.
- **Run ledger** — per-run JSON state (chain, per-item status, touched files, attempts) updated at
  step boundaries; an interrupted run (session limits happen) resumes deterministically instead of
  via improvised handoffs.
- **Deterministic transform option** for high-volume mechanical items (≳30 static hits): a one-off
  element-scoped script generated from the item's `map`, verified by the same grep + re-check net;
  LLM appliers keep everything needing judgment (dynamic bindings, behavioral items).
- **Enforced never-push:** a skill-scoped PreToolUse hook blocks any `git push` for the duration of
  a run — verified to fire inside the skill and stay inert outside it.

### Changed
- **One clone = changelog + sources.** Phase A clones the DS repo once; the clone's default branch
  is the primary changelog source (the raw-URL fetch demoted to fallback; the docs-site SPA dropped
  as a source). Migration manifests are saved aside before per-version tag checkouts.
- Concurrency made explicit: keep ≤~8 subagents concurrent, dispatch in waves.
- `plugin.json` marketplace hygiene: `displayName`, `homepage`, `license`, `keywords`.

## 1.2.7 — 2026-07-10

Follow-ups from the second live run (mm-broker, 0.3.0 → 0.5.0, clean full-auto pass):

### Changed
- Appliers may own a **small disjoint batch** of files (≤~5) instead of strictly one file; the
  invariant stays — a file is never shared between concurrent appliers. (The run batched safely on
  its own; the letter now matches the proven behavior.)
- Applier dispatch prompts must embed the item's `map`/`old`/`new`/`note` **verbatim** — clarifying
  prose goes around the canonical data, never instead of it; per-batch tailoring selects items, it
  doesn't rewrite map rows.
- **Customization-drift fixes now get their own re-check**: every retargeted selector/class/token
  is verified to exist on the new version's real surface via the sources checkout (a typo in a
  retargeted selector compiles clean and was previously invisible).

## 1.2.6 — 2026-07-10

### Breaking (workflow contract)
- **Full-auto.** The applier now ATTEMPTS every actionable change, including `removed-api` and
  `behavior` items (real code edits per the changelog's migration notes). Manual review is a
  last-resort escalation (attempt + fix-loop failed), no longer the default bucket for behavioral
  changes. No-consumer-action changes are reported as informational; visual-only edits are
  committed but flagged "applied — human should eyeball".

### Added
- **Generic changelog-reading engine** — no baked component/attribute/value specifics; the planner
  derives every specific from the changelog block (content-based actionability, compound bullets
  split per mechanical unit, `behavior` catch-all so nothing documented is dropped).
- **Sources of truth for API questions** — a local checkout of the DS repo at the release tag
  `vX.Y.Z` (primary; readable sources of the version being migrated TO, available to every agent
  at every stage) + the installed package in `node_modules` (FROM before the bump, V after);
  reading `main` is forbidden (it is ahead of V).
- **Customization-drift check** — consumer styling that reaches into DS internals (deep selectors,
  internal classes/tokens) is validated against the new bundle after install; broken intent is
  reproduced on the supported theming API where derivable.
- **Mandatory independent re-check** of every item (never skipped), whole-source-root grep as the
  finder-miss backstop, zero-hit items re-checked as a not-applicability confirmation.
- Monorepo support (shared-lockfile loop inversion), DEGRADED grep-only mode for no-build
  consumers, command-type migrations (orchestrator runs them with user approval), user-named
  target version caps the chain.

### Changed
- `ds-usage-finder` moved haiku → sonnet (finding usages needs scoping/classification/
  exhaustiveness judgement).
- `value-remap` map semantics pinned as closed-set decision tables in applier + recheck (absent
  from `map` = leave untouched, never guess); structured items passed to agents verbatim — no
  prose paraphrase in dispatch prompts.
- Element-scoped search/re-check for shared attribute names; finder hits (`loc`/`match`/`el`/
  `dynamic`) flow to appliers instead of being re-derived.

## 1.0.0 — 2026-07-08

- Initial release: version-by-version conveyor (installed → latest stable, patches included) with
  tiered subagents (`ds-migration-planner` / `ds-usage-finder` / `ds-migration-applier` /
  `ds-recheck`), build/typecheck + grep verification, per-version commits, peer-dependency stop.
- Mechanical renames applied automatically; behavioral changes surfaced for manual review.
