# design-sync changelog

What changed in the Claude Design upload — the cards, their metadata, the generators that build
them, and the routes for getting a file out of the shared project.

**This is not the package changelog and must never be merged into it.** Nothing under
`.design-sync/` reaches the npm tarball: `src/lib/ng-package.json` copies only `src/lib/styles` and
`src/lib/themes` as assets, and `package.json` declares no `files` field that would pull anything
else in. A consumer installing the package cannot observe any of it. The published `CHANGELOG.md`
is also linted against naming a path outside the published tree, so an entry about this directory
could not live there even if it were wanted.

Sections mirror the package's versions, because the upload tree is rebuilt and committed inside
the release commit — one timeline, two audiences.

## Unreleased

### Cards

- **Every card is titled after its own subject and names its own tag.** A card used to open with
  the chapter's header, so a pane full of cards from one chapter read as the same thing repeated.
  Each now opens with its own subject and names the Angular tag it documents, with the React tag
  beside it.
- **Every card carries a one-sentence subtitle and a usage note.** The pane truncates a subtitle
  at about 195 characters — measured, not guessed — so the generator writes one sentence and puts
  anything longer in the note.
- **The last five cards lose the eyebrow**, and a part no longer republishes the chapter it
  belongs to.
- **376 of 409 cards ship as static HTML instead of an Angular application.** A card is a whole
  document, and every one of them downloaded the 2.12 MB bundle and booted its own application, in
  every tile of the grid at once. `snapshot-cards.mjs` renders each card and writes back the settled
  DOM with the scripts stripped, so a frozen card fetches no bundle at all. Nothing renders
  differently — the theme tokens stay in `_ds_bundle.css`, so the pane switching `data-theme` still
  recolours a frozen card, and all 409 declared heights are unchanged. What is lost is behaviour,
  so the chapters whose demos open on a click are listed in `live-chapters.txt` and stay live:
  toast, drawer, modal, popover, bottom-sheet, tree, loading-overlay, scrollbar.
- **The 185 distinct component stylesheets are one linked file.** Angular inlines a component's
  styles into every document that renders it, so the same block arrived in card after card. They
  are scoped by attribute and therefore position-independent, so they concatenate into
  `_ds_cards.css`, fetched once for the whole grid instead of parsed inside each card. With the
  scaffolding comments and the Angular component ids trimmed too, the tree is 20 MB → 9.0 MB.

### Removing a file from the shared project

- **An obsolete path now reaches the owner as one pasted instruction.** A write to a project the
  uploader does not own cannot be taken back by the uploader: `delete_files` refuses without
  project ownership. What works is a single instruction the owner executes, including the unregister
  step that a rename or a delete alone leaves behind.

### Build

- **The upload tree is rebuilt against each release** inside the release commit, so the tag and
  the shipped cards agree.
- **A release build can no longer thaw the committed cards.** Freezing needs a browser the CI image
  does not have, so a CI build produces live cards while this repo commits frozen ones — and the
  byte comparison that followed said "stale" every time, which on the release branch means the bot
  COMMITS rather than fails. `build-cards` now writes `.design-sync/cards.lock.json`, a fingerprint
  per generated file that a browserless build reproduces exactly, and CI compares that instead: it
  moves when a card's source moves and stays put when only the freeze is missing. The frozen copies
  and `_ds_cards.css` are then restored from git, and `check-frozen.mjs` asserts that every card
  outside `live-chapters.txt` really is static.
- **The freeze is reproducible.** Five render lanes finish out of order, so the results are read
  back in `cards.json` order; without that the shared stylesheet's block order and the shortened
  component ids differed every run, rewriting all 376 cards and the stylesheet with no change in
  them. The tidy pass also waits for the DOM to stop changing rather than counting frames — the
  sticky-scrollbar card had frozen three different ways in three runs.
