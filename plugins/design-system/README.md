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
/design-system:auto-update-package
```

It detects the installed version, computes the chain of published versions up to the latest,
asks once for a git strategy (feature branch vs current branch), then runs autonomously —
committing one version at a time — and stops (leaving edits in place) on any version it cannot
make green.

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
- `agents/ds-migration-applier.md` (sonnet) — apply the documented edits, one file per agent.
- `agents/ds-recheck.md` (sonnet) — independently re-verify every migration item (grep for
  mechanical, semantic for behavioral); always runs as a second pass.

## Scope & limits

- Steps through every published **stable** version (prereleases skipped).
- "Green" per version = build/typecheck passes **and** no renamed old API remains in the code.
- Mechanical renames (selector/input/output/token/type) are applied and re-checked automatically;
  `removed-api` and `behavior` changes are applied only when a clear mechanical rewrite exists,
  otherwise surfaced for manual review.
- If a target's Angular (or other peer) version doesn't satisfy a release's peer range, the run
  stops with that reason rather than trying to upgrade Angular for you.
