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
// sync SKIP a file that did change. `_ds_manifest.json` is not ours either — the app compiles it
// from the `@dsCard` markers in each card.
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

// `category: Forms & inputs` in a doc's front matter is `forms-inputs` on the remote, which is also
// the `@dsCard group`. Verified against all eight groups the live project already carries.
const groupOf = (category) =>
  category.toLowerCase().replace(/&/g, '').trim().replace(/\s+/g, '-');

function readDoc(name) {
  const raw = readFileSync(join(syncDir, 'docs', `${name}.md`), 'utf8').replace(/\r\n/g, '\n');
  const front = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const category = front?.[1].match(/^category:\s*(.+)$/m)?.[1].trim();
  if (!category) throw new Error(`${name}.md has no \`category\` in its front matter.`);

  return { group: groupOf(category), body: raw.slice(front[0].length).trimStart() };
}

/** The card page: the ds-docs section for this component, and nothing else.
 *
 *  There is no React on this page and no per-card script. A hand-written preview per component was
 *  the previous design and the showcase drifted from the components it showed, because a specimen
 *  nobody opens is a specimen nobody checks. The docs site is looked at every day. */
function cardHtml({ name, group, tag, viewport }) {
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
</body></html>
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
  const { group, body } = readDoc(name);
  const section = sectionFor(name);
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

  // The height is per SECTION, not per component: several components share one, and the card is
  // that section. Sub-components inherit their parent's measurement for the same reason.
  const height = viewports.heights[section.slug];
  writeFileSync(
    join(dir, `${name}.html`),
    cardHtml({
      name,
      group,
      tag: section.tag,
      viewport: height ? `${viewports.width}x${height}` : null,
    }),
  );
  written.push(name);
}

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

// The project's own README, from the same conventions file the agent reads.
writeFileSync(
  join(OUT, 'README.md'),
  readFileSync(join(syncDir, config.readmeHeader.replace('.design-sync/', '')), 'utf8'),
);

const distinctSections = new Set([...byName.keys()].map((name) => sectionFor(name).slug));
console.log(
  `✓ ${written.length} card(s) over ${distinctSections.size} ds-docs section(s)`
    + ` + ${byName.size} declaration(s) + ${readdirSync(pasted).length} pasted image(s)`
    + ` into ${OUT.replace(repo, '.')}`,
);
