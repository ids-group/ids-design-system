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

**Authoring:** drafted at release time alongside the CHANGELOG entry (the `/changelog` workflow
drafts it from the release diff; the release author reviews). The prose changelog stays canonical
for humans — the manifest is its machine mirror; if they disagree, fix the manifest.

**Shipping:** `tools/build-schematics.mjs` copies `migrations/` into `dist/ds/migrations/`, so
consumers get manifests in `node_modules` and the plugin also reads them from the repo clone.
