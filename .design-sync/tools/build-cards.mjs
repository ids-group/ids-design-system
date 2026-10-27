// Builds everything the Claude Design project holds per component, into .design-sync/upload/.
//
// The upload used to be driven by a /design-sync skill that is not installed on any account here
// and could not run in a pipeline anyway — a skill is instructions for a model, and CI runs a
// shell. So the artefacts are derived from the same sources the bundle is, and the publish step is
// left with nothing to invent.
//
//   node .design-sync/tools/build-cards.mjs      # after gen.mjs -> ng build -> build-bundle.mjs
//
// What it does NOT write is `_ds_sync.json`. That file is the skill's incremental-sync bookkeeping
// and its hash recipes are unknown (`keyRecipe: 7` names a version we cannot reproduce). A wrong
// value there is worse than a stale one: a hash that happens to match makes the next skill-driven
// sync SKIP a file that did change. `_ds_manifest.json` IS ours — see build-manifest.mjs.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  cpSync,
  readdirSync,
  existsSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  internalSymbols,
  resolveLibSpecifier,
} from '../../tools/lib-entry-points.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const repo = resolve(syncDir, '..');
const elements = join(syncDir, 'elements');
const OUT = join(syncDir, 'upload');

const config = JSON.parse(readFileSync(join(syncDir, 'config.json'), 'utf8'));
const viewports = JSON.parse(
  readFileSync(join(syncDir, 'viewports.json'), 'utf8'),
);
const surface = JSON.parse(
  readFileSync(join(elements, 'gen', 'surface.json'), 'utf8'),
);
const byName = new Map(
  surface.components.map((component) => [component.name, component]),
);
const sections = JSON.parse(
  readFileSync(join(elements, 'gen', 'sections.json'), 'utf8'),
).sections;
const sectionBySlug = new Map(
  sections.map((section) => [section.slug, section]),
);

const kebab = (name) =>
  name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** The component's name as a reader sees it. `ToggleButton` is an identifier — it belongs in the
 *  declaration and the directory, both of which keep it — but the card's filename IS its label in
 *  the pane, and a list of run-together words is read a word at a time. `W3w` keeps its shape:
 *  the split is only ever at a lowercase-or-digit followed by an uppercase. */
const spacedName = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

/** Every name `src/lib/public-api.ts` exports, by walking the re-export graph.
 *
 *  This decides what gets a published CONTRACT. The README the project ships says it outright:
 *  "Engineers translate what you build here… anything with no Angular counterpart can't be handed
 *  off". A component the package does not export has no counterpart to hand off — an engineer
 *  cannot import it — so a `.d.ts` and a React wrapper for it are a false promise. Four were:
 *  TimeColumns and FieldMessage say "Internal" in their own docblocks, `modal/index.ts` withholds
 *  ModalConfirmComponent while exporting the service that opens it, and CalendarDay was never
 *  re-exported at all.
 *
 *  The lever is `src/lib/public-api.ts` and nothing here: export a component and it is published on the
 *  next build. There is deliberately no allowlist to drift. */
const publicExports = (() => {
  const names = new Set();
  const seen = new Set();

  const resolve = (from, specifier) => resolveLibSpecifier(from, specifier);

  const declaredIn = (source) => {
    for (const [, name] of source.matchAll(
      /export\s+(?:abstract\s+)?class\s+(\w+)/g,
    )) {
      names.add(name);
    }
  };

  (function walk(file) {
    if (!file || seen.has(file)) return;
    seen.add(file);
    let source = '';
    try {
      source = readFileSync(file, 'utf8');
    } catch {
      return;
    }
    declaredIn(source);
    for (const [, listed, specifier] of source.matchAll(
      /export\s*\{([^}]*)\}\s*from\s*'([^']+)'/g,
    )) {
      for (const entry of listed.split(',')) {
        const name = entry
          .replace(/\btype\b/, '')
          .split(/\s+as\s+/)
          .pop()
          .trim();
        if (name) names.add(name);
      }
      walk(resolve(file, specifier));
    }
    for (const [, specifier] of source.matchAll(
      /export\s*\*\s*from\s*'([^']+)'/g,
    )) {
      const target = resolve(file, specifier);
      if (target) {
        try {
          declaredIn(readFileSync(target, 'utf8'));
        } catch {
          /* the walk below reports it */
        }
      }
      walk(target);
    }
  })(join(repo, 'src', 'lib', 'public-api.ts'));
  for (const name of internalSymbols()) names.delete(name);

  return names;
})();

/** The ds-docs section that documents this component — the card's whole body.
 *
 *  Most resolve by name: `Input` is documented by `components/input`. The rest are sub-components
 *  documented alongside their parent (`MenuItem` inside Menu) or by a foundation page (`Divider`
 *  under Borders), which no rule can derive — those are the hand-kept `sections` map in config.json. */
function sectionFor(name) {
  const slug = config.sections?.[name] ?? `components/${kebab(name)}`;
  const section = sectionBySlug.get(slug);
  if (!section) {
    throw new Error(
      `${name} resolves to the ds-docs section "${slug}", which GROUP_PAGES does not register.\n` +
        `Either add a section for it in ds-docs, or point config.json's \`sections\` at the one ` +
        `that documents it.`,
    );
  }

  return section;
}

/** A section's template, comments stripped. Most are a `.section.html`; `practice/rules` keeps its
 *  markup inline in the decorator, and reading only the file left that chapter with no blocks.
 *
 *  The comments have to go because they quote markup: Dropzone's says "every cell is a live
 *  <ds-dropzone>", which any scan of this file reads as an element that opens and never closes. */
function templateOf(slug) {
  const base = join(
    repo,
    'ds-docs/src/app/sections',
    slug,
    `${slug.split('/').pop()}.section`,
  );
  const read = (file) =>
    readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  try {
    return read(`${base}.html`);
  } catch {
    /* falls through to the inline template */
  }
  try {
    return (
      read(`${base}.ts`).match(/template:\s*`([\s\S]*?)`\s*[,}]/)?.[1] ?? ''
    );
  } catch {
    return '';
  }
}

const ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  rarr: '→',
  times: '×',
  middot: '·',
};
const decode = (text) =>
  text
    .replace(/&(\w+);/g, (whole, name) => ENTITIES[name] ?? whole)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

/** The chapter's own heading, which is what a card is named after. Taken from the template's
 *  `title=` rather than the slug: the slug says `color` where the page says `Colour`, and the
 *  page is what a reader recognises. */
