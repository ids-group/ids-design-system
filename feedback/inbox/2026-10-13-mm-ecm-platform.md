# DS feedback: mm-ecm-platform, 0.15.0 -> 0.15.1 (plugin 1.14.0, 2026-10-13)

## tool:lint-step (should-fix, defect)

lint-step.mjs exits 0 with no output when started through a path whose realpath differs (symlinked plugin cache dir or an MSYS /c/... path): the entry guard compares import.meta.url with pathToFileURL(process.argv[1]).

Evidence:
- node /c/Users/admin/.claude-acc2/plugins/cache/ids/design-system/1.14.0/scripts/lint-step.mjs . . <lint copy> --from 0.15.0 --to 0.15.1 -> exit 0, stdout 0 bytes, stderr 0 bytes
- node C:/Users/admin/.claude/plugins/cache/ids/design-system/1.14.0/scripts/lint-step.mjs (realpath) same args -> JSON with ran/skipped
- scripts/lint-step.mjs:338

Proposal: Compare realpaths (fs.realpathSync of fileURLToPath(import.meta.url) vs of process.argv[1]), or print an error when the guard does not match; apply-mechanical.mjs ran fine from the same path, so align the two guards.

## manifest:0.15.1#table-column-width-from-config (should-fix, gap)

Columns with an empty label and an icon/button cell (no width) become equal text shares under the fixed layout: a 100px button column shrank to 32px and clipped, a 42px arrow column grew to 139px and squeezed the name column. detect does not point at them.

Evidence:
- ecm-portal agent-portfolio.page.ts:373 { key: 'timeline', label: '', align: 'right', cell: () => '' } -> DR measure 0.15.0 -> 0.15.1: timeline 100 -> 32px, clipped [Eligibility, timeline]
- agent-portal dashboard.page.ts:85 { key: 'arrow', label: '' } -> arrow 42 -> 139px, Policyholder 238 -> 139px

Proposal: Add `label: ''` (empty-label column without width) to detect and name it in pitfall with the restore `width: 'content'`.

## skill:auto-update-package (nit, gap)

The https clone fails in a shell without Bitbucket credentials (exit 128); a local sibling clone of the DS repo has all tags and serves every step, but Phase A step 7 only names node_modules and raw fetch as fallbacks. A local clone on Windows also fails checkout on .design-sync paths over MAX_PATH, while CHANGELOG, migrations and tools are present.

Evidence:
- git clone https://bitbucket.org/itband/ids-design-system.git -> exit 128
- git clone C:/Repositories/ids-design-system clone -> Filename too long ... checkout failed; tags v0.15.0, v0.15.1 present

Proposal: Add 'a local clone found as in Phase D step 4' as the first fallback, and clone with -c core.longpaths=true or --no-checkout plus sparse checkout of CHANGELOG.md migrations tools.

