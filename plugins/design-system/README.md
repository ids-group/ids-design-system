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

## Private-repository note

`itband/ids-design-system` is a **private** Bitbucket repo. Manual `/plugin marketplace add` and
`/plugin install` work through your existing git credentials (the same ones that let you
`git clone` it). **Background auto-update of the plugin at startup does not use git credential
helpers** — for that, set a `BITBUCKET_TOKEN` environment variable (a Bitbucket app password or
repository access token). Manual install/update needs nothing extra.

## What's inside

- `skills/auto-update-package/SKILL.md` — the orchestrator (runs on opus).
- `agents/ds-migration-planner.md` (opus) — one changelog block → a structured migration plan.
- `agents/ds-usage-finder.md` (sonnet) — locate old-API usages in the consumer's source.
- `agents/ds-migration-applier.md` (sonnet) — apply the documented edits; one file (or a small
  disjoint batch) per agent — a file is never shared between concurrent agents.
- `agents/ds-recheck.md` (sonnet) — independently re-verify every migration item (grep for
  mechanical, semantic for behavioral); always runs as a second pass.

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
