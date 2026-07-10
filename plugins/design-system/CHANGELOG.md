# design-system plugin — changelog

Versioning: **patch** = instruction/prompt fixes; **minor** = new capability (pipeline step,
source, agent); **major** = a change to the workflow's behavior contract. Bump `plugin.json` +
`marketplace.json` together on every published change.

## 2.0.0 — 2026-07-10

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
