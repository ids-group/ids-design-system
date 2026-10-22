# Claude Design cards: what gets published

A card in the Claude Design pane is one block of a ds-docs chapter. **Nothing is published by
default.** A block reaches Claude Design only when its ds-docs template says so with
`data-claude-design`. The docs site ignores the attribute; it changes only what `build-cards.mjs`
publishes.

The agent in Claude Design reads a component's API from `<Name>.d.ts` and its usage from
`<Name>.prompt.md`. A card is the visual example beside them, so it earns its place only by showing
something the agent will copy onto a screen and cannot get from the declaration.

## Publishing a block

Put the attribute on the block's heading:

```html
<h3 class="block-title t-h4" data-claude-design>Sizes</h3>
```

A group of demos without a heading of its own (a `data-for` container) takes it on the container:

```html
<div class="demo-grid" data-for="menu-item" data-claude-design>…</div>
```

A chapter whose blocks the cards cannot address (a block nested inside a plain container, or no
blocks at all) publishes as one whole-chapter card, and only with the attribute on the section:

```html
<docs-section data-claude-design …>
```

Rules the build enforces:

- Only a direct child of `<docs-section>` is a block. A mark on a nested block fails the build and
  names the chapter.
- The section mark is for a chapter without addressable blocks. On a chapter that has them it fails
  the build: mark the blocks.
- The chapter's lede and the API table ride the first published card of each component, whichever
  block that is.
- Every public component (every `<Name>.d.ts` in the upload) needs at least one published card, or
  `build-design-sync.sh` stops with `No card for <Name>`.
- A chapter that marks anything and still backs no card fails `check-section-coverage.mjs`. A
  chapter that marks nothing is unpublished on purpose and is only counted.
- A part documented inside another component's chapter (`TimeColumns` in Time Picker,
  `ChartTooltipPanel` in Line chart) gets cards only from blocks marked `data-for="<its-name>"`.
  It never gets a copy of the chapter.

## What to publish

- The canonical usage: the block a reader sees first.
- The visual range: the colour x variant matrix, the size scale, the states showcase.
- A distinct layout mode: range vs single, vertical vs horizontal, compact vs default, collapsed.
- A composition that is not obvious from props: a table with the bulk-action bar, a card with
  header, body and footer, a page header with breadcrumbs.
- The empty, loading and error states a real screen shows, once per component.
- In the guides: palettes, scales, token tables, the placement and composition rules, do and
  don't.

## What not to publish

- A proof that a bug is fixed or a guard works.
- What a screen reader announces, focus mechanics, keyboard behaviour.
- Anything invisible on a static card: animation, lazy loading, virtual scroll, persistence, CSV
  export, server-side sort and filter, debounce.
- A demo of a single prop the declaration already makes obvious: `clearable`, `required`,
  `width`, `placeholder`, `readOnly`, a character counter.
- A block that is a subset of another published block: `disabled` alone next to a states
  showcase, an error state next to a matrix that already has one.
- A validation block per control. The forms group shows validation once, on Input.
- A demo that renders only a trigger button: an overlay has to be shown open in the flow (a
  static specimen, `staticPreview`), or it shows nothing on a card.
- Angular-only material the React canvas cannot use: forms integration, `provideDsConfig`,
  theme SCSS imports, the browser tab.
- A block that argues or explains why rather than showing what.

## How many

Measured on the published set of 2026-09-26 (259 cards: 195 component, 64 guide):

| cards per component | components |
| --- | --- |
| 1 | 45 |
| 2 | 21 |
| 3 | 14 |
| 4 | 7 |
| 5 | 4 |
| 7 | 1 (Button) |
| 11 | 1 (Table) |

Aim for 1-3 per component. Past 5 needs a layout the others genuinely do not show; Table is the
only one past 7. A guide chapter publishes its specifications and rules, 1-4 cards; Do & Don't and
Charts & dataviz carry 7.

## After changing a mark

1. `node .design-sync/tools/build-cards.mjs`, then the rest of the chain in
   `infrastructure/scripts/build-design-sync.sh` (`snapshot-cards`, the gates).
2. A card you withdrew is still on the project until its owner deletes it: add its `.html` and
   `.prompt.md` paths to `.design-sync/obsolete.txt`. A path the build still produces fails the
   build, so a card you publish again comes out of that file.
3. Open the new card in a browser before relying on it. A block whose demo renders only after
   interaction publishes an empty card.
