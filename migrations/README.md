# Machine-readable migration manifests

One file per released version — `migrations/<version>.json` — mirroring that version's
`CHANGELOG.md` block as a structured **MigrationPlan** (the exact schema the
`/design-system:auto-update-package` plugin's planner produces from prose):

```json
{ "version": "X.Y.Z",
  "items": [ { "id": "<stable-kebab-slug>", "kind": "<kind>", "old": "...", "new": "... | null",
               "note": "<concrete consumer migration steps>", "searchHints": ["..."],
               "map": { "<oldValue>": "<full replacement token | null>" },
               "surface": "template | typescript | style | config | none   (or an array of them)",
               "detect": ["<shape written the way the CONSUMER writes it>", "..."],
               "verify": "<the positive assertion that proves this landed>",
               "restore": "<literal snippet that brings the old behaviour back | null>",
               "supersedes": ["<version>#<id>"], "supersededBy": ["<version>#<id>"] } ],
  "deleteList": [ { "id": "<slug>", "surface": "<surface>", "find": ["<shape>", "..."],
                    "why": "<what made it unnecessary>",
                    "replaceWith": "<the API that replaces it>" } ],
  "informational": [ "<one-line FYI per non-actionable change group>" ] }
```

- `kind` ∈ `selector-rename | type-rename | input-rename | output-rename | token-rename |
  class-rename | value-remap | scss-api | code-add | removed-api | behavior`.
- `map` (value-remap only) is keyed by old VALUE; each entry is the FULL replacement for the whole
  `attr="oldValue"` token, `null` to drop the attribute; a value mapping to itself is still valid;
  a value absent from the map is undocumented-as-changed and must be left untouched.
- `old` of an element-scoped item is `element[attr]`.
- **`surface`** — which of the consumer's artifacts changes: their `template`, their `typescript`,
  their `style`, their app `config`, or `none` when the only action is to LOOK. It is a required
  statement, not a hint: `none` and "the author forgot" must not read the same to a finder.
- **`detect`** — the shapes to grep for when `old` is a DS symbol the affected code never mentions.
  Written the way the consumer writes it (`orderBy: sortKey`, `?? config.control?.size`), not the
  way we do. Mandatory on a `behavior` / `removed-api` item whose surface includes `typescript` or
  `config`; a `style` surface is exempt, because there the consumer writes our token names verbatim
  and `--ds-search-height` IS the locator.
- **`verify`** — the positive assertion that proves the migration landed, for the items where
  "the old symbol is gone" proves nothing because there was never a symbol to remove.
- **`restore`** — the literal snippet that brings the old behaviour back on a changed default, or an
  explicit `null` when there is no way back.
- **`supersedes` / `supersededBy`** — `<version>#<id>` links between an item and the later one that
  reverses its guidance. Both directions are declared: a chain walker needs to know an item was
  undone, and a consumer landing on the later item needs to know what it undoes.
- **`deleteList`** — the structured form of "what you can now delete" (see below).

**Why:** the auto-update plugin reads the prose changelog with an LLM planner — correct, but
re-derived on every consumer run. A shipped manifest makes the plan deterministic: the planner
validates and prefers it, falling back to prose only when a version has no manifest. **Every
published version has one**, so the fallback should never fire — the earliest were authored
retroactively, and `0.6.1`, `0.6.2` and `0.9.1` were backfilled on 2026-08-11 after an audit found
them missing. A patch release is not exempt: 0.6.2 turned out to carry an actionable change (a sheet
with nothing focusable in it stopped closing on Escape), which is exactly the kind a "just fixes"
release is assumed not to have.

See `AUTHORING.md` for how to write a good entry.

**Do NOT write a prose guide per release — 0.9.0 tried it and it was retired the same day.**
`migrations/unreleased/README.md` restated the manifest in a form nothing reads: the auto-update
plugin loads `<version>.json`, and the only content the manifest did not already carry was the
delete-list. Worse, it went stale inside one release — three late changes never reached it — and a
stale duplicate misleads where no file would merely be silent. Its content now lives in the two
places that ARE read: the `deleteList` array in `<version>.json`, and a "What you can now DELETE"
table in that version's CHANGELOG block.

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
unnecessary.

**Those entries are the `deleteList` ARRAY, not prose.** 0.9.0 and 0.10.0 shipped 21 and 24 of them
as `DELETE-LIST:` sentences inside `informational`, and in the mm-broker upgrade (2026-08-21) not one
of them was acted on by the loop: an array of strings has no `find` for a finder to run, so every one
of the 45 waited for a human to read all 63 informational lines and recognise their own code in a
sentence. Twelve local classes and a duplicated `visually-hidden` recipe survived the upgrade that
way. Write each as `{ id, surface, find, why, replaceWith }` — `find` being the shape in the
CONSUMER's code, a string or an array of them — and keep the human copy in that version's CHANGELOG
"What you can now DELETE" table. Two copies, each read by someone; the third copy in `informational`
is the one that goes stale, so new manifests do not carry it.

**What made an item findable is now part of the schema, because a well-formed item can still be
undetectable.** mm-broker walked 0.6.0 → 0.10.1 with the plugin and a review afterwards found two
items the whole find/apply/recheck loop had passed over in silence — not malformed, not ambiguous,
just impossible to locate from what they carried:

- `0.7.1#table-sortkey-non-null-when-unsorted` named `ds-table[sortKey]` as `old`, and every
  `searchHint` named the DS. What breaks is the host's own store code —
  `sorting: store.sortKey() ? { path: sortKey()!, order: sortDir() ?? 'Asc' } : undefined` — which
  mentions no DS symbol at all. Zero hits, "not applicable", and the recheck's clean grep CONFIRMED
  the verdict. Three server-paged screens kept ordering by a column whose header showed no sort.
- `0.7.1#field-reserve-message-default-off` put "consumers that wrote `[reserveMessage]="false"` can
  delete those bindings" at word 150 of a 200-word note, with no delete entry. Three of them
  survived.

Hence `surface`, `detect`, `verify` and `restore`: say WHERE the consumer's code changes, what that
code LOOKS like when it names nothing of ours, what proves the change landed, and how to get the old
behaviour back. **`tools/migration-lint.mjs` enforces it** — run `npm run migration-lint` (the
`preversion` hook runs it too, so a release cannot be cut on a manifest that fails). Manifests up to
0.10.1 predate these fields, so their gaps report as warnings and the back-fill is tracked in
`docs/todo.md`; `--strict` promotes those warnings to errors once it is done.

**Authoring:** drafted at release time alongside the CHANGELOG entry (the `/changelog` workflow
drafts it from the release diff; the release author reviews). The prose changelog stays canonical
for humans — the manifest is its machine mirror; if they disagree, fix the manifest.

**Shipping:** `tools/build-schematics.mjs` copies `migrations/` into `dist/ds/migrations/`, so
consumers get manifests in `node_modules` and the plugin also reads them from the repo clone.
