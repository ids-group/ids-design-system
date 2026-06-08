# DS — improvements backlog

Running list of design-system improvements. Add items here as they come up.
Deep audit findings (a11y, API consistency, tokens) live in `docs/superpowers/library-audit.md`.

---

## Animations
- [ ] **Accordion open/close animation** — animate the panel expand/collapse (height/opacity). Must be **toggleable** (e.g. an `[animated]` input defaulting on, or respect `prefers-reduced-motion`). Currently the panel snaps open/closed instantly.
- [ ] **Bottom-sheet close animation** — animate the sheet sliding down + scrim fade on dismiss (open already animates; close is abrupt). Honor `prefers-reduced-motion`.

## Component improvements (surfaced by field app `_ds-overrides.scss`)
- [ ] **Tabs · pills overflow** — the `pills` variant overflows narrow (mobile) viewports with 4+ tabs. Consider making the pill bar scroll horizontally within its own bounds by default (or an opt-in `scrollable` input), instead of widening the page. Field works around it with `overflow-x: auto` + hidden scrollbar.
- [ ] **Banner · compact density** — field tightens compact banners (`--ds-banner-pad-y: --s-1-5`, font-size `--fs-xs`). Review whether the DS `compact` default should be tighter, or expose the body font-size as a token.
- [ ] **Search · max-width** — `.search` caps at `--search-maxw`. It IS tokenized (consumers can set `--search-maxw: none`), but the field app overrode `.search` directly — likely didn't discover the token. Document `--search-maxw` more prominently; consider defaulting to `none` (let the container constrain).
- [ ] **Input · label tokens** — field uses `--ds-input-label-fs` / `--ds-input-label-fw` / `--ds-input-label-color`. Confirm these are documented in the catalogue + tokens-reference (they're real public knobs).

## Done (recent)
- [x] `.link.quiet` — underline colour now follows the muted text at rest (was link-blue under grey text). `_link.scss`.
- [x] Reset zeroes `h1–h6` margins — browser default heading margins were leaking into consumers. `_reset.scss`.
- [x] Tabs `.panel:empty` collapses — no phantom gap when tabs are used as a filter selector with content rendered outside. `tabs.component.scss`.

## Larger tracks (see docs/superpowers/library-audit.md)
- [ ] **A11y (P0/P1)** — dialog ARIA + focus-trap/restore + Escape for modal/drawer/bottom-sheet; listbox/menu/tab semantics; form-label association; aria-labels on icon-only controls; toast live-region; progress role.
- [ ] **API consistency (P2)** — `booleanAttribute` on all boolean inputs; `danger`→`error` / `warn`→`warning`; dropdown `error`→`invalid`; `radio.name` type; export `DividerSpacing` / `PopoverAlign`; button size scale; output-name unification (`dismissed`/`closed`); pagination model/output dedup.
