# Machine-readable migration manifests

One file per released version — `migrations/<version>.json` — mirroring that version's
`CHANGELOG.md` block as a structured **MigrationPlan** (the exact schema the
`/design-system:auto-update-package` plugin's planner produces from prose):

```json
{ "version": "X.Y.Z",
  "items": [ { "id": "<stable-kebab-slug>", "kind": "<kind>", "old": "...", "new": "... | null",
               "note": "<concrete consumer migration steps>", "searchHints": ["..."],
               "map": { "<oldValue>": "<full replacement token | null>" } } ],
  "informational": [ "<one-line FYI per non-actionable change group>" ] }
```

- `kind` ∈ `selector-rename | type-rename | input-rename | output-rename | token-rename |
  class-rename | value-remap | scss-api | code-add | removed-api | behavior`.
- `map` (value-remap only) is keyed by old VALUE; each entry is the FULL replacement for the whole
  `attr="oldValue"` token, `null` to drop the attribute; a value mapping to itself is still valid;
  a value absent from the map is undocumented-as-changed and must be left untouched.
- `old` of an element-scoped item is `element[attr]`.

**Why:** the auto-update plugin reads the prose changelog with an LLM planner — correct, but
re-derived on every consumer run. A shipped manifest makes the plan deterministic: the planner
validates and prefers it, falling back to prose only when a version has no manifest. Every published
version `0.1.0`–`0.5.0` ships a manifest (older ones authored retroactively); new versions add theirs
at release time.

See `AUTHORING.md` for how to write a good entry.

**Do NOT write a prose guide per release — 0.9.0 tried it and it was retired the same day.**
`migrations/unreleased/README.md` restated the manifest in a form nothing reads: the auto-update
plugin loads `<version>.json`, and the only content the manifest did not already carry was the
delete-list. Worse, it went stale inside one release — three late changes never reached it — and a
stale duplicate misleads where no file would merely be silent. Its content now lives in the two
places that ARE read: the `DELETE-LIST:` entries in `<version>.json`, and a "What you can now
DELETE" table in that version's CHANGELOG block.

**A sibling folder `migrations/<version>/*.md` is still legal for the rare case a `note` genuinely
cannot hold** — a worked before/after with code on both sides, like `migrations/0.5.1/badge-statuses.md`.
The folder never matches the `*.json` glob, so tooling ignores it, and `tools/changelog-release.mjs`
promotes `migrations/unreleased/` alongside the manifest if one exists. The test before writing one:
**would a tool or an agent ever open it?** If the answer is "a human might", it belongs in the
CHANGELOG instead.

**What the manifest must carry that a release note usually omits: what the consumer can now DELETE.**
Two dogfooding audits (mm-ecm 08-06, mm-broker 08-07) read consumer stylesheets as a record of what
this library made them write, and both found the same thing — most workarounds were written against
hooks that ALREADY existed, because a release note says what broke and never says what became
unnecessary. Ship those as `DELETE-LIST: if you have <X> -> <why it can go>` entries in
`informational`; 0.9.0 has 21 of them and is the shape to follow.

**Authoring:** drafted at release time alongside the CHANGELOG entry (the `/changelog` workflow
drafts it from the release diff; the release author reviews). The prose changelog stays canonical
for humans — the manifest is its machine mirror; if they disagree, fix the manifest.

**Shipping:** `tools/build-schematics.mjs` copies `migrations/` into `dist/ds/migrations/`, so
consumers get manifests in `node_modules` and the plugin also reads them from the repo clone.
