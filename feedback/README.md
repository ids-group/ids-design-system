# Auto-update feedback

`feedback/inbox/` collects what `/design-system:auto-update-package` runs learned about this repo's
side of an upgrade: the skill and its agents, the migration manifests, the changelog and the tools.
Each run in a consumer writes one pair of files, `<YYYY-MM-DD>-<consumer-slug>.md` (for people) and
`.json` (the entries), and commits them on a `feedback/auto-update-<consumer-slug>-<YYYY-MM-DD>`
branch of a local clone when its user chooses that; nothing is ever pushed by the run. The
maintainer merges the branch and triages the inbox with `/design-system:triage-feedback`.

This file is the one definition of a feedback entry. The skill and every agent refer to it.

## Entry

```json
{
  "id": "check-manifest-truth-bare-input-name",
  "target": "tool:check-manifest-truth",
  "kind": "false-positive",
  "severity": "should-fix",
  "summary": "A bare input name as `old` is reported declared at neither tag",
  "evidence": [
    { "command": "node tools/check-manifest-truth.mjs 0.14.2" },
    {
      "output": "0.14.2.json chart-pin-on-click-default-true: `pinOnClick` is declared at neither tag"
    },
    { "loc": "v0.14.1:src/lib/components/chart/line-series.component.ts:115" }
  ],
  "proposal": "Resolve a bare camelCase name against every element's members before calling it undeclared.",
  "status": "open",
  "run": {
    "consumer": "mm-ecm-platform",
    "dsFrom": "0.14.0",
    "dsTo": "0.14.2",
    "pluginVersion": "1.9.0",
    "date": "2026-09-25"
  }
}
```

| field      | meaning                                                                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`       | A kebab slug, unique inside its file.                                                                                                                                                                   |
| `target`   | What the fix edits: `skill:auto-update-package`, `agent:<name>`, `manifest:<V>#<itemId>` (an item or a `deleteList` row), `changelog:<V>`, `tool:<script name>`, `plugin:readme`.                       |
| `kind`     | `defect` (a wrong instruction or claim), `gap` (a missing case or field), `ambiguity` (two readings), `false-positive`, `false-negative`, `cost` (wasted dispatches, redundant work).                   |
| `severity` | `blocker` (the run stopped, or shipped a wrong edit), `should-fix` (the run needed a workaround or a manual step), `nit` (wording, a redundant step).                                                   |
| `summary`  | One line. Entries are deduplicated on (`target`, `summary`).                                                                                                                                            |
| `evidence` | Mandatory, at least one item: `loc` is file:line in the consumer or `v<V>:<path>:<line>` in a tag tree; `command` is the exact command, `output` what it printed. An entry without evidence is dropped. |
| `proposal` | The concrete fix: the replacement wording, a diff, a manifest field value.                                                                                                                              |
| `status`   | Optional. `open` (the default) or `done`: the fix already exists, named in `evidence`. A `done` entry is a record, closed at triage.                                                                    |
| `run`      | Filled by the orchestrator, never by an agent: the consumer slug, the first and last version of the chain, the plugin version, the date.                                                                |

Feedback is about this repo's side only. An entry about the consumer's own code quality is out of
scope and is dropped.

## Verification

An entry ships only after the run's orchestrator has re-checked its evidence: opened each file:line,
re-read the tag tree it quotes, re-run a cheap command it quotes. An entry that does not hold, or
cannot be checked, is dropped and counted in the run's report. Triage verifies again, against the
current `dev`: an entry the tree already fixes is closed as done, one whose evidence no longer
holds is closed as invalid.

## Triage

`/design-system:triage-feedback`, run inside this repo, reads every inbox file, re-verifies each
entry against `dev`, and fixes each target in its own branch and worktree: skill and agent prose
with a plugin CHANGELOG entry and a `plugin.json` + `marketplace.json` bump; a manifest or the
changelog under `migrations/AUTHORING.md` and `CONTRIBUTING.md` and their gates; a tool with its
selftest. It asks the maintainer only where a fix has two valid readings. The inbox files it
triaged are removed with `git rm` in the same branch: their content lands as fixes, and history
keeps the rest. It never pushes and never merges into `dev`.
