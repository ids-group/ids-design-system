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
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const repo = resolve(syncDir, '..');
const elements = join(syncDir, 'elements');
const OUT = join(syncDir, 'upload');

const config = JSON.parse(readFileSync(join(syncDir, 'config.json'), 'utf8'));
const viewports = JSON.parse(readFileSync(join(syncDir, 'viewports.json'), 'utf8'));
const surface = JSON.parse(readFileSync(join(elements, 'gen', 'surface.json'), 'utf8'));
const byName = new Map(surface.components.map((component) => [component.name, component]));
const sections = JSON.parse(readFileSync(join(elements, 'gen', 'sections.json'), 'utf8')).sections;
const sectionBySlug = new Map(sections.map((section) => [section.slug, section]));

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** The component's name as a reader sees it. `ToggleButton` is an identifier — it belongs in the
 *  declaration and the directory, both of which keep it — but the card's filename IS its label in
 *  the pane, and a list of run-together words is read a word at a time. `W3w` keeps its shape:
 *  the split is only ever at a lowercase-or-digit followed by an uppercase. */
const spacedName = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

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
      `${name} resolves to the ds-docs section "${slug}", which GROUP_PAGES does not register.\n`
        + `Either add a section for it in ds-docs, or point config.json's \`sections\` at the one `
        + `that documents it.`,
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
  const base = join(repo, 'ds-docs/src/app/sections', slug, `${slug.split('/').pop()}.section`);
  const read = (file) => readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  try {
    return read(`${base}.html`);
  } catch {
    /* falls through to the inline template */
  }
  try {
    return read(`${base}.ts`).match(/template:\s*`([\s\S]*?)`\s*[,}]/)?.[1] ?? '';
  } catch {
    return '';
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rarr: '→', times: '×', middot: '·' };
const decode = (text) => text
  .replace(/&(\w+);/g, (whole, name) => ENTITIES[name] ?? whole)
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

/** The chapter's own heading, which is what a card is named after. Taken from the template's
 *  `title=` rather than the slug: the slug says `color` where the page says `Colour`, and the
 *  page is what a reader recognises. */
const chapterTitleOf = (slug) => decode(templateOf(slug).match(/title="([^"]*)"/)?.[1] ?? '')
  || slug.split('/').pop();

/** Which sub-components each chapter marks a block for, so a card can tell its own blocks from the
 *  chapter's. Read from the templates because the marks live there and nowhere else. */
const markedInSection = new Map();
for (const section of sections) {
  markedInSection.set(
    section.slug,
    new Set([...templateOf(section.slug).matchAll(/data-for="([^"]+)"/g)].map((match) => match[1])),
  );
}

/** Selector → the key docs-section renders its API table under. Read from the generated data
 *  because the key is not derivable: most components are keyed by their folder (`avatar-group`),
 *  one that shares a folder with its parent by `folder:ClassName` (`menu:MenuItemComponent`), and
 *  `ds-container` by the folder it shares with Stack and Inline (`layout`). Guessing produced a
 *  card with no API table at all. */
const apiKeyBySelector = (() => {
  const source = readFileSync(
    join(repo, 'ds-docs/src/app/shared/component-api.generated.ts'), 'utf8',
  );
  const map = new Map();
  // Each entry opens with its own `key` and `selector` on adjacent lines.
  for (const [, key, selector] of source.matchAll(
    /"key":\s*"([^"]+)",\s*\n\s*"selector":\s*"([^"]+)"/g,
  )) {
    if (!map.has(selector)) map.set(selector, key);
  }

  return map;
})();

/** The blocks of a section, in template order, each with the component it belongs to.
 *
 *  A block is a demo with its own `<h3 class="block-title">` and description, or a container
 *  carrying `data-for` when a set of demos is grouped without a heading of its own (Menu's item
 *  states). `owner` is the sub-component the block documents, or `''` for the chapter's own. */
const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'track', 'area']);
const TAG = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*)>/g;

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
    const empty = attributes.trimEnd().endsWith('/') || VOID_TAGS.has(name.toLowerCase());

    if (depth === 1 && heading) {
      // The heading's own text, which is what the card is named after.
      const opens = match.index + tag.length;
      const closes = body.indexOf('</h3>', opens);
      const title = decode(body.slice(opens, closes < 0 ? opens : closes).replace(/<[^>]*>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();
      found.push({ title, owner: owner ?? '' });
    } else if (depth === 1 && owner !== null) {
      // A set of demos grouped without a heading of its own — Menu's item states.
      found.push({ title: '', owner });
    } else if (depth > 1 && (heading || owner !== null) && !insideMarkedContainer) {
      // Nested under a plain container, so the walk cannot address it: Empty-state lays four of its
      // five variants out in a `.blocks` grid. Slicing that chapter would silently drop them, so it
      // publishes as one whole-chapter card instead.
      sliceable = false;
    }

    if (!empty) {
      if (depth === 1 && owner !== null) insideMarkedContainer = true;
      depth += 1;
    }
  }

  return sliceable ? found : [];
}

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

