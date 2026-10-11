# Two-wave adversarial review of the packaging record — 2026-09-02

> **What this is.** Every number in `packaging-diagnosis.md`, `packaging-chunking-audit.md` and
> `basic-advanced-split-audit.md`, plus the two commits that shipped out of them, put through two
> waves of adversarial agents with a validation gate after each: **wave 1 (6 axes) → my validation
> → wave 2 (5 axes, attacking wave 1's findings) → my validation of wave 2.** Eleven agents. Nothing
> entered the fix list on an agent's authority; every item names the evidence that settled it.
>
> **Why it is kept.** Nineteen published figures were wrong and five agent findings did not survive
> scrutiny — those five would have shipped as "corrections" if wave 1 had been trusted. The
> distinction between the two lists is the whole value of the record, and it cannot be reconstructed
> from the corrected documents, which only show the endpoint.
>
> **How to read it.** Start at **THE FINAL GATED LIST** near the end: section A is what did NOT
> change, B the numbers corrected, C the code, D what was struck and why, E what is still not
> settled. Everything above it is the working record.
>
> The corrections were executed on branch `fix/two-wave-review-corrections`; the closing section
> lists the commits.

**Outcome: not one architectural verdict moved.** A3 is still the largest item on the plan, the
basic/advanced split is still rejected (and the rejection got safer), A3-pre was still worth doing.
What moved is the arithmetic.

Wave 1 axes dispatched (all read-only, Explore agents, opus):

| axis                                         | status                                                               |
| -------------------------------------------- | -------------------------------------------------------------------- |
| measurement methodology                      | **FAILED — API error, produced NO findings. MUST BE RE-DISPATCHED.** |
| arithmetic / cross-document numbers          | **RETURNED — below**                                                 |
| **shipped commit `d8eb81c0` (dev warnings)** | **RETURNED — below**                                                 |
| **shipped commit `e8cef30a` (lint rule)**    | **RETURNED — below**                                                 |
| records consistency (docs vs decks vs code)  | **RETURNED — below**                                                 |
| audit of my own 22 claims                    | **RETURNED — below (agent F)**                                       |

---

## Agent C — `d8eb81c0`, dev-warning stripping

**Core mechanism: SOUND.** The agent reproduced it with the repo's own esbuild 0.27.3 and
`--define:ngDevMode=false`: new shape folds to `class o{constructor(){}}` — guard, call, closure,
message string and the module-level `DISCOURAGED_COMBOS` map all eliminated. Dev build preserves it.
Old shape kept the message string, so the premise was true.

### Findings

**C-F1 — the count is 13, not 14. CONFIRMED. Low severity, but published.**
`CHANGELOG.md:226`, the commit message, and `src/lib/core/build-flags.d.ts:8` all say fourteen.
Actual: 13 (button 1, stat 1, table 11). `git tag --contains d8eb81c0` → **v0.11.2**, so the wrong
number is in `dist/ds/CHANGELOG.md`, on npm, and served by the docs site.
→ **MY VALIDATION: CONFIRMED-BY-ME.** `grep -rn "devWarn(" src/lib --include=*.ts` minus the
definition = 13. Guards: button 1, stat 1, table 2 = 4 guards over 13 calls.

**C-F2 — the CHANGELOG headline overstates the category. CONFIRMED. Medium.**
"Dev-mode warnings no longer ship to production bundles" is true of `devWarn` only. Six other
dev-diagnostic sites still use `isDevMode()` — the exact pattern the entry condemns:
`components/field-errors.ts:331`, `components/tabs/tabs.component.ts:134`,
`icons/icon.component.ts:83`, `components/app-layout/app-layout.component.ts:188`,
`components/filter-bar/filter-bar.component.ts:84` (+ `filter-bar.component.html:52`),
`components/projection-dropped.directive.ts:53`.
Shipped FESM: 4 `typeof ngDevMode` guards vs 6 surviving `isDevMode()` calls, message text intact —
1 278 B raw / **732 B gzip** still shipping. Fair caveat from the agent: projection-dropped's warning
does not FIRE in production (the `@if (devMode)` gate holds), but the bytes ship.
Collateral: `icons/icon.component.ts:82` comment says "Production pays one falsy check" — the commit's
own reasoning proves that comment wrong and left it standing.
→ **MY VALIDATION: CONFIRMED-BY-ME.** `grep -o "isDevMode" dist/ds/fesm2022/*.mjs | wc -l` = **7**;
`typeof ngDevMode` = **4**.

**C-F3 — `build-flags.d.ts` redeclares Angular's global; `skipLibCheck` hides two TS2451s. CONFIRMED. Medium.**
Angular ships `declare global { const ngDevMode: null | NgDevModePerfCounters }` in
`node_modules/@angular/core/types/_event_dispatcher-chunk.d.ts:22`, pulled in unconditionally by
`core.d.ts:14`. `npx tsc -p tsconfig.lib.json --noEmit --skipLibCheck false` produces exactly two
errors in the whole library, and they are this pair. Types also disagree
(`boolean | object | undefined` vs `null | NgDevModePerfCounters`).
The agent claims **the file is not needed**: `ds-docs/tsconfig.app.json` excludes it, yet the docs app
compiles the same library sources at exit 0 on Angular's declaration alone.
→ **NOT YET VALIDATED BY ME.** This is the one to check hardest: if true, the file should be deleted,
and the guard keeps working on Angular's own declaration.

**C-F4 — one of the file's two "load-bearing rules" may be false. CONFIRMED by the agent, DISPUTED by me.**
`build-flags.d.ts:12-14` says the guard must be inline, because behind an intermediate `const` the fold
does not happen. The agent got the const form to fold with raw esbuild 0.27.3 + `--define`, and with
`--minify-syntax` alone.
→ **MY VALIDATION: IN PROGRESS, AND I EXPECT A SPLIT VERDICT.** The agent tested raw esbuild on a
source file. I measured through ng-packagr → partial-Ivy FESM → Angular application builder, and
observed 500 markers surviving in BOTH configurations. Different pipelines. If both are right, my
comment is correct for our pipeline and wrong as a general claim, and must be reworded rather than
deleted. **The re-test through our pipeline is the next thing to run** — fixture
`.claude/local/define-probe`, restore the `const ADVANCED = …` form, rebuild with ng-packagr, then
build the consumer with `--configuration prototype`.

**C-F5 — the 827 B button figure does not reconcile. SUSPECTED. Low.**
The agent's independent estimate is roughly half. Whole-app gzip deltas are not the same measurement,
so it cannot be called wrong — only that nothing recorded lets anyone reproduce it.

**C-F6 — double blank line at `CHANGELOG.md:232-233`. CONFIRMED. Trivial.** Prettier's glob excludes
the repo root, so `npm run format` will never catch it.

**C-F7 — nothing prevents the regression returning. CONFIRMED. Low.**
No lint rule requires the guard on a `devWarn` call. The repo has four hand-written eslint rules, so
the mechanism exists and was not used.

### Agent C verified as correct (abridged — 20 items)

Guard coverage 13/13 with zero misses; no semantic change (`git show -w --ignore-blank-lines` yields
exactly four added `if` lines and four `}`); no adjacent statement captured; no call site was in
expression position; `this` binding unaffected; injection context preserved; guard polarity correct in
all three scenarios, verified by running esbuild not by reading; exact truthiness-equivalence with
Angular's `isDevMode()` (`core.mjs:900`), including under `enableProdMode()`; the `@angular/build`
define confirmed at `application-code-bundle.js:465`; the `.d.ts` IS picked up by the lib build
(`tsc --listFiles`); `"types": []` does not break it; **no type leak into consumers** — ng-packagr does
not re-emit input `.d.ts`, `find dist -name "*build-flags*"` is empty; the guard survives packaging;
the dead `Map` really is dropped; `devWarn` is not public API; no migration entry needed; the new file
passes lint and format; `changelog-lint` 322 OK and `check-docblock-drift` 368 OK; no shadowing of
`ngDevMode` anywhere in `src`.

---

## Agent D — `e8cef30a`, entry-point boundary lint rule

**Verdict: correct about what it flags today (307 is real), wrong about what it will flag on the day
it is switched on, and a third of its messages name a package path that cannot exist.**

### Findings

**D-F1 — the shipped defaults encode CYCLES, not ENTRY POINTS. Flipping to `'error'` yields 31 false
positives. CONFIRMED. HIGH — this is the load-bearing one.**
`entry-point-boundary.mjs:20-24` `DEFAULT_CO_LOCATED` is the three SCCs. `eslint.config.mjs:129-134`
wires the rule with **no options**, so those defaults apply. But the rule's semantics are entry-point
membership, and `docs/todo.md:392` defines the core entry as **13 groups** — a different set.
The agent produced the exact 31 `file:line:col` that would falsely error: all inside the planned core
entry (button ×10, field-message ×3, menu ×5, popover ×3, field-group ×3, spinner, message-base,
brand-defaults, field-defaults, field-errors ×2). A3 will deliberately leave those relative.
**The correct configuration exists only in the gitignored probe** `.claude/local/eslint.entrypoint-probe.mjs`.
Neither `eslint.config.mjs:124-128` nor `docs/todo.md:565` says the flip must also supply
`coLocated: CORE_ENTRY`.

**D-F2 — 99 of 308 messages name `@ids-group-ltd/ids-design-system/components-root`, which cannot
exist. CONFIRMED. HIGH.**
`publicSpecifier()` at `entry-point-boundary.mjs:50-55` feeds the synthetic sentinel `components-root`
straight into the suggestion. Distribution: 99 components-root / 68 core / 64 icons / 17 field-message.
So the claim "names the public specifier to use instead" is false for the largest bucket — and that is
the message a developer sees while trying to fix a cryptic ng-packagr crash.
Latent secondary: `publicSpecifier('styles')` / `('themes')` would collide with the existing
`"./styles/*"` and `"./themes/*"` keys in `package.json:16-20`.

**D-F3 — the 307 headline and its breakdown come from two different runs. CONFIRMED. MEDIUM.**
307 is reproducible (308 today; the delta is one import added in `93f65ace`,
`table.component.ts:38` → bottom-sheet). But the by-target breakdown quoted in `docs/todo.md:560` —
92/60/57/15 — is from the **probe-config** run (276 then, 277 now), not from the 307 run, whose
breakdown is 99/68/64/17. The "81%" in `docs/todo.md:559` computes 224/277, against the wrong
denominator. Consequence: A3's sizing ("four bulk replacements plus roughly fifty individual reviews")
is derived from the correct run, while the number used to declare A3 done is from the other.

**D-F4 — dynamic `import()` is not handled. CONFIRMED. MEDIUM (latent).**
`ImportExpression` is absent from the visitor list at `entry-point-boundary.mjs:114-118`. Zero dynamic
relative imports in `src/lib` today. Relevant because `@defer` compiles to exactly this node type, and
`docs/todo.md:580` already flags @defer as the tricky case.

**D-F5 — `TSImportType` (`type T = import('...').A`) not handled. CONFIRMED. LOW-MEDIUM (latent).**
Inconsistent with the rule's own docblock rationale about erased imports.

**D-F6 — `TSImportEqualsDeclaration` not handled. CONFIRMED. LOW.**

**D-F7 — extension-bearing specifiers silently skipped. CONFIRMED. MEDIUM (latent).**
`resolveSpecifier` appends `.ts` to a base that already carries one, so `'./x.ts'` and `'./x.js'`
resolve to nothing and `check` returns without reporting. **Fails open** — unresolvable is treated as
clean, not as unknown. Zero instances today; `"module": "preserve"` means neither form is required yet.

**D-F8 — imports resolving outside `src/lib` are silently allowed. CONFIRMED. LOW-MEDIUM (latent).**
A file in `src/lib` reaching up to `src/public-api.ts` is a circular entry-point dependency and the
rule treats it as fine. None exist today.

**D-F9 — a file at the `src/lib` root is classified as `components-root`. CONFIRMED. LOW (latent).**
`entry-point-boundary.mjs:30`. Dormant — no file at that root today. A3 adding a root barrel activates it.

**D-F10 — `libRoot` uses substring search on a separator-bearing literal. CONFIRMED as behaviour,
SUSPECTED as practical risk. LOW.**
A POSIX-separator filename on Windows makes the rule **silently disable itself**. Mitigated because
ESLint absolutizes via `path.resolve`, which normalises `/`→`\` on Windows; only a custom harness hits
it. Not broken on POSIX. A sibling `src/library/` would fail open. The agent credits `lastIndexOf` as
the deliberately correct choice for a repeated substring.

**D-F11 — resolution order diverges from TypeScript's. CONFIRMED. LOW.**
Probes `X/index.ts` before `X.d.ts`; TS does the reverse. No collision exists today.

**D-F12 — zero test coverage. CONFIRMED. MEDIUM (process).**
No `RuleTester` suite. Every one of D-F4…D-F9 is a one-line RuleTester case. The repo ships selftests
for `migration-lint`, `changelog-lint` and `deck-lint`, so this departs from local convention — for the
rule slated to gate a ~300-import refactor.

### Agent D verified as correct (abridged)

`import type`, `import { type A }`, `export type { } from`, `export * from`, `export { x } from`,
`export * as ns from`, side-effect `import './x'`, default and namespace imports — all reported;
directory `index.ts` and `.d.ts` resolution work; **the three co-located sets exactly match the three
real SCCs**, verified by the agent running Tarjan independently over the group graph;
`shareEntryPoint` is symmetric; `groupOf` maps all 76 real directories sensibly and no component folder
has nested sub-folders; wiring confirmed off via `--print-config` → `[0]` and `npm run lint` exit 0;
plugin namespace resolves correctly through flat-config merging; the probe config is gitignored;
virtual filenames fail open without crashing; 307 reproducible.

---

## My validation so far (step 2, incomplete)

| finding                                 | my verdict          | evidence                                                                                                                             |
| --------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| C-F1 (13 not 14)                        | **CONFIRMED-BY-ME** | grep: 13 calls, 4 guards                                                                                                             |
| C-F2 (other isDevMode sites ship)       | **CONFIRMED-BY-ME** | built FESM: 7 `isDevMode`, 4 `typeof ngDevMode`                                                                                      |
| C-F3 (redundant `.d.ts`, masked TS2451) | not yet             | must re-run tsc with `--skipLibCheck false` and test deleting the file                                                               |
| C-F4 (inline-guard rule false)          | **DISPUTED**        | agent used raw esbuild; I measured through ng-packagr + Angular builder and saw the opposite. Re-test pending — see the note in C-F4 |
| C-F5…C-F7                               | not yet             |                                                                                                                                      |
| D-F1…D-F12                              | not yet             | D-F1 and D-F2 are the two that change what we ship                                                                                   |

## Next actions when work resumes

1. **Re-dispatch the measurement-methodology agent — it died on an API error and produced nothing.**
   It is the highest-value axis: it attacks whether the numbers were produced validly at all (baseline
   drift, missing controls, tsconfig bypassing the map, raw-vs-gzip, generalising a
   fixture to the real library). Its prompt is in the transcript; re-use it verbatim.
2. Wait for the three remaining wave-1 agents (arithmetic, records consistency, audit of my 22 claims);
   append their reports here.
3. Finish step 2 — my own validation of every finding, `CONFIRMED-BY-ME` / `REJECTED-BY-ME` with the
   `file:line` that decided it. **A rejected finding stays on the list with its reason.**
4. Dispatch wave 2 — fresh agents attacking these findings, given them as data not fact, forbidden from
   agreeing without their own evidence.
5. Step 4 — my validation of wave 2. Where waves disagree, the code decides.
6. Only then implement.

**Highest-priority checks, in order:** C-F4 (re-test the const form through OUR pipeline — it decides
whether a shipped doc comment is wrong), D-F1 (the shipped lint defaults will produce 31 false
positives on the day A3 flips them on), D-F2 (99 messages name an impossible specifier), C-F3 (a
possibly redundant declaration file masking two type errors), C-F1/C-F2 (a published count and headline
that are wrong, already on npm in v0.11.2).

---

## Agent B — arithmetic and cross-document numbers

Verdict: **raw measurements are internally consistent — the agent could not break a single subtraction
inside a table.** The failures are all in the DERIVED layer: two cross-fixture subtractions, a
systematic KB/KiB mix, four stale values, one impossible statement.

### CRITICAL

**B-F1 — a saving larger than the thing being saved. CONFIRMED.**
`packaging-chunking-audit.md:294` and `todo.md:317`: "moves 576 239 B raw out of the lazy chunk". The
lazy chunk held 566 761 B and dropped to 189 B, so it can surrender at most **566 572 B**. The initial
grew 576 239 B. The extra 9 667 B existed in neither prior artefact. The NUMBERS are right; the causal
sentence "moved out of X into Y" is impossible as written. Deck 4 phrases it correctly already.

**B-F2 — 56 129 B is a subtraction across two different fixtures, and it flips a conclusion. CONFIRMED.**
`packaging-diagnosis.md:436-439` computes CDK's share as `86 775 − 30 646 = 56 129`. But 86 775 is the
bundle-probe app's initial, whose own DS-free floor is **59 019**, not 30 646 (that is the
basic/advanced ladder's bare app — a different, smaller application). Using the right floor the DS
contribution is `86 775 − 59 019 = 27 756` — exactly the "27.8 kB post-A3 cost" the same document
quotes elsewhere. So **CDK is 17 729 / 27 756 = 64%** of the post-A3 eager cost, not "about a third".
→ This changes what A3 is worth: the floor is nearly two-thirds of the prize.

**B-F3 — the split's "return" exceeds "the entire size of the problem". CONFIRMED.**
`basic-advanced-split-audit.md:61-69` says unused components cost **18.2 KB** = "the entire size of the
problem", then says the split "saves 32 KB". 32 > 18.2. Worse: the 32.0 KB is the cost of USING
`ds-table`; for "a prototype that uses no table at all" the table is unreferenced and the document's own
verdict is "unused components are already free" — so that prototype saves **0**, not 32 KB. Propagated
to `:20`, `:124`, deck 5 `:115,180,252`, deck 11.
→ **The rejection's headline number is a ceiling on WEIGHT MOVED, not on BYTES SAVED**, and the two are
used interchangeably. The rejection itself may still be right — but not for this reason.

### HIGH

- **B-F4** three-layer partition sums to **79 of 77** (13 + 2 + 64). The 64 already contains toast and
  modal, so the middle layer is a subset of the top. Consistent statement is 13 / 2 / **62**.
  `packaging-diagnosis.md:153`, `chunking-audit.md:341`, `todo.md:392`.
- **B-F5** the 55→64 correction does not close: `55 + 11 = 66 ≠ 64`. Reconciles only if you notice
  `theme` is in BOTH the eleven-item list and the core seed, and that `card` moved. As written the
  "eleven groups in the complement" list contains a group the same paragraph puts in the core.
- **B-F6** `224/307 = 73%`, not **81%**; remainder is **83**, not "roughly fifty". `todo.md:610-612`.
  One wrong percentage produced both numbers. This is A3's sizing.
- **B-F7** "53 more rewrites than three layers" — it is **61**. 53 is the delta against SIX clusters.
  Deck 11 `:113` then pairs the six-cluster delta with the three-layer percentage: `53/318 = 16.7%`,
  not 19%.
- **B-F8** deck 5 `:80` says 135 744 B is "5.7× the table's directive split". It is **7.0×**. The 5.7
  came from a different pair (the 107.9 KB SAVING vs 18.9), and even that is 5.6 in bytes.
- **B-F9** component-folder count stated as 71, 85 and 95 in three places. **Disk says 71** (+23 loose
  files). Deck 8 is right; `packaging-diagnosis.md:19,50,97` and others are wrong.

### MEDIUM / LOW

- **B-F10** systematic KB(1000)/KiB(1024) mixing. The SAME measurement (31 428 B) appears as both
  "30.7 KB" and "31.4 KB". `packaging-diagnosis.md:221-222` puts a KiB number and an SI number on
  either side of "nearly" in one sentence.
- **B-F11** "31.0 kB hard ceiling" = 18.9 (KiB) + 12.1 (SI). In bytes the ceiling is 31 428 B =
  31.4 KB SI / 30.7 KiB. **31.0 exists in no convention**, and contradicts the same paragraph's 31.4.
- **B-F12** four stale values still in print: (a) 55 at `packaging-diagnosis.md:203` and `todo.md:452`;
  (b) 12-group core at `packaging-diagnosis.md:93`; (c) **40 import rewrites + the DECLINED verdict on
  deck 4** `:100,254`; (d) "exactly two cycles" in five places.
- **B-F15** `+118.3 KB` should be `+118.2` (148 882 − 30 646 = 118 236). Four sites. Ratio unaffected.
- **B-F16** **the icon map has 86 entries, not 115.** So 2 522 B is the cost of the 77 removed, not
  "the entire set", and deck 11's "22 B/icon → ~11 KB at 500 icons" should be ~33 B/icon → ~16 KB.
- **B-F17** "the prize is a third of what item 8 reported" — no pair of the stated figures gives a
  third (1 592/3 409 = 47%).
- **B-F18** SUSPECTED: item 8's gzip total is the SUM of individually-gzipped parts, which is always
  larger than gzipping the concatenation. Exact-to-the-byte match proves it was added, not measured.
- **B-F19** SUSPECTED: two ladders agree to the byte on bare Angular and on `ds-button` but differ by
  520 B on `ds-divider` — not a shape a build difference produces.
- **B-F20** SUSPECTED: `145 + 164 = 309`, matching neither 307 nor 318.
- **B-F21** SUSPECTED: the seam's "87–95%" range rests on an asserted 1–2.5 kB overhead that is 1.1× to
  2.7× the MEASURED 923 B. With the measured value it is a single number, 95.2%.
- **B-F22** smaller: "a twentieth of 307" is 21.9×; deck 4's "1.25 MB FESM" is the 0.7.0 figure (now
  1.73 MB); `todo.md:477` calls a core-15 partition "the three-layer partition again" while every other
  place says core-13; "131 exported declarations" may count only value exports (242 total incl. types),
  which would under-scope the facade collision check.

### Agent B's coverage list (recomputed and CORRECT)

The entire §1 ladder except the one `+118.3` slip; §9 ablation (19 303 / 31 428 / 12 125 / −61%); the
anchor table (2 519 B spread, 15 B type-only); the granularity probe (52 887 / −30%); the
chunk-explosion probe (−78%, 1 212 B / 0.2%); the shell case (142.3 → 42.1, −70%); the button ablation
(5 351 / 32 087 / 20 792 / 11 295 / 35%); `249 + 69 = 318`; the seam probe (923 B at both sizes, 704 /
5 013 recovery); the define probe (23 948 / 1 988); devWarn (1 590 / 827); A3-pre (11 + 3 = 14, 593 B);
cluster merge (60 + 15 + 2 = 77); FESM 1.73 MB verified on disk; **77 groups verified against disk**
(71 folders + 5 + 1); 254 files verified (255 today).

---

## Agent E — records consistency

Verdict: **the record is not self-consistent.** Four verdicts were reversed and the reversals were not
swept through; the decks were renumbered and three cross-references were never re-pointed; nine of
nineteen `file:line` citations no longer land; one shipped fix is still listed as open work.

### HIGH

- **E-F1 — the A3-pre reversal was not swept.** Three records still say DECLINED: deck 4 `:99-101` and
  `:254-255`; `packaging-chunking-audit.md:338`; `todo.md:335-336` and `:392`. todo.md says both
  "accepted rather than broken" and "DO IT / reversed", 172 lines apart.
- **E-F1b — the declined verdict is baked into shipped code.** `entry-point-boundary.mjs:19-23` comments
  the four-way SCC allowance as "accepted, because breaking it saves 593 B". Nothing says this allowance
  must come out with A3-pre. (Compounds D-F1.)
- **E-F2 — deck 4 vs todo.md contradict on the recommendation.** Deck 4 `:242` says "D, and the top
  layer must be PER-COMPONENT". `todo.md:672-676` describes that same rewrite as landing on "layered,
  not per-component". todo.md's own A3+ item `:469` then says "go per-component" — so todo.md
  contradicts itself as well as the deck.
- **E-F3 — "exactly two cycles" survives** at `packaging-diagnosis.md:93` and `chunking-audit.md:310,317`
  after being corrected to three. §11(b) of the audit contradicts itself internally: the heading says
  two, `:338` says "the four-way SCC".
- **E-F9 — deck 4 still calls the `moduleResolution` question "untested"** at `:250`, after attw
  measured it. Deck 4 is the deck a reader reaches first.
- **E-F12 — deck 5 cites ITSELF as "deck 5", and cites the tool deck as the seam deck.** `:79-82` and
  `:88-89`. Renumbering damage the README explicitly warns about.
- **E-F15 — deck 11 is missing from the README queue table** (lists 1–10) and from `todo.md:25`, which
  says "Nine" open decks using a phrase that explicitly warns about this exact failure mode. Ten on
  disk; deck-lint reports 11 ranked open.
- **E-F23 — the icon map has 86 entries and NEVER had 115** — checked at HEAD, HEAD~10, HEAD~30 and the
  0.11.2 tag. Independent confirmation of B-F16.
- **E-F24 / E-F31 — `devWarn` has 13 call sites, and the work already SHIPPED**, yet `todo.md:427` still
  carries it as an open `- [ ] [P2]` item and `packaging-diagnosis.md:613` heads the section "A free win
  available today" in the future tense. Also: `:628` prescribes bare `ngDevMode && devWarn(…)`, which
  the SAME document forbids 20 lines earlier — the code that shipped correctly used `typeof`.

### MEDIUM / LOW

- **E-F4** the CSS correction is 270 lines from the claim it corrects, which is left unmarked
  (`packaging-diagnosis.md:429-431`). And **deck 5 `:89-90` points at a correction that does not exist
  on that page.**
- **E-F5** "`overlay`, `config`, `theme` import nothing outside themselves" — `config` has three
  cross-group type edges. `overlay` and `theme` verified genuinely leaf.
- **E-F6 — CONFIRMED FALSE:** "`toast/` and `modal/` import nothing else from `../`". Modal alone has
  **eleven** external specifiers across core, config, overlay, icons, button and components-root.
- **E-F7** "Not measured: how much of the 32.1 kB is field-message" — measured 62 lines later in the
  same document (11 295 B).
- **E-F8** "three decks" vs "decks 5 and 9" for the typesVersions caveat, and NEITHER of those decks
  mentions it. Deck 8 `:256` gets it right ("deck 4 and this page").
- **E-F10** 307 vs 318 used interchangeably; only `todo.md:558` explains the gap, and E-F1's reversal
  invalidates the co-location that produces 307.
- **E-F11** deck 5's "Not verified: whether the library partitions" was answered by A0.
- **E-F21** `ds-table` has **66** inputs/outputs (48 input, 10 output, 8 model), not 62; the file is
  81 200 B, not 76 KB.
- **E-F22** **nine of nineteen `file:line` citations in the "already ships" table no longer land** —
  every named symbol EXISTS, so the substance holds, but the evidence has rotted.
- **E-F25** component counts wrong three ways (95 / 85 / 55). 71 folders, 84 exported component classes.
- **E-F26** deck 4's "1.25 MB FESM" is the 0.7.0 number; actual 1.73 MB.
- **E-F27** `eslint-rules/` now has FOUR rules and the fourth IS the rule `packaging-diagnosis.md:446`
  proposes as a future option.
- **E-F28** mixin usage counts drifted (21/11/2, stated 20/10/2). The load-bearing part — that `ds.scss`
  does not forward them — is correct.
- **E-F29 — CONFIRMED FALSE:** "every optional table behaviour is an `input(false)`". Three default to
  `null`: `stickyScrollbar`, `hiddenKeys`, `columnOrder`.
- **E-F30** SUSPECTED: the `DsConfig` "repeated name" illustration is wrong (interface is `DsConfig`,
  token is `DS_CONFIG`) — but the conclusion (no collisions) is right; there are none at all.
- **E-F33** `todo.md:298` still says the placement prize is "unmeasured" 17 lines above the A0 item that
  measured it — and `:300` justifies the whole plan ordering from that row.
- **E-F34** both audits say they measured `dist/ds` 0.11.1; the artefact on disk is now 0.11.2.
- **E-F35** decks 9 and 11 both open with "every number here is measured", then carry AG Grid's and
  TanStack's own marketing figures (40%, 43%, 5 kB, 14→25 kB) with no source. The diagnosis doc frames
  them honestly as "Reported:"; the decks re-badge them as measured.
- **E-F36** deck 4's "every number here is from packaging-chunking-audit.md" is wrong for its own
  correction block, which sources from the granularity probe and packaging-diagnosis.md.
- **E-F37** "a February 2026 guide" is never named or linked, and it is half the evidence for
  "secondary entry points are not deprecated" — the premise A3 rests on.
- **E-F38** SUSPECTED: the 593 B figure reproduces exactly when the agent re-gzipped the probe output
  (85 031 − 84 438 = 593), but the retained build LOG prints 74.37/75.02 kB, Δ 650 B. Number stands,
  record does not say how to reproduce it.

### Agent E's coverage list

deck-lint passes all 47 decks; all five decks conform to the README marker/rank/path conventions; the
ranked tool at 10 is PERMITTED by README `:25`, so that is not a violation; **every file path cited in
prose exists** (all probes, tools, node_modules paths, `dist/ds`); `button.component.ts:19-26,62,78` all
land exactly; all four SCC edges verified present and all edges out of `ds-config.ts` are `import type`;
`provide-ds-theme.ts` is a true leaf; `application-code-bundle.js:465` exact; `cut-release.sh:75` exact,
so deck 8's version-trap argument stands; `ng-package.schema.json` has exactly 8 top-level properties;
`sideEffects: false`, tslib-only runtime dep, CDK as peer — all three preconditions hold; 77 groups
exact; 144 boolean flags exact; `staticPreview` "about eight early returns" is fair; 307 reproduces at
308; 593 B reproduces.

---

## CROSS-WAVE CONFLICT — must be settled by the code, not by majority

**Agent B asserts 14 devWarn call sites (table ×12). Agents C and E, and my own grep, all say 13
(table ×11).** Three-to-one, but the rule is that the code decides, not the count of agents.
→ **MY VALIDATION: 13.** `grep -rn "devWarn(" src/lib --include=*.ts` minus the definition = 13;
per-file: button 1, stat 1, table 11. **Agent B is wrong on this one**, which is a useful calibration
on the rest of its report.

---

## Updated priority of what to settle first

1. **B-F2** — CDK is 64% not 32% of the post-A3 eager cost. This is the one finding that changes what
   A3 is worth. Re-derive from the probe's own floor.
2. **B-F3** — the "≤32 KB return" against basic/advanced is a weight-moved figure, not a saving. The
   rejection may survive, but its headline number does not.
3. **D-F1 + E-F1b** — the shipped lint defaults encode a REVERSED decision and will produce 31 false
   positives when flipped on.
4. **E-F1 / E-F2 / E-F3 / E-F9** — four reversed or corrected verdicts still asserted in decks 4 and 5
   and in the audit. Deck 4 is the first deck a reader reaches.
5. **C-F4** — re-test the intermediate-`const` fold through OUR pipeline; a shipped doc comment may be
   wrong.
6. **B-F16 / E-F23** — 86 icons, not 115, confirmed independently by two agents at four commits.
7. **E-F24 / E-F31** — shipped work still listed as open; the prescription in the doc is the form the
   doc itself forbids.
8. **B-F4 / B-F5 / B-F6 / B-F7 / B-F8 / B-F9** — six derived figures that do not follow.
9. **B-F10 / B-F11** — decide one unit convention and restate every figure in it.
10. **E-F22** — nine stale `file:line` citations; substance holds, evidence rotted.

---

## Agent F — audit of my own 22 "verified" claims

**Verdict: the arithmetic in this repo is unusually reliable; the failure mode is rhetorical
inflation, not fabrication.** Where artifacts survived the agent reproduced the recorded number
exactly (`dist-core_seed` 84 430 B and `dist-core_seed_card` 85 023 B, matching `docs/todo.md:520`).
18 of 22 claims stand. Four are wrong or overstated, and all four fail the same way: a measurement
taken correctly, then stated one notch broader than it was taken.

**Structural caveat the agent raises first, and it is fair.** Every probe `run.sh` opens with
`rm -rf "dist-$s"`, and the four ablation branches the byte figures came from
(`probe/table-feature-directives`, `probe/button-field-message`, `probe/icons-map`, `probe/devwarn`)
**no longer exist** — `git branch -a` shows only `probe/angular-22`. So a whole family of claims is
recorded-but-not-reproducible. That is an archival gap, not evidence of error.

### FALSE

**F-#4 — "`provideDsTheme()` is in the documented setup every consumer copies, so every app already
has an eager anchor". FALSE. HIGH — this one carries weight in the argument.**
The citation is real and says the opposite. `theme/provide-ds-theme.ts:23-32` is a JSDoc example whose
line 30 reads _"Light is the default with no provider; `followSystem` opts into OS-driven switching."_
The only other consumer-facing mention, `themes/README.md:44`, says _"To follow the OS, **opt in** at
the app root"_. `provideDsTheme` appears in no README, no `design-system.md`, no `components.md` setup
section. Decisively: `schematics/ng-add/index.cts:3,54` — the thing a consumer actually runs — inserts
only `@use '@ids-group-ltd/ids-design-system/styles/ds';`, no provider, in all 77 lines.
So `packaging-diagnosis.md:81-83` ("every app already has an eager anchor. There is no consumer for
whom this is hypothetical") is unsupported. **A consumer on default light theme who lazy-loads every
route has no theme anchor at all.**
→ This does not weaken the mechanism — one `<ds-button>` anchors just as well — but it removes the
"every consumer is already affected" framing from the diagnosis and from deck 4.

**F-#10 — "the whole 115-icon map is 2 522 B gzip". FALSE on the count. MEDIUM.**
Counted three ways: `icons/icons.data.ts` has **86** entries (lines 3→118); the published
`dist/ds/types/…d.ts` has **86** `readonly` keys; `git show v0.11.1:src/lib/icons/icons.data.ts` — the
measured version — has **83**. `packaging-diagnosis.md:409` says 115. Wrong by ~35%. Compounding it:
the ablation "cut to 9", so 2 522 B is the cost of ~74 of 83, not "the whole map". The _conclusion_
(splitting the icon map is not worth it) survives; the stated fact does not.
→ **Third independent confirmation.** B-F16 and E-F23 found the same thing at different commits.

### OVERSTATED

**F-#3 — "it does not matter WHICH symbol is imported eagerly". OVERSTATED. MEDIUM.**
The 2.5 KB arithmetic is exact (194 763 − 192 244 = 2 519 B) and all four scenario files exist. But
**row 2 of the same table refutes the universal**: `import type { DsStatus }` costs 15 B and does not
anchor. The document says so at line 85; the headline sentence at line 22 drops the qualifier.
Secondary: the equivalence is a consequence of the one-entry-point packaging, not a property of
imports in general — which is the document's own thesis.

**F-#7 — "the contribution-registry seam costs a FIXED 923 B, proven by scaling 4×". OVERSTATED. LOW.**
Arithmetic and fixture check out: `seam-probe2` carries exactly 1 600 marker lines in both the mono
and the seam shape, 33 888 − 32 965 = 923 B, and `seam_off` being byte-identical at both sizes is the
right test for "fixed w.r.t. feature size". What is overstated is the definite article: one fixture,
one component, one registry, one contribution kind, two data points. The source doc is more careful —
it estimates the real table's registry at 1–2.5 kB (`packaging-diagnosis.md:526`), i.e. 1–2.7× the
fixture. **923 B is the floor for the simplest possible seam, not a constant.**

**F-#14 — "the minimum cut is 14 statements". OVERSTATED — it is 15–16. MEDIUM.**
The two counts are right _as `import` statements_: 11 files import `config/ds-config`, 3 import
`card/card.types`. But `components/card/index.ts:2` (`export type { CardElevation, CardPadding } from
'./card.types'`) is a fourth statement whose path changes when the file moves, and `src/public-api.ts:1`
(`export * from './lib/config/ds-config'`) is a fifth. **The repo's own lint rule counts
`ExportNamedDeclaration` and `ExportAllDeclaration` as crossings** (`entry-point-boundary.mjs:116-117`),
so excluding them here is inconsistent with the 318/307 counting used everywhere else.
"Minimum" itself rests on a subset search recorded only as prose (`todo.md:508-510`) and could not be
reproduced — though the agent found no cheaper pure-move alternative.
→ The A3-pre reversal survives (15–16 is still nothing like 40), but the published figure must change.

**F-#21 — "`staticPreview` is one boolean plus about eight early returns — tens of bytes".
OVERSTATED. MEDIUM — it is the statement used to close the `define`-flag question.**
The directive half is right (`static-preview.directive.ts:8`, one `booleanAttribute` input,
host-directived into modal/popover/select). The count is incomplete: **7** TS call sites (6 guards,
one class-list condition at `select.component.ts:299`) **plus 7 template references the claim omits,
two of them rendered branches rather than guards** — `popover.component.html:7-21` duplicates the whole
panel `<div>`, its four attribute bindings and the arrow span; `select.component.html:107-111` is a
second render site for the dropdown panel; plus `modal.component.html:1,4,12,13` and
`select.component.html:32`.
And **"tens of bytes" was never measured** — it is an eyeball estimate in
`presentations/11-rejected-with-numbers.html:163-164`, quoted as a verified figure. Every other size
statement in this set has a probe behind it; this one has none.

### New contradictions this agent surfaced (not in my 22)

**F-#15b — `core` is 15 groups in one document and 13 in another. HIGH.**
`docs/todo.md:479` (the cluster-merge table) says core = 15; `packaging-chunking-audit.md:339` and
`packaging-diagnosis.md:153` say the core seed is 13. **One of the two is wrong**, and the 60-of-77
figure follows arithmetically from core=15, so it moves if core=13 is the right number. The six-cluster
membership map was never written down, so 60 cannot be recomputed independently.

**F-#16b — `docs/todo.md:560` says "81%"; 92+60+57+15 = 224, which is 73% of 307. CONFIRMED.**
Same defect D-F3 found from the other direction (D-F3: wrong denominator, 224/277; F: wrong numerator
for 307). Both agree the published percentage is wrong.

**F-#11b — the stylesheet total has drifted, and "a third" is a fifth.**
Recompiled at HEAD with `sass --style=compressed`: every partial matches
`packaging-diagnosis.md:418-427` **byte for byte** (sum 11 703, gzip within 0–4 B of 3 409). The global
total moved to 59 357 B min / 10 374 B gzip from the recorded 58 293 / 10 282 — four theme commits
landed 2026-09-02. Separately, the heading "A third of the global stylesheet is component-specific" is
wrong: 11 703 / 58 293 is **a fifth**.

**F-#17b — "no option to name an entry point" is true of the specifier, false of the artifact.**
`lib.flatModuleFile` renames the emitted FESM and `.d.ts` (`entry-point.js:138-139`, used at `:110-114`).
It cannot rename the public import path. The distinction matters because **deck 8's option E is exactly
a post-build renaming**, and `shape-probe/dist-A/package.json` already carries hand-added `./button`,
`./table`, `./core` aliases beside the long paths.

**F-#19b — the attw evidence does not exist as an artifact. HIGH ratio of consequence to evidence.**
`@arethetypeswrong/cli` is **not installed** and no attw output is saved anywhere. The node10 claim
rests entirely on `packaging-diagnosis.md:743-768` and `8-entry-point-shape.html:253-282`. Physical
corroboration is good — `shape-probe/dist-B/package.json` carries a hand-written `typesVersions` beside
its `exports`, and `dist-B/types/shapelib-b.d.ts` is three `export * from` lines, exactly the shape that
would fail node10 — so somebody built the fix and had something to test. **What is missing is the
three-row green/red table itself**, and this claim is what promotes a caveat to "a measured breaking
change".

**F-#18b — the ng-packagr crash has no captured log**, but the mechanism is corroborated in installed
source: `analyse-sources.transform.js:63-73` overrides `resolveModuleNames` so a non-relative
package-internal specifier returns `undefined` and is registered as an entry-point dependency, while a
relative one resolves normally into the current program. `file.referencedFiles[index]` destructuring
does exist in the installed `typescript/lib/typescript.js`, so `Cannot destructure property 'pos'` is a
real TS internal. The "including a type-only one" half rests entirely on narrative
(`packaging-diagnosis.md:350-354`) — **and it is the correction that turned 249 rewrites into 318**, so
it deserved a captured log.

**F-#1b — the 18.2 KB sentence inverts its own meaning.** "The 52 components a prototype never uses
**cost it** 18.2 KB" — unused components cost a tree-shaken prototype **zero**. 18.2 KB is what they
would _add_ if used: the ceiling on what any split could save. Same slippage at
`packaging-diagnosis.md:28`. Also: entry cost is quoted as "5.6 KB" from two different builds (5 569 B
and 5 351 B).

**F-#9b — "35% of the button's cost" needs its denominator stated.** 11 295 / 32 087 = 35.2% is
35% of the button's _marginal cost over bare Angular_, not of its 62 733 B total. The structural half
is fully confirmed at HEAD (`button.component.ts:19,21-22,25-26,62,78`).

**F-#12b — the CDK figure is a retained closure, not "the package".** 48 375 − 30 646 = 17 729 B is
`Overlay` + a global position strategy + backdrop. A different overlay usage retains a different amount.

### Agent F confirmed as CORRECT (the 18 that stand)

Claims 1, 2, 5, 6, 8, 9, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22 — plus the two structural ones. Notable
independent reproductions:

- **#13, the strongest-evidenced claim in the set.** The agent rebuilt the group graph from `src/lib`
  (77 groups over 255 files, same grouping function as the lint rule) and ran Tarjan itself:
  all edges → `[card, config, core, icons]`, `[radio-group, radio]`, `[time-picker, time-columns]`;
  runtime edges only → the two sibling pairs. Exactly as claimed, and every edge in
  `packaging-diagnosis.md:361-368` matches a real import.
- **#16.** Recomputed at HEAD: **320** cross-group relative statements (250 runtime + 70 type-only) and
  the rule reports **308**. The +2/+1 drift is fully explained by four `src/lib` commits landing
  2026-09-02 (`fb44874c`, `c61b686e`, `c04c8b9f`, `da78eb22`). The structural explanation of the gap is
  confirmed: the difference is exactly the 12 imports inside the three accepted SCCs — 320 − 12 = 308.
- **#22.** `@angular/build/src/tools/esbuild/application-code-bundle.js:465` —
  `...(optimizationOptions.scripts ? { 'ngDevMode': 'false' } : undefined)`. Exact line, exact
  condition. `@angular/build` 21.2.15.
- **#17.** The naming rule is in the source, not inferred:
  `discover-packages.js:137-138` derives `secondaryModuleId` from `path.relative(primary.basePath,
basePath)`, and `entry-point.js:153-154` returns it verbatim. All eight schema keys check out.
- **#11.** Every stylesheet partial reproduced byte-exact.
- **#20.** Exactly two relative imports in all 12 files of `src/lib/core` — `config-defaults.ts:2` and
  `option.ts:1`.
- **#12, #1, #2, #9.** Arithmetic re-derived exactly.

### Housekeeping the agent disclosed

It created an empty `C:\Repositories\ids-design-system\err.txt` via a `2>err.txt` redirect and
declined to delete it (deletion is also a write). **Deleted 2026-09-02.**

---

## Wave 1 is now closed except one axis

| axis                                | outcome                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| shipped commit `d8eb81c0`           | agent C — 7 findings, core mechanism sound                              |
| shipped commit `e8cef30a`           | agent D — 12 findings, 2 HIGH                                           |
| arithmetic / cross-document numbers | agent B — 3 CRITICAL, 16 total                                          |
| records consistency                 | agent E — 24 findings, 4 reversed verdicts unswept                      |
| audit of my 22 claims               | agent F — 2 FALSE, 4 OVERSTATED, 18 stand, 9 new contradictions         |
| **measurement methodology**         | **re-dispatched and RETURNED — 20 findings, 2 HIGH structural. Below.** |

**Triple-confirmed across independent agents:** the icon map is 86 (83 at the measured version), never
115 — B-F16, E-F23, F-#10. **Cross-confirmed:** the `todo.md:560` percentage is wrong — D-F3 and F-#16b
by different routes.

**Cross-wave conflict count so far: one** (13 vs 14 devWarn sites — agents C, E and my own grep say 13;
agent B says 14). My grep decides it: **13**.

---

# STEP 2 — MY OWN VALIDATION (in progress; wave 2 running in parallel)

Wave 2 dispatched 2026-09-02: five agents attacking wave-1 findings (arithmetic, lint rule,
dev-warning, my-22-claims, records consistency) plus a re-dispatch of the failed measurement-
methodology axis. Every wave-2 prompt forbids agreeing without independent evidence.

## V-1. C-F4 — **REJECTED-BY-ME.** The shipped doc comment is CORRECT for our pipeline.

The agent got the intermediate-`const` form to fold with raw esbuild 0.27.3 and concluded the comment
was false. I re-ran it through the pipeline the comment is actually about — ng-packagr partial-Ivy
FESM → `@angular/build` application builder with `define` — using `.claude/local/define-probe`.
Six shapes, each packaged and built twice (`--configuration full` and `--configuration prototype`,
the latter defining `dsPrototype: "true"`). Marker count is out of 500.

| guard shape                                                                     | FESM markers | full build      | prototype build     |
| ------------------------------------------------------------------------------- | ------------ | --------------- | ------------------- |
| `if (typeof dsPrototype === 'undefined' \|\| !dsPrototype)` — **as shipped**    | 500          | 500 / 123 498 B | **0 / 99 550 B**    |
| `const ADVANCED = typeof … ; if (ADVANCED)` — module scope                      | 500          | 500 / 123 503 B | **500 / 123 469 B** |
| `const advanced = typeof … ; if (advanced)` — inside the callback               | 500          | 500 / 123 498 B | **500 / 123 462 B** |
| `const ADVANCED_BARE = !dsPrototype; if (ADVANCED_BARE)`                        | 500          | 500 / 123 479 B | **500 / 123 469 B** |
| `if (!dsPrototype)` — inline, no `typeof`                                       | 500          | 500 / 123 472 B | **0 / 99 550 B**    |
| `if (!dsPrototype \|\| typeof dsPrototype === 'undefined')` — inline, reordered | 500          | 500 / 123 498 B | **0 / 99 550 B**    |

**Every inline form folds. Every `const` form fails to fold, at either scope, with or without
`typeof`.** The prototype build of the const variants is the same size as the full build — the whole
23 948 B saving disappears.

The mechanism, from the emitted bundle: esbuild **does** fold the initializer —
`grep -o "jf=[^,;]*" dist-const-v1-prototype/browser/main.js` returns `jf=!1` — but it does **not**
propagate that constant into the branch, which survives as `jf&&(e.push("advanced-payload-marker-0"…`.
So the payload ships behind a branch the bundler has already proved can never run. That is precisely
what the shipped comment says, in the words it says it.

→ **Rule 1 of the comment ("the guard must sit INLINE") is CONFIRMED for our pipeline.** The agent's
raw-esbuild result is presumably also correct for raw esbuild; it is not a statement about how this
library is built. No rewording is needed — the file documents this repo's build. The one thing worth
ADDING is the reproduction: the `jf=!1` observation, which is what makes the rule checkable.

→ **Rule 2 of the comment ("it must be the `typeof` form") is CONFIRMED, and the comment already
states the right reason.** Rows 5 and 6 show the bare inline form folds _equally well_, so `typeof`
buys nothing for folding. What it buys is runtime safety, exactly as the comment says: the full build
of the bare form emits `return dsPrototype||(e.push(…` — an **undeclared free identifier**, a
ReferenceError in any consumer whose build does not define it. The shipped form emits
`(typeof dsPrototype>"u"||!dsPrototype)&&…`. If anyone later "simplifies" rule 2 away because the
fold still works, they reintroduce that crash.

**The one thing in that file that IS wrong is the count**: "1 590 B gzip across the 14 call sites"
(`build-flags.d.ts:9`) — it is 13. That is C-F1, separately confirmed.

## V-2. B-F16 / E-F23 / F-#10 — **CONFIRMED-BY-ME, and I refute agent F's variant of it.**

Parsed the `ICONS` object literal and counted top-level keys at six refs:

| ref          | keys   | file    |
| ------------ | ------ | ------- |
| working tree | **86** | 9 437 B |
| `HEAD`       | **86** | 9 437 B |
| `v0.11.2`    | **86** | 9 437 B |
| `v0.11.1`    | **86** | 9 437 B |
| `v0.11.0`    | **86** | 9 508 B |
| `v0.10.0`    | **86** | 9 508 B |

**86 at every ref back to v0.10.0.** The map has never had 115 entries in any released version, so
`packaging-diagnosis.md:409`, `todo.md:610` and `11-rejected-with-numbers.html:137` are all wrong.

→ But **agent F's "83 at v0.11.1" is also wrong** — the count is 86 there too, and the file is
byte-identical to HEAD's. Three agents said 86; only F added the 83, and it does not survive.
Calibration: agent B was wrong about devWarn (14 vs 13), agent F is wrong here. **Neither agent's
numbers can be taken on trust; each has now been caught once.**

Consequence for the argument (unchanged by which figure is right): 2 522 B gzip was measured by
cutting 86 icons down to 9, so it is the cost of the 77 removed, not "the entire set", and deck 11's
per-icon extrapolation is built on the wrong divisor. The _conclusion_ — splitting the icon map is not
worth it — stands either way, and stands more firmly at 86 than at 115.

## Validation table (running)

| finding                                           | my verdict                                  | what decided it                                             |
| ------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| C-F1 (13 devWarn sites, not 14)                   | **CONFIRMED-BY-ME**                         | grep: 13 calls, 4 guards (button 1, stat 1, table 11)       |
| C-F2 (six `isDevMode()` sites still ship)         | **CONFIRMED-BY-ME**                         | built FESM: 7 `isDevMode`, 4 `typeof ngDevMode`             |
| C-F3 (`build-flags.d.ts` redundant, masks TS2451) | wave 2 running                              | must not be settled by reading — needs the tsc runs         |
| **C-F4 (inline-guard rule false)**                | **REJECTED-BY-ME**                          | six-shape build matrix above; `jf=!1` survives unpropagated |
| C-F5…C-F7                                         | wave 2 running                              |                                                             |
| D-F1…D-F12                                        | wave 2 running                              | D-F1 and D-F2 change what we ship                           |
| B-F1…B-F9                                         | wave 2 running                              | B-F2 is the one that moves a conclusion                     |
| **B-F16 / E-F23 / F-#10 (86 icons)**              | **CONFIRMED-BY-ME**                         | six-ref key parse, table above                              |
| F-#10's "83 at v0.11.1"                           | **REJECTED-BY-ME**                          | 86 at v0.11.1, file byte-identical to HEAD                  |
| B-F10…B-F22 (except F16)                          | **not assigned to wave 2** — mine to finish |                                                             |
| E-F4…E-F38                                        | partly wave 2, remainder mine               |                                                             |
| F-#1b, #9b, #11b, #12b, #18b                      | mine to finish                              |                                                             |

## Calibration ledger — every agent caught in an error so far

| agent            | caught on                                              | by                        |
| ---------------- | ------------------------------------------------------ | ------------------------- |
| B (arithmetic)   | 14 devWarn sites; it is 13                             | my grep, agents C and E   |
| C (dev warnings) | C-F4: generalised a raw-esbuild result to our pipeline | my six-shape build matrix |
| F (my 22 claims) | "83 icons at v0.11.1"; it is 86                        | my six-ref parse          |
| D, E             | nothing yet                                            |                           |

This is the point of the two waves. **No finding enters the fix list on an agent's authority.**

## V-3. B-F18 — **CONFIRMED-BY-ME, and the error is bigger than the agent said.** Item 8's CSS prize is roughly HALF what is published.

B-F18 was filed as SUSPECTED: "item 8's gzip total is the SUM of individually-gzipped parts, which is
always larger than gzipping the concatenation. Exact-to-the-byte match proves it was added, not
measured." Agent E's coverage list and agent F both reproduced the per-partial table byte-exact and
treated the total as sound, because each ROW is correct. **Neither of them tested the total.**

I recompiled every partial at HEAD with dart-sass `style: 'compressed'`, then measured three different
things the doc conflates:

| what is being measured                                | gzip        | note                                          |
| ----------------------------------------------------- | ----------- | --------------------------------------------- |
| **sum of the ten partials gzipped SEPARATELY**        | **3 409 B** | ← what `packaging-diagnosis.md:415` publishes |
| gzip of the ten partials CONCATENATED                 | 2 568 B     | −841 B: one dictionary instead of ten         |
| **`ds.scss` minus the ten `@forward` lines, ablated** | **2 156 B** | ← the only figure that answers the question   |

The per-partial rows reproduce exactly (`dropdown-overlay` 4 346/1 043, `overlay-motion` 1 829/458,
`link` 1 685/533, `page-grid` 1 079/312, `scrollbar` 774/297, `surface-motion` 751/192,
`layout-utils` 706/184, `skeleton-shimmer` 337/207, `icon-base` 119/92, `toast-overlay` 77/91) and the
**minified** total of 11 703 B is correct, because minified bytes are additive. **Gzip is not
additive**, and the published 3 409 B **overstates the real cost by 58%.**

The ablation is the right method because these partials do not ship as ten files. They ship inside one
`styles/ds` stylesheet, where they share a compression dictionary with the other eleven partials as
well as with each other. Removing them from `ds.scss` is exactly the change item 8 proposes, so
measuring that removal is exactly the prize.

**Both sub-totals move the same way:**

| group                                                                                                                    | doc says | ablation says |
| ------------------------------------------------------------------------------------------------------------------------ | -------- | ------------- |
| component-scopable (`link`, `page-grid`, `scrollbar`, `surface-motion`, `layout-utils`, `skeleton-shimmer`, `icon-base`) | ~1.8 kB  | **1 018 B**   |
| portaled (`dropdown-overlay`, `overlay-motion`, `toast-overlay`)                                                         | 1 592 B  | **1 055 B**   |

`presentations/9-opt-in-seam.html:338` and `11-rejected-with-numbers.html:180` both publish the
1 592 B figure; it is 1 055 B. And the sentence at `packaging-diagnosis.md:489` — "the prize is a third
of what item 8 reported" — is wrong twice over: on the published numbers it is 47% (B-F17, confirmed),
and on the measured ones it is 49%. **It is half, either way.**

Consequences, and they cut in the direction the record already leans:

- "A consumer rendering one button ships **3.4 kB gzip** of dropdown, toast and skeleton CSS"
  (`packaging-diagnosis.md:428`) → **2.1 kB**.
- The heading "**A third** of the global stylesheet is component-specific" is a fifth: 11 703 / 59 356
  = **19.7% min**, and 2 156 / 10 391 = **20.7% gzip**. F-#11b is CONFIRMED-BY-ME, by both measures.
- The whole CSS item was already a Tier-3 "independent win, priced". At half the price it is a
  weaker item, not a stronger one — **this finding makes item 8 less attractive, not more.** That is
  worth saying plainly, because a correction that happens to favour the conclusion the reviewer wants
  is the kind that gets waved through.

**Drift, separately:** `styles/ds` at HEAD compiles to **59 356 B min / 10 391 B gzip** against the
recorded 58 293 / 10 282 (`packaging-diagnosis.md:414`). Four theme commits landed 2026-09-02. Agent F
reported 59 357 / 10 374 — the 1-byte and 17-byte gaps against my run are gzip level (mine is level 9),
not a disagreement about the stylesheet.

**Calibration note.** This is the first finding where the WAVE-1 agent was right and two other wave-1
agents were wrong to clear it. B-F18 was filed as SUSPECTED with no measurement; it deserved
CONFIRMED. Agent B's arithmetic instinct was sound even though its devWarn count was not.

## V-4. B-F2 — **REFUTED-BY-ME.** The agent had the two floors the wrong way round. But there IS an invalid subtraction here, in the OTHER document, and it is worse.

B-F2 was ranked the most consequential wave-1 finding: it claimed
`packaging-diagnosis.md:436-439` mixes fixtures by computing `86 775 − 30 646 = 56 129`, that the
right floor is 59 019, and therefore CDK is **64%** of the post-A3 eager cost rather than "about a
third". **I rebuilt every scenario involved and the opposite is true.**

Method: `run-placement.sh` reports `initial` (main.js + every chunk it statically imports), `lazy`, and
the heavy-selector census, so every row below is one metric, one script, one library build
(`dist/ds` 0.11.2 at HEAD).

| scenario             | initial gzip | recorded | lazy bytes | has a lazy route? |
| -------------------- | ------------ | -------- | ---------- | ----------------- |
| `baseline`           | **30 646**   | 30 646   | 0          | **no**            |
| `cdk_only`           | **48 375**   | 48 375   | 0          | **no**            |
| `placement_after_a3` | **86 376**   | 86 775   | **0**      | **NO**            |
| `placement_clean`    | 59 020       | 59 019   | 574 554    | yes               |
| `anchor_typeonly`    | 59 034       | 59 034   | 574 554    | yes               |
| `placement_eager`    | 196 633      | 194 763  | 189        | yes               |

`grep -c "lazy-heavy" scenarios/*.ts` settles it: **`placement_after_a3` is the only placement scenario
with no `await import('./lazy-heavy')`.** Its `lazy=0B` confirms it at build time. So it is the same
app shape as `baseline` and `cdk_only`, and 30 646 is exactly its right floor.

→ **`86 775 − 30 646 = 56 129` compares like with like. The diagnosis's "CDK is ~32%" is CORRECT**
(at HEAD: 17 729 / 55 730 = 31.8%). B-F2's correction to 64% is itself the cross-fixture subtraction it
was complaining about — it takes a no-lazy-route measurement and subtracts a lazy-route floor.

### The error the agent walked past

Both documents subtract from 86 775. They disagree about the floor, so **one of them must be wrong**,
and the agent picked the wrong one to condemn:

| document                          | subtraction         | result                                     | verdict                                            |
| --------------------------------- | ------------------- | ------------------------------------------ | -------------------------------------------------- |
| `packaging-diagnosis.md:437`      | 86 775 − **30 646** | 56 129 → "CDK is ~32% of it"               | **valid** — same app shape                         |
| `packaging-chunking-audit.md:305` | 86 775 − **59 019** | 27 756 → "**falls to 27.8 KB gzip, −80%**" | **INVALID** — 59 019 is the lazy-route app's floor |

So the headline that sizes the entire A3 item — _"the DS's contribution to the initial bundle falls
from 135.7 KB gzip to 27.8 KB gzip, −80%"_ (`packaging-chunking-audit.md:303-306`) — **subtracts a
lazy-route floor from a no-lazy-route measurement.** Its 27.8 KB is not a measurement of anything.

**Recomputed with each scenario against its own control:**

- eager today: 194 763 − 59 019 = **135 744 B** the DS puts in the initial bundle
- the services closure, measured alone: 86 775 − 30 646 = **56 129 B** (55 730 B at HEAD)
- fall: 135.7 → 56.1 kB = **−59%, not −80%**
- and _"A3 is worth roughly 5.7× the table work"_ (`chunking-audit.md:307`) recomputes as
  (135.7 − 56.1) / 18.9 = **4.2×**

**A3 is still the largest single item on the plan by a wide margin, so nothing about the ordering
changes.** What changes is that its headline is overstated by a third, and the overstatement is
structural rather than a typo.

### The missing control, and why the honest number is a range

The deeper defect is that **`placement_after_a3` does not measure placement.** Its "0 of 11 heavy
components in the initial bundle" is vacuous — the scenario never imports them, and has no lazy chunk
for them to be in. It sits as the third row of a table whose other two rows both carry the lazy route,
and it is read as though it were the same experiment.

The control that was never built is: **the services injected eagerly AND the lazy route intact.** That
cannot be built against today's library — one entry point means `inject(ToastService)` drags everything,
which is precisely what `placement_eager` shows at 11/11. So the post-A3 figure is unavoidably a
**model**, and it should be labelled one. The best bound available from what exists:

- raw is additive, so post-A3 initial ≈ 178 723 (clean initial) + 204 510 (closure raw) = **383 233 B
  raw**, against 763 989 B raw eager — a fall of **−50% raw**
- gzip is sub-additive, so the gzip fall is somewhat better than the −59% computed above, and
  **cannot be better than −80% unless the closure compresses in context by more than a third**

→ **What the record should say: "from 135.7 kB to roughly 50–56 kB, about −60%", labelled a model,
with the note that the like-for-like control cannot be built until entry points exist.**

## V-5. B-F1 — **CONFIRMED-BY-ME, and I can now say where the extra bytes come from.**

Reproduced at HEAD with fresh builds of both scenarios:

- `placement_clean`: initial 178 723 B raw, lazy **574 554 B**
- `placement_eager`: initial 763 989 B raw, lazy **189 B**
- initial grew **+585 266 B**; the lazy chunk surrendered **−574 365 B**
- **residual: 10 901 B** (the recorded pair gives 9 667 B)

So "moves 576 239 B raw out of the lazy chunk and into the initial bundle"
(`packaging-chunking-audit.md:294`, `todo.md:317`) is indeed impossible as a description of movement.

But the agent's gloss — _"the extra 9 667 B existed in neither prior artefact"_ — is wrong. **It exists
in the eager build as the services' own code.** `placement_eager` injects `ToastService`, `ModalService`
and `BodyScrollLockService`; `placement_clean` imports nothing from the DS, so toast, modal and
scroll-lock were never in its lazy chunk either. The eager build therefore contains code that was in
NO chunk of the clean build. The residual is new code, not misplaced code.

→ Correct phrasing, and it is a small edit: _"One `inject(ToastService)` collapses the lazy chunk from
574 554 B to 189 B and grows the initial bundle by 585 266 B — the difference being the services' own
closure, which the clean build never contained."_

## V-6. B-F8 — **CONFIRMED-BY-ME.** The audit is right and the deck is wrong.

`chunking-audit.md:307` computes 5.7× from the SAVING: (135.7 − 27.8) / 18.9 = 5.71. That is internally
consistent with its own (invalid) 27.8. Deck 5 `:80` attaches the same "5.7×" to **135 744 B**, where
the ratio is 135 744 / 18 900 = **7.18×**. Two different quantities, one ratio.
→ With V-4's correction both die anyway: the defensible figure is **4.2×**.

## Running validation table — update

| finding                                             | my verdict          | what decided it                                                                                                            |
| --------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **B-F1** (saving larger than the thing saved)       | **CONFIRMED-BY-ME** | fresh builds: +585 266 in, −574 365 out, residual 10 901 B = the services' own closure                                     |
| **B-F2** (CDK is 64%, not a third)                  | **REFUTED-BY-ME**   | `placement_after_a3` has no lazy route (`lazy=0B`); 30 646 IS its floor; CDK = 31.8% at HEAD                               |
| **NEW (mine): the −80% headline is invalid**        | **CONFIRMED-BY-ME** | `chunking-audit.md:305` subtracts a lazy-route floor from a no-lazy-route build; correct figure ≈ −59%, A3 ≈ 4.2× not 5.7× |
| **NEW (mine): `placement_after_a3` has no control** | **CONFIRMED-BY-ME** | its "0 of 11" is vacuous; the like-for-like control cannot be built until entry points exist                               |
| **B-F8** (5.7× vs 7.0×)                             | **CONFIRMED-BY-ME** | deck 5 attaches the saving's ratio to the gross figure                                                                     |
| B-F18 (CSS gzip summed, not measured)               | **CONFIRMED-BY-ME** | ablation: 2 156 B, not 3 409 B — see V-3                                                                                   |
| B-F16 (86 icons)                                    | **CONFIRMED-BY-ME** | six-ref parse — see V-2                                                                                                    |
| C-F4 (inline-guard rule false)                      | **REJECTED-BY-ME**  | six-shape build matrix — see V-1                                                                                           |

## Calibration ledger — update

| agent            | caught on                                                                                             | by                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| B (arithmetic)   | 14 devWarn sites; it is 13                                                                            | my grep, agents C and E                   |
| B (arithmetic)   | **B-F2: inverted the two floors, and condemned the valid subtraction while clearing the invalid one** | my rebuild of all six placement scenarios |
| C (dev warnings) | C-F4: generalised a raw-esbuild result to our pipeline                                                | my six-shape build matrix                 |
| F (my 22 claims) | "83 icons at v0.11.1"; it is 86                                                                       | my six-ref parse                          |
| E, D             | nothing yet                                                                                           |                                           |

**Three of the five wave-1 agents have now been caught in a concrete error, and B — the agent whose
axis was arithmetic — has been caught twice, once on its own headline finding.** Its remaining
findings are not thereby void: B-F1, B-F8 and B-F18 all survived my check, and B-F18 was
UNDER-stated. Each item still has to be settled on its own evidence.

---

# WAVE 2 — agents attacking wave 1's findings

Dispatched 2026-09-02, five agents, each forbidden from marking anything CONFIRMED without its own
evidence. **4 of 5 returned; the arithmetic axis and the re-dispatched measurement-methodology axis are
still running.** Wave 2 did what it was for: it REFUTED or narrowed a wave-1 finding in every axis.

## Wave 2 on the dev-warning commit (`d8eb81c0`)

**W2-E1 — E1 (13 not 14) CONFIRMED, and the rival "table ×12" REFUTED.** Table has 11, enumerated
(1508, 1516, 1572, 1577, 1582, 1587, 1592, 1597, 1602, 1607, 1612). Same 13 at `d8eb81c0^`. Zero
`devWarn` in any `.html`. **Where 14 comes from is now known**: `grep -rn "devWarn(" src/ --include=*.ts
| wc -l` returns exactly 14 **because it matches the definition** at `core/dev-warning.ts:15`. A
definition is not a call site. Four places carry it: `CHANGELOG.md:226`, `dist/ds/CHANGELOG.md:226`
(shipped in v0.11.2), `build-flags.d.ts:9`, and the commit message.

**W2-E2 — E2 PARTIAL. The structure is right, the enumeration and the byte figure are not.**

- Correct: `isDevMode()` is a function CALL (`@angular/core/fesm2022/core.mjs:900`); its body folds
  under `--define`, the call does not. In the agent's own esbuild matrix the call form was **the only
  shape that survived `--minify`**. Angular defines nothing that would strip it.
- Correct: the FESM has exactly 4 `typeof ngDevMode` (lines 882, 2702, 6561, 6616) and 6 `isDevMode()`
  (295, 409, 659, 1559, 2374, 2894).
- **WRONG: there are five component sites, not six.** `projection-dropped.directive.ts:53` does **not**
  use `isDevMode()` — it is a bare `console.warn` inside `afterNextRender`. And the sixth `isDevMode()`
  in the FESM is **`devWarn`'s own guard** (`core/dev-warning.ts:16`), which C-F2 never mentions.
- **WRONG / UNSUPPORTED: 1 278 B raw / 732 B gzip.** Independent measurements of the same regions gave
  2 129/929, 1 617/879, and 600 B for the literals alone. Nothing lands on 1 278/732. The measurement is
  also **ill-posed**: filter-bar's `devMode` gates a template `@if` that pulls in a whole directive plus
  its template instructions, none of it in the cited lines. It would need two consumer builds.

**W2-E3 — E3 (C-F3) PARTIAL, and the conclusion is confirmed by better evidence than the docs app.**

- **The quoted reproduction command does not work**: `npx tsc -p tsconfig.lib.json --noEmit
--skipLibCheck false` aborts with `TS5051` on `inlineSources` and never reaches TS2451. Add
  `--sourceMap` and the TS2451 pair does reproduce exactly.
- **Context C-F3 omitted, and it matters:** under the settings the repo actually builds with
  (`tsconfig.json:11` sets `skipLibCheck: true`), `npx tsc -p tsconfig.lib.json --noEmit --sourceMap`
  gives **zero errors**. The file breaks nothing today.
- **"Not needed" CONFIRMED with a direct test, not an analogy.** The agent compiled the library sources
  with `build-flags.d.ts` excluded via a scratchpad tsconfig: **exit 0** with default `skipLibCheck`,
  and **exit 0 even at `--skipLibCheck false`**. So the TS2451 pair is caused entirely by our file, and
  `typeof ngDevMode === 'undefined' || ngDevMode` typechecks on Angular's declaration alone.
- The docs-app evidence was also checked rather than assumed: same base tsconfig, same `"types": []`,
  same strictness, adding only `resolveJsonModule`/`allowSyntheticDefaultImports`. 251 library sources,
  zero `build-flags`, exit 0.
- Angular's type has no `undefined`, but `typeof x === 'undefined'` is legal against any declared
  identifier — proven by those exit-0 runs.
  → **Verdict: delete line 18 (`declare const ngDevMode: …`), KEEP the comment.** The declaration is
  redundant and is the sole cause of the masked errors; lines 1-17 are the only record of the technique
  and part of it is load-bearing.

**W2-E4 — the C-F4 dispute is RESOLVED, and it resolves against MY explanation as well as the agent's.**

The agent reproduced BOTH results and then found the real mechanism.

- Raw esbuild 0.27.3, `--define:ngDevMode=false`: inline, module-scope const, exported const,
  cross-module const and block-scoped const **all fold** under `--minify-syntax`; only the function-call
  form survives. (Independent confirmation of the commit's premise.)
- My pipeline table was reproduced **byte for byte** from the surviving `dist-const-*` artifacts
  without rebuilding: 0/99 550 for inline, v4 and v5; 500/123 46x for v1, v2, v3.
- It then took the probe's own real FESM, hoisted the guard to a module-scope `const`, and bisected.
  Not payload size, not the `computed()` shape, not `ɵɵngDeclareClassMetadata`, not `--splitting`, not
  `sideEffects`, not operand order. The condition is:

> **esbuild 0.27.3 inlines a top-level `const` whose post-`define` initializer folds to a primitive
> ONLY IF the module declaring it contains no `import` statement at all.**

**I re-ran this myself, seven shapes, raw esbuild with `--define:dsPrototype=true --minify`:**

| shape                                        | markers left | output  |
| -------------------------------------------- | ------------ | ------- |
| inline, no import                            | **0**        | 40 B    |
| `const`, module has NO import                | **0**        | 40 B    |
| `const`, UNUSED import before it             | 40           | 1 253 B |
| `const`, import AFTER it, same module        | 40           | 1 276 B |
| `const`, USED import before it               | 40           | 1 278 B |
| `const` in its own IMPORT-FREE module        | **0**        | 51 B    |
| `const` in its own module that HAS an import | 40           | 1 253 B |

Confirmed exactly. Position of the import is irrelevant; used or unused is irrelevant; _any_ import in
the declaring module defeats the inlining.

→ **My V-1 framing was wrong.** It is not "our pipeline versus raw esbuild" — it is module shape, and
raw esbuild reproduces both outcomes on demand. Both measurements were right; my explanation was not.

→ **What survives, and it is the part that matters:** every Angular component module imports
`@angular/core`, so a guard `const` written in a component file can never fold. **The shipped rule
("the guard must sit INLINE") is correct for every file it governs.** Its stated _reason_ at
`build-flags.d.ts:12-14` — _"esbuild substitutes the identifier but will not propagate the constant
through module scope"_ — is **exactly backwards**: propagation through module scope is precisely the
case that works.

**W2-E5 — C-F5 PARTIAL, and the "roughly half" rebuttal is REFUTED.** Unreproducible from the record:
true, there is no `dist-button/` and no `build-button.log`. But the 827 B reconciles once collateral
tree-shaking is counted — folding the guarded block also orphans `DISCOURAGED_COMBOS` (669 B) and
`devWarn` itself (369 B): 867 + 669 + 369 = 1 905 B raw → **779 B gzip**, within 6% of 827.
→ Correct statement: _not reproducible from anything recorded, but plausible and not contradicted._

**W2-E6 — C-F6 CONFIRMED**, with context: `npm run format` currently reports 121 files with issues and
sits under `run-s -c`, so widening the glob would not make CI fail anyway.

**W2-E7 — C-F7 CONFIRMED.** Four rules registered in `eslint-rules/index.mjs`; nothing mentions
`devWarn` or `ngDevMode`.

## Wave 2 on the lint rule (`e8cef30a`)

The agent flagged its own methodology failure first, unprompted: its initial synthetic battery returned
0 for every case **including the positive control**, caused by a Bash heredoc collapsing `\\` to `\`.
It caught it _because_ the baseline was 0 and re-ran. **Only runs whose positive control fired are
reported.** That is the discipline this whole exercise is for.

**W2-D1 — CONFIRMED, with three corrections, and the "31" holds.**

```
SCC-defaults (as shipped)  TOTAL 308
PROBE core(13)             TOTAL 277
EXTRA = 31        ONLY-IN-PROBE = 0
```

The probe run is a strict subset — the defaults miss nothing.

1. **D-F1's itemisation sums to 30, not 31** — it says "menu ×5"; `menu.component.ts` adds a sixth.
2. **"All inside the planned core entry" is true and STRONGER than D-F1 claimed.** Every source group
   and every target group is one of the 13. The agent also tested the **post-A3-pre** partition (card
   and theme removed per `42b54a0b`): 279 violations, and all 31 are still suppressed.
3. **The probe config is ALSO stale.** `.claude/local/eslint.entrypoint-probe.mjs:8,10` still include
   `theme` and `components/card` in the core entry, which `42b54a0b` reverses. So "the correct
   configuration exists only in the gitignored probe" should read: **no correct configuration exists
   anywhere.**
   On "false positive": acting on one means rewriting `button.component.ts:12` to import
   `@ids-group-ltd/ids-design-system/core` **from a file inside the core entry** — a self-referential
   entry-point import. Today it is fully moot (`npx eslint "src/lib/**/*.ts"` → 0 messages); it fires the
   day someone follows the shipped instruction, and `eslint.config.mjs:124-128` and `todo.md:565` both say
   only "flip it to `'error'`".

**W2-D2 — CONFIRMED, and materially understated.** 99/68/64/17 reproduced. `src/lib` contains no
`components-root` directory and no ng-packagr layout produces one.
**The bigger finding**: the suggestion is derived from the GROUP, not the ENTRY POINT, so any partition
that merges groups breaks every suggestion pointing into the merged entry — and configuring `coLocated`
does not fix it. Under the probe config, **264 of 277 messages name a group that is a member of the
13-group core entry**; only the 60 naming `core` would be right. So **~204 of 277 (74%) suggestions are
wrong even with the correct configuration**, versus D-F2's 99.
Severity down-check: `meta` has no `fixable` and no `hasSuggestions`, so nothing auto-applies.
**Secondary claim REFUTED**: `src/lib/styles/` and `src/lib/themes/` contain **no `.ts` files at all**
(28 `.scss`, 7 `.woff2`), and the rule only probes `.ts`, so neither group can ever be a source or a
resolved target. The `package.json` collision is real in the abstract and unreachable here.

**W2-D3 — CONFIRMED, and D-F3's diagnosis of the 81% is BACKWARDS.**

| target          | defaults (308) | probe (277) |
| --------------- | -------------- | ----------- |
| components-root | 99             | 92          |
| core            | 68             | 60          |
| icons           | 64             | 57          |
| field-message   | 17             | 15          |
| **top-4 share** | **80.5%**      | **80.9%**   |

`todo.md:559-560`'s 92/60/57/15 is an exact match for the probe run. **But 224/276 = 81.2% is the probe
run's own internally consistent arithmetic — the percentage is not the error; the four absolute counts
attached to a 307 headline are.** And **B-F6's "73%" is also wrong**: 224/307 pairs a probe numerator
with a defaults denominator.
→ **Correct fix: keep 307 and keep 81%, replace the four counts with 99 / 68 / 64 / 17** (248/307 =
80.8%). The percentage survives under either config; nothing else does.
Provenance of the 307→308 delta confirmed directly: `git diff e8cef30a..HEAD -- src/lib` contains
**exactly one** added relative-import line, `table.component.ts:38` → bottom-sheet, from `93f65ace`.

**W2-D4 — CONFIRMED as a gap, its JUSTIFICATION REFUTED.** `ImportExpression` is absent and a dynamic
relative import reports 0. But **`@defer` is template syntax lowered by the Angular compiler; that node
never exists in the `.ts` source ESLint parses**, and `todo.md:580` is about _consumer_ code. Fix it —
but because a human will write `await import('../x/y')` during A3, not because of `@defer`.

**W2-D5…D12, each tested with a firing positive control:**

- **D-F5 CONFIRMED**, and _not_ a one-word fix: `TSImportType` carries `argument`, not `source`.
- **D-F6 CONFIRMED but inert** — `@typescript-eslint/no-require-imports` already fires on the same line.
- **D-F7 CONFIRMED, and the fail-open is broader than stated.** `'./x.ts'`, `'./x.js'` and
  `'../../does-not-exist/nope'` all report 0. The reachable defect is not the extension case (which
  needs `allowImportingTsExtensions`) but that **any unresolvable specifier is silently green** — a
  boundary guard defeatable by a typo.
- **D-F8 CONFIRMED**, mechanism verified twice (`groupOf` line 28 + `check` line 106).
- **D-F9 CONFIRMED, dormant, and the real defect is a NAME COLLISION**: lines 30 and 34 map two
  different directories onto one sentinel, so imports between `src/lib/` and `src/lib/components/` are
  mutually invisible.
- **D-F10 CONFIRMED as a code defect, REFUTED as a reachable one.** Proven at unit level with
  `Linter.verify` (which does not normalise), and refuted at every supported entry point: CLI
  `--stdin-filename`, Node API absolute posix, and Node API relative posix **all** produce 10 reports.
  The agent then named the defect D-F10 _should_ have found: `lastIndexOf` has no separator boundary
  check, so a checkout under `…\src\library\…` mis-roots the analysis instead of disabling it.
- **D-F11 CONFIRMED as fact, unreachable**: needs `X.d.ts` and `X/index.ts` for one base;
  `src/lib/core/build-flags.d.ts` is the only `.d.ts` and has no sibling directory.
- **D-F12 CONFIRMED**, true of **all four** ds rules; and the cited precedent is a different category
  (those three selftests are for standalone node scripts, not ESLint rules). `node:test` is built in.

**W2 on the reversed comment — CONFIRMED, and the history makes it worse.** `git show 2e1535aa`
(2026-09-01 20:59, "a comment pass over everything the last three releases touched") rewrote:

```
- *  config's type imports create (accepted 2026-09-01 - breaking it saves 593 B gzip). */
+ *  config's type imports create - accepted, because breaking it saves 593 B gzip. */
```

**The comment pass stripped the date, converting a dated record into a standing claim — and the next
day's commit falsified it.** Separately the sentence is a non-sequitur: "accepted, **because** breaking
it **saves** 593 B" gives a reason to break it as the reason not to. `todo.md:522` states it correctly
("accepting the cycle **costs** 593 B").

## Wave 2 on the audit of my 22 claims

**W2-V4 — F-#4 CONFIRMED on the premise, but the conclusion is NARROWER-THAN-STATED, not FALSE.**
Every citation re-verified line by line (the JSDoc block is `:20-33`, the provider line is `:26`, not
`:25` as `packaging-diagnosis.md:81` cites). The stylesheet anchors nothing: `ng-add` injects an SCSS
`@use`, contributing zero JS and zero runtime symbols.
**But the agent then asked the question F did not**, and found the answer in this repo:

- **`ds-docs` is a real consumer with an eager anchor twice over — and never via `provideDsTheme`.**
  `ds-docs/src/app/app.config.ts:7,18` provides `DS_TOAST_CONFIG` (a runtime `InjectionToken`) at the
  root; `app.ts:3-8` imports `AppLayoutComponent, ButtonComponent, IconButtonComponent, TopBarComponent`
  into the root shell and `app.html:1` renders `<ds-app-layout>`. That is the **measured** row at
  `packaging-diagnosis.md:70`, within 148 B of the theme-provider row.
- **But "there is no consumer for whom this is hypothetical" is refuted by the document's own table.**
  Rows `:66` and `:67` ARE that consumer, and both were built and measured.
  → **Correct statement:** an app that renders any DS component or provides any DS token in its root shell
  has an eager anchor — true of `ds-docs` itself; an all-lazy app with a DS-free shell has none.
  **Severity HIGH → MEDIUM**: the anchor-equivalence measurement is untouched and the A3 recommendation is
  unaffected. **Two documents carry the bad premise**, not one — `todo.md:534` repeats it verbatim.

**W2-V10 — F-#10 PARTIAL: the headline is right, two of F's three numbers are wrong.** Counted at six
refs plus the shipped `.d.ts`: **86 everywhere back to v0.10.0** (85 at v0.9.1). **F's "83 at v0.11.1"
is wrong**, so its "74 of 83" is wrong too — the ablation cut to 9, so 2 522 B is the cost of **77 of
86**. This is the **fourth** independent confirmation of 86 and the **second** independent refutation of
F's 83; it matches my own six-ref parse in V-2 exactly.
**Where 115 came from — the agent found it.** No legitimate source exists (SVG child elements: 174;
aliases: none; the union type has 86 members; no docs table). **The only 115 within nine lines of the
claim is `115 345 B` at `packaging-diagnosis.md:400`, the "one entry per component" figure.** The 115 at
`:409` is that number's digits carried down the page. Four files repeat it, including
`.claude/local/todo/packaging-bundle-plan.md:95`.

**W2-V14 — F-#14 PARTIAL, and this is the finding that changes the implementation plan.**

**I reproduced the whole thing independently** (Tarjan over the 77-group graph rebuilt from disk with
multi-line imports included — my first run missed the `time-picker ↔ time-columns` pair because the
regex forbade newlines; corrected, all three SCCs appear):

| cut                                                       | statements touched | non-trivial SCCs left                      |
| --------------------------------------------------------- | ------------------ | ------------------------------------------ |
| **the doc plan** — `ds-config`→core AND `card.types`→core | **17**             | `core+icons` (+ the 2 sibling pairs)       |
| **`card.types` → core, ALONE**                            | **4**              | `config+core+icons`                        |
| `card.types` → config, alone                              | 4                  | `config+core+icons`                        |
| **`ds-config` → core, ALONE**                             | **14**             | **`card+core+icons` — card STILL trapped** |

Three things follow, and each is published wrongly today:

1. **The published "14" is the cost of a move that does not achieve the goal.** 11 + 3 = 14 is
   `ds-config` alone; that cut leaves `components/card` inside a three-way SCC.
2. **The doc plan costs 17, not 14** — and not F's "15-16" either. The 17 are enumerated in my run:
   10 component imports of `ds-config`, `core/config-defaults.ts:2`, `config/ds-config.ts:2,3,4` (its
   own outbound paths change), `auth-layout.component.ts:10`, `card/card.component.ts:8`,
   `card/index.ts:2`. Plus `src/public-api.ts:1` outside `src/lib` → **18 total**.
3. **The stated architectural goal costs 4 statements, not 17.** `todo.md:521-524` gives the motive as
   the layering inversion (`ds-config` type-importing from a COMPONENT) and making `card` an ordinary
   leaf. **Moving `card.types.ts` alone achieves both**, for `auth-layout.component.ts:10`,
   `card.component.ts:8`, `card/index.ts:2`, `config/ds-config.ts:4`. The other 13 statements buy only
   the dissolution of the `config` group name — and `config/` holds exactly one file while
   `core/config-defaults.ts ↔ config/ds-config.ts` is a genuine 2-cycle, so **config and core share an
   entry point either way**. Zero byte or granularity difference.

The agent also notes ~11 of the 17 are rewritten by A3 regardless (they already cross a boundary and are
inside the 308 count; only the target specifier differs), so the genuinely NEW edit surface is ~6.
→ **A3-pre's reversal survives and gets cheaper: the minimum useful cut is 4 statements.**

**W2-V21 — F-#21 CONFIRMED, and the agent measured what F said was never measured.**
Template references verified: `popover.component.html:7-20` is **real duplication** (a second
`<div class="popover">` with four attribute bindings and a duplicated arrow span);
`select.component.html:107-111` is a second render site but only 5 lines and **reuses `#panelContent`**
rather than duplicating markup; `select.component.html:32` and `modal.component.html:1,4,12,13` are
inline conditions folded into existing bindings. 7 TS guards, so "about eight early returns" is fair.
**Measured on `dist-core_seed/browser/main.js`, a real optimised production bundle containing
`PopoverComponent`**: excising every `staticPreview`-attributable byte (directive IIFE 187 B, compiled
`@if` branch ~290 B, arrow-span fn 41 B, plus the `ɵɵconditional`/`hostDirectives`/guard fragments)
gives **701 B raw → 127 B gzip for popover alone**; whole-library estimate **~1.5-2.0 kB raw /
~250-400 B gzip**. An order of magnitude above "tens of bytes" in raw.
**And the point that actually settles the question, which neither the deck nor F made:** a `define` flag
**cannot strip most of it**. The template compiles to `ue(r.preview.staticPreview()?2:-1)` — a signal
read on a component instance, not a constant esbuild can fold. `define` has no reach into
`ɵɵconditional` arguments or a `hostDirectives` array. A flag could remove only the 7 TS guards
(~250 B raw). → **The deck's rejection is right and should be stated more strongly, with the number
replaced.**

**W2-V15b — F-#15b REFUTED. Two different objects, both sound.**

- `chunking-audit.md:339` / `packaging-diagnosis.md:153` **"core (13 groups)"** is a computed transitive
  closure seed: 12 groups plus `components/card` from the accepted SCC. `:339` states the check
  explicitly: 77 − 13 = 64.
- `todo.md:479` **"core | 15"** is a **semantic cluster** in a six-way hand partition after merging its
  SCCs. That table sums 60 + 15 + 2 = 77. ✔
  Different definitions, different partitions, both summing to the independently measured 77.
  **The real defect is traceability**, not contradiction: neither document says which object "core"
  denotes at the point of use, and the cluster membership behind the 15 is recorded nowhere, so it cannot
  be recomputed. → label them **"core seed (13)"** and **"core cluster (15)"**.

**W2-V17b — F-#17b CONFIRMED on ng-packagr, and the agent answered the decision question with a
controlled experiment.** `flatModuleFile` verified at `entry-point.js:138-139`, consumed at `:106`,
naming `declarations`, `declarationsBundled`, `esm2022` and `fesm2022` — it renames the artifact, never
the specifier. The runtime side is already proven in the fixture: `shape-probe/alias-app/src/main.ts`
imports `ButtonComponent` from **both** `shapelib-a/button` and the native long path, and the build log
shows a clean 98.82 kB bundle with **one** class identity.

**W2-V19b — F-#19b CONFIRMED on the evidence gap, AND the missing table is contradicted by the
fixtures.** `@arethetypeswrong/cli` is not installed, not in `package.json`, and no output is saved.
**I re-ran the resolution experiment myself**, with a real `node_modules` (the virtual-host version I
tried first failed its own positive control and was discarded), TypeScript 5.9.3, and a negative control
in every run:

| specifier                                                 | node10   | bundler | node16 |
| --------------------------------------------------------- | -------- | ------- | ------ |
| `shapelib-a` (root)                                       | OK       | OK      | OK     |
| `shapelib-a/src/lib/components/button` (native long path) | **OK**   | OK      | OK     |
| `shapelib-a/button` (hand-added ALIAS, no directory)      | **FAIL** | OK      | OK     |
| `shapelib-b/components/button` (stub + `typesVersions`)   | **OK**   | OK      | OK     |
| `shapelib-c/button` (stub, **NO** `typesVersions`)        | **OK**   | OK      | OK     |
| `shapelib-c/does-not-exist`                               | FAIL     | FAIL    | FAIL   |

Ablations, each isolating one cause:

| variant                                       | `shapelib-b/components/button` under node10    |
| --------------------------------------------- | ---------------------------------------------- |
| as shipped (stub + typesVersions)             | OK                                             |
| **minus `typesVersions`, stubs kept**         | **OK** — the typesVersions is redundant        |
| **minus `typesVersions` AND minus the stubs** | **FAIL** — the stubs are what make node10 work |
| dist-A + a `typesVersions` for its alias      | its alias goes **OK**                          |

**ng-packagr already emits a per-entry-point node10 compatibility stub** — `dist-C/button/package.json`
is `{"module": "../fesm2022/shapelib-c-button.mjs", "typings": "../types/shapelib-c-button.d.ts"}` —
and `dist-C` carries no `typesVersions` at all.

→ **`packaging-diagnosis.md:751-757` ("💀 resolution failed" for every subpath; "a measured breaking
change") is REFUTED for the natural ng-packagr shape.** A plain multi-entry build is **not** a node10
breaking change.
→ **`typesVersions` is mandatory only for option E** — post-build short aliases, which have no directory
on disk. That is a real and previously unpriced cost of option E specifically, and a cost options B/C/D
do not carry at all.
→ Untested caveat the agent flagged honestly: the stubs carry `module` + `typings` but no `main`, so
`require()` under node10 CJS would still fail. Irrelevant for an Angular ESM library, but unmeasured.

**W2 re-tests of F's clean bill (it picked five, not the three I asked for):**

- **#13 CONFIRMED** — rebuilt the graph, ran Tarjan, got exactly the three SCCs, matching
  `DEFAULT_CO_LOCATED`. **My own independent run agrees** (after fixing my multi-line regex).
- **#16 — F's numbers right, the documents' not, and a NEW defect found.** 556 relative statements,
  **320 cross-group** (318 imports + 2 exports), minus the three co-located sets → **308**.
  **`todo.md:459` splits the 318 as "249 runtime + 69 type-only"; the measured split is 258 + 60** — off
  by 9 in both directions, total unaffected. This matters because `packaging-diagnosis.md:354` uses that
  split to argue "318 rewrites, not 249".
- **#20 CONFIRMED exactly** — 2 lines across 12 files, and both are the SCC edges.
- **#22 CONFIRMED at the exact line** — `application-code-bundle.js:465`, inside the `define` block at
  `:460`, comment at `:462-464`. Neighbours `ngJitMode`, `ngServerMode`, `ngHmrMode` at `:466-468`.
- **#11 CONFIRMED arithmetically**; independent sass compile gives 59 357 / 10 394 vs the doc's
  58 293 / 10 282 — 1.8% / 1.1% high, "consistent with the doc having used esbuild's CSS minifier".
  **Note this does NOT touch my V-3 finding**: the agent verified the table SUMS correctly; V-3 shows
  the sum is the wrong operation.
- **#12 CONFIRMED arithmetically** with the caveat wave 1 should have recorded: it is a difference of
  two builds, carrying both builds' error, and **no artifact for either is preserved**.

## Wave 2 on records consistency

**W2-R1 — PARTIAL. Agent E flattened five heterogeneous sites into one verdict; only two are wrong
today.**

- **Genuinely wrong now (both in deck 4):** `:100-101` asserts "priced and declined — 593 B gzip against
  **40 import rewrites**", where the 40 is refuted on its own terms by `todo.md:518` ("The 40 came from
  assuming `icons.data.ts` (28 importers) had to move too. **It does not.**"), and it cites commit
  `d6b52890` — real, but the _superseded_ declining commit, so a reader who follows the hash lands on
  the wrong record. `:253-255` says `ds-card` "lives in the core entry as a result", which the reversal
  undoes.
- **Stale rationale on a still-correct number (three sites):** `chunking-audit.md:338`,
  `todo.md:335-336`, `todo.md:392`. **The arithmetic is correct TODAY** — no code has moved,
  `ds-config.ts` still type-imports from `card`, so a partition computed on today's graph _does_ put
  `card` in the core seed. Only the word "accepted" has gone stale. These become **numerically** wrong
  the day A3-pre lands, not before.
- **The real reader hazard:** `todo.md` says "accepted rather than broken" at `:335` and "DO IT /
  reversed" at `:507`, 172 lines apart, **with no cross-reference in either direction**.

**W2-R2 — CONFIRMED, and it is a contradiction, not a chronology.** `todo.md:672-675` makes a factual
assertion **about the deck's present content** ("the page now marks B dead and recommends D — layered,
not per-component") that the deck explicitly repudiates in the same breath, calling that exact wording
"wrong in the expensive direction". It even adds "Read the rest of the page… which still hold",
inviting the reader to trust the summary. Asymmetry: `todo.md:392`, `:438` and `:469` all say
per-component; it is **one stale narrative sentence against three current ones**.
→ **Current recommendation, unambiguously: option D with a PER-COMPONENT top layer.** Only
`todo.md:674-675` misleads.

**W2-R3 — REFUTED as stated; the real defect is a one-way correction.** Every "two cycles" site is
**explicitly scoped to runtime edges**: `packaging-diagnosis.md:93` says "runtime edges only" in the
quoted sentence, and `chunking-audit.md:312-314` sits between the heading and `:317` saying "Runtime
edges only — `import type` and `{ type X }` are erased and were excluded, **which matters because two of
the interesting edges are type-only**". Both counts are TRUE under their stated definitions.
What is actually broken: `packaging-diagnosis.md:350` says "this CORRECTS §11(b)" and **§11(b) never got
the back-pointer**. And E-F3's "contradicts itself internally" half **survives**: `:317` asserts "exactly
two" and `:338` refers to "the four-way SCC" as an established object the section never derives.

**W2-R9 — CONFIRMED and UNDERSTATED.** Deck 4 `:250` says "verify that before promising a non-breaking
upgrade" about what the diagnosis calls a measured breaking change with a mandatory fix. The deck's
parenthetical is still true (`grep typesVersions` over `package.json`, `ng-package.json`,
`dist/ds/package.json` → zero hits), which makes the stale framing more dangerous, not less.
**Bonus wave 1 missed:** `packaging-diagnosis.md:759` says the caveat "was open on three decks" and names
"decks 5 and 9" — `grep untested` across all decks finds it only in deck `packaging-entry-points` (numbered `4-` at the time of the review)
and `8-entry-point-shape.html:165,256`. **Decks 5 and 9 never carried it.** A second instance of E-F12's
renumbering damage, inside the diagnosis doc.
→ **And note this whole item is now REFUTED at the root by W2-V19b**: the node10 breakage is not
measured and is contradicted by the fixtures. So deck 4's "untested" is closer to right than the
diagnosis's "measured".

**W2-R12 — CONFIRMED.** Deck 5 `:79-82` says "it is deck 5" while being deck 5 (chunk placement is deck
4), and `:88-89` attributes the 923 B seam figure to "deck 10", a tool deck; it lives in
`9-opt-in-seam.html:91,104,105,394`. README `:30-33` warns about exactly this.

**W2-R15 — CONFIRMED, with agent E's own arithmetic wrong.** README lists ranks 1-10; deck 11 absent.
`todo.md:25` says "Nine" and `deck-lint` reports **11 ranked open**. **E said "Ten decks on disk"; there
are ELEVEN numbered decks** plus `backlog-board`, of which ten are `open`. Deck 11 landed in `9b884b1c`,
the most recent commit — one-commit-old drift, not rot.

**W2-R24/R31 — CONFIRMED, called the strongest finding in the set.** The work shipped in `d8eb81c0`,
every site guarded, yet `todo.md:427` is still an open `- [ ]` in the present tense and
`packaging-diagnosis.md:613` still heads "A free win available **today**". Someone will do it twice.
Count confirmed 13, not the "14"/"Fourteen one-token edits" at `todo.md:428`, `diagnosis:616` and `:633`.
**E overstated "forbids"**: `diagnosis:607-609` states the `typeof` counter-rule scoped to `dsPrototype`,
not `ngDevMode`, so `:628`'s bare form is an inconsistency the shipped code already resolved correctly,
not a literal self-contradiction.

**W2-R22 — CONFIRMED in substance, WRONG in both numbers.** The agent checked **all** of them, not six:
`basic-advanced-split-audit.md:88-107` carries **25** citations, not 19, and **ten** no longer land, not
nine. Drift pattern is −1 near the top, −13 mid-file, +78…+86 below line 1300 — the signature of pure
insertion rot. **Strong mitigation wave 1 omitted:** `:86` states its baseline, "Verified in source on
**0.11.1**", and the tree is 0.11.2.

**W2-R35 — PARTIAL, two of three sub-claims REFUTED.** Only `9-opt-in-seam.html:67` says "Every number
here is measured"; **deck 11 makes no such claim**. And deck 9's vendor row sits under
`<th>Reported result</th>` at `:138` — the same honest framing as `diagnosis:681`. Deck 11 `:102-103`
carries "grids up to 40% smaller" **unlabelled**; that half stands. **"With no source" CONFIRMED**:
`grep -c 'https\?://' 9-opt-in-seam.html` → 0, and `packaging-diagnosis.md` contains exactly one URL in
771 lines.

**W2-R37 — CONFIRMED.** No title, no author, no URL for the "February 2026 guide", in either place. One
of two legs under the non-deprecation premise; the other is at least a followable file path.

**W2-R6 — CONFIRMED FALSE, count exact.** `modal/` has exactly eleven distinct external specifiers,
enumerated. `toast/` has three — also not "nothing". **And the record already knows**: `todo.md:686`
states it correctly ("need only button, spinner, icon"), so `chunking-audit.md:268`'s absolute form is
the outlier.

**W2-R29 — PARTIAL: literally false, E's exception list too SHORT, and the argument untouched.**
`grep -c 'input(false)' table.component.ts` → **0**; the real form is
`input(false, { transform: booleanAttribute })`. Substantive exceptions are **six**, not three:
`bordered:162`, `stickyScrollbar:337` (both `input<boolean|null>(null)`), `hiddenKeys:280`,
`columnOrder:292` (both `model<…|null>(null)`), `columnFilters:275`, `columnWidths:286` (both
`model<Map>(new Map())`) — **three of them are `model()`, not `input()`**. **But the second clause
("nothing is on by default") is true of every one**: `null` resolves to `false` through
`resolveWithConfig(…, false)` at `:392-395`, and empty maps mean nothing hidden or filtered.

**W2-R21 — REFUTED. The audit was exact at its stated baseline.** E's numbers for TODAY are right
(48 + 10 + 8 = 66, file 81 200 B), but the audit says 62 in 76 KB and states its baseline twice
(`:6`, `:86`: 0.11.1). At `v0.11.1`: input 46 + output 8 + model 8 = **62** exact; blob 74 399 B (LF) +
1 991 CRLF line endings = 76 390 B = **76 KB** exact. Control at HEAD: 79 017 + 2 183 = **81 200**, the
on-disk size. **Both figures reproduce to the byte at the version the document names.**
→ **Restating this as an error would itself be the mistake.**

**W2-R25 — PARTIAL: one of three wrong, two reproduce exactly.**

- **"85 exported `*Component` classes" REFUTED** — `todo.md:658` states its method verbatim
  (`grep -rho 'export class .*Component' src/lib | sort -u`) and that command returns **85**. E's 84
  came from a stricter regex dropping `W3wComponent`.
- **"All 96 exported declarables" REFUTED** — `bundle-probe/declarables.json` has length **96**.
- **"55" not a live error** — already corrected in place at two sites.
- **"95 components/folders" CONFIRMED WRONG** — actual **71**, and 71 at v0.11.1 too, so drift does not
  excuse it. It contradicts the record's own model twice: `audit:311`'s 77 groups = 71 + 6 is
  arithmetically exact, and `8-entry-point-shape.html:301,315` uses 71 correctly. Four sites carry 95.

**W2-R34 — CONFIRMED, low severity**, and the agent adds the point that matters: naming the version is
what **rescues** R21 and R22.

**W2-R38 — REFUTED. Agent E compared gzip against brotli.**

```
gzip -9 -c < dist-core_seed/browser/main.js       -> 84 430 B   (todo.md:523)
gzip -9 -c < dist-core_seed_card/browser/main.js  -> 85 023 B   (todo.md:523)
delta 593 B  ✓
brotli seed 74 371 -> 74.37 kB   card 75 018 -> 75.02 kB   delta 647 B
```

Angular's `Estimated transfer size` in the retained build logs is **brotli**. 593 B (gzip) and ~650 B
(brotli) are two correct compressions of the same 2 984-byte raw delta. E's own 84 438 / 85 031 are the
same files gzipped **with** the filename in the header (`gzip -c file` rather than `gzip -c < file`) —
8 bytes more each, same delta. **No defect; the record's 593 B is sound and fully reproducible.**

**W2 re-tests of E's coverage claims:** deck-lint 47 decks CONFIRMED; the five decks' README conformance
CONFIRMED by reading each `<head>`; **308 confirmed independently via the ESLint API** (255 files), so
`todo.md:558,564`'s 307 is one off; "nine of nineteen" REFUTED (ten of twenty-five); "ten decks on disk"
REFUTED (eleven).

**Wave 2's ranking of what actually misleads a reader today:** ① `todo.md:674-675` (wrong architectural
recommendation, in the index everyone reads first) ② the shipped devWarn item still open in two places
③ deck 4 `:100-101`/`:253-255` ④ deck 4 `:250` ⑤ `chunking-audit.md:268`'s absolute import claim.
**Findings wave 2 says should be STRUCK from the record: E-F21, E-F38, and two-thirds of E-F25.**

---

# STEP 4 — MY VALIDATION OF WAVE 2

I did not take wave 2 on trust either. I re-ran its three most consequential claims myself, each with a
control that had to fail.

## V-7. The esbuild `const` mechanism — **CONFIRMED-BY-ME, and it corrects MY OWN V-1.**

Wave 2 claimed the inline-vs-const split is not about our pipeline at all: esbuild inlines a top-level
`const` only when the declaring module has **no `import` statement**. I built seven shapes and ran raw
esbuild 0.27.3 with `--bundle --format=esm --define:dsPrototype=true --minify`, 40 markers each:

| shape                                            | markers left | output  |
| ------------------------------------------------ | ------------ | ------- |
| inline, no import                                | **0**        | 40 B    |
| `const`, module has NO import                    | **0**        | 40 B    |
| `const`, **UNUSED** import before it             | 40           | 1 253 B |
| `const`, import **AFTER** it, same module        | 40           | 1 276 B |
| `const`, **USED** import before it               | 40           | 1 278 B |
| `const` in its own **import-free** module        | **0**        | 51 B    |
| `const` in its own module **that has an import** | 40           | 1 253 B |

Reproduced exactly. Import position is irrelevant, used-or-unused is irrelevant: **any import in the
declaring module defeats the inlining.**

→ **My V-1 explanation was wrong.** "Our pipeline versus raw esbuild" was the wrong frame — raw esbuild
reproduces both outcomes on demand, and the variable is module shape. Both measurements were always
right.
→ **The V-1 conclusion is unchanged and now better founded.** Every Angular component module imports
`@angular/core`, so a guard `const` in a component file can never fold. The shipped rule holds for every
file it governs; only its stated reason at `build-flags.d.ts:12-14` is backwards and must be reworded.
→ Wave 1's C-F4 stays **REJECTED** as a claim about our code; wave 2 explains why both sides measured
what they measured.

## V-8. The A3-pre cut — **CONFIRMED-BY-ME. The published 14 is the cost of a move that does not work.**

Rebuilt the group graph from `src/lib` (255 files, 77 groups) and ran Tarjan, then re-ran it under each
candidate move, counting every statement whose text changes.

**A methodology note on my own run, because it nearly cost me the answer:** my first regex forbade
newlines inside an import statement, so it missed every multi-line `} from '…'` — and the
`time-picker ↔ time-columns` SCC vanished. Two SCCs instead of three was the tell. Widened the regex,
all three reappeared, and the cut results were unchanged. **A graph analysis that finds fewer cycles
than the shipped lint rule already encodes is wrong, and that is the check to run first.**

| cut                                                       | statements touched in `src/lib` | non-trivial SCCs left                                     |
| --------------------------------------------------------- | ------------------------------- | --------------------------------------------------------- |
| **doc plan** — `ds-config`→core **and** `card.types`→core | **17**                          | `core+icons`, `radio` pair, `time` pair                   |
| **`card.types` → core ALONE**                             | **4**                           | `config+core+icons`, + the 2 pairs                        |
| `card.types` → config alone                               | 4                               | same                                                      |
| **`ds-config` → core ALONE**                              | **14**                          | **`card+core+icons`** — card still trapped, + the 2 pairs |

1. **The published "14" (11 + 3) is `ds-config` alone**, which leaves `components/card` inside a
   three-way SCC. It is the cost of a move that does not achieve the goal.
2. **The doc plan is 17 in `src/lib`, 18 with `src/public-api.ts:1`.** Neither 14 nor F's "15-16".
   The three the doc misses are `card/index.ts:2` and `ds-config.ts`'s own two outbound paths
   (`../core/size` → `./size`, and its `card.types` import); `../icons/icons.data` is unchanged because
   `config/` and `core/` sit at the same depth.
3. **The stated goal costs 4.** `todo.md:521-524` gives the motive as the layering inversion and making
   `card` a leaf. `card.types.ts` alone does both: `auth-layout.component.ts:10`,
   `card/card.component.ts:8`, `card/index.ts:2`, `config/ds-config.ts:4`.
   The other 13 buy only the disappearance of the `config` group — and since `config/` holds one file
   and `core/config-defaults.ts ↔ config/ds-config.ts` is a real 2-cycle, **`config` and `core` share an
   entry point either way.** No byte difference, no granularity difference.

→ **A3-pre stays reversed-to-DO-IT and gets cheaper: 4 statements, not 14, not 17.** The 13-statement
`ds-config` move becomes optional tidying, to be judged on its own merits (it does remove a group,
77 → 76).

## V-9. node10 resolution — **CONFIRMED-BY-ME. A plain multi-entry build is NOT a breaking change.**

This is the claim that would withdraw a published "measured breaking change", so I ran it with controls
rather than accepting it.

**My first harness was wrong and I threw it away.** A virtual `ts.CompilerHost` returned FAIL for every
row **including the positive controls** — an all-red table is a broken harness, not a finding. I rebuilt
it with a real `node_modules` (copies of dist-A/B/C), the default compiler host, TypeScript 5.9.3, and
`shapelib-c/does-not-exist` as a negative control in every run.

| specifier                                                 | node10   | bundler | node16 |
| --------------------------------------------------------- | -------- | ------- | ------ |
| `shapelib-a` (root)                                       | OK       | OK      | OK     |
| `shapelib-a/src/lib/components/button` (native long path) | **OK**   | OK      | OK     |
| `shapelib-a/button` (hand-added alias, **no directory**)  | **FAIL** | OK      | OK     |
| `shapelib-b` (root facade)                                | OK       | OK      | OK     |
| `shapelib-b/components/button` (stub + `typesVersions`)   | **OK**   | OK      | OK     |
| `shapelib-c/button` (stub, **no** `typesVersions`)        | **OK**   | OK      | OK     |
| `shapelib-c/does-not-exist`                               | FAIL     | FAIL    | FAIL   |

Ablations, each isolating one cause, negative control failing throughout:

| variant                                               | `shapelib-b/components/button` @ node10       |
| ----------------------------------------------------- | --------------------------------------------- |
| as shipped                                            | OK                                            |
| **minus `typesVersions`**, stubs kept                 | **OK** — so the hand-written map is redundant |
| **minus `typesVersions` AND minus the on-disk stubs** | **FAIL**                                      |
| dist-A **plus** a `typesVersions` for its alias       | that alias flips to **OK**                    |

The cause is on disk: **ng-packagr emits a node10 compatibility stub per entry point.**
`dist-C/button/package.json` is `{"module": "../fesm2022/shapelib-c-button.mjs", "typings":
"../types/shapelib-c-button.d.ts"}`, and dist-C has no `typesVersions` anywhere.

→ **`packaging-diagnosis.md:751-757` — "💀 resolution failed" for every subpath, "now a measured
breaking change" — is REFUTED**, and it was never measured: `@arethetypeswrong/cli` is not installed and
no output was ever saved. It must be withdrawn or re-run with attw actually present.
→ **`typesVersions` is required only for option E**, the post-build short aliases, because those have no
directory on disk. **That is a genuine, previously unpriced cost of option E, and a cost B/C/D do not
have.** It makes E slightly more expensive and B/C/D slightly cheaper than deck 8 currently says.
→ One thing I did **not** test, and it is a real gap: the stubs carry `module` + `typings` but no
`main`, so a node10 **`require()`** would still fail. Irrelevant for an Angular ESM library consumed by
a bundler, but it is the row attw would have covered and I did not.

## Where the two waves disagree, and who wins

| question                     | wave 1                                | wave 2                                                              | **my verdict**                                     |
| ---------------------------- | ------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| devWarn call sites           | B: 14 · C, E: 13                      | 13, and **found the cause of the 14** (grep matched the definition) | **13**                                             |
| the const-fold rule          | C: the doc comment is FALSE           | it is true for every module with an import                          | **the rule holds; its stated reason is backwards** |
| CDK's share of post-A3 cost  | B: 64%, not "a third"                 | (arithmetic axis still running)                                     | **~32% — B inverted the floors** (V-4)             |
| icon map size                | B, E: 86 · F: 83 at v0.11.1           | **86** at six refs                                                  | **86 everywhere back to v0.10.0**                  |
| the A3-pre cut               | doc: 14 · F: 15-16                    | 17 for the doc plan, **4 for the goal**                             | **4 is the useful cut** (V-8)                      |
| node10 breakage              | doc: measured breaking change         | refuted by the fixtures                                             | **refuted — stubs make node10 work** (V-9)         |
| `ds-table` 62 inputs / 76 KB | E: wrong, it is 66 / 81 200           | **exact at the stated 0.11.1 baseline**                             | **strike the finding**                             |
| the 593 B figure             | E: log says 650, unreproducible       | gzip vs **brotli**                                                  | **strike the finding**                             |
| "core" = 13 or 15            | F: a contradiction                    | two different objects, both sound                                   | **not a contradiction — a labelling gap**          |
| CSS partial total            | B-F18: SUSPECTED, summed not measured | (wave 2 verified the ROWS, not the total)                           | **CONFIRMED and worse: 2 156 B, not 3 409** (V-3)  |

## Still open

- **The arithmetic axis of wave 2** and **the re-dispatched measurement-methodology axis of wave 1** are
  still running. B-F1…B-F9 are not finally settled until the first returns, though I have settled B-F1,
  B-F2 and B-F8 myself (V-4, V-5, V-6).
- **My own new finding — the `−80%` headline in `chunking-audit.md:305` is invalid** — has had no
  adversarial pass at all. It should get one before it is acted on.

## Wave 2 on the arithmetic findings — **two of the nine do not survive**

**W2-C1 — B-F1 CONFIRMED on the arithmetic, severity OVERSTATED, and the residual is fully explained
without a rebuild.** The agent read `run-placement.sh` and noticed the "lazy chunk" column is a
**residual**, not a chunk: `lazy = total − initial`. So each row's total is recoverable:

| row                    | initial | "lazy"  | **total JS** |
| ---------------------- | ------- | ------- | ------------ |
| no eager DS symbol     | 178 723 | 566 761 | **745 484**  |
| `inject(ToastService)` | 754 962 | 189     | **755 151**  |

`576 239 − 566 572 = 9 667`, and `755 151 − 745 484 = 9 667` **exactly**. The residual is the growth in
total emitted JS — the toast closure the DS-free build never retained.
**Corroboration the agent found in the same table:** the other three anchors go the OTHER way —
`provideDsTheme` totals 743 913, `provideDsConfig` 743 772, one `<ds-button>` 743 544, all **below** the
745 484 clean total, because collapsing two chunks into one removes wrapper overhead. **Only the toast
anchor adds new code.** That is a much better explanation than "existed in neither artefact", and it
matches my own fresh-build residual of 10 901 B at HEAD (V-5).

**W2-C2 — B-F2 REFUTED, independently and by the same route I took.** The agent grepped every scenario
for `await import(` and got the identical partition I did, then added a check I did not:
`bundle-probe/tsconfig.json` has `files: ["src/main.ts"]`, so **`lazy-heavy.ts` is never even compiled**
for a scenario that does not import it. It also refuted B-F2's parenthetical directly:
`basic-advanced-split-audit.md:187` says the ladder's scaffold **is** `.claude/local/bundle-probe/` —
same `angular.json`, same `tsconfig.json`, same `run.sh`. **"A different, smaller application" is false;
it is `scenarios/baseline.ts` in the same workspace.**
Its sanity check is the one I wish I had made: one `<ds-button>` alone costs 32 087 B gzip over the same
bare app, and the services closure contains button + icon + spinner + modal-card + toast + modal + CDK
overlay. **56 129 fits; 27 756 would make the whole closure cheaper than one button inside it.**
→ And it reached my V-4 conclusion unprompted: _"If anything the first-wave picked the wrong one of the
two to correct."_

**W2-C3 — B-F3 CONFIRMED, and the rejection is STRENGTHENED.** 18 172 and 32 022 re-derived. They are
not contradictory as numbers — different populations, same build — but the document asserts two mutually
exclusive headline prizes. And `basic-advanced-split-audit.md:69` ("a prototype that uses no table at
all saves 32 KB") is refuted by `:16` in the same document ("Unused components are already free"):
**that app sits at the 159 409 rung today and would sit at the same rung after the split. It saves 0.**
Deck 5 `:175-179` prints both claims three lines apart.
→ **The rejection does not collapse — it gets safer.** The case at `:113-128` rests on duplicate
maintenance, and a prize of ~0 rather than ≤32 KB makes that case stronger. Nothing in §3, §6 or the
AG Grid corroboration depends on the 32.

**W2-C4 — B-F4 CONFIRMED.** Recounted from disk with the shipped rule's own grouping: **77 groups**,
core 13, services 2, components **62**. 71 folders + 23 loose files + `config`/`core`/`icons`/`overlay`/
`theme` + `components-root` = 77. The 64 is derived in the audit itself as 77 − 13, so it necessarily
contains toast and modal; listing them again double-counts 2.
→ **Correct: `core (13) ← services (2) ← components (62)`.**

**W2-C5 — B-F5 CONFIRMED, with the mechanism nailed.** `src/lib/theme/` holds one file with **no
relative imports out and no importers anywhere** — verified both directions. So `theme` is legitimately
in the eleven no-runtime-edge list **and** in the 13-group core seed, and that double membership is the
only way the sum closes: runtime-edge universe 77 − 11 = 66; core contributes 11 of those; complement
**55** ✔. Full universe with a 13-group core: **64** ✔. Naive `55 + 11 = 66` overshoots by exactly 2 =
`theme` double-counted + `card` moved.
_(The agent disclosed that its own classifier found 10 no-edge groups, traced the gap to its regex —
`status-dot.component.ts:2` is an `import type` — and credited the audit's 11 as right. Same class of
self-caught error as my multi-line-import miss.)_

**W2-C6 — B-F6 REFUTED, and B-F6's citation is wrong too.** The agent ran the probe config and got
**277 violations**, with `components-root 92 / core 60 / icons 57 / field-message 15 = 224 = 80.9%`, and
heaviest importers multi-select 27, autocomplete 25, select 24, modal 13, input 11 — **every sub-figure
in `todo.md:558-562` reproduces exactly** (only `table` drifted 11→12). So **"81%" and "roughly fifty"
(53) are correct.** It then re-implemented the rule in Python, validated against the eslint run, and
confirmed 320 total / 308 under the three-SCC default / 277 under the 13-group core.
**What is wrong is the 307**, spliced from the other configuration.
→ I verified B-F6's citation myself: `todo.md:610-612` is the **icon-map item**; the 81% is at
**`:559`**. B-F6 cited the wrong lines.
→ **Note the two wave-2 agents propose opposite repairs** — the lint agent says keep 307 and swap the
counts to 99/68/64/17 (80.8%); the arithmetic agent says the counts are right and the 307 is wrong.
**Both are internally coherent; this is a choice of which configuration the paragraph describes, not a
factual dispute.** The percentage survives either way.

**W2-C7 — B-F7 CONFIRMED, both halves.** From the doc's own table (P1 318, P2 265, P3 257):
318 − 257 = **61**, 318 − 265 = 53, 53/318 = **16.67%**, 61/318 = 19.18%. So
`packaging-diagnosis.md:294`'s "53 more than three layers" should be **61**, and the 19% at `:275` is
correctly derived from 61. Deck 11 `:113-114` pairs the six-cluster delta with the three-layer
percentage; its own parenthetical computes to **16.7%**.

**W2-C8 — B-F8 CONFIRMED.** 135 744 / 19 303 = **7.03**. The 5.7× is correct in its home
(`chunking-audit.md:306-308`, where it multiplies the NET saving 107.9 / 18.9 = 5.71); the deck kept the
multiplier and swapped the gross figure in.

**W2-C9 — B-F9 PARTIAL, and one of the three is a DEFINITION difference, not an error.**

| number                                                                                                                      | what it counts                                                                       | verdict                                                                                                   |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **71** (deck 8 `:188,315`)                                                                                                  | component folders                                                                    | **correct**                                                                                               |
| **85** (deck 4 `:236,248`, labelled "component folders")                                                                    | `grep -rho 'export class .*Component' \| sort -u` = 85; `@Component` decorators = 85 | **number right, LABEL wrong** — a class count called folders. `todo.md:668` states this method explicitly |
| **95** (`chunking-audit.md:268`, `basic-advanced-split-audit.md:158,181`, `todo.md:686`, `packaging-diagnosis.md:19,50,97`) | nothing reproducible                                                                 | **wrong under every definition**                                                                          |

The agent checked every plausible denominator at 0.11.1 — 71 folders, 80 documented components, 85
classes, 88 `export *` lines, 96 declarables, 107 declarable classes. **None is 95.**
→ **I verified the three live counts myself: 71 folders, 23 loose `components/*.ts`, 85 classes.** All
three confirmed.
→ **New, in the same family:** `chunking-audit.md:9-10,186` records "73 component folders" for 0.7.0;
`git ls-tree -d v0.7.0:src/lib/components` returns **66**. So four distinct folder counts circulate
(66/71 real, 73/85/95 written).

---

# WAVE 1, AXIS 6 (re-dispatched) — measurement methodology

The axis that died on an API error. Re-run verbatim with one addition: it was handed B-F2 as a lead to
test rather than accept. **It refuted the lead and convicted the number at the other end — arriving at
my V-4 independently, by a different route.**

## The two structural findings

**M-F1 — HIGH, CONFIRMED. The `−80%` headline subtracts a code-split floor from a non-split total.**
Same conclusion as my V-4 and as W2-C2, reached through a byte-level reconstruction I had not attempted:

- `basic-advanced-split-audit.md:46` — the same 11 heavy components, **monolithic**: 741 977 B raw;
  bare app 92 686 B → payload closure **649 291 B**.
- `chunking-audit.md:290` — **split**: initial 178 723 + lazy 566 761 = **745 484 B** total.
  Splitting overhead = 745 484 − 741 977 = **3 507 B**.
- Payload left in the _eager_ chunk = 649 291 − 566 761 = **82 530 B**.
- And 178 723 − 92 686 = **86 037 = 82 530 + 3 507**, exactly.

**So the "DS-free floor" of 59 019 contains 86 037 B raw / 28 373 B gzip of code that exists only
because a lazy route uses the DS.** The post-A3 app still has that lazy route, so its floor stays
≈59 019 and the services closure sits **on top**: post-A3 initial ≈ 59 019 + 56 129 ≈ **115 kB gzip**,
DS contribution ≈ **56 kB not 27.8 kB**, saving ≈ **80 kB (−59%)** not "~108 kB / −80%", and the 5.7×
becomes **~4×**. Every figure matches what I computed in V-4 from fresh builds.
Propagated to: `chunking-audit.md:305-306,308`, `packaging-diagnosis.md:150,153,261`, `todo.md:321-322`.

**M-F2 — HIGH, CONFIRMED. A SECOND instance of the same failure class, which nobody had found.**
`packaging-diagnosis.md:218-222`: _"an app shell … 201 283 B … Built on its own that closure is
101 108 B gzip, so an eager-shell consumer stands to save ~98 kB gzip"_. `201 283` is
`scenarios/anchor_shell.ts` (**has** the lazy route); `101 108` is `scenarios/shell_closure.ts`
(**no** lazy route). Split-app initial minus monolithic total, again.
→ Corrected: ≈ 59 019 + (101 108 − 30 646) = 129 481 → saving ≈ **72 kB, not 98 kB**.

**And it bounded the failure class.** It checked every other delta in the three documents against the
scenario that produced each side: the divider `+5.6 KB`, the button `+32.1 KB`, the unused-components
18.2 KB, the table marginal 32.0 KB, the CDK 17.3 kB and the field-message 11 295 B **all subtract two
monolithic rungs and are shape-consistent**. **Exactly two instances, both now named.**

## Provenance and reproducibility

**M-F3 — HIGH (gap) / SUSPECTED (drift). Every figure is provenanced by a version string that did not
change while the library did.** `package.json` read `0.11.1` from the v0.11.1 tag (2026-08-31 16:09Z)
until v0.11.2 (2026-09-01 17:12Z), and in that window `src/lib` changed at least five times —
`6d73b435`, `e0b1e899`, **`fbf475e7` (a toast fix, i.e. inside the services closure)**, `a420ceaa`,
`d8eb81c0`. No probe script rebuilds `dist/ds`; no build order is recorded anywhere.
**Concretely at risk:** `packaging-diagnosis.md:216-218` puts "the three services 194 763" (doc
committed 15:16) and "an app shell 201 283" (committed 16:28) in ONE table with `fbf475e7` between
them. That row-to-row comparison is unverifiable as same-build. And it is now unrepeatable: `dist/ds`
on disk is 0.11.2, built 2026-09-02 01:38.

**M-F10 — SUSPECTED. Every ablation baseline is unverifiable.** The four probe branches are gone from
`git branch -a` with no reflog entries, so "control re-measured on the same build" cannot be checked.
What makes it worth flagging rather than trusting: the same doc set shows a build change moving a rung
(prototype+table 191 431 → 190 837 → 191 988), yet `ds-button` is reported as **62 733 B** on three
separate branch builds and on the 0.11.1 ladder. Possible; not demonstrable now.

**M-F17 — no graph-analysis tool survives.** The 77 groups, 318 imports, SCC list, core closure, 64-group
top layer and the P1/P2/P3 counts are produced by **no script anywhere in the repo**, and no output was
kept. The doc has already had to correct 55→64 and two-SCCs→three, both from re-running the same
unversioned computation. → **My `scc_cut.py` and the two wave-2 agents' independent re-implementations
now exist; one of them should be committed as a tool.**

**M-F11 — recorded gzip does not reproduce from the artifacts that produced it.** `define-probe` raw
sizes reproduce exactly (123 498 / 99 550, markers 500 → 0) — **gzip does not**: doc 34 957 / 32 969 vs
measured 34 963 / 32 979. No gzip tool or version is recorded anywhere. That ~10 B noise floor sits
under "15 bytes of difference", "38 bytes apart" and "byte-identical down to the chunk hash". **Raw-byte
and chunk-hash claims are unaffected; gzip ones at that precision are not.**

## Controls that cannot fail

**M-F12 — "0 bytes of CSS" is a build-config tautology.** No probe `angular.json` has a `styles` array
(all six checked). `bundle-probe/probe.scss` exists but is **not wired into the build**. `run.sh:9`
reports `CSS=0` under every condition **including one where tree-shaking failed completely**.
→ `basic-advanced-split-audit.md:53-56` ("Style weight tree-shakes exactly as well as code weight")
is unsupported by that measurement.

**M-F13 — a vacuous cell presented as a measured negative.** `chunking-audit.md:292`'s "0 of 11" for the
services-closure row is arithmetic on an empty set; its neighbour `Lazy chunk: —` is the tell.
**Independent arrival at my own V-4 sub-finding.**

**M-F8 — not one entry-point measurement exercises the `exports` map.** Every probe app resolves through
tsconfig `paths`, which bypasses `exports` entirely — bundle-probe, entrypoint-probe, granularity-probe,
scale-probe, seam-probe2, define-probe, all six tabulated. So `chunking-audit.md:242` ("emitted four
separate FESM modules … with a correct `exports` map") is **inspection, not test**, and every
deep-specifier result would be identical if the map were absent or wrong. The only fixture using real
node resolution is `shape-probe/alias-app` — and its manifest has hand-added aliases ng-packagr did not
produce.
→ **This is the missing control on the one mechanism A3's consumer surface depends on.** It is also
exactly the gap my V-9 node10 experiment fills from the other side: I resolved through a real
`node_modules` with a failing negative control, which is the test M-F8 says was never run.

## Measurement-definition defects

**M-F7 — "initial" is computed by grepping only `main.js`.** `run-placement.sh:11-15`:
`grep -oE 'from"\./chunk-[A-Z0-9]+\.js"' "$main"`. Two holes: a chunk statically imported by _another
eager chunk_ is never found, and a bindingless `import"./chunk-X.js"` does not match. Both under-count
initial and over-count lazy, **and both get likelier as chunk count rises — precisely in the
per-component arms the recommendation rests on.** The Angular builder prints the correct answer in every
log and was not used. Not yet shown to have bitten (the one surviving multi-chunk build has an eager
chunk that imports nothing).

**M-F15 — gzip is taken over the concatenation, not per file.** All four scripts do
`cat dist/browser/*.js | gzip -9 -c`; real transfer gzips each file separately. Measured on the
surviving two-file bundle: separate 33 389 vs concatenated 33 078 — **311 B (0.9%) understated**, biased
toward multi-file arms, **and the arms differ in file count** (1 file for 86 775, 2 for 59 019/194 763).

**M-F9 — KB means ÷1000 in some places and ÷1024 in others, inside one comparison.**
`basic-advanced-split-audit.md:212-214`: 18.9 = 19 303/**1024** vs 18.2 = 18 172/**1000**. Consistent
units give 18.9 vs 17.7 KiB, or 19.3 vs 18.2 kB. Same at `chunking-audit.md:308` (5.7× → **5.6×** in
consistent units). And `:43`'s `+118.3 KB` is **neither** 118.2 kB nor 115.5 KiB.

**M-F5 — the CSS item sums gzips that are not additive.** Independent arrival at my V-3. It recovered
the method, reproduced the **min** column to the byte, and measured the nine partials **together** at
**2 582 B**, not 3 409 — "overstates by 32%", and "a third of the sheet" becomes 25%.
→ **My V-3 ablation gives 2 156 B**, lower still, because I removed them from `ds.scss` rather than
compiling them as a group — so they also lose the dictionary they share with the other eleven partials.
**Two independent methods, both well below the published figure; mine is the one that matches what
shipping the change would actually save.**

**M-F4 — `86.8 kB gzip` is billed to the DS but 30.6 kB of it is bare Angular.**
`packaging-diagnosis.md:92` calls the services closure "86.8 kB gzip, measured"; the DS part is 56 129.
Same number, two incompatible readings, two pages apart.

**M-F6 — the CDK figure measures a NARROWER CDK than the DS actually uses.** `cdk_only.ts` imports
`Overlay` and a global position strategy. The services closure additionally retains
`@angular/cdk/portal` and `cdkTrapFocus` from `@angular/cdk/a11y` — **the audit says so itself** at
`chunking-audit.md:150-153` — plus flexible connected positioning. **So 17 729 B is a FLOOR on CDK's
share, presented as the share.** No control exists that would have caught it.
→ This cuts against my V-4's "CDK is 31.8%": the true share is **higher**, though still nowhere near
B-F2's 64%.

**M-F14, M-F16, M-F18, M-F19, M-F20 (LOW):** the §10 fixture on disk is not the one §10 measured (built
14 h apart, from two separately authored sources, CRLF vs LF — so "38 bytes apart" is unearned
precision across two builds); the icon claim has a scope error **and repeats the 115** (the agent did
not catch that the map is 86 — _its own instance of the error it was auditing_); attw has no recoverable
method and ng-packagr does not emit `typesVersions`; the "61 entry points 9 s" build-time figure is a
single unlogged run; and the seam overhead was measured in a multi-entry library and applied to a
single-entry one, with the app builds gone.

## What this axis found genuinely SOUND — and this list is why the rest is credible

- **Optimization and sourcemaps**: all six probe `angular.json` — `optimization: true`,
  `sourceMap: false`, `outputHashing: "none"`. No `.map` bytes can enter any count.
- **Gzip level**: all four scripts use `gzip -9 -c`. Consistent (the residual issue is version, M-F11).
- **No brotli/gzip mix-up**: verified `brotliCompressSync(dist-full/main.js)` = 30 437 = the log's
  "30.44 kB", and the docs never quote those. **Independently kills E-F38.**
- **The "initial" definition matches the builder** where both survive: 12 901 + 85 919 = 98 820 =
  the builder's "Initial total 98.82 kB".
- **The "all 96 declarables" rung is exhaustive by construction**; `proto.ts` = 43 + table = 44, so
  "52 unused" is right.
- **The anchoring negative control exists and behaved**: `anchor_typeonly` genuinely uses the type, and
  its 26 raw bytes are explained.
- **Discriminating controls exist in four fixtures and were observed going RED**: granularity-probe's
  grouped arm, scale-probe's `many_one`, entrypoint-probe's `ctl`, and the `@defer` facade arm — the
  last of which proves the facade/deep comparison is _capable_ of showing a difference, **so
  "byte-identical" elsewhere is not instrument blindness.**
- **`define-probe` is the best-run fixture in the set**: raw sizes and marker counts reproduce exactly,
  an `explicit-full` control configuration exists, a dev build is retained as a third arm, **and the
  failed first attempt is written down as an observed negative control.**
- **The "missed rewrite" test is a proper causal control**: mutate → build fails → restore → builds.
- **Source citations spot-checked and correct**: `application-code-bundle.js:465`; `provide-ds-theme.ts`
  is a true leaf; `button.component.ts`'s field-message imports.
- **Internal arithmetic of the ladders is correct everywhere checked.** _"The failures above are of what
  was subtracted from what, not of adding up."_

---

# THE FINAL GATED LIST — what survived all four gates

Eleven agents, two waves, plus my own measurements at both validation gates. **Nothing below is on an
agent's authority: every item names the evidence that settled it.** Items an agent asserted and the
evidence did not support are in the STRUCK list, which is part of the output, not an omission from it.

## A. The conclusions are UNCHANGED. Not one architectural verdict moved.

This is the headline, and it should be said before the corrections:

- **The diagnosis holds.** One `entryFile` is the cause; tree-shaking works; placement is broken; no
  internal refactor can move a byte while there is one entry point. **Wave 2 attacked the anchor table
  and could not break it** — the four anchors are within 2 519 B, the type-only row costs 15 B, and the
  discriminating controls in four fixtures were **observed going red**, so "byte-identical" elsewhere is
  not instrument blindness.
- **basic/advanced as two packages stays REJECTED — and the rejection got SAFER.** Its headline number
  was wrong in the direction that _weakens_ the split: the prize for a no-table prototype is **~0, not
  32 KB**. The case rests on duplicate maintenance, which is untouched.
- **A3 (per-component entry points behind a facade) stays the largest item on the plan**, by a wide
  margin, even after its headline is cut by a third.
- **A3-pre stays reversed to DO IT — and gets CHEAPER: 4 statements, not 14.**
- **The icon-map split, the `define` flag for `staticPreview`, and semantic clustering all stay
  rejected**, each now on better evidence than before.

## B. Published numbers that are WRONG and must be corrected

Ranked by what they change.

1. **The `−80%` headline is invalid** — `chunking-audit.md:305-306`, propagated to
   `packaging-diagnosis.md:150,153,261`, `chunking-audit.md:308`, `todo.md:321-322`.
   It subtracts a code-split floor (59 019) from a non-split total (86 775).
   **Correct: 135.7 → ~56 kB, −59%; A3 ≈ 4.2× the table work, not 5.7×.**
   _Settled by: my fresh rebuild of all six placement scenarios (V-4); the methodology axis's byte
   reconstruction (86 037 = 82 530 + 3 507); the wave-2 arithmetic axis reaching it independently._
   **Three independent routes, one answer.**
2. **The same error a second time** — `packaging-diagnosis.md:218-222`, the eager-shell case.
   **Correct: ~72 kB, not ~98 kB.** _Found only by the methodology axis; verified against the scenario
   sources._ **The class is now bounded: exactly two instances; every other delta subtracts two
   monolithic rungs and is shape-consistent.**
3. **The A3-pre cut is 4 statements, not 14** — `todo.md:507-527`. The published 14 is `ds-config`
   alone, which **leaves `card` inside a three-way SCC and does not achieve the goal**. The doc plan is
   17 (18 with `public-api.ts`). _Settled by: my Tarjan run over all four candidate cuts (V-8), matching
   the wave-2 claims axis exactly._
4. **node10 is NOT broken by a plain multi-entry build** — `packaging-diagnosis.md:751-757` must be
   withdrawn; deck 4 `:250`'s "untested" is closer to right than the diagnosis's "measured".
   **ng-packagr emits a per-entry-point node10 stub.** `typesVersions` is required **only for option E**.
   _Settled by: my TypeScript-resolver matrix with four ablations and a failing negative control (V-9)._
   **This changes the deck-8 decision: E costs more than stated, B/C/D cost less.**
5. **The CSS prize is ~half what is published** — `packaging-diagnosis.md:414-434`, `:477-486`, deck 9
   `:338`, deck 11 `:180`. 3 409 B is the sum of ten _separately gzipped_ partials.
   **Ablated from `ds.scss`: 2 156 B.** Sub-totals: movable ~1.8 kB → **1 018 B**; portaled 1 592 B →
   **1 055 B**. And "a third of the stylesheet" is **a fifth** (19.7% min / 20.7% gzip).
   _Settled by: my ablation (V-3); the methodology axis independently measured the same partials
   together at 2 582 B — both well below the published figure, mine matching what shipping it saves._
6. **The icon map is 86, never 115** — `packaging-diagnosis.md:409`, `todo.md:610`, deck 11 `:137`,
   `packaging-bundle-plan.md:95`. 86 at every ref back to v0.10.0. **The 115 is the digits of
   `115 345 B` at `:400` carried down the page.** _Four independent counts; F's "83 at v0.11.1" refuted
   by two of them and by my own six-ref parse._
7. **"95 components/folders" is wrong under every definition** — 5 sites. **71 folders + 23 loose
   files.** "85" is a _correct class count mislabelled as folders_ (deck 4 `:236,248`) — a definition
   error, not a miscount. **And "73 folders" at v0.7.0 is 66** (`chunking-audit.md:9-10,186`) — verified
   by me: `git ls-tree -d v0.7.0:src/lib/components` = 66.
8. **The three-layer partition is 13 / 2 / 62, not 13 / 2 / 64** — the 64 is derived as 77 − 13, so it
   already contains toast and modal. `packaging-diagnosis.md:153`, `chunking-audit.md:341`,
   `todo.md:392`.
9. **"53 more rewrites than three layers" is 61**; deck 11 `:113`'s own pair computes to **16.7%**, not
   19%. `packaging-diagnosis.md:294`.
10. **Deck 5 `:80`'s "5.7×" should be 7.0×** — the deck kept the ratio and swapped the gross figure for
    the net one. The 5.7× is correct in its home; **both die anyway under item 1 → 4.2×.**
11. **`todo.md:558-562` splices two lint configurations.** The counts 92/60/57/15 and "roughly fifty"
    belong to the 277 run; the 307 headline belongs to the three-SCC run.
    **The 81% is CORRECT under either.** B-F6's "73%" is wrong _and_ cited the wrong lines (`:610-612`
    is the icon item; the text is at `:559`). **The two wave-2 axes propose opposite repairs — that is a
    choice of which configuration to describe, not a factual dispute.**
12. **`todo.md:459`'s "249 runtime + 69 type-only" is 258 + 60** — total unaffected, but
    `packaging-diagnosis.md:354` uses the split to argue "318 rewrites, not 249".
13. **The `55 → 64` correction does not close as written** — it reconciles only via `theme` being in
    both the no-edge list and the core seed (verified: zero edges either way) plus `card` moving.
14. **Unit convention**: KB is ÷1000 in some sentences and ÷1024 in others _inside one comparison_
    (18.9 vs 18.2). `+118.3 KB` is neither. Pick one and restate.
15. **`chunking-audit.md:268`'s "toast/ and modal/ import nothing else from `../`" is FALSE** — modal
    has **eleven** external specifiers, toast three. **`todo.md:686` already states it correctly**, so
    the audit is the outlier.
16. **"Every optional table behaviour is an `input(false)`" is false for six members**, three of them
    `model()`. The second clause ("nothing is on by default") is true of all six, and the argument does
    not depend on the form.
17. **The 86.8 kB figure is billed to the DS but 30.6 kB of it is bare Angular**
    (`packaging-diagnosis.md:92`).
18. **The CDK 17 729 B is a FLOOR, not the share** — `cdk_only.ts` retains only `overlay`; the services
    closure also retains `portal` and `a11y`/`cdkTrapFocus`, **which the audit itself says at
    `chunking-audit.md:150-153`**. Verified by me: `src/lib` imports four CDK entry points — overlay
    (12), portal (11), a11y (7), drag-drop (1). **So the true CDK share is above 31.8%, though nowhere
    near B-F2's 64%.**
19. **The devWarn count is 13, not 14** — `CHANGELOG.md:226`, `dist/ds/CHANGELOG.md:226` (shipped in
    v0.11.2), `build-flags.d.ts:9`, the commit message. **The 14 is a grep that matched the definition.**

## C. Shipped code that must change

1. **`build-flags.d.ts:12-14` — the stated REASON for the inline rule is backwards.** "esbuild will not
   propagate the constant through module scope" — propagation through module scope is precisely the case
   that works. **The real condition: esbuild inlines a top-level `const` only if the declaring module
   has no `import` statement at all.** _Settled by my seven-shape raw-esbuild matrix (V-7), reproducing
   the wave-2 finding exactly._ **The RULE is correct and must stay** — every Angular component module
   imports `@angular/core`. Rule 2 (`typeof`) is correct and its stated reason is right.
2. **`build-flags.d.ts:18` — delete the `declare const`, keep the comment.** It duplicates Angular's own
   `declare global` and is the sole cause of two masked TS2451s; the library compiles at exit 0 without
   it **even at `--skipLibCheck false`**. _Wave 2 tested this directly rather than by analogy._
3. **`entry-point-boundary.mjs:17-23` — the comment encodes a REVERSED decision**, and
   `git show 2e1535aa` shows a comment pass **stripped its `2026-09-01` date the evening before the
   reversal**, turning a dated record into a standing claim. The sentence is also a non-sequitur
   ("accepted, **because** breaking it **saves** 593 B" — `todo.md:522` says _costs_).
4. **The lint rule cannot be flipped to `'error'` as shipped** — 31 false positives, every one inside
   the planned core entry, "fixable" only by writing a self-referential entry-point import.
   **And no correct configuration exists anywhere**: the gitignored probe is also stale post-`42b54a0b`.
   `eslint.config.mjs:124-128` and `todo.md:565` both say only "flip it".
5. **`publicSpecifier()` maps group → slug, not group → entry point.** 99 of 308 messages name
   `components-root`, which cannot exist — **and ~204 of 277 are wrong even with the correct config.**
   The co-location sets need a name. _(The styles/themes collision is unreachable: those directories
   contain no `.ts` files at all.)_
6. **`ImportExpression` is unchecked** — fix it, but **not for the `@defer` reason given**: `@defer` is
   template syntax lowered by the compiler and never appears in the `.ts` ESLint parses. The real risk
   is a human writing `await import('../x/y')` during A3.
7. **The rule FAILS OPEN on any unresolvable specifier** — a boundary guard defeatable by a typo.
8. **`CHANGELOG.md:232-233`** — double blank line; prettier's glob excludes the repo root.
9. **`todo.md:427` and `packaging-diagnosis.md:613` still carry the devWarn work as OPEN** — it shipped
   in `d8eb81c0`. Wave 2 called this the strongest finding in its set: _someone will do it twice._
   And `packaging-diagnosis.md:628` prescribes the bare form the shipped code correctly avoided.
10. **`todo.md:674-675` states the OPPOSITE of deck 4's recommendation**, in the index everyone reads
    first, and invites the reader to trust the summary. **Current answer: option D, PER-COMPONENT top
    layer** — `todo.md:392`, `:438`, `:469` all agree; one stale narrative sentence does not.
11. **Deck 4 `:99-101` and `:253-255`** assert the reversed A3-pre verdict, the refuted "40 rewrites",
    and a superseded commit hash a reader would follow to the wrong record.
12. **Deck 4 `:250`** — reword, but toward "untested", not toward "measured" (see B-4).
13. **Deck 5 `:79-82` cites itself as deck 5; `:88-89` cites the tool deck as the seam deck.**
    `packaging-diagnosis.md:759` has the same bug ("decks 5 and 9" never carried that caveat).
14. **Deck 11 is missing from `presentations/README.md` and `todo.md:25` says "Nine"** — deck-lint says
    11 ranked open. One-commit-old drift.
15. **Deck 11 `:102-103` carries AG Grid's 40% unlabelled**; deck 9 labels its vendor row "Reported"
    correctly. **No source URL exists anywhere for any vendor figure**, and the "February 2026 guide" is
    never named — one of two legs under the non-deprecation premise A3 rests on.
16. **Ten of twenty-five citations in the "already ships" table no longer land** — pure insertion rot,
    every symbol still exists, and the table names its 0.11.1 baseline, which is what makes it
    defensible.

## D. STRUCK — findings that did not survive

| finding                                           | why it dies                                                                                                                                                                         |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B-F2** (CDK is 64%, not a third)                | `placement_after_a3` has **no lazy route**; 30 646 IS its floor. Refuted by me and by two wave-2 axes independently. It condemned the valid subtraction and cleared the invalid one |
| **C-F4** (the inline rule is false)               | true of raw esbuild in an import-free module; **every module the rule governs has imports**                                                                                         |
| **E-F21** (`ds-table` 62 inputs / 76 KB is wrong) | **exact to the byte at the stated v0.11.1 baseline** — 46+8+8 = 62, 74 399 + 1 991 = 76 390                                                                                         |
| **E-F38** (593 B vs a 650 B log)                  | **gzip vs brotli.** Independently confirmed by the methodology axis, which verified `brotliCompressSync` = the log's figure                                                         |
| **E-F25's "85" and "96"**                         | both reproduce **exactly** under the documents' own stated methods                                                                                                                  |
| **E-F3** ("exactly two cycles" is false)          | every site is explicitly scoped to _runtime edges_; both counts are true. The real defect is a missing back-pointer                                                                 |
| **F-#15b** (core 13 vs 15 is a contradiction)     | two different objects — a computed **seed** and a semantic **cluster**. Label them; do not "fix" either                                                                             |
| **F-#10's "83 icons at v0.11.1"**                 | it is 86; the file is byte-identical to HEAD's                                                                                                                                      |
| **B-F6's "73%"**                                  | pairs a numerator from one run with a denominator from another; **81% is right**                                                                                                    |
| **C-F2's "1 278 B / 732 B"**                      | not reproducible by any method, and **ill-posed** — the bytes cannot be read off the FESM                                                                                           |
| **C-F2's sixth site**                             | `projection-dropped.directive.ts:53` uses a bare `console.warn`, not `isDevMode()`; the sixth FESM hit is `devWarn`'s own guard                                                     |
| **C-F5's "roughly half"**                         | 827 B reconciles at 779 B once the orphaned `DISCOURAGED_COMBOS` and `devWarn` are counted                                                                                          |
| **D-F2's styles/themes collision**                | those directories contain **no `.ts` files**; unreachable                                                                                                                           |
| **D-F10 as a reachable defect**                   | ESLint normalises through `path.resolve` at every supported entry point — CLI, Node API absolute, Node API relative all report 10                                                   |
| **D-F4's `@defer` justification**                 | `@defer` never appears as an `ImportExpression` in the linted source                                                                                                                |
| **E-F35's "decks 9 and 11 both claim measured"**  | only deck 9 does, and its vendor row is honestly headed "Reported result"                                                                                                           |

## E. Still not settled, and it should be said plainly

- **The true post-A3 initial bundle cannot be measured today.** It needs a scenario with the services
  eager AND the lazy route intact — impossible while there is one entry point, which is the very problem.
  **Every post-A3 figure is a MODEL and must be labelled one.** Best bound: ~50-56 kB gzip DS
  contribution, −50% raw.
- **`M-F3`: no probe records which library build it ran against**, and `src/lib` changed five times
  inside the 0.11.1 window — including a toast fix, between two rows of one table.
- **`M-F8`: no probe exercises the `exports` map**; every one resolves through tsconfig `paths`.
  My V-9 fills this from the types side with a real `node_modules`; the runtime side is still untested.
- **`M-F7`: "initial" is computed by grepping `main.js` only** — misses a chunk imported by another
  eager chunk, and a bindingless side-effect import. Not shown to have bitten; gets likelier in exactly
  the per-component arms the recommendation rests on.
- **`M-F11`: recorded gzip does not reproduce** (34 957 vs 34 963) and no gzip version is recorded, so
  claims at 15-byte and 38-byte precision are below the noise floor.
- **`M-F12`: "0 bytes of CSS" is a control that cannot fail** — no probe wires a stylesheet in.
- **`M-F17`: no graph tool survives.** My `scc_cut.py` and two agent re-implementations now exist; one
  should be committed so the 77/318/SCC numbers stop being unversioned.
- **My own `−80%` finding had no adversarial pass** when I first wrote it. It has three now.
- The node10 **`require()`** row is untested: the ng-packagr stubs carry `module` + `typings` but no
  `main`.

## F. Calibration — every agent caught in a concrete error

| agent                   | caught on                                                                                                                          | by                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| B (arithmetic)          | 14 devWarn sites; **B-F2 inverted the floors**; 73%; wrong citation                                                                | me, C, E, both wave-2 axes  |
| C (dev warnings)        | C-F4 generalised an import-free-module result; the 1 278 B figure; a sixth site that is not one                                    | me, wave 2                  |
| D (lint rule)           | itemisation sums to 30; the styles/themes collision is unreachable; the `@defer` rationale                                         | wave 2                      |
| E (records)             | E-F21 and E-F38 struck; "nine of nineteen" is ten of twenty-five; "ten decks" is eleven; two-thirds of E-F25                       | wave 2                      |
| F (my 22 claims)        | "83 icons"; "15-16" is 17; F-#15b is not a contradiction                                                                           | me, wave 2                  |
| M (methodology)         | **repeated the "115 icons" it was auditing**                                                                                       | me                          |
| **me**                  | **V-1's pipeline framing was wrong**; my first SCC graph missed multi-line imports; my first node10 harness failed its own control | wave 2, and my own controls |
| wave-2 lint agent       | first synthetic battery invalid (heredoc mangled the path) — **it caught this itself and re-ran**                                  | itself                      |
| wave-2 arithmetic agent | its no-edge classifier missed `status-dot` — **caught and credited the audit**                                                     | itself                      |

**Every single participant, including me, was caught in at least one error. That is the result the two
waves were for.** The five items in section D would all have shipped as corrections if wave 1 had been
trusted; the nineteen in section B would all have shipped as fact if no review had run at all.

---

# THE CORRECTION PASS, as executed

Branch `fix/two-wave-review-corrections`, cut from `dev` at `9a345622`.
Evidence for every item: the section "THE FINAL GATED LIST" above.

Approved 2026-09-02: everything in one pass, in this branch. A3-pre at the full 17-edit plan.

## 1. Shipped code

- [x] `src/lib/core/build-flags.d.ts:12-14` — rewrite the reason for rule 1. The real condition:
      esbuild inlines a top-level `const` only when its declaring module has NO `import` statement.
      Rule itself stays (every component module imports `@angular/core`).
- [x] `src/lib/core/build-flags.d.ts:9` — "14 call sites" -> 13.
- [x] `src/lib/core/build-flags.d.ts:18` — delete `declare const ngDevMode`; keep the comment.
      Verify: `npx tsc -p tsconfig.lib.json --noEmit --sourceMap --skipLibCheck false` -> 0 errors.
- [x] `eslint-rules/rules/entry-point-boundary.mjs:17-23` — the comment encodes the REVERSED A3-pre
      decision and `2e1535aa` stripped its date. Restate as dated, and fix the non-sequitur
      ("accepted, because breaking it SAVES 593 B" -> accepting it COSTS 593 B).
- [x] `CHANGELOG.md:226` — "fourteen" -> "thirteen".
- [x] `CHANGELOG.md:232-233` — collapse the double blank line.

## 2. A3-pre — the full 17-edit plan

- [x] `git mv src/lib/config/ds-config.ts src/lib/core/ds-config.ts`
- [x] `git mv src/lib/components/card/card.types.ts src/lib/core/card.types.ts`
- [x] rewrite the 17 statements (list in the findings ledger, V-8) + `src/public-api.ts:1`
- [x] `src/lib/config/` is then empty — remove it
- [x] verify: `npm run build:lib`, `npm run lint`, and re-run the SCC check (only the two sibling
      pairs plus `core+icons` may remain)
- [x] `eslint-rules/rules/entry-point-boundary.mjs` `DEFAULT_CO_LOCATED` — the four-way entry comes out
- [x] no public API change: the same symbols are exported from the same package specifier

## 3. Numbers that are wrong (19 items, section B of the ledger)

- [x] the `-80%` headline -> `-59%`; A3 ~4.2x not 5.7x. Label every post-A3 figure a MODEL.
      `chunking-audit.md:305-306,308`, `packaging-diagnosis.md:150,153,261`, `todo.md:321-322`
- [x] the eager-shell case ~98 kB -> ~72 kB. `packaging-diagnosis.md:218-222`
- [x] A3-pre cost: 14 -> 17 for the doc plan, with the 4-statement minimum recorded. `todo.md:507-527`
- [x] node10: withdraw "measured breaking change"; `typesVersions` needed ONLY for option E.
      `packaging-diagnosis.md:751-757`, deck 4 `:250`, deck 8
- [x] CSS prize 3 409 -> 2 156 B ablated; sub-totals 1 018 / 1 055; "a third" -> "a fifth".
      `packaging-diagnosis.md:414-434,477-486`, deck 9 `:338`, deck 11 `:180`
- [x] icons 115 -> 86 (4 sites incl. `packaging-bundle-plan.md:95`)
- [x] "95 components/folders" -> 71 folders + 23 loose files (5 sites); deck 4's 85 is a CLASS count
      mislabelled as folders; `chunking-audit.md:9-10,186` "73 folders" at v0.7.0 -> 66
- [x] three-layer partition 13/2/64 -> 13/2/62
- [x] "53 more rewrites" -> 61; deck 11 `:113` 19% -> 16.7%
- [x] deck 5 `:80` 5.7x -> 7.0x (then -> 4.2x under item 1)
- [x] `todo.md:558-562` splices two lint configs — state which run each figure belongs to. 81% is right
- [x] `todo.md:459` "249 + 69" -> **250 + 70, measured by the new tool.** I first applied an agent's
      "258 + 60" without measuring; the tool refuted it. Both sites now point at the tool.
- [x] the 55->64 correction: show the reconciliation (theme in both lists, card moved)
- [x] one unit convention throughout; `+118.3 KB` -> 118.2
- [x] `chunking-audit.md:268` "toast/ and modal/ import nothing else" is FALSE — modal has 11
- [x] "every optional table behaviour is an input(false)" — 6 exceptions, 3 of them `model()`
- [x] `packaging-diagnosis.md:92` 86.8 kB is app-total, DS part is 56.1
- [x] CDK 17 729 B is a FLOOR (cdk_only retains only `overlay`; the closure also uses portal + a11y)
- [x] devWarn 13 not 14 (docs side)

## 4. Records, decks, and the open items (section C of the ledger)

- [x] `todo.md:427` + `packaging-diagnosis.md:613` — devWarn SHIPPED, close the item
- [x] `packaging-diagnosis.md:628` — prescribes the bare form the shipped code avoids
- [x] `todo.md:674-675` — states the opposite of deck 4's recommendation
- [x] deck 4 `:99-101`, `:253-255` — reversed verdict, refuted "40", superseded commit hash
- [x] deck 5 `:79-82` cites itself; `:88-89` cites the tool deck; `packaging-diagnosis.md:759` same bug
- [x] deck 11 into `presentations/README.md`; `todo.md:25` "Nine" -> ten open
- [x] deck 11 `:102-103` — label the AG Grid figure "Reported", as deck 9 does
- [x] name the "February 2026 guide" or drop it as evidence
- [x] the 10 rotted citations in the "already ships" table
- [x] `packaging-diagnosis.md:350` claims it corrected §11(b) — give §11(b) the back-pointer
- [x] record the open methodology gaps (M-F3, M-F7, M-F8, M-F11, M-F12, M-F17) in the audit

## 5. Tooling the review showed is missing

- [x] commit a graph tool (77 groups / cross-group imports / SCCs) so those numbers stop being
      unversioned — M-F17. Basis: `scc_cut.py` from the review.
- [ ] decide (not necessarily do): `RuleTester` for the four ds eslint rules — D-F12. **NOT DECIDED.**

## Not in this pass

- the lint rule's `publicSpecifier` and `DEFAULT_CO_LOCATED` partition fix — belongs with A3 itself
- `ImportExpression` / fail-open hardening — same
- re-running attw with the tool actually installed

## Result

All four commits on `fix/two-wave-review-corrections`:

|            |                                                                   |
| ---------- | ----------------------------------------------------------------- |
| `76b7c9c2` | build-flags reason + count + the redundant declaration; CHANGELOG |
| `bff7efbc` | A3-pre: 17 statements, 77 -> 76 groups, four-way SCC gone         |
| `f94c586c` | 233 insertions across 4 docs and 5 decks                          |
| `eeb7471a` | `tools/entry-point-graph.mjs`                                     |

Gates, all green: `build:lib`, `lint`, `deck-lint`, `changelog-lint`, `check-docs-links`,
`check-docblock-drift`, and `tsc --skipLibCheck false` (which was RED before the declaration came out

- watched it go red on the restored file, then green again).

Public type surface identical either side of A3-pre: 126 declarations, none added, none removed.

### Caught by my own tool, after I had already written it into the docs

I applied "258 runtime + 60 type-only" from a wave-2 agent without measuring. `entry-point-graph.mjs`
says **250 + 70** pre-A3-pre and **249 + 70** after - close to the original 249 + 69, not to the
agent's figure. Corrected, and the docs now tell the reader to re-run the tool rather than trust the
number. This is the exact failure the two waves exist to catch, and it still got through one gate.

### Deliberately NOT in these commits

- the lint rule's `publicSpecifier` and its entry-point partition - belongs with A3 itself
- `ImportExpression` / fail-open hardening - same
- re-running attw with the tool installed
- a `RuleTester` suite for the four ds rules
