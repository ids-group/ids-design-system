# Authoring migration manifests

How to write a `migrations/<version>.json` entry so it is complete, unambiguous, and safely
executable by **both** consumers of these files: a machine transform / grep, and an LLM agent whose
work a human then reviews. (Nx's `--agentic` runner — which delegates judgment migrations to an
installed AI agent, Claude Code included — is the closest industry precedent; this is a real pattern,
not a bespoke one.) Schema and field reference live in `README.md`; this file is the *how to write it
well* companion. The prose `CHANGELOG.md` stays the human source of truth — a manifest is its machine
mirror; if they disagree, fix the manifest.

## The one rule everything else serves

**A reader (machine or agent) must be able to act on an entry without seeing the prose changelog,
and know exactly where it does and does NOT apply.** Every rule below is in service of that.

## Granularity & ordering

- **One entry per mechanical unit, not per changelog bullet.** A bullet that renames a component AND
  its types AND its tokens becomes several entries (one selector-rename, N type-renames, one
  token-rename). A finder/applier acts on one unit; a reviewer rejects one unit.
- **Split a compound behavioral bullet only where the sub-changes migrate differently.** Keep one
  `behavior` entry when the steps are one coherent action.
- **Substring-collision ordering.** We match by grep + token boundary + LLM, NOT by AST — so a naive
  replace of a short identifier can corrupt a longer one that contains it (`DropdownOption` inside
  `DropdownOptionGroup`). No industry manifest has a "longer-first" field (real engines match whole
  AST nodes). Our mitigation: give the longer identifier its **own entry**, and in the shorter one's
  `note` say *"rename the longer identifier first"*. Never rely on replace order alone.

## Precision

- **Exact identifiers, never a paraphrase.** `old`/`new` and `searchHints` carry the string exactly
  as it appears in consumer code (`--ds-pagehdr-title-fs`, not "the page-header title token").
- **Closed enumerated lists for removals.** Name every removed symbol; "some deprecated tokens" is a
  defect.