/** The cards a component gets: one per block it owns, or one whole-chapter card when the chapter
 *  marks nothing for it.
 *
 *  One card per block, because the pane fits a card's declared `viewport` into a fixed tile — so a
 *  card's height IS its zoom level. Table's chapter is 18919px tall and rendered as an illegible
 *  smudge; its 35 blocks are a few hundred pixels each and legible at the same scale as everything
 *  else. Nothing is cut from ds-docs: a block carries its own title and prose, and the pane labels
 *  a card by its FILENAME, so the block's name lands outside the card as well. */
function cardsFor(name) {
  const section = sectionFor(name);
  const own = kebab(name);
  const blocks = blocksOf(section.slug);
  const marks = new Set(blocks.map((block) => block.owner).filter(Boolean));
  // Only the chapter's OWN component may claim the unmarked blocks. A part whose chapter marks
  // nothing for it falls back to one whole-chapter card — giving it a card per block would republish
  // the parent's demos under a second name, which is the duplication this whole design removes.
  const primary = section.slug.startsWith('components/') && section.slug.slice(11) === own;
  const owner = marks.has(own) ? own : (primary ? '' : null);
  const label = spacedName(name);
  if (owner === null || !blocks.length) {
    return [{ file: label, owns: null, ownedIndex: -1, chapterPosition: -1, title: '' }];
  }

  const mine = blocks
    .map((block, chapterPosition) => ({ ...block, chapterPosition }))
    .filter((block) => block.owner === owner);
  if (!mine.length) return [{ file: label, owns: null, ownedIndex: -1, chapterPosition: -1, title: '' }];

  return nameCards(label, mine, owner);
}

/** The chapters that document no component of their own — Foundations, Patterns, Practice, and
 *  Link, whose `ds-link` is a directive and so has no entry in the component surface.
 *
 *  They were compiled into the bundle from the first build and shown on nothing: 27 chapters, the
 *  colour ramps and the spacing scale and the do/don't among them, which is most of what an agent
 *  needs before it places a single component. */
function guideCardsFor(section) {
  const chapter = blockLabel(chapterTitleOf(section.slug));
  const blocks = blocksOf(section.slug)
    .map((block, chapterPosition) => ({ ...block, chapterPosition }))
    .filter((block) => !block.owner);
  if (!blocks.length) {
    return [{ file: chapter, owns: null, ownedIndex: -1, chapterPosition: -1, title: '' }];
  }

  return nameCards(chapter, blocks, '');
}

/** One card per owned block, each named `<chapter> - <block>`. */
function nameCards(chapter, mine, owner) {
  const seen = new Map();

  return mine.map((block, ownedIndex) => {
    // A block with no heading of its own is a grouped set of demos (Menu's item states); the
    // chapter's own name is the best label there is, and it needs an ordinal only if there
    // are several.
    const base = block.title
      ? blockLabel(block.title)
      : (mine.length > 1 ? `States ${ownedIndex + 1}` : '');
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    const suffix = count > 1 ? `${base} ${count}` : base;

    return {
      file: suffix ? `${chapter} - ${suffix}` : chapter,
      owns: owner,
      ownedIndex,
      chapterPosition: block.chapterPosition,
      title: block.title,
    };
  });
}

