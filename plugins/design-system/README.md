# design-system (Claude Code plugin)

Steps a repo that consumes `@ids-group-ltd/ids-design-system` from its installed version up to
the latest published one, **one version at a time**, reading each release's changelog and
applying the documented migrations, with a build/typecheck gate and independent re-checks.

## Install

```
/plugin marketplace add https://bitbucket.org/itband/ids-design-system.git
/plugin install design-system@ids
```

Then, inside a consumer repo:

```
/design-system:auto-update-package                  # full run, up to the latest stable
/design-system:auto-update-package 0.4.0            # stop the chain at a target version
/design-system:auto-update-package dry-run          # read-only plan+find+drift report, zero edits
```

It detects the installed version, computes the chain of published versions up to the latest,
asks once for a git strategy (feature branch vs current branch), then runs autonomously —
committing one version at a time — and stops (leaving edits in place) on any version it cannot
make green. Migration plans come from the DS's shipped `migrations/<version>.json` manifests when
a version has one (deterministic), falling back to reading the prose changelog. A skill-scoped
hook hard-blocks `git push` for the duration of a run — you review the branch and push yourself.

## Team setup — auto-install and auto-update, zero per-user steps

Commit this to a consumer repo's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "ids": {
      "source": {
        "source": "url",
        "url": "https://bitbucket.org/itband/ids-design-system.git"
      },
      "autoUpdate": true
    }
  },
  "enabledPlugins": { "design-system@ids": true }
}
```

Everyone who opens that repo (and trusts the folder) gets the marketplace added and the plugin
installed — no `/plugin` commands (auto-install works because the plugin lives in the marketplace
repo itself, as a relative-path source). `autoUpdate: true` refreshes the marketplace in the
background shortly after session start; new plugin versions are picked up automatically because
every published change bumps `plugin.json`.

## Private-repository note

`itband/ids-design-system` is a **private** Bitbucket repo. Manual `/plugin marketplace add` /
`install` / `update` work through your existing git credentials (the same ones that let you
`git clone` it). The background auto-update pull runs WITHOUT git credential helpers — but when
that pull fails it falls back to a fresh clone, which DOES use them, so with a normal credential
manager setup (the Windows default) auto-update works with no extra configuration. If the
background update still cannot authenticate: add the marketplace by SSH URL
(`git@bitbucket.org:itband/ids-design-system.git` — `ssh-agent` keys work non-interactively), or
scope a git URL-rewrite with a read-only repository access token. `BITBUCKET_TOKEN` is not a
documented mechanism for marketplace fetches — do not rely on it.

## What's inside

- `skills/auto-update-package/SKILL.md` — the orchestrator (runs on opus).
- `agents/ds-migration-planner.md` (opus) — one changelog block → a structured migration plan.
- `agents/ds-usage-finder.md` (sonnet) — locate old-API usages in the consumer's source.
- `agents/ds-migration-applier.md` (sonnet) — apply the documented edits; one file (or a small
  disjoint batch) per agent — a file is never shared between concurrent agents.
- `agents/ds-recheck.md` (sonnet) — independently re-verify every migration item (grep for
  mechanical, semantic for behavioral); always runs as a second pass.
- `agents/ds-delete-judge.md` (sonnet) - the deleteList pass: judge each hit dead or kept against
  the release's tree and delete the dead ones; one per group of rows with disjoint files.
- `agents/ds-visual-check.md` (sonnet) - measure a rendering change on a consumer screen in a real
  browser; dispatched only when the session has browser tools.
- `scripts/apply-mechanical.mjs` - applies a version's token-, selector-, input-, output-, class-
  and type-renames and `value-remap`s by exact, element-scoped replacement before any agent runs,
  and reports what it left for them (`--dry-run` writes nothing). Its fixture cases live in
  `apply-mechanical.fixtures/`, run by `apply-mechanical.test.mjs`.
- `scripts/drift-scan.mjs` - the `--ds-*` tokens and CSS classes a release dropped, and every
  consumer line still naming one (plain `node`, no dependencies; `drift-scan-selftest.mjs` beside it).
- `scripts/lint-step.mjs` - runs the library's own ESLint and stylelint plugins over the consumer's
  source for one version step and prints each report as a located hit keyed by its manifest item
  (read-only; `lint-step.test.mjs` runs it over `lint-step.fixtures/`).
- `skills/triage-feedback/SKILL.md` - for the DS maintainer: triage `feedback/inbox/` into one fix
  branch per target.

## Lint step

Every version step also runs the design system's shipped lint plugins (`@ids-group-ltd/ids-design-system/eslint`
and `/stylelint`) with that step's `from`/`to` range: once after the mechanical rewrite, to locate
what it left and what no grep reaches (a listener on a renamed output, a token set from code, a
subclass member that overrides nothing), and once at the re-check, where any remaining hit keeps the
version from going green. The plugin copy comes from the newest release tag that ships it, so it
lints steps from versions released before the plugins existed; without one, the step is skipped and
the report says so. Nothing is fixed by the linters: renames stay with `apply-mechanical.mjs`.

Linters and parsers:

| need               | packages                                                                   |
| ------------------ | -------------------------------------------------------------------------- |
| `.ts`              | `eslint` >= 8.57 + `typescript-eslint` or `@typescript-eslint/parser`      |
| templates (inline) | `@angular-eslint/template-parser` or `angular-eslint` (+ inline processor) |
| stylesheets        | `stylelint` + `postcss-scss`                                               |

- Taken from the consumer's own `node_modules` first.
- Missing ones: the run asks once to fetch a pinned set with `npm exec` into npm's cache
  (`_npx`) and passes that dir as `lint-step.mjs --tools`. Nothing is installed into your repo.
- Declined: the missing linters are skipped and named in the report.
- Your lint config is neither read nor changed.

## Feedback

Every run ends by writing what it learned about the plugin, the manifests, the changelog and the
DS tools: evidence-backed entries, each re-verified before it ships, as
`ds-feedback-<consumer>-<date>.md` and `.json` in the OS temp dir (never in your repo). It then
asks once: commit them to a `feedback/auto-update-*` branch of your local DS clone (found via
`IDS_DS_REPO`, a sibling folder, or a repo whose `origin` is `itband/ids-design-system`), just
print the file path, or skip. Nothing is pushed or posted anywhere; the entry format is in the DS
repo's `feedback/README.md`.

## Versioning

The plugin is versioned (see `CHANGELOG.md` next to this file): **patch** = instruction/prompt
fixes, **minor** = new capability, **major** = a change to the workflow's behavior contract.
`plugin.json` and `marketplace.json` are bumped together on every published change — so a plugin
update is always visible as a version change (the plugin cache is keyed by version).

## Scope & limits

- Steps through every published **stable** version (prereleases skipped); by default up to the
  latest, or up to a target version you name when invoking the command.
- "Green" per version = build/typecheck passes **and** no renamed old API remains in the code.
- **Full-auto:** every documented change is attempted — mechanical renames/remaps verified by grep,
  behavioral changes applied per the changelog's migration notes and verified semantically. Manual
  review is a last resort (only what the auto attempt + fix loop could not make green); visual-only
  edits are committed but flagged "applied — human should eyeball" in the report.
- If a target's Angular (or other peer) version doesn't satisfy a release's peer range, the run
  stops with that reason rather than trying to upgrade Angular for you.
