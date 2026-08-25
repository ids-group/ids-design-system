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

## Detectability (the false-NEGATIVE guard): `surface`, `detect`, `verify`

The scope rules above stop an item matching code it does not own. These stop the opposite, which is
worse because it is silent: an entry that is correct, complete, unambiguous — and locates nothing.

mm-broker walked 0.6.0 → 0.10.1 with this plugin (2026-08-21) and a review afterwards found two
entries the loop had passed over without a word. Both are worth knowing by heart, because neither
looks defective:

> `0.7.1#table-sortkey-non-null-when-unsorted` — `old: "ds-table[sortKey]"`, hints `sortKey`,
> `sortDir`, `sortChange`. The code that breaks is the consumer's OWN store:
> `sorting: store.sortKey() ? { path: store.sortKey()!, order: store.sortDir() ?? 'Asc' } : undefined`.
> It binds no `sortKey` on the element — nobody does; the key arrives through `(sortChange)` — so the
> element-scoped `old` matched **nowhere**, the finder returned zero hits, the orchestrator recorded
> *not applicable*, and the recheck's clean grep CONFIRMED that verdict. Three server-paged screens
> kept ordering by a column whose header showed no sort.

> `0.7.1#field-reserve-message-default-off` — the sentence that mattered ("consumers that had
> written `[reserveMessage]="false"` to opt OUT can delete those bindings") sat at word 150 of a
> 200-word note, with no delete entry to act on. Three dead bindings survived the upgrade.

- **`surface` is required on every item, and `none` is an answer.** Say which artifact of the
  consumer's changes: `template`, `typescript`, `style`, `config`, or `none` when the only action is
  to look at a screen. An array is legal where a change genuinely spans two (`["template",
  "typescript"]` for a value remap whose values also come from a typed field). A missing `surface`
  and a deliberate `none` must never read the same to a finder — that ambiguity is what let a
  TypeScript-surface item be searched as a template item.
- **`detect` carries the CONSUMER's shapes, not ours.** Once a `behavior` item's surface reaches
  their `typescript` or their app `config`, `old` and `searchHints` stop being enough: our symbol
  names appear in their templates and not in the logic that has to change. (A `style` surface is the
  exception — in a stylesheet they write our token names verbatim, so `--ds-search-height` is already
  the locator.) Write the shapes the way they write them —
  `orderBy: sortKey`, `sortKey() ?`, `?? config.control?.size`, `protected clear(` — and expect them
  to be imperfect; they are recall seeds for a semantic pass, not a find/replace.
- **`verify` is the positive assertion.** For a rename, "the old name is gone" is proof. For a
  behaviour change there was never a symbol to remove, so the recheck has nothing to grep and
  reports success by default. Give it the sentence it can actually test: *"every place that turns
  (sortChange) into a query gates on the direction, not the key"*. If you cannot write that sentence,
  the item is not yet understood well enough to ship.
- **A missing item is worse than a noisy one.** The scope rules trade a false positive for cheap
  discard work; these trade a false negative for the same. When in doubt, name the surface widely and
  let the semantic pass narrow it.

## Supersession: name the item you reverse

A default flipped in one release and flipped back in the next reads as two independent instructions,
and a consumer walking the chain does the first release's work and then undoes it — or, if they skip
a version (0.9.0 was skipped entirely by one consumer going 0.8.0 → 0.9.1), acts on guidance that no
longer holds. `0.8.0#table-client-sort-replaced-by-sort-mode` told consumers unset now resolves to
`'client'` and that a server-paged table must declare `"server"`; `0.9.0#table-sort-filter-mode-default-server`
made unset mean `'server'` again.

So the LATER item carries `supersedes: ["0.8.0#table-client-sort-replaced-by-sort-mode"]`, and the
earlier file is not touched. **The link only ever points back.** A published manifest is frozen when
the next one is written and an upgrade applies it on its own, so a `supersededBy` would name a
version that did not exist when the file was authored — `tools/migration-lint.mjs` rejects the field
outright (M028). It resolves every `supersedes` reference, so a typo or a renamed id fails the
release rather than pointing at nothing.

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

## Default-value changes get their OWN entry, and they carry TWO facts

A changed default is invisible in a diff, so it hides. Give it a dedicated item (usually `behavior`),
worded **"was X, now Y, restore via Z"** with the literal restore snippet in the `restore` field —
`null` there when there is genuinely no way back, never an absent field. Do NOT bury it inside a
rename entry. (E.g. a button size default moving `l`→`md`, or a hue default moving to a new palette
family with "point the channel back at `--primary-h/s/l` to keep the old look".)

**The second fact is what the flip made REDUNDANT, and it belongs in `deleteList`, not in the note.**
A default that moves to what half the consumers were already writing turns their binding into a
restatement — `[reserveMessage]="false"` against a default of `false`, `sortMode="server"` against a
default of `'server'`. 0.7.1 put that sentence in the note and three dead bindings survived the
upgrade; the delete entry is what a finder can run. The linter flags a default-change note with no
`restore`, and a `deleteList` you can write and did not is the failure it cannot see — so write it.

## A `deleteList` entry is a find, a why, and a replacement

`{ id, surface, find, why, replaceWith }`. The whole value is in `find`: the shape in the CONSUMER's
code, written the way they wrote it, a string or an array of them (`["ds-table tr:hover",
"::ng-deep ds-table"]`). `why` says what made it unnecessary — a hook that already existed, a default
that moved, an API that became public. `replaceWith` names the API that replaces it, or the literal
word "nothing" where the answer is simply to delete.

Two things to get right, both learned from the 45 prose entries that nothing acted on:

- **Never a bare token as the `find`.** `--ds-menu-item-radius` is OUR name for the fix; their code
  says `ds-menu-divider { padding: 0 }`. Grep-ability decides whether the entry exists in practice.
- **A sentence in `informational` that tells the consumer to delete something must NAME its row**,
  as `(delete list: <id>)`. Prose is not executed: 0.9.0 shipped five such sentences and four had no
  row behind them. The citation is what a tool can check — a shape test alone goes quiet as soon as
  the file holds any unrelated entry. If the thing to delete cannot be given a greppable `find` at
  all, do not promise the deletion: say what is supported instead. The older spellings — a trailing
  `(DELETE-LIST)` tag, `DELETE-LIST MATERIAL` mid-sentence — mark the instruction but link nothing, so
  they now require the citation like any other sentence. (lint, M034)
- **Say when the workaround is still legitimate.** `[reserveMessage]="false"` is dead under the new
  default and load-bearing under a `dsReserveMessages` host — the entry that omits that turns a
  cleanup into a regression.

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
| type of an existing exported member widened or changed | `behavior` (see the widening rule below) |
| documented but needs NO consumer code edit (additive / visual-only / internal) | NOT an item → `informational` |

**Catch-all:** if you can't confidently fit a breaking/changed entry to a mechanical kind, make it
`behavior` (never drop it). Reading the changelog completely matters more than perfect kinds.

**One rename can need TWO items.** When an input, a `variant` value or a tone also changes the class
the component puts in the DOM, the `input-rename` / `value-remap` fixes the consumer's *binding* and
finds nothing in their stylesheet — a selector like `.modal.danger` survives the upgrade and silently
matches nothing. Emit a `class-rename` alongside it, element-scoped (`ds-modal .danger`), and say in
the `note` that only consumer STYLING of the internal class is affected. This is how 0.5.1's
`danger` → `error` vocabulary rename left a consumer with a dead destructive-modal stripe: every
binding item was present and correct, the class items were missing (added retroactively 2026-08-03).

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

**Widening an exported type is actionable, and it will not look it.** A field on an exported
interface going `number` → `number | 'content'`, an input going `boolean` → `boolean | null`, a
returned union growing a member — each is source-compatible for whoever WRITES the value and
breaking for whoever READS it back (`sum += col.width` → TS2365) or overrides it in a subclass
(the `equal` position of `InputSignalWithTransform` is invariant, so TS2416 fires even when the
values are compatible). That asymmetry is exactly why release notes describe a widening as a new
capability: 0.10.0 shipped two of these with nothing actionable in the manifest, and the
consumer's type-checker was the only finder — firing only after the bump was already installed.
Emit a `behavior` entry per widened type naming who breaks (readers and overriders — not the
writers, who are fine), with the resolution in the `note`: usually "handle the new union member
where the field is read back", with the literal old → new type.

**Do not compile either list by eye — run `npm run class-surface`.** It diffs the exported surface
between the last tag and HEAD (`[base] [head]` overrides both ends) and prints it per class:
gained/lost member names AND changed types — annotated fields, `input`/`model`/`output`
initializers, exported interface members, type aliases and `extends` clauses. Twice the names list
was assembled by reading the diff and twice it was wrong in a way a consumer found first (0.8.0's
private `saveLayout`, 0.9.0's sixteen grown classes); the type diff exists because 0.10.0 then
shipped two widenings the same way. What it still cannot see, so check by hand: a member whose
BEHAVIOR changed under an unchanged signature (`TableComponent.isStriped()` went window-relative
to absolute), and a CLASS member that moved to a base class (interface members that move get a
"check the base" hint).

## Per-entry checklist

Run `npm run migration-lint` before you call the manifest done — it mechanises the lines marked
(lint) below, and a release cannot be cut past it. The rest are judgment the linter cannot make.

- [ ] `id` is a stable, unique kebab slug. (lint)
- [ ] `old`/`new`/`searchHints` are exact code strings; element-scoped as `element[attr]` where shared.
- [ ] `kind` correct; `map` present iff `value-remap`; `new: null` for `behavior`. (lint)
- [ ] `surface` says which of the consumer's artifacts changes — `none` where nothing does. (lint)
- [ ] `detect` carries the consumer's own shapes wherever the affected code names no DS symbol; an
      item whose every locator is a DS name while its surface is not the template fails the lint.
- [ ] `verify` states the positive assertion for every `behavior` / `removed-api` entry — what a
      recheck can test when there is no old symbol to find. (lint)
- [ ] `value-remap` map: full-token replacements, only changed values listed, identities map to self.
- [ ] Pattern/prefix items state coverage AND exclusions in `note`.
- [ ] Default-value / timing / event-payload changes are their own `behavior` entry, with `restore`
      (or an explicit `null`) AND a `deleteList` entry for whatever the flip made redundant. (lint,
      for the `restore` half)
- [ ] An entry that reverses an earlier release's guidance carries `supersedes` naming it; the earlier
      file stays untouched, and `supersededBy` is rejected. (lint, M028 + reference resolution)
- [ ] Substring-colliding renames: longer has its own entry; shorter's `note` says "rename longer first".
- [ ] Non-mechanical entries carry the decision rule + where to read the real new name, not "review".
- [ ] Widened/changed exported types each have a `behavior` entry naming who breaks
      (run `npm run class-surface` — do not assemble the list by eye).
- [ ] `deleteList` holds every "you can now delete X" — with a greppable `find`, not our token name,
      and a word on when the workaround is still legitimate. (lint, for the shape)
- [ ] Every delete instruction written in `informational` prose cites its row as
      `(delete list: <id>)`, or does not promise a deletion at all. (lint, M034)
- [ ] Nothing documented in the block is silently dropped (actionable → item; else → `informational`).