/** The card's group, taken from the ds-docs group page that renders its section.
 *
 *  It used to come from `category` in the doc's front matter, which was a second, hand-kept
 *  opinion about where a component belongs — and it disagreed: the front matter filed Container,
 *  Inline and Stack under `layout` and Divider under `data-display`, while ds-docs puts all four
 *  under Foundations. One source now, and it is the site people actually navigate. */
const groupOf = (section) => section.group.replace(/^components\//, '');

function readDoc(name) {
  const raw = readFileSync(join(syncDir, 'docs', `${name}.md`), 'utf8').replace(/\r\n/g, '\n');
  const front = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!front) throw new Error(`${name}.md has no front matter.`);

  return raw.slice(front[0].length).trimStart();
}

/** The card page: the ds-docs section for this component, and nothing else.
 *
 *  There is no React on this page and no per-card script. A hand-written preview per component was
 *  the previous design and the showcase drifted from the components it showed, because a specimen
 *  nobody opens is a specimen nobody checks. The docs site is looked at every day. */
function cardHtml({ name, group, tag, viewport, owns, ownedIndex, apiKey }) {
  const marker = `<!-- @dsCard group="${group}"${viewport ? ` viewport="${viewport}"` : ''} -->`;

  return `${marker}
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
    body{margin:0;background:var(--surface-canvas, #fff);color:var(--text-primary, #161A28)}
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
${owns === null ? '' : `  <script>
    /* Keeps this component's blocks and drops the rest, so Menu and MenuItem are two pages rather
       than the same chapter twice. A block starts at a top-level child carrying \`data-for\` (which
       names the sub-component it belongs to) or at an h3.block-title (which belongs to the
       chapter's own component), and runs until the next one. CHROME is docs-section's own template
       — heading, lede, API tables — and is never touched, so a part's card still says which chapter
       it came from. Removed rather than hidden: the pane sizes a card from its rendered height. */
    (function () {
      var OWNS = ${JSON.stringify(owns)};
      var INDEX = ${JSON.stringify(ownedIndex)};
      var KEY = ${JSON.stringify(apiKey)};
      var CHROME = '.eyebrow, h2, docs-component-meta, p.lede';
      var API = '[data-key]';
      var host = document.querySelector(${JSON.stringify(tag)});
      var start = Date.now();
      (function slice() {
        var section = host && host.querySelector('.section');
        if (!section) {
          if (Date.now() - start < 8000) setTimeout(slice, 50);
          return;
        }
        var owner = '';
        var doomed = [];
        var apis = [];
        var ordinal = -1;
        for (var node = section.firstElementChild; node; node = node.nextElementSibling) {
          if (node.matches(CHROME)) continue;
          if (node.matches(API)) { apis.push(node); continue; }
          var marked = node.getAttribute('data-for');
          var starts = marked !== null || node.matches('h3.block-title');
          if (marked !== null) owner = marked;
          else if (node.matches('h3.block-title')) owner = '';
          if (starts && owner === OWNS) ordinal += 1;
          if (owner !== OWNS || ordinal !== INDEX) doomed.push(node);
        }
        /* One API table per card: its own. The chapter's component is keyed by the anchor and a
           part by the anchor plus its class name. A part the extractor left out has no key at all,
           and then the chapter's table is the only one there is, so it stays. */
        var mine = KEY === null ? [] : apis.filter(function (n) { return n.getAttribute('data-key') === KEY; });
        var survivor = KEY === null ? null : (mine.length ? mine[0] : apis[0]);
        for (var a = 0; a < apis.length; a++) if (apis[a] !== survivor) doomed.push(apis[a]);

        for (var i = 0; i < doomed.length; i++) doomed[i].remove();
        /* What SURVIVED, which is the number that matters: four Menu cards shipped with a heading
           over an empty page because the chapter reported more blocks than the card could address,
           and a card that removes everything looks exactly like one that removed nothing. */
        var kept = 0;
        for (var k = section.firstElementChild; k; k = k.nextElementSibling) {
          if (!k.matches(CHROME) && !k.matches(API)) kept += 1;
        }
        document.documentElement.setAttribute('data-ds-sliced', String(doomed.length));
        document.documentElement.setAttribute('data-ds-kept', String(kept));
      })();
    })();
  </script>
`}</body></html>
`;
}