const chapterTitleOf = (slug) =>
  decode(templateOf(slug).match(/title="([^"]*)"/)?.[1] ?? '') ||
  slug.split('/').pop();

/** Which sub-components each chapter marks a block for, so a card can tell its own blocks from the
 *  chapter's. Read from the templates because the marks live there and nowhere else. */
const markedInSection = new Map();
for (const section of sections) {
  markedInSection.set(
    section.slug,
    new Set(
      [...templateOf(section.slug).matchAll(/data-for="([^"]+)"/g)].map(
        (match) => match[1],
      ),
    ),
  );
}

/** Selector → the key docs-section renders its API table under. Read from the generated data
 *  because the key is not derivable: most components are keyed by their folder (`avatar-group`),
 *  one that shares a folder with its parent by `folder:ClassName` (`menu:MenuItemComponent`), and
 *  `ds-container` by the folder it shares with Stack and Inline (`layout`). Guessing produced a
 *  card with no API table at all. */
const apiKeyBySelector = (() => {
  const source = readFileSync(
    join(repo, 'ds-docs/src/app/shared/component-api.generated.ts'),
    'utf8',
  );
  const map = new Map();
  // The ENTRY's own name, not its inner `key`. A part that shares its chapter's anchor is filed as
  // `menu:MenuItemComponent` while its `key` field holds the bare anchor `menu`, and it is the
  // entry name that `docs-section` renders into `data-key`. Reading the field tagged every part
  // with its chapter: the Menu Item card printed `<ds-menu>`.
  for (const [, entry, selector] of source.matchAll(
    /"([^"]+)":\s*\{\s*\n\s*"key":\s*"[^"]+",\s*\n\s*"selector":\s*"([^"]+)"/g,
  )) {
    if (!map.has(selector)) map.set(selector, entry);
  }

  return map;
})();

/** The blocks of a section, in template order, each with the component it belongs to.
 *
 *  A block is a demo with its own `<h3 class="block-title">` and description, or a container
 *  carrying `data-for` when a set of demos is grouped without a heading of its own (Menu's item
 *  states). `owner` is the sub-component the block documents, or `''` for the chapter's own. */
/** Template markup as a reader would hear it: tags out, entities resolved, bindings dropped. */
const plainText = (markup) =>
  decode(markup.replace(/<[^>]*>/g, ' '))
    .replace(/\{\{[\s\S]*?\}\}/g, '')
    .replace(/\s+/g, ' ')
    // Only where the mark ENDS a word. Without the lookahead this ate the space in `the global .link`,
    // because stripping the tags leaves the class name starting with a dot.
    .replace(/\s+([,.;:!?)])(?=\s|$)/g, '$1')
    .replace(/(\()\s+/g, '$1')
    .replace(/\s+\)/g, ')')
    .trim();

