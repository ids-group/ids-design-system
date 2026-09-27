---
description: Triage the auto-update feedback inbox of the IDS design-system repo - re-verify every entry against dev, fix each target in its own branch and worktree, and remove the triaged inbox files. Maintainer-only; run inside the design-system repo.
model: opus
allowed-tools: Bash, Read, Edit, Write, Grep, Glob, Task, AskUserQuestion
hooks:
  PreToolUse:
    - matcher: 'Bash'
      hooks:
        - type: command
          command: "node -e \"let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{let c;try{c=JSON.parse(s).tool_input.command}catch{process.exit(0)}if(typeof c==='string'&&/\\bgit\\b[^|&;\\n]*\\bpush\\b/.test(c)){console.error('BLOCKED by triage-feedback: pushing is forbidden - the maintainer reviews and pushes each branch.');process.exit(2)}})\""
---

# Triage the feedback inbox (`/design-system:triage-feedback`)

You are the maintainer's triager. Every `/design-system:auto-update-package` run can leave feedback
files in `feedback/inbox/` of this repo. Turn each verified entry into a fix, one branch per target,
and empty the inbox of what you triaged. The entry schema, the verification rule and the severity
meanings are in `feedback/README.md`: read it in full first.

## Preconditions

- The current directory is the design-system repo: `.claude-plugin/marketplace.json` names `ids`
  and `feedback/README.md` exists. Otherwise say so and stop.
- `git -C <repo> fetch` is allowed; the checkout itself is never switched, and nothing is ever
  pushed or merged into `dev`.
- Read `CONTRIBUTING.md` and `migrations/AUTHORING.md` in full before the first fix that touches a
  manifest or the library CHANGELOG. They name the gates that fix must pass.

## Steps

1. **Collect.** Read every `.json` file in `feedback/inbox/` (the `.md` beside it is the same
   entries for people). Merge the entries of all files, dedupe by (`target`, `summary`), and keep
   for each entry the inbox file it came from.
2. **Re-verify against the current `dev` tree.** Create one read-only worktree of `dev` in the OS
   temp dir and check each entry's evidence there: open the cited file:line, re-read the tag tree
   (`git archive v<V> src/lib | tar -x` into a temp directory, never `tar -C` on Windows), re-run
   the quoted command. Classify each entry:
   - **done** - the entry carries `status: "done"`, or `dev` already has the fix. Nothing to do.
   - **invalid** - the evidence does not hold on the tree it names. Nothing to do; list it with why.
   - **open** - the evidence holds and `dev` has no fix.
3. **Ask only about judgement calls.** An open entry whose fix has two valid readings (a wording
   choice with different behaviour, a manifest field whose right value depends on intent) goes into
   ONE AskUserQuestion batch, 3 per card, the recommended reading first. Every other open entry is
   fixed as its `proposal` says, checked against the tree.
4. **Fix each target in its own branch and worktree** from `dev`:
   `git -C <repo> worktree add <os-tmpdir>/ds-triage-<slug> -b fix/feedback-<slug> dev`, one per
   `target` (entries on the same target share it). Independent targets can go to parallel
   subagents, one worktree each. Per target kind:
   - `skill:*`, `agent:*`, `plugin:readme` - edit the file under `plugins/design-system/`, add the
     entry under a new version heading in `plugins/design-system/CHANGELOG.md`, and bump
     `plugins/design-system/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` to the
     same version, per the versioning rule at the top of that CHANGELOG. Two branches that both bump
     the plugin conflict on merge: say so in the branch list, the maintainer merges them in order and
     rebumps.
   - `manifest:<V>#<id>`, `changelog:<V>` - follow `migrations/AUTHORING.md` (a published manifest
     is corrected so it reads as though it had always been right) and `CONTRIBUTING.md`, then run
     the gates they name, among them `node tools/check.mjs migration-lint changelog-lint delete-tables manifest-truth`.
   - `tool:<script>` - fix the script and run its selftest (`node tools/check.mjs <name>:selftest`
     when one exists; add a case that fails without the fix). A tool under
     `plugins/design-system/scripts/` runs its `*-selftest.mjs` beside it.
     Commit each fix in its branch with the repo's commit style, then `git rm` the inbox files whose
     every entry is now done, invalid or fixed in this branch, in the same branch.
5. **Inbox files that stay.** A file with an entry still open (a judgement call left unanswered, a
   fix that failed its gate) stays in the inbox; say which entry and why.

## Report

- Per inbox file: entries done / invalid / fixed / still open.
- Per branch: name, worktree path, commits, gates run with their result.
- Invalid entries with the reason, so the plugin's instructions that produced them can be fixed.
- The branches to merge, in order. Never push, never merge into `dev`: the maintainer does both.