/** Declarations for the agent. Richer than the deleted port's: the same per-prop docs plus the 55
 *  named slots, which no hand-written declaration ever carried. */
function declaration({ name, component, doc }) {
  const lines = [];
  for (const { name: propName, kind, type, doc: propDoc } of component.api) {
    const emitted = kind === 'output' ? `on${propName[0].toUpperCase()}${propName.slice(1)}` : propName;
    const emittedType = kind === 'output' ? `(value: ${type}) => void` : type;
    if (propDoc) lines.push(`  /** ${propDoc} */`);
    lines.push(`  ${emitted}?: ${emittedType};`);
    if (kind === 'model') {
      lines.push(`  on${propName[0].toUpperCase()}${propName.slice(1)}Change?: (value: ${type}) => void;`);
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
  'boolean', 'number', 'string', 'void', 'unknown', 'null', 'undefined', 'true', 'false',
  'readonly', 'Array', 'Record', 'Partial', 'Date', 'RegExp', 'File', 'FileList', 'Blob',
  'Event', 'MouseEvent', 'KeyboardEvent', 'PointerEvent', 'FocusEvent', 'InputEvent', 'DragEvent',
  'HTMLElement', 'Element', 'React', 'ReactNode',
]);

// 86 icon names is 881 characters on every icon prop. The union is kept long enough to show the
// naming convention and closed with `string & {}` so any name still type-checks — the same trade
// the deleted port made, and the reason it read as a usable declaration.
const ICON_NAMES_SHOWN = 15;

function declarationType(inlined) {
  const bare = inlined
    .replace(/'[^']*'/g, ' ')
    .match(/[A-Za-z_$][\w$]*/g) ?? [];
  if (bare.some((name) => !AMBIENT.has(name) && name !== 'keyof' && name !== 'typeof')) {
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
for (const name of [...byName.keys()].sort()) {
  const component = byName.get(name);
  const body = readDoc(name);
  const section = sectionFor(name);
  const group = groupOf(section);
  const dir = join(OUT, 'components', group, name);
  mkdirSync(dir, { recursive: true });

  writeFileSync(
    join(dir, `${name}.jsx`),
    `// Re-export of ${config.pkg} ${name}. Implementation is in the root _ds_bundle.js (window.IdsDs).\n`
    + `Object.assign(window, { ${name}: window.IdsDs.${name} });\n`,
  );
  writeFileSync(
    join(dir, `${name}.d.ts`),
    declaration({
      name,
      doc: body,
      component: {
        ...component,
        api: component.api.map((entry) => ({ ...entry, type: declarationType(entry.inlined) })),
      },
    }),
  );
  writeFileSync(join(dir, `${name}.prompt.md`), `# ${name}\n\n${body}`);

  // Keyed by the card FILE, not the component: a component publishes one card per block it owns and
  // each is a different height. measure-cards.mjs writes these keys.
  for (const card of cardsFor(name)) {
    const height = viewports.heights[card.file];
    writeFileSync(
      join(dir, `${card.file}.html`),
      cardHtml({
        name,
        group,
        tag: section.tag,
        viewport: height ? `${viewports.width}x${height}` : null,
        owns: card.owns,
        ownedIndex: card.ownedIndex,
        // Only the first card of a component carries the API table. On Table that is the difference
        // between one table and thirty-five copies of it.
        apiKey: card.ownedIndex <= 0 ? apiKeyBySelector.get(component.selector) ?? '' : null,
      }),
    );
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
const claimed = new Set([...byName.keys()].map((name) => sectionFor(name).slug));
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
        viewport: height ? `${viewports.width}x${height}` : null,
        owns: card.owns,
        ownedIndex: card.ownedIndex,
        apiKey: card.ownedIndex <= 0 ? '' : null,
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
const sectionOrder = new Map(sections.map((section, index) => [section.slug, index]));
const ordered = written.map((card) => ({
  path: card.path,
  section: sectionOrder.get(card.slug) ?? Number.MAX_SAFE_INTEGER,
  block: card.chapterPosition < 0 ? Number.MAX_SAFE_INTEGER : card.chapterPosition,
  name: card.name,
}));
ordered.sort((a, b) => a.section - b.section || a.block - b.block || a.name.localeCompare(b.name));
writeFileSync(
  join(elements, 'gen', 'cards.json'),
  `${JSON.stringify({ generatedBy: 'build-cards.mjs', cards: ordered.map((entry) => entry.path) }, null, 2)}\n`,
);

cpSync(join(elements, 'dist', 'ds-bundle.js'), join(OUT, '_ds_bundle.js'));
const bundleCss = readFileSync(join(elements, 'dist', 'ds-bundle.css'), 'utf8');
writeFileSync(join(OUT, '_ds_bundle.css'), bundleCss);

// Everything below used to be left over from a hand-made upload in July, which meant the project
// depended on files nothing in this repo could rebuild: a font could not be added, React could not
// be pinned, and a wipe-and-reupload was unsafe because half the tree had no source.
mkdirSync(join(OUT, 'fonts'), { recursive: true });
const faces = readdirSync(join(elements, 'dist', 'browser', 'media'))
  .filter((file) => file.endsWith('.woff2'));
if (!faces.length) {
  throw new Error('no .woff2 in dist/browser/media — the Angular build did not emit the faces.');
}
for (const face of faces) {
  cpSync(join(elements, 'dist', 'browser', 'media', face), join(OUT, 'fonts', face));
}

// The @font-face rules already ship inside the bundle, pointing at `fonts/`. fonts.css exists
// because styles.css imports it, and it sits INSIDE that directory — so the same rules need their
// URLs rewritten one level down or every face 404s from here.
const fontFaces = bundleCss.match(/@font-face\s*\{[^}]*\}/g) ?? [];
if (fontFaces.length < faces.length) {
  throw new Error(
    `${faces.length} face file(s) but ${fontFaces.length} @font-face rule(s) in the bundle`
    + ' — one of the two is out of step.',
  );
}
writeFileSync(
  join(OUT, 'fonts', 'fonts.css'),
  `${fontFaces.join('\n').replace(/url\("fonts\//g, 'url("./')}\n`,
);

// The stylesheet the cards link first. Reproduced rather than reinvented: this is what the project
// already served, so the load order the pane relies on does not change.
writeFileSync(join(OUT, 'styles.css'), '@import "./fonts/fonts.css";\n@import "./_ds_bundle.css";\n');

// The React the cards load as a classic script. Shipping it is the point: the host's copy is
// outside our control, and the wrappers are compiled against a known version — 18.3.1 is what
// bootstrap.mjs installs and what the demo page is proved against.
mkdirSync(join(OUT, '_vendor'), { recursive: true });
const vendored = [
  ['react', 'umd/react.production.min.js', 'react.js'],
  ['react-dom', 'umd/react-dom.production.min.js', 'react-dom.js'],
];
for (const [pkg, file, target] of vendored) {
  cpSync(join(syncDir, 'node_modules', pkg, file), join(OUT, '_vendor', target));
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
// nothing to restore it from. These are still those bytes; see docs/todo.md for re-rendering it.
cpSync(join(syncDir, 'assets', 'thumbnail.webp'), join(OUT, '.thumbnail'));

// The project's own README, from the same conventions file the agent reads.
writeFileSync(
  join(OUT, 'README.md'),
  readFileSync(join(syncDir, config.readmeHeader.replace('.design-sync/', '')), 'utf8'),
);

const distinctSections = new Set(written.map((card) => card.slug));
console.log(
  `✓ ${written.length} card(s) over ${distinctSections.size} ds-docs section(s)`
    + ` + ${byName.size} declaration(s) + ${readdirSync(pasted).length} pasted image(s)`
    + ` into ${OUT.replace(repo, '.')}`,
);
