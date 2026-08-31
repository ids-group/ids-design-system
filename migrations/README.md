# Machine-readable migration manifests

One file per released version — `migrations/<version>.json` — mirroring that version's
`CHANGELOG.md` block as a structured **MigrationPlan**:

```json
{ "version": "X.Y.Z",
  "items": [ { "id": "<stable-kebab-slug>", "kind": "<kind>", "old": "...", "new": "... | null",
               "note": "<concrete consumer migration steps>", "searchHints": ["..."],
               "map": { "<oldValue>": "<full replacement token | null>" },
               "surface": "template | typescript | style | config | none   (or an array of them)",
               "detect": ["<shape written the way the CONSUMER writes it>", "..."],
               "verify": "<the positive assertion that proves this landed>",
               "restore": "<literal snippet that brings the old behaviour back | null>",
               "supersedes": ["<version>#<id>"] } ],
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
- **`supersedes`** — `<version>#<id>`, declared on the item that REVERSES an earlier one. It points
  BACKWARD only. An upgrade walks one version at a time and each manifest is frozen when the next is
  written, so a file cannot name its own future: there is no `supersededBy`, and a note that says
  "in the next release" is a defect. The reversal is described in full by the later
  item, which is the one an upgrade reaches second.
- **`action`** — the imperative: what to change, in the order to change it. The one field an
  upgrade executes.
- **`appliesWhen`** — the boundary: which components, which bindings, and what is explicitly NOT
  affected, so an item can be ruled out without searching.
- **`pitfall`** — the way to apply the item mechanically correctly and still ship a broken app.
  Read it before deciding a clean build means done.
- **`deleteList`** — the structured form of "what you can now delete" (see below).

**Why:** an upgrade tool can read the plan out of the prose changelog, but it re-derives it on
every run. A shipped manifest makes it deterministic: the tool validates and prefers the
manifest, falling back to prose only when a version has no manifest. **Every published version
has one**, so the fallback should never fire. A patch
release is not exempt: 0.6.2 carries an actionable change (a sheet
with nothing focusable in it stopped closing on Escape), which is exactly the kind a "just fixes"
release is assumed not to have.

A version may also ship a sibling folder `migrations/<version>/*.md` holding a worked
before/after too long for a `note` — `migrations/0.5.1/badge-statuses.md` is the one that exists.
It never matches the `*.json` glob, so tooling ignores it.

**What the manifest must carry that a release note usually omits: what the consumer can now DELETE.**
Most workarounds in an app are written against hooks that
ALREADY existed, because a release note says what broke and never says what became unnecessary.

**Those entries are the `deleteList` ARRAY, not prose.** A delete hint written as a sentence inside
`informational` has no `find` for a finder to run, so it waits for a human to recognise their own
code in it. Write each as `{ id, surface, find, why, replaceWith }` — `find` being the shape in the
CONSUMER's code, a string or an array of them — and keep the human copy in that version's CHANGELOG
"What you can now DELETE" table. Two copies, each read by someone; the third copy in `informational`
is the one that goes stale, so new manifests do not carry it.

**What made an item findable is now part of the schema, because a well-formed item can still be
undetectable.** Two shapes slip past a find/apply/recheck loop — not malformed, not ambiguous, just
impossible to locate from what they carry:

- `0.7.1#table-sortkey-non-null-when-unsorted` named `ds-table[sortKey]` as `old`, and every
  `searchHint` named the DS. What breaks is the host's own store code —
  `sorting: store.sortKey() ? { path: sortKey()!, order: sortDir() ?? 'Asc' } : undefined` — which
  mentions no DS symbol at all. A DS-named search returns zero hits, the item is
  recorded not-applicable, and a clean re-check grep agrees — while the table keeps ordering by a
  column whose header shows no sort.
- `0.7.1#field-reserve-message-default-off` put "consumers that wrote `[reserveMessage]="false"` can
  delete those bindings" deep inside a long note, with no delete entry, so the bindings survive.

Hence `surface`, `detect`, `verify` and `restore`: say WHERE the consumer's code changes, what that
code LOOKS like when it names nothing of ours, what proves the change landed, and how to get the old
behaviour back. **Every published manifest meets this contract**, back to the earliest release, so there is no
legacy tier and no warning level: `surface`, `detect`, `verify` and `restore` are present wherever
they apply.

The prose CHANGELOG is the human copy of a release; the manifest is its machine mirror of the
same release. Where the two disagree, the CHANGELOG is the one to trust.

**Shipping:** the manifests are in
`node_modules/@ids-group-ltd/ids-design-system/migrations/`.
