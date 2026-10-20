# Auto-update feedback: bandsmith, DS 0.15.0 -> 0.15.3 (2026-10-21)

Plugin 1.18.0. 4 verified entries; 1 dropped (manifest:0.15.1#text-link-token-removed: 0.15.2#link-colour-reads-text-link-role already supersedes it, the run missed its own supersedes skip).

## agent:ds-recheck

### A behavioral re-check misses a [disabled] that turns true through a computed the template calls (false-negative, should-fix)

Evidence:

- loc: src/frontend/projects/client-portal/src/app/features/improvements/components/new-request-modal/new-request-modal.component.html:57 (commit 132b207c): [disabled]="!canSubmit()" beside [loading]="saving()"
- loc: src/frontend/projects/client-portal/src/app/features/improvements/components/new-request-modal/new-request-modal.component.ts:71-73 (commit 132b207c): canSubmit = computed(() => !this.saving() && ...)
- output: first ds-recheck of 0.15.1#button-loading-keeps-focus: 19 remaining; a second, explicitly told to resolve [disabled] through the component's computeds and methods: 35 more real-miss entries

Proposal: In ds-recheck.md, behavioral mode: when an item's action concerns a binding's VALUE (disabled, hidden, readonly), resolve each bound expression through the component's computeds and methods in the .ts before judging; a bare template grep is not evidence.

## manifest:0.15.1#button-loading-keeps-focus

### detect has no shape for a [disabled] fed by a can*() computed that includes the loading flag (gap, should-fix)

Evidence:

- output: detect: ["toBeDisabled()","button:disabled","button[disabled]","(click)=","[loading]=\"true\""]
- loc: src/frontend/projects/workspace/src/app/features/projects/components/qa-run-tests-modal/qa-run-tests-modal.component.html:214 (commit 132b207c): [disabled]="!canStart()" where canStart includes !starting()

Proposal: Add to detect: "[disabled]=\"!can" and "[disabled]=\"!is"; add to action: "Read a [disabled] bound to a computed or method through to its body; a loading flag inside it counts as the flag itself."

## skill:auto-update-package

### Phase A step 9 cannot install the locked version when package.json already names a later one (gap, should-fix)

Evidence:

- command: npm ci
- output: npm error code EUSAGE ... Invalid: lock file's @ids-group-ltd/ids-design-system@0.15.0 does not satisfy @ids-group-ltd/ids-design-system@0.15.3
- loc: src/frontend/package.json:34 (commit d4d7b691): "@ids-group-ltd/ids-design-system": "0.15.3" while package-lock.json resolves 0.15.0

Proposal: Step 9: when the dependency spec in package.json differs from the locked version, install the locked one for the baseline with `npm install --no-save @ids-group-ltd/ids-design-system@<current>` (and the bun/yarn/pnpm equivalents), and say so in the report.

### No path for a consumer already hand-migrated to the target with its package.json pinned there (gap, nit)

Evidence:

- loc: src/frontend/package.json:34 (commit d4d7b691): spec 0.15.3, lock 0.15.0, code already migrated in the branch
- output: the per-version bump-and-commit loop (Phase B steps 4 and 9) would set the spec back to 0.15.1 and 0.15.2; the run did one bump to 0.15.3 with a whole-chain re-check instead

Proposal: Phase A step 3: when the package.json spec is a published stable above the lock, offer (AskUserQuestion) a single-step run to that version with the whole-chain pre-pass and re-check, one commit, instead of the per-version loop.
