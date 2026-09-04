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

### Removing a file from the shared project

- **An obsolete path now reaches the owner as one pasted instruction.** A write to a project the
  uploader does not own cannot be taken back by the uploader: `delete_files` refuses without
  project ownership. Every route was tested and the working one is a single instruction the owner
  executes, including the unregister step that a rename or a delete alone leaves behind.

### Build

- **The upload tree is rebuilt against each release** inside the release commit, so the tag and
  the shipped cards agree.