- **Bound every pattern.** If `old` is a prefix/pattern (`--ds-*-bg`), state the boundary in `note`:
  what it covers AND what it excludes (e.g. "DS tokens only — a consumer's own `-bg` variable is not
  affected; confirm the new name exists in the installed package when unsure").
- **State what is NOT affected** whenever an attribute/class/type name is shared with other
  components — this is the same instinct as element-scoping, written for the human reviewer.

## Scope (the false-positive guard)

- **Element-scope in `old` itself**, never in prose: `element[attr]` (e.g. `ds-button[variant]`).
  This is our lightweight `limitedTo` — it tells the finder/recheck to count matches only on that
  element, so a shared attribute name (`variant` on `ds-badge`, `ds-select`, …) never false-positives.
- A plain identifier / selector / token / type has no element scope → it matches everywhere; don't
  add a fake scope.

## `searchHints` are broad recall seeds — do NOT over-anchor them

`searchHints` exist to help the finder *locate candidates*; precision comes from the `old` field
(`element[attr]` scope) plus the finder confirming each hit's enclosing element and the recheck's
scoped grep — NOT from a narrow hint. So keep hints broad enough for recall, even if they match
non-target occurrences the finder will later drop:

- **Attribute-value items**: hint the bare attribute (`variant="`, `size="`), NOT the element+attribute
  together. Angular tags routinely span lines (`<ds-button⏎  variant="…">`), so an element-anchored
  hint like `ds-button variant=` would MISS the multi-line cases the bare hint catches. The
  element scope lives in `old`, and the finder walks up to confirm the enclosing element.
- **Token-pattern items**: don't anchor to `--ds-` when non-`--ds-` DS-owned globals are in scope.
  (The `--*-bg` rename also renames `--select-bg` / `--chart-*-bg` / `--status-*-bg`, which have no
  `--ds-` prefix — a `--ds-`-anchored hint would silently miss them.) Carry the precision in the
  `note` (what's DS-owned vs the consumer's own vars), not in a narrowed hint.

Rule of thumb: a hint that risks a false *negative* (missed usage) is worse than one that risks a
false *positive* (the finder/recheck discard those cheaply).

## `value-remap` map conventions

- **Key = old VALUE. Value = the FULL replacement of the whole `attr="oldValue"` token** (or `null`
  to drop the attribute). Never a bare value — that makes the applier guess.
  - value→value: `{ "secondary": "variant=\"tonal\"" }`
  - value→different attribute: `{ "outline": "color=\"neutral\" variant=\"outline\"" }`
  - value→becomes default (drop): `{ "primary": null }`
  - value→becomes a bare boolean attribute: `{ "indeterminate": "indeterminate" }`
- **Passthrough-by-omission (the universal convention).** A value the changelog does NOT change is
  simply ABSENT from the map — the applier and recheck leave it untouched, never guess. Only
  enumerate values the changelog actually addresses.
- **Identity = still valid.** A value that stays valid maps to its own full token
  (`{ "text": "variant=\"text\"" }`); the recheck treats it as valid, not as "old to remove".
- **Dynamic bindings.** If the changelog moves values to a different attribute, say in `note` that
  `[attr]="expr"` bindings and any method/field/type supplying old values must be rebound/retyped too.

## Default-value changes get their OWN entry

A changed default is invisible in a diff, so it hides. Give it a dedicated item (usually `behavior`),
worded **"was X, now Y, restore via Z"** with the literal restore snippet. Do NOT bury it inside a
rename entry. (E.g. a button size default moving `l`→`md`, or a hue default moving to a new palette
family with "point the channel back at `--primary-h/s/l` to keep the old look".)

## Changes that aren't a clean find/replace

- **One-old-maps-to-many-new** (a semantic rename where the replacement depends on context): classify
  `behavior`, and in `note` give the **decision rule the agent should follow**, not "review your
  usage". Point it at the version's real sources for the exact new name
  (`-fg` → resolve to `-text-color` / `-label-color` / `-icon-color` by reading the component's SCSS).
- **Genuinely un-mechanizable residue** stays a `behavior` item with a precise `note`; the workflow
  attempts it and escalates to manual review only if it can't be verified — and that escalation is
  greppable (the old `old` still present), never silent.

## Kind selection (quick map)

| The change is… | kind |
|---|---|
| identifier → identifier (selector/type/input/output/token/class) | the matching `*-rename` |
| same attribute, values change | `value-remap` (+ `map`) |
| Sass `@use` path / mixin / function moved | `scss-api` |
| new code the consumer must ADD | `code-add` (snippet in `new`, site in `note`, `searchHints` locate it) |
| API removed WITH a replacement path | `removed-api` |
| needs a code edit but not a find/replace (wrap, restructure, changed default/timing/event payload) | `behavior` |
| documented but needs NO consumer code edit (additive / visual-only / internal) | NOT an item → `informational` |

**Catch-all:** if you can't confidently fit a breaking/changed entry to a mechanical kind, make it
`behavior` (never drop it). Reading the changelog completely matters more than perfect kinds.

## actionable vs informational

Decide by CONTENT, not by which `###` section it sits in — an actionable change can hide in
Added/Changed/Fixed prose, and an "additive" bullet can carry a behavioral default change.
Actionable = existing consumer code stops working or *behaving as before*. Everything else (new
components, new optional inputs, additive tokens whose defaults equal the old role token, pure
bugfixes, visual polish) → `informational`, so a reader knows silence = safe.

**Members added to an exported class are actionable even when the feature is additive.** Subclassing
a DS component is unsupported (`design-system.md` § Components), but a consumer who does it breaks on
a name collision — TS4114 demands `override`, TS2416 fires when the signature differs — so a release
that only ADDS can fail their build. Emit ONE `behavior` item per release naming the classes whose
member surface grew, with the added member names where few enough to list and the count where not,
`searchHints` that locate the subclass (`extends TableComponent`, `extends `), and a `note` giving the
resolution: rename the subclass's own member, or add `override` where the base's semantics genuinely
match. Keep the feature bullets themselves in `informational` — the item is the collision, not the
feature.

## Per-entry checklist

- [ ] `id` is a stable, unique kebab slug.
- [ ] `old`/`new`/`searchHints` are exact code strings; element-scoped as `element[attr]` where shared.
- [ ] `kind` correct; `map` present iff `value-remap`; `new: null` for removals & `behavior`.
- [ ] `value-remap` map: full-token replacements, only changed values listed, identities map to self.
- [ ] Pattern/prefix items state coverage AND exclusions in `note`.
- [ ] Default-value / timing / event-payload changes are their own `behavior` entry with restore info.
- [ ] Substring-colliding renames: longer has its own entry; shorter's `note` says "rename longer first".
- [ ] Non-mechanical entries carry the decision rule + where to read the real new name, not "review".
- [ ] Nothing documented in the block is silently dropped (actionable → item; else → `informational`).