const VOID_TAGS = new Set([
  'br',
  'hr',
  'img',
  'input',
  'meta',
  'link',
  'source',
  'track',
  'area',
]);
// A quoted value can hold markup: Tooltip's `[dsTooltip]="'<b>Tags</b> ...'"` otherwise closes the
// tag early and unbalances the depth of every block after it.
const TAG = /<(\/?)([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

function blocksOf(slug) {
  const html = templateOf(slug);
  const from = html.indexOf('<docs-section');
  if (from < 0) return [];

  const body = html.slice(from);
  const found = [];
  // A card slices itself by walking the section's own children, so only a DIRECT child of
  // `<docs-section>` can be a block. Counting nested headings as blocks too is what shipped four
  // blank Menu cards: the chapter reported seven blocks, the card could address three, and the
  // other four sliced everything away and published a heading over an empty page.
  let depth = 0;
  let insideMarkedContainer = false;
  let sliceable = true;

  for (const match of body.matchAll(TAG)) {
    const [tag, closing, name, attributes] = match;
    if (closing) {
      depth -= 1;
      if (depth <= 1) insideMarkedContainer = false;
      continue;
    }

    const heading = /class="block-title/.test(attributes);
    const owner = attributes.match(/data-for="([^"]+)"/)?.[1] ?? null;
    const empty =
      attributes.trimEnd().endsWith('/') || VOID_TAGS.has(name.toLowerCase());
    const card = /\sdata-claude-design(?![\w-])/.test(attributes);

    if (depth === 1 && heading) {
      // The heading's own text, which is what the card is named after.
      const opens = match.index + tag.length;
      const closes = body.indexOf('</h3>', opens);
      const title = decode(
        body.slice(opens, closes < 0 ? opens : closes).replace(/<[^>]*>/g, ' '),
      )
        .replace(/\s+/g, ' ')
        .trim();
      found.push({ title, owner: owner ?? '', at: match.index, card });
    } else if (depth === 1 && owner !== null) {
      // A set of demos grouped without a heading of its own — Menu's item states.
      found.push({ title: '', owner, at: match.index, card });
    } else if (
      depth > 1 &&
      (heading || owner !== null) &&
      !insideMarkedContainer
    ) {
      // Nested under a plain container, so the walk cannot address it: Empty-state lays four of its
      // five variants out in a `.blocks` grid. Slicing that chapter would silently drop them, so it
      // publishes as one whole-chapter card instead.
      sliceable = false;
      if (card)
        throw new Error(
          `${slug}: a nested block carries data-claude-design, but a card can only address a direct child of <docs-section>. Put data-claude-design on the <docs-section> to publish the chapter whole.`,
        );
    }

    if (!empty) {
      if (depth === 1 && owner !== null) insideMarkedContainer = true;
      depth += 1;
    }
  }

  if (!sliceable && found.some((block) => block.card))
    throw new Error(
      `${slug}: nests a block the cards cannot address, so it publishes whole and its block-level data-claude-design marks would be ignored. Move data-claude-design to the <docs-section>.`,
    );
  if (!sliceable) return [];

  // The block's own first paragraph, which becomes the card's subtitle in the pane. Bounded by the
  // NEXT block so a chapter's later prose cannot leak into an earlier card's line.
  return found.map((block, index) => {
    const until = index + 1 < found.length ? found[index + 1].at : body.length;
    const slice = body.slice(block.at, until);
    // Every class the sections use for PROSE, not just the shared one: the refusal block carries its
    // paragraphs in `.refusal-copy`, do-dont in `.caption`, token-discipline in `.muted`.
    const prose = [
      ...slice.matchAll(
        /<p[^>]*class="[^"]*(?:block-desc|refusal-copy|caption|muted)[^"]*"[^>]*>([\s\S]*?)<\/p>/g,
      ),
    ]
      .map(([, inner]) => plainText(inner))
      .filter(Boolean);

    return { ...block, desc: prose[0] ?? '', prose };
  });
}

// The pane fits the declared viewport into its tile — `scale = min(tileW/1200, tileH/declaredH)` —
// so a card that declares its true height is scaled DOWN by exactly the ratio it overshoots by:
// `Button - Color x variant` at 1405px rendered at 0.54 and was unreadable. Declaring no more than
// this instead renders the page at its own size and lets the frame scroll, which it does (measured
// on the live pane with a probe card: a 2400px page inside a 700px declaration scrolls to the end).
// Below the cap the true height is kept, so a short card has no dead space under it.
const VIEWPORT_CAP = 700;
const declaredHeight = (measured) => Math.min(measured, VIEWPORT_CAP);

const MAX_LABEL = 46;

/** A block's title as a filename. The pane labels a card by its filename and nothing else, so this
 *  string is the card's name in the UI — it is written to be read, not to be parsed.
 *
 *  Spaces are used because the pane accepts them (verified against the live project: a path with
 *  spaces writes and reads back unchanged). Everything else is folded to printable ASCII: the
 *  transport is proven for it and not for the `×` and `·` the titles actually contain, and a
 *  rejected path would only surface as a card silently missing from the pane. */
function blockLabel(title) {
  const words = title
    // A binding in a heading is a value at runtime and a name here, so `Library ({{ names.length }})`
    // would have gone up as the card's own label. The parentheses go with it.
    .replace(/\(?\s*\{\{[^}]*\}\}\s*\)?/g, '')
    // A slash joining two alternatives is an "and", and it cannot survive in a path: the Practice
    // chapter is titled "Do / Don't" and dropping the slash left "Do Don't", which reads as a typo.
    .replace(/\s+\/\s+/g, ' & ')
    .replace(/[×✕]/g, 'x')
    .replace(/[·•]/g, '-')
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '')
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    // Windows forbids these in a filename, and the build writes the tree to disk before it uploads.
    .replace(/[<>:"/\\|?*]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // A trailing dot is dropped by Windows on write, so the file would not be where the manifest says.
  const clean = (text) => text.replace(/[-,.:;\s]+$/, '');
  const whole = words.join(' ');
  if (whole.length <= MAX_LABEL) return clean(whole);

  // Too long to keep: end it on a clause rather than mid-sentence. "The header slots are a reading
  // order, not a promise" reads as a name at the comma and as a truncation two words later.
  let cut = '';
  for (const separator of [', ', ' - ', ': ', '; ', ' (']) {
    const at = whole.lastIndexOf(separator, MAX_LABEL);
    if (at > MAX_LABEL * 0.4 && at > cut.length) cut = whole.slice(0, at);
  }
  if (cut) return clean(cut);

  const kept = [];
  for (const word of words) {
    if (kept.join(' ').length + word.length + 1 > MAX_LABEL) break;
    kept.push(word);
  }

  return clean(kept.join(' '));
}

const sectionCarded = (slug) =>
  /<docs-section\b[^>]*\sdata-claude-design(?![\w-])/.test(templateOf(slug));

const wholeChapterCard = (file) => [
  {
    file,
    owns: null,
    ownedIndex: -1,
    chapterPosition: -1,
    title: '',
    desc: '',
    prose: [],
    first: true,
  },
];

function refuseSectionMarkOverBlocks(slug) {
  if (sectionCarded(slug))
    throw new Error(
      `${slug}: <docs-section> carries data-claude-design, but the chapter has blocks a card can address. Mark the blocks instead; the section mark is for a chapter that publishes whole.`,
    );
}

/** The cards a component gets: one per block it owns that carries `data-claude-design` in ds-docs. Nothing
 *  is published by default.
 *
 *  One card per block, because the pane fits a card's declared `viewport` into a fixed tile — so a
 *  card's height IS its zoom level. Table's chapter is 18919px tall and rendered as an illegible
 *  smudge; its blocks are a few hundred pixels each and legible at the same scale as everything
 *  else. The pane labels a card by its FILENAME, so the block's name lands outside the card too. */
function cardsFor(name) {
  const section = sectionFor(name);
  const own = kebab(name);
  const blocks = blocksOf(section.slug);
  const marks = new Set(blocks.map((block) => block.owner).filter(Boolean));
  // Only the chapter's OWN component may claim the unmarked blocks. A part whose chapter marks
  // nothing for it gets NO card: whatever documents it is already on the chapter's own cards, and a
  // second copy under the part's name is the duplication this whole design removes. `TimeColumns`
  // shipped the entire Time Picker chapter — all seven of its blocks — under the name
  // "Time Columns". The chapter named after the component is its own in any group:
  // `charts/heatmap-chart` as much as `components/button`, and so is a chapter named after no
  // component at all: `charts` documents BarChart.
  const chapterName = section.slug.split('/').pop();
  const primary =
    chapterName === own ||
    ![...byName.keys()].some((other) => kebab(other) === chapterName);
  const owner = marks.has(own) ? own : primary ? '' : null;
  const label = spacedName(name);
  if (owner === null) return [];
  if (!blocks.length)
    return sectionCarded(section.slug) ? wholeChapterCard(label) : [];
  refuseSectionMarkOverBlocks(section.slug);

  const mine = blocks
    .map((block, chapterPosition) => ({ ...block, chapterPosition }))
    .filter((block) => block.owner === owner);

  return nameCards(label, mine, owner);
}

/** The chapters that document no component of their own — Foundations, Patterns, Practice, and
 *  Link, whose `ds-link` is a directive and so has no entry in the component surface. */
function guideCardsFor(section) {
  const chapter = blockLabel(chapterTitleOf(section.slug));
  const blocks = blocksOf(section.slug)
    .map((block, chapterPosition) => ({ ...block, chapterPosition }))
    .filter((block) => !block.owner);
  if (!blocks.length)
    return sectionCarded(section.slug) ? wholeChapterCard(chapter) : [];
  refuseSectionMarkOverBlocks(section.slug);

  return nameCards(chapter, blocks, '');
}

/** A block title as it should READ, not as a filename: the folding to printable ASCII that
 *  `blockLabel` does exists because a path may not carry the multiplication sign or a middle dot,
 *  and the h2 inside the card is under no such constraint. Only a template binding has to go. */
const displayTitle = (raw) =>
  (raw ?? '')
    .replace(/\{\{[\s\S]*?\}\}/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    // It follows a dash in `Buttons - with icon`, so it continues the line rather than starting one.
    // Only an ordinary word is lowered: `CSV export`, `W3w`, `12-hour (AM PM)` keep their shape.
    .replace(/^[A-Z](?=[a-z]|\s|$)/, (letter) => letter.toLowerCase());

/** One card per owned block that carries `data-claude-design`, each named `<chapter> - <block>`. Labels
 *  and `ownedIndex` count every block, published or not: the card's runtime slicer counts every
 *  block of the owner on the rendered page. */
function nameCards(chapter, mine, owner) {
  const seen = new Map();

  const cards = mine.map((block, ownedIndex) => {
    // A block with no heading of its own is a grouped set of demos (Menu's item states); the
    // chapter's own name is the best label there is, and it needs an ordinal only if there
    // are several.
    const base = block.title
      ? blockLabel(block.title)
      : mine.length > 1
        ? `States ${ownedIndex + 1}`
        : '';
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const suffix = count > 1 ? `${base} ${count}` : base;

    return {
      file: suffix ? `${chapter} - ${suffix}` : chapter,
      owns: owner,
      ownedIndex,
      chapterPosition: block.chapterPosition,
      title: block.title,
      desc: block.desc ?? '',
      prose: block.prose ?? [],
    };
  });

  return cards
    .filter((_, index) => mine[index].card)
    .map((card, index) => ({ ...card, first: index === 0 }));
}

/** The API keys a chapter declares, which is the set of parts it renders a chip and a table for.
 *  A part outside that set has no `data-key` of its own on the page, and its card then keeps the
 *  chapter's - the Menu Item card printed `<ds-menu>`. */
const declaredKeys = (slug) => {
  const declared =
    templateOf(slug).match(/\[apiKeys\]="\[([^\]]*)\]"/)?.[1] ?? '';

  return new Set([...declared.matchAll(/'([^']+)'/g)].map(([, key]) => key));
};

/** The card's group, taken from the ds-docs group page that renders its section.
 *
 *  It used to come from `category` in the doc's front matter, which was a second, hand-kept
 *  opinion about where a component belongs — and it disagreed: the front matter filed Container,
 *  Inline and Stack under `layout` and Divider under `data-display`, while ds-docs puts all four
 *  under Foundations. One source now, and it is the site people actually navigate. */
const groupOf = (section) => section.group.replace(/^components\//, '');

function readDoc(name) {
  const raw = readFileSync(join(syncDir, 'docs', `${name}.md`), 'utf8').replace(
    /\r\n/g,
    '\n',
  );
  const front = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!front) throw new Error(`${name}.md has no front matter.`);

  return raw.slice(front[0].length).trimStart();
}

/** The card's usage note: the file the pane reads for "Usage notes for Claude", named after the
 *  card and sitting beside it. Found by listing the project after a note was typed in the pane -
 *  it appeared as `<card>.prompt.md` holding the raw text, so the build can write them.
 *
 *  It carries what will not fit in the one-line subtitle: the block's whole prose, and a pointer to
 *  the component's own prompt and declaration. NOTE that the build now OWNS these files - a note
 *  typed in the pane is replaced on the next upload. */
const usageNote = ({ title, prose, component, contract }) =>
  [
    `# ${title}`,
    '',
    ...(prose.length ? [prose.join('\n\n'), ''] : []),
    ...(component
      ? [
          `Full API: \`${component}.d.ts\`. How to use the component anywhere: \`${component}.prompt.md\`.` +
            (contract
              ? ''
              : ' This component is not exported by the package, so it has neither.'),
          '',
        ]
      : []),
  ].join('\n');

/** The same words the card's own h2 shows, for the line the pane prints above the frame. */
const paneTitle = (head, blockTitle) => {
  const shown = displayTitle(blockTitle);

  return shown ? `${head} - ${shown}` : head;
};

/** The card page: the ds-docs section for this component, and nothing else.
 *
 *  There is no React on this page and no per-card script. A hand-written preview per component was
 *  the previous design and the showcase drifted from the components it showed, because a specimen
 *  nobody opens is a specimen nobody checks. The docs site is looked at every day. */
/** Safe inside an HTML comment attribute. The angle brackets go because a `>` ends the marker for
 *  any parser that scans to the first one - thirteen subtitles quoting a tag or a loudness order
 *  did exactly that - and the app's own parser cannot be inspected from here. */
const markerValue = (value) =>
  (value ?? '')
    .replace(/"/g, "'")
    .replace(/[<>]/g, '')
    .replace(/--+/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

/** What the pane prints ABOVE the frame: ONE sentence, a whole thought that ends rather than a
 *  paragraph that stops. The rest of the block's prose is not lost - it becomes the card's usage
 *  note.
 *
 *  Measured, not guessed: a 2003-character probe was stored by the API in full and the pane showed
 *  it up to character 193, so the pane's own limit is about 195. This cap sits under it so the cut
 *  is OURS - on a word, with an ellipsis - rather than the pane's mid-word. The median first
 *  sentence is 76 characters and the ninetieth percentile 168, so 180 lets 93% through whole. */
const SUBTITLE_CAP = 180;
const capped = (paragraph) => {
  const stop = paragraph.search(/[.!?](\s|$)/);
  const sentence = stop < 0 ? paragraph : paragraph.slice(0, stop + 1);

  return sentence.length <= SUBTITLE_CAP
    ? sentence
    : `${sentence.slice(0, sentence.lastIndexOf(' ', SUBTITLE_CAP))}…`;
};

/** A card is generated output nobody edits, so the reasons live here rather than in 410 copies of
 *  the page. The @dsCard marker is added back by the caller - the manifest is built from it.
 *
 *  The strip runs over the whole page, the live inline script included, so a comment opener inside
 *  an interpolated VALUE would eat from there to the next closer and leave a card that renders
 *  nothing and reports no error. Today every value is a component name or a card title;
 *  `guardInterpolated` is what keeps that true rather than hoped for. */
const trimmed = (page) =>
  page
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^[^\S\n]*\n/gm, '');

const COMMENT_TOKEN = /\/\*|\*\/|<!--|-->/;
const guardInterpolated = (card, values) => {
  for (const [key, value] of Object.entries(values)) {
    if (typeof value !== 'string' || !COMMENT_TOKEN.test(value)) continue;
    throw new Error(
      `${card}: \`${key}\` carries ${value.match(COMMENT_TOKEN)[0]}, which the comment strip would` +
        ' follow to the next closer and cut the card apart.',
    );
  }
};

function cardHtml({
  name,
  group,
  tag,
  viewport,
  owns,
  ownedIndex,
  apiKey,
  withTable,
  withLede,
  head,
  block,
  react,
  title,
  subtitle,
}) {
  // Exactly the values that pass THROUGH `trimmed()`. `group`, `title` and `subtitle` reach only
  // the marker, which is concatenated after the strip and never sees it, so guarding those would
  // reject a build over a `*/` in prose the card never carries — while `name`, which the strip does
  // run over, was the one value left out.
  guardInterpolated(name, { name, tag, owns, apiKey, head, block, react });

  const marker =
    `<!-- @dsCard group="${group}"${viewport ? ` viewport="${viewport}"` : ''}` +
    `${title ? ` name="${markerValue(title)}"` : ''}` +
    `${subtitle ? ` subtitle="${markerValue(capped(subtitle))}"` : ''} -->`;

  return (
    marker +
    trimmed(`
<!doctype html>
<!-- The theme is PINNED. The design system switches on the data-theme attribute and has no
     automatic OS branch, so a host that sets it on this document flips every component's tokens
     while the page keeps its own background. Measured on the live cards: a light page whose tonal
     buttons came out dark navy with white labels and whose outline labels went invisible. -->
<html data-theme="light"><head><meta charset="utf-8">
  <title>${name}</title>
  <link rel="stylesheet" href="../../../styles.css">
  <link rel="stylesheet" href="../../../_ds_bundle.css">
  <style>
    /* From the token, not a literal: the hardcoded white is what made that mismatch possible at
       all, because the components followed the theme and the page did not. */
    body{margin:0;background:var(--surface-canvas, #fff);color:var(--text-primary, #161A28)}${
      block
        ? `
    /* The block's own h3 is gone - the h2 says it now - so its first paragraph sits under the
       title and takes the tight gap a heading gives, not the loose one that separates demos. */
    .ds-page .section > .block-desc:first-of-type{margin-top:var(--space-2)}`
        : ''
    }
    /* The same column ds-docs renders a section in (section-group.page.scss). A section laid out
       for a capped, padded column stretches edge to edge without it, and every demo that relies on
       wrapping wraps at the wrong width. */
    .ds-page{max-width:var(--col-cap-content);margin-inline:auto;padding:var(--space-12) var(--space-16) var(--space-24)}
  </style>
</head><body>
  <div class="ds-page"><${tag}></${tag}></div>
  <!-- Sections only: a section renders DS components as Angular components, and registering those
       same tags as custom elements upgrades each host twice. See .design-sync/elements/main.ts. -->
  <script>window.__dsSectionsOnly = true</script>
  <script src="../../../_ds_bundle.js"></script>
  <script>
    /* Keeps this component's blocks and drops the rest, so Menu and MenuItem are two pages rather
       than the same chapter twice. A block starts at a top-level child carrying \`data-for\` (which
       names the sub-component it belongs to) or at an h3.block-title (which belongs to the
       chapter's own component), and runs until the next one.
       Of the chapter's own header only the title is kept on every card. The eyebrow is a constant,
       and the lede describes the CHAPTER — printing it on all seven Button cards is the same
       paragraph seven times, so it rides the first card only. Removed rather than hidden: the pane
       sizes a card from its rendered height. */
    (function () {
      var OWNS = ${JSON.stringify(owns)};
      var INDEX = ${JSON.stringify(ownedIndex)};
      var KEY = ${JSON.stringify(apiKey)};
      var TABLE = ${JSON.stringify(Boolean(withTable))};
      var HEAD = ${JSON.stringify(head)};
      var BLOCK = ${JSON.stringify(block)};
      var REACT = ${JSON.stringify(react)};
      /* The chapter's title and lede belong to the chapter's OWN component. On a ToggleButton card
         the title said "Buttons" and the lede described Button, and the card already names itself
         in its block heading and in the pane's label. The lede rides the chapter's first published card.
         A chapter with no addressable blocks publishes as ONE card, and then there is nothing to
         slice and nothing repeated — it loses only the eyebrow. */
      var WHOLE = OWNS === null;
      /* The chapter's summary belongs to the chapter, so it rides its first card only - seven
         copies of the same paragraph is what it was before. A whole-chapter card is that card. */
      var LEDE = WHOLE || (OWNS === '' && ${JSON.stringify(Boolean(withLede))});
      var KEEP = LEDE ? 'h2, p.lede' : 'h2';
      /* docs-section appends a chapter's service tables after its last block, so without this they
         ride that block's card; a service is Angular-only and has no place on the React canvas. */
      var DROP_ALWAYS = '.eyebrow, docs-api-table:not([data-key])' + (LEDE ? '' : ', p.lede');
      var API = '[data-key]';
      var host = document.querySelector(${JSON.stringify(tag)});
      var start = Date.now();
      (function slice() {
        var section = host && host.querySelector('.section');
        if (!section) {
          if (Date.now() - start < 8000) setTimeout(slice, 50);
          return;
        }
        /* Until a section's body has rendered it holds only its header, and slicing then would
           drop every block before it arrives. */
        var HEADER = 'h2, p.lede, .eyebrow, .tagrow, docs-component-meta, ' + API;
        var filled = function (node) {
          return !node.matches(HEADER) && (node.childElementCount > 0 || node.textContent.trim() !== '');
        };
        if (!Array.prototype.some.call(section.children, filled)) {
          if (Date.now() - start < 8000) return setTimeout(slice, 50);
          document.documentElement.setAttribute('data-ds-sliced', '0');
          document.documentElement.setAttribute('data-ds-kept', '0');
          return;
        }
        var owner = '';
        var doomed = [];
        var apis = [];
        var ordinal = -1;
        var heading = null;
        for (var node = section.firstElementChild; node; node = node.nextElementSibling) {
          if (node.matches(DROP_ALWAYS)) { doomed.push(node); continue; }
          if (WHOLE) continue;
          if (node.matches(KEEP)) continue;
          if (node.matches(API)) { apis.push(node); continue; }
          var marked = node.getAttribute('data-for');
          var starts = marked !== null || node.matches('h3.block-title');
          if (marked !== null) owner = marked;
          else if (node.matches('h3.block-title')) owner = '';
          if (starts && owner === OWNS) ordinal += 1;
          if (owner !== OWNS || ordinal !== INDEX) doomed.push(node);
          else if (starts && node.matches('h3.block-title')) heading = node;
        }
        /* One API table per card: its own. The chapter's component is keyed by the anchor and a
           part by the anchor plus its class name. A part the extractor left out has no key at all,
           and then the chapter's table is the only one there is, so it stays. */
        var mine = KEY === '' ? [] : apis.filter(function (n) { return n.getAttribute('data-key') === KEY; });
        var keepApi = KEY === '' ? [] : (mine.length ? mine : apis.slice(0, 1));
        if (!WHOLE) {
          for (var a = 0; a < apis.length; a++) {
            if (keepApi.indexOf(apis[a]) < 0) { doomed.push(apis[a]); continue; }
            if (TABLE) continue;
            if (apis[a].matches('docs-api-table')) { doomed.push(apis[a]); continue; }
            var nested = apis[a].querySelector('docs-api-table');
            if (nested) doomed.push(nested);
          }
        }

        /* The h2 names what the card is ABOUT. It said "Buttons" on all seven Button cards and
           said nothing at all on a part's card, while the block's own h3 carried the only specific
           words on the page - so the h3's text moves up and the h3 itself goes. HEAD overrides the
           chapter's name for a part, whose own name is not the chapter's. */
        var title = section.querySelector('h2');
        var label = null;
        for (var c = 0; title && c < title.childNodes.length; c++) {
          if (title.childNodes[c].nodeType === 3) { label = title.childNodes[c]; break; }
        }
        if (title && label === null) {
          label = document.createTextNode('');
          title.insertBefore(label, title.firstChild);
        }
        if (label) {
          var head = HEAD || label.nodeValue.trim();
          label.nodeValue = BLOCK ? head + ' - ' + BLOCK : head;
          if (BLOCK && heading) doomed.push(heading);
        }

        for (var i = 0; i < doomed.length; i++) doomed[i].remove();

        /* A part's chip is rendered inside its \`.api-sub\` wrapper at the foot of the chapter, while
           the chapter's own sits directly under the title. Same place on every card. An emptied
           wrapper goes with it - it carries a margin of its own. */
        var wrapper = KEY === '' ? null : section.querySelector('.api-sub[data-key="' + KEY + '"]');
        var chip = wrapper ? wrapper.querySelector('docs-component-meta') : null;
        if (chip && title) title.parentNode.insertBefore(chip, title.nextSibling);
        if (wrapper && wrapper.firstElementChild === null) wrapper.remove();

/* To Claude Design this is a React design system, so the chip names the React tag and only that
           one: an agent here cannot type \`<ds-button>\`, and the Angular name is on the docs site,
           in the \`.d.ts\` and in the README for whoever translates. Rewritten in place, so ds-docs
           renders its own chip untouched. A directive has no React tag and passes null. */
        var named = section.querySelector('docs-component-meta .chip .tag');
        if (REACT && named) named.textContent = '<' + REACT + ' />';
        /* What SURVIVED, which is the number that matters: four Menu cards shipped with a heading
           over an empty page because the chapter reported more blocks than the card could address,
           and a card that removes everything looks exactly like one that removed nothing. */
        var kept = 0;
        for (var k = section.firstElementChild; k; k = k.nextElementSibling) {
          if (filled(k)) kept += 1;
        }
        document.documentElement.setAttribute('data-ds-sliced', String(doomed.length));
        document.documentElement.setAttribute('data-ds-kept', String(kept));
      })();
    })();
  </script>
</body></html>
`)
  );
}

/** Declarations for the agent. Richer than the deleted port's: the same per-prop docs plus the 55
 *  named slots, which no hand-written declaration ever carried. */
function declaration({ name, component, doc }) {
  const lines = [];
  for (const { name: propName, kind, type, doc: propDoc } of component.api) {
    const emitted =
      kind === 'output'
        ? `on${propName[0].toUpperCase()}${propName.slice(1)}`
        : propName;
    const emittedType = kind === 'output' ? `(value: ${type}) => void` : type;
    if (propDoc) lines.push(`  /** ${propDoc} */`);
    lines.push(`  ${emitted}?: ${emittedType};`);
    if (kind === 'model') {
      lines.push(
        `  on${propName[0].toUpperCase()}${propName.slice(1)}Change?: (value: ${type}) => void;`,
      );
    }
  }
  for (const slot of component.slots) {
    lines.push(`  /** Content for the \`[${slot.attribute}]\` slot. */`);
    lines.push(`  ${slot.prop}?: React.ReactNode;`);
  }
  lines.push('  /** Element content. */');
  lines.push('  children?: React.ReactNode;');
  lines.push('  className?: string;');
  lines.push('  style?: React.CSSProperties;');

  return `import * as React from 'react';

/**
 * ${name} — the real ${component.className}, run by Angular behind \`<${component.tag}>\`.
${doc.split('\n')[0] ? ` * ${doc.split('\n')[0].replace(/\*\//g, '*\\/')}\n` : ''} */
export interface ${name}Props {
${lines.join('\n')}
}

export declare const ${name}: React.ComponentType<${name}Props>;
`;
}

// The declaration cannot import from the library, so `gen.mjs` hands over each type with its
// aliases already substituted. What survives here is anything made of literals and built-ins; a
// name that still refers to a library interface becomes `unknown`, which teaches an agent nothing
// but at least does not break the project's own typecheck with a dangling import.
const AMBIENT = new Set([
  'boolean',
  'number',
  'string',
  'void',
  'unknown',
  'null',
  'undefined',
  'true',
  'false',
  'readonly',
  'Array',
  'Record',
  'Partial',
  'Date',
  'RegExp',
  'File',
  'FileList',
  'Blob',
  'Event',
  'MouseEvent',
  'KeyboardEvent',
  'PointerEvent',
  'FocusEvent',
  'InputEvent',
  'DragEvent',
  'HTMLElement',
  'Element',
  'React',
  'ReactNode',
]);

// The whole icon union on every icon prop is a wall of characters. It is kept long enough to show
// the naming convention and closed with `string & {}` so any name still type-checks.
const ICON_NAMES_SHOWN = 15;

function declarationType(inlined) {
  const bare =
    inlined.replace(/'[^']*'/g, ' ').match(/[A-Za-z_$][\w$]*/g) ?? [];
  if (
    bare.some(
      (name) => !AMBIENT.has(name) && name !== 'keyof' && name !== 'typeof',
    )
  ) {
    return 'unknown';
  }
  const literals = inlined.match(/'[^']*'/g) ?? [];
  if (literals.length > ICON_NAMES_SHOWN + 5) {
    const shown = literals.slice(0, ICON_NAMES_SHOWN).join(' | ');
    const rest = literals.length - ICON_NAMES_SHOWN;
    return `${shown} | (string & {}) /* +${rest} more */${/\|\s*null\b/.test(inlined) ? ' | null' : ''}`;
  }

  return inlined;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const written = [];
const withheld = [];
const untagged = [];
for (const name of [...byName.keys()].sort()) {
  const component = byName.get(name);
  const body = readDoc(name);
  const section = sectionFor(name);
  const group = groupOf(section);
  const dir = join(OUT, 'components', group, name);
  mkdirSync(dir, { recursive: true });

  // The chapter still publishes its CARDS — how a field message or a day cell looks is worth
  // seeing — but a component the package does not export gets no contract to build against.
  if (publicExports.has(component.className)) {
    writeFileSync(
      join(dir, `${name}.jsx`),
      `// Re-export of ${config.pkg} ${name}. Implementation is in the root _ds_bundle.js (window.IdsDs).\n` +
        `Object.assign(window, { ${name}: window.IdsDs.${name} });\n`,
    );
    writeFileSync(
      join(dir, `${name}.d.ts`),
      declaration({
        name,
        doc: body,
        component: {
          ...component,
          api: component.api.map((entry) => ({
            ...entry,
            type: declarationType(entry.inlined),
          })),
        },
      }),
    );
    writeFileSync(join(dir, `${name}.prompt.md`), `# ${name}\n\n${body}`);
  } else {
    withheld.push(name);
  }

  // Keyed by the card FILE, not the component: a component publishes one card per block it owns and
  // each is a different height. snapshot-cards.mjs writes these keys.
  const partKey = apiKeyBySelector.get(component.selector) ?? '';
  for (const card of cardsFor(name)) {
    const height = viewports.heights[card.file];
    writeFileSync(
      join(dir, `${card.file}.html`),
      cardHtml({
        name,
        group,
        tag: section.tag,
        viewport: height
          ? `${viewports.width}x${declaredHeight(height)}`
          : null,
        owns: card.owns,
        ownedIndex: card.ownedIndex,
        apiKey: apiKeyBySelector.get(component.selector) ?? '',
        // The tag is on every card; only the first published one carries the API table and the
        // chapter's lede. On Table that is the difference between one table and dozens of copies.
        withTable: card.first,
        withLede: card.first,
        // A part's card is titled after the PART. `card.owns` is empty exactly when the card belongs
        // to the chapter's own component, and then the chapter's own h2 text is already right.
        head: card.owns ? spacedName(name) : null,
        block: displayTitle(card.title),
        title: paneTitle(
          card.owns ? spacedName(name) : chapterTitleOf(section.slug),
          card.title,
        ),
        subtitle: card.desc,
        // `name` IS the React name - it is what the wrapper, the declaration and the card directory
        // are called. All 85 components in the surface are elements today; an attribute selector
        // would be a directive, which has no React tag of its own.
        react: component.selector.startsWith('[') ? null : name,
      }),
    );
    // An empty key means the API extractor has no entry for this component at all, and then there
    // is no chip anywhere to show - the card correctly shows none rather than the chapter's.
    writeFileSync(
      join(dir, `${card.file}.prompt.md`),
      usageNote({
        title: paneTitle(
          card.owns ? spacedName(name) : chapterTitleOf(section.slug),
          card.title,
        ),
        prose: card.prose,
        component: name,
        contract: publicExports.has(component.className),
      }),
    );
    if (card.owns && partKey && !declaredKeys(section.slug).has(partKey)) {
      untagged.push(`${card.file} (${section.slug} declares no '${partKey}')`);
    }
    written.push({
      file: card.file,
      path: `components/${group}/${name}/${card.file}.html`,
      slug: section.slug,
      chapterPosition: card.chapterPosition,
      name,
    });
  }
}

// Chapters with no component of their own. Link keeps its place among the components because that
// is where a reader looks for it; the rest are guides and get a tree of their own.
const claimed = new Set(
  [...byName.keys()].map((name) => sectionFor(name).slug),
);
for (const section of sections.filter((entry) => !claimed.has(entry.slug))) {
  const group = groupOf(section);
  const chapter = blockLabel(chapterTitleOf(section.slug));
  const root = section.slug.startsWith('components/') ? 'components' : 'guides';
  const dir = join(OUT, root, group, chapter);
  mkdirSync(dir, { recursive: true });

  for (const card of guideCardsFor(section)) {
    const height = viewports.heights[card.file];
    writeFileSync(
      join(dir, `${card.file}.html`),
      cardHtml({
        name: chapter,
        group,
        tag: section.tag,
        viewport: height
          ? `${viewports.width}x${declaredHeight(height)}`
          : null,
        owns: card.owns,
        ownedIndex: card.ownedIndex,
        apiKey: '',
        withTable: card.first,
        withLede: card.first,
        head: null,
        block: displayTitle(card.title),
        title: paneTitle(chapterTitleOf(section.slug), card.title),
        subtitle: card.desc,
        // A chapter with no component of its own renders no chip, so there is nothing to name.
        react: null,
      }),
    );
    writeFileSync(
      join(dir, `${card.file}.prompt.md`),
      usageNote({
        title: paneTitle(chapterTitleOf(section.slug), card.title),
        prose: card.prose,
        component: null,
        contract: false,
      }),
    );
    written.push({
      file: card.file,
      path: `${root}/${group}/${chapter}/${card.file}.html`,
      slug: section.slug,
      chapterPosition: card.chapterPosition,
      name: chapter,
    });
  }
}

// The order the pane should show them in: the reading order of the docs site — groups as
// GROUP_PAGES lists them, chapters within a group, blocks within a chapter. Written for
// build-manifest, because walking the built tree only ever yields alphabetical, which put Button's
// "Color × variant" nowhere near the top of the Buttons chapter where it opens.
const sectionOrder = new Map(
  sections.map((section, index) => [section.slug, index]),
);
const ordered = written.map((card) => ({
  path: card.path,
  section: sectionOrder.get(card.slug) ?? Number.MAX_SAFE_INTEGER,
  block:
    card.chapterPosition < 0 ? Number.MAX_SAFE_INTEGER : card.chapterPosition,
  name: card.name,
}));
ordered.sort(
  (a, b) =>
    a.section - b.section || a.block - b.block || a.name.localeCompare(b.name),
);
writeFileSync(
  join(elements, 'gen', 'cards.json'),
  `${JSON.stringify(
    {
      generatedBy: 'build-cards.mjs',
      cards: ordered.map((entry) => entry.path),
      // The chapters that opt anything into Claude Design: check-section-coverage holds each of them
      // to at least one card and leaves the rest unpublished on purpose.
      opted: sections
        .filter((section) =>
          /\sdata-claude-design(?![\w-])/.test(templateOf(section.slug)),
        )
        .map((section) => section.tag),
    },
    null,
    2,
  )}\n`,
);

cpSync(join(elements, 'dist', 'ds-bundle.js'), join(OUT, '_ds_bundle.js'));
const bundleCss = readFileSync(join(elements, 'dist', 'ds-bundle.css'), 'utf8');
writeFileSync(join(OUT, '_ds_bundle.css'), bundleCss);

// Everything below used to be left over from a hand-made upload in July, which meant the project
// depended on files nothing in this repo could rebuild: a font could not be added, React could not
// be pinned, and a wipe-and-reupload was unsafe because half the tree had no source.
mkdirSync(join(OUT, 'fonts'), { recursive: true });
const faces = readdirSync(join(elements, 'dist', 'browser', 'media')).filter(
  (file) => file.endsWith('.woff2'),
);
if (!faces.length) {
  throw new Error(
    'no .woff2 in dist/browser/media — the Angular build did not emit the faces.',
  );
}
for (const face of faces) {
  cpSync(
    join(elements, 'dist', 'browser', 'media', face),
    join(OUT, 'fonts', face),
  );
}

// The @font-face rules already ship inside the bundle, pointing at `fonts/`. fonts.css exists
// because styles.css imports it, and it sits INSIDE that directory — so the same rules need their
// URLs rewritten one level down or every face 404s from here.
const fontFaces = bundleCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];
if (fontFaces.length < faces.length) {
  throw new Error(
    `${faces.length} face file(s) but ${fontFaces.length} @font-face rule(s) in the bundle` +
      ' — one of the two is out of step.',
  );
}
writeFileSync(
  join(OUT, 'fonts', 'fonts.css'),
  `${fontFaces.join('\n').replace(/url\("fonts\//g, 'url("./')}\n`,
);

// The stylesheet the cards link first. Reproduced rather than reinvented: this is what the project
// already served, so the load order the pane relies on does not change.
writeFileSync(
  join(OUT, 'styles.css'),
  '@import "./fonts/fonts.css";\n@import "./_ds_bundle.css";\n',
);

// The React the cards load as a classic script. Shipping it is the point: the host's copy is
// outside our control, and the wrappers are compiled against a known version — 18.3.1 is what
// bootstrap.mjs installs and what the demo page is proved against.
mkdirSync(join(OUT, '_vendor'), { recursive: true });
const vendored = [
  ['react', 'umd/react.production.min.js', 'react.js'],
  ['react-dom', 'umd/react-dom.production.min.js', 'react-dom.js'],
];
for (const [pkg, file, target] of vendored) {
  cpSync(
    join(syncDir, 'node_modules', pkg, file),
    join(OUT, '_vendor', target),
  );
}

// Images pasted into the project by hand. They are not design system content, but the point of
// committing the upload tree is that the repo can rebuild the WHOLE project — and a file with no
// source here cannot be restored if the project is ever wiped, because `delete_files` and a
// re-upload are the only repair and only the owner can do the first half.
const pasted = join(syncDir, 'assets', 'uploads');
mkdirSync(join(OUT, 'uploads'), { recursive: true });
for (const file of readdirSync(pasted)) {
  cpSync(join(pasted, file), join(OUT, 'uploads', file));
}

// The project's cover image. It was the last file in the project with no source at all — a WebP
// that came with the hand-made upload — so a wipe-and-reupload would have blanked the tile with
// nothing to restore it from. These are still those bytes.
//
// Any extension is accepted because the project file is called `.thumbnail` and carries none:
// dropping a replacement into assets/ should not also mean editing this line.
const cover = readdirSync(join(syncDir, 'assets')).find((file) =>
  /^thumbnail\./.test(file),
);
if (!cover) {
  throw new Error(
    'no assets/thumbnail.* — the project tile would publish blank.',
  );
}
cpSync(join(syncDir, 'assets', cover), join(OUT, '.thumbnail'));

// The composition rules the package ships to every consumer's agents, which the README sends the
// agent to first. A second copy sits beside each card of the Rules chapter, because that chapter
// fetches the file relative to its own page and would otherwise freeze the fallback text.
cpSync(join(repo, 'design-system.md'), join(OUT, 'design-system.md'));
for (const card of written.filter((entry) => entry.slug === 'practice/rules')) {
  cpSync(
    join(repo, 'design-system.md'),
    join(OUT, dirname(card.path), 'design-system.md'),
  );
}

/* Paths the project still holds and this build no longer produces. The list stays in the REPO and
   is printed for whoever is running the upload - it must NOT reach the project. The README there is
   the front door a designer and an agent read, and our clean-up list has no business in it. */
const obsolete = readFileSync(join(syncDir, 'obsolete.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const live = obsolete.filter((path) => existsSync(join(OUT, path)));
if (live.length) {
  throw new Error(
    `.design-sync/obsolete.txt lists ${live.length} path(s) this build still produces, so they are` +
      ` live cards and not obsolete files:\n  ${live.join('\n  ')}`,
  );
}

// The project's own README, from the same conventions file the agent reads.
writeFileSync(
  join(OUT, 'README.md'),
  readFileSync(
    join(syncDir, config.readmeHeader.replace('.design-sync/', '')),
    'utf8',
  ),
);

if (obsolete.length) {
  console.log(
    `· ${obsolete.length} obsolete path(s) still on the project, owner-only to delete:` +
      `\n  ${obsolete.join('\n  ')}`,
  );
}

if (untagged.length) {
  throw new Error(
    `${untagged.length} part card(s) would print their CHAPTER's tag, having none of their own.` +
      ` Add the key to that section's \`[apiKeys]\` input so docs-section renders its chip and` +
      ` table:\n  ${untagged.join('\n  ')}`,
  );
}

if (withheld.length) {
  console.log(
    `· ${withheld.length} component(s) get no contract — src/lib/public-api.ts does not` +
      ` export them: ${withheld.join(', ')}`,
  );
}

const distinctSections = new Set(written.map((card) => card.slug));
console.log(
  `✓ ${written.length} card(s) over ${distinctSections.size} ds-docs section(s)` +
    ` + ${byName.size - withheld.length} declaration(s) + ${readdirSync(pasted).length} pasted image(s)` +
    ` into ${OUT.replace(repo, '.')}`,
);
