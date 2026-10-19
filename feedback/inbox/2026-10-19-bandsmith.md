# DS auto-update feedback - bandsmith, 0.15.0 -> 0.15.3, plugin 1.14.1, 2026-10-19

## manifest:0.15.1#button-loading-keeps-focus - should-fix gap

`action` names only a [disabled] bound to the same flag as [loading]; a [disabled] that ORs the loading flag with other conditions disables natively too and is not covered

**Evidence**
- `git show --stat 9311528f` -> 41 files changed, 67 insertions(+), 114 deletions(-)
- `git show 9311528f | grep -c '^-.*\[disabled\]'; git show 9311528f | grep -c '^+.*\[disabled\]'` -> 59 / 24 (removed / rewritten [disabled] lines)
- src/frontend/projects/client-portal/src/app/features/acceptance/pages/plan-detail/acceptance-plan.page.html:83 `[disabled]="signingOff()"` beside `[loading]="signingOff()"` (same flag)
- src/frontend/projects/workspace/src/app/features/admin/pages/branding/branding.page.html:21 `[disabled]="saving()"` beside `[loading]="saving()"` (same flag)
- src/frontend/projects/workspace/src/app/features/absences/components/absence-manage-modal/absence-manage-modal.component.html:109 `[disabled]="deleting() || saving()"` beside `[loading]="deleting()"`, rewritten to `[disabled]="saving()"`
- v0.15.1:src/lib/components/button/button.component.html:60 `[disabled]="disabled() && !softDisabled()"` - any truthy disabled input sets the native attribute, loading or not

**Proposal:** Extend `action`: where [disabled] combines the [loading] expression with other conditions (`deleting() || saving()` beside `[loading]="deleting()"`), drop the loading expression from it and keep the rest; add that compound pair to the item's .found locator fixture. No new `detect` shape: `old` ds-button[loading] and the `loading` hint already locate every such button (the existing .found fixture holds the same-flag pair), and a bare `[disabled]=` on this multi-surface item would hit every element.

## skill:auto-update-package - should-fix gap

the chain steps only to published versions, so preparing a consumer branch for the next DS release ahead of its publish needed a manual path

**Evidence**
- plugins/design-system/skills/auto-update-package/SKILL.md:255-258 the chain is built from `npm view ... versions --json`, stable only
- plugins/design-system/skills/auto-update-package/SKILL.md:270-272 a current newer than every published stable, or an empty chain -> report "ahead of published" and stop
- `git show 5db82eda` -> package.json "@ids-group-ltd/ids-design-system": "0.15.0" -> "0.15.3"; message: package-lock follows with npm i once 0.15.3 is published

**Proposal:** Add an `unreleased` target mode: install `npm pack` of a dev `dist/ds` with `npm install --no-save <tgz>`, read `## Unreleased` and `migrations/unreleased.json` as the last chain step, and leave the package.json/lock bump to a follow-up once the version is published.

## tool:sync-lib-package - nit ambiguity

a dev build of the library reports the last released version while it carries Unreleased changes, so a dev pack is indistinguishable from the release

**Evidence**
- `CI=true npm run build:lib && grep '"version"' dist/ds/package.json` -> "version": "0.15.2",
- CHANGELOG.md:1 `## Unreleased` (dev, above `## 0.15.2`)
- tools/sync-lib-package.mjs copies `version` from the root package.json into src/lib/package.json unchanged

**Proposal:** Judgement call: stamp a prerelease suffix on non-release builds (e.g. `0.15.2-dev.<short sha>` written to dist/ds/package.json only, leaving src/lib/package.json and the --check mode untouched), or keep the version and document that a dev pack carries the last release number.
