# design-system plugin — changelog

Versioning: **patch** = instruction/prompt fixes; **minor** = new capability (pipeline step,
source, agent); **major** = a change to the workflow's behavior contract. Bump `plugin.json` +
`marketplace.json` together on every published change.

## 1.6.0 — 2026-09-01

Three validation gaps closed, each grounded in a manifest defect the plugin could not distinguish
from success (found by the 2026-08-31 manifest audit).

### Added
- **LOCATOR-DEAD classification.** A zero-hit item is classified before it is dropped: broad
  locators show the feature absent → not-applicable; `old` + every `detect` shape + every
  `searchHint` match nothing repo-wide → locator-dead — evidence about the MANIFEST, reported as
  its own Phase C section ("file this back to the design-system repo"), never folded into
  not-applicable. Per-item hit counts now go to the ledger and the final report; the finder returns
  `{ hits: [], searched: [...] }` on every zero (a bare `[]` no longer exists); the re-checker
  confirms locator-dead with its own repo-wide grep.
- **`scss-api` / `code-add` insertion mode.** A missing or unmatched `old` is an ANCHOR, not a
  reason to skip: the applier inserts `new` at the location `action`/`note` describes and reports
  `replaced` vs `inserted` per item (`modes` in its output); the re-checker verifies presence at
  the described location instead of grepping for an `old` that was never there.

### Changed
- **Executor-simulation + regression pass.** The unresolvable-dynamic-binding path is now one road
  (skip the fix loop → re-check excusal → "human should eyeball" with `locs`); the finder reports
  per-locator `rawMatches` so the not-applicable/locator-dead call has evidence; superseded items
  stay out of the re-check dispatch; an empty-`items` version still runs its `deleteList` pass; the
  touched-files union covers drift fixes and deletions, and deletions re-verify before commit; the
  ledger moved to a session-independent path (dry-run stamps itself and is never offered as a
  resume); `verify` on `value-remap` is now required upstream too; `supersedes` is never fabricated
  from prose; `no-op` joined the applier's `modes`; residual `note`-era wording swept.
- **Adversarial review pass over the whole skill + agents.** Correctness: the re-check excuses only
  occurrences the applier named in `needsReview.locs` (the excuse data now exists and is forwarded);
  a `value-remap`'s `verify` is tested, and an old token standing inside its full replacement no
  longer fails the item; drift fixes are dispatched as synthetic items; the planner accepts
  detect-only and locator-less `behavior` items instead of discarding the whole manifest, repairs a
  single defective item in place, never emits rename+`new: null`, and gains Grep/Glob; the finder
  filters non-target hits itself; the locator-dead/not-applicable mark travels into the re-check
  dispatch; `surface: "none"` is exempt from the semantic pass on both sides. Archaeology: dated
  war stories and duplicate slogans cut throughout — rules now stand on their constraints.
- **Field model synced with the manifests' current contract.** `action` is the imperative and the
  only field the applier executes ("None, unless …" whose condition is unmet = applied-as-no-op);
  `appliesWhen` bounds where an edit may land; `pitfall` is tested by the orchestrator's semantic
  verdict and the re-checker; `note` is the why, playing the `action` role only on an old
  un-enriched manifest item. The planner emits and enriches all four, `supersededBy` is gone from
  the schema (the link points backward only), and `surface` may be an array.
- **`surface` ranks the search, it no longer restricts it.** The finder searches ALL artifact
  classes for every item, flags hits outside the declared surface with `outOfSurface: true`, and
  still runs locators on `surface: "none"` items (a hit there contradicts the manifest and is
  reported). An under-declared surface previously excluded the very file holding the break.

## 1.5.0 — 2026-08-21

### Added
- **A behavioural item is no longer dropped on zero hits (Phase B step 2).** An item whose `surface`
  is not the template is about the CONSUMER's own code, which routinely names nothing of ours: zero
  hits now means "these shapes did not match this consumer's spelling", and the orchestrator does a
  semantic pass over the named surface instead of recording not-applicable. This is the exact hole
  that let mm-broker's 0.6.0 → 0.10.1 upgrade pass over `0.7.1#table-sortkey-non-null-when-unsorted`:
  it targets `ds-table[sortKey]`, which no consumer binds, while the code that breaks reads
  `sorting: store.sortKey() ? { path: store.sortKey()!, … } : undefined` in a store file. The finder
  found nothing, the item was written off, and the re-check's clean grep confirmed it — three
  server-paged screens kept ordering by a column whose header showed no sort.
- **Delete-list pass (new Phase B step 8).** The plan's `deleteList` is swept once the items are
  green: grep each entry's `find` over its surface, judge each hit (a workaround can still be
  load-bearing — `[reserveMessage]="false"` is dead against the new default and REQUIRED under a
  `dsReserveMessages` host), delete what is dead, and report both halves. 45 such entries shipped as
  prose across DS 0.9.0 and 0.10.0 and the loop had acted on none of them.
- **The finder reads `surface` and `detect`**: it searches the artifact the item names, treats the
  consumer-shaped `detect` strings as the primary locator there, does not element-scope them, and
  reports `{ hits: [], searched: [...] }` on a behavioural miss so the weaker claim stays visible.
- **The re-checker tests `verify`.** For a behavioural item "grep for `old` came back clean" is no
  longer evidence of anything: the item's `verify` sentence is the assertion, and one with no
  verifiable assertion comes back `confidence: "low"` instead of green.
- **Supersession is honoured**: an item the plan marks `supersededBy` a version inside the chain is
  skipped with that reason recorded, so a run stops doing work the next version undoes.

### Changed
- The planner emits the new fields (`surface`, `detect`, `verify`, `restore`, `supersedes` /
  `supersededBy`, top-level `deleteList`) and, where a manifest lacks them, ENRICHES each item from
  its own `note` instead of passing an undetectable item downstream. Every manifest in the DS repo
  carries the fields as of 2026-08-21, but the copy inside an older `node_modules` will not — which
  is exactly the one a consumer's run reads first.

## 1.4.0 — 2026-08-20

### Added
- **Phase C team-setup offer**: at the end of a run, if the consumer repo's committed
  `.claude/settings.json` does not declare the `ids` marketplace, the orchestrator offers to merge
  in `extraKnownMarketplaces` (+`autoUpdate: true`) + `enabledPlugins` and commit it — after which
  the whole team gets the plugin auto-installed and background-updated. Idempotent (silent when
  already configured); dry-run only reports the pointer, no edit.
- README "Team setup" section: the same recipe documented for hand-rolling — possible because the
  plugin is a relative-path marketplace source.

### Changed
- Private-repo auth: `BITBUCKET_TOKEN` is not a documented mechanism for marketplace fetches. The
  working paths are the credentialed re-clone fallback (the default on credential-manager setups),
  an SSH marketplace URL, or a scoped git URL-rewrite token.
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
