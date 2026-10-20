// Guards the hand-maintained half of the @angular/elements route. Everything
// else in that route is generated from the AST and cannot drift; these two lists
// are the exceptions, and they grow silently — the attribute-directive count
// went 6 -> 15 in one month without anyone noticing.
//
//   node .design-sync/tools/check-manual-surface.mjs           # verify (exit 1 on drift)
//   node .design-sync/tools/check-manual-surface.mjs --bless    # re-record after triage
//
// Two things are recomputed from src/lib and compared to manual-surface.json:
//   1. conditional projection — a component whose <ng-content> sits inside an
//      @if/@for/@switch block loses its projected children when the custom
//      element upgrades in the closed state (see MANUAL-SURFACE.md)
//   2. attribute directives — a directive has no tag, so @angular/elements has
//      nothing to register and it is absent from the generated surface
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MANIFEST = join(repo, '.design-sync', 'manual-surface.json');
const bless = process.argv.includes('--bless');

function walk(dir, suffix, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, suffix, out);
    else if (entry.name.endsWith(suffix)) out.push(path);
  }
  return out;
}

const relPath = (path) => relative(repo, path).replace(/\\/g, '/');

/**
 * True when any `<ng-content>` in the template sits inside a control-flow block.
 * Interpolations are blanked first so `{{ }}` cannot unbalance the brace count,
 * and only `@`-prefixed blocks open a level — a bare `{` in an attribute value
 * never does.
 */
function hasConditionalProjection(template) {
  const text = template.replace(/\{\{[\s\S]*?\}\}/g, '  ');
  let depth = 0;
  let pendingBlock = false;
  for (let i = 0; i < text.length; i += 1) {
    if (
      text[i] === '@' &&
      /^@(if|else|for|switch|case|default|empty|placeholder|loading|error)\b/.test(
        text.slice(i),
      )
    ) {
      pendingBlock = true;
      continue;
    }
    if (text[i] === '{') {
      if (pendingBlock) {
        depth += 1;
        pendingBlock = false;
      }
      continue;
    }
    if (text[i] === '}' && depth > 0) {
      depth -= 1;
      continue;
    }
    if (depth > 0 && text.startsWith('<ng-content', i)) return true;
  }
  return false;
}

const templates = walk(join(repo, 'src', 'lib'), '.component.html');
const conditionalProjection = templates
  .filter((file) => {
    const template = readFileSync(file, 'utf8');
    return (
      template.includes('<ng-content') && hasConditionalProjection(template)
    );
  })
  .map(relPath)
  .sort();

const selectorList =
  /selector:\s*'(\[[A-Za-z][\w-]*\](?:,\s*\[[A-Za-z][\w-]*\])*)'/g;
const attributeDirectives = [
  ...new Set(
    walk(join(repo, 'src', 'lib'), '.ts').flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(selectorList)].flatMap((m) =>
        m[1].split(',').map((selector) => selector.trim()),
      ),
    ),
  ),
].sort();

const found = { conditionalProjection, attributeDirectives };

if (bless) {
  const previous = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  writeFileSync(
    MANIFEST,
    `${JSON.stringify({ ...previous, ...found }, null, 2)}\n`,
  );
  console.log(
    `blessed: ${conditionalProjection.length} conditional-projection template(s), ${attributeDirectives.length} attribute directive(s)`,
  );
  process.exit(0);
}

const recorded = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const errors = [];

for (const [key, label] of [
  [
    'conditionalProjection',
    'component template with <ng-content> inside a control-flow block',
  ],
  ['attributeDirectives', 'attribute directive with no element to register'],
]) {
  const before = new Set(recorded[key] ?? []);
  const after = new Set(found[key]);
  for (const entry of after) {
    if (!before.has(entry)) {
      errors.push(
        `✗ NEW ${label}: ${entry} — decide how the elements route covers it, note it in MANUAL-SURFACE.md, then --bless`,
      );
    }
  }
  for (const entry of before) {
    if (!after.has(entry)) {
      errors.push(
        `✗ GONE ${label}: ${entry} — its MANUAL-SURFACE.md entry is now stale, delete it, then --bless`,
      );
    }
  }
}

// The elements bundle is a package dir purely so config.json's cssEntry and docsDir keep
// resolving against it the way they did against react-bindings/ — the skill reads them
// relative to the nearest package.json above `entry`. Its version is therefore load-bearing
// for nothing except honesty, which is exactly why it drifts unnoticed. Gate it.
const rootVersion = JSON.parse(
  readFileSync(join(repo, 'package.json'), 'utf8'),
).version;
const elementsPackage = join(repo, '.design-sync', 'elements', 'package.json');
if (!existsSync(elementsPackage)) {
  errors.push(
    '✗ .design-sync/elements/package.json is missing — config.json resolves cssEntry and docsDir against it, and without it they resolve somewhere else silently',
  );
} else {
  const elementsVersion = JSON.parse(
    readFileSync(elementsPackage, 'utf8'),
  ).version;
  if (elementsVersion !== rootVersion) {
    errors.push(
      `✗ .design-sync/elements/package.json says ${elementsVersion}, the DS ships ${rootVersion} — sync it`,
    );
  }
}

// Every registered component needs a usage doc: the design agent reads these, and a
// component that ships without one is invisible to it. Previews are deliberately not
// gated — a child component (ListItem, Tab, MenuItem) appears inside its parent's
// preview and has none of its own.
const pascalOfTag = (tag) =>
  tag
    .replace(/^ds-/, '')
    .replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
// Every template we ship, inline ones included, so a component can be asked whether anything of
// ours renders it.
const libTemplates = [
  ...walk(join(repo, 'src', 'lib'), '.component.html'),
  ...walk(join(repo, 'src', 'lib'), '.component.ts'),
].map((file) => readFileSync(file, 'utf8'));
const componentTags = new Set();
for (const file of walk(join(repo, 'src', 'lib'), '.component.ts')) {
  const source = readFileSync(file, 'utf8');
  const match = /selector:\s*'(ds-[a-z0-9-]+)'/.exec(source);
  if (!match) continue;
  // Marked internal AND rendered by no template of ours: a directive creates it imperatively,
  // so it can never appear in a consumer's markup or inside another component's preview. There
  // is no usage for the design agent to read and no section to point at. A component that is
  // merely internal still counts - CalendarDay and FieldMessage render inside their parents.
  const renderedByUs = libTemplates.some((template) =>
    template.includes(`<${match[1]}`),
  );
  if (source.includes('@internal') && !renderedByUs) continue;
  componentTags.add(match[1]);
}
const docNames = new Set(
  readdirSync(join(repo, '.design-sync', 'docs'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3)),
);
for (const tag of [...componentTags].sort()) {
  if (!docNames.has(pascalOfTag(tag))) {
    errors.push(
      `✗ ${tag} has no .design-sync/docs/${pascalOfTag(tag)}.md — the design agent reads these, so an undocumented component is unusable to it`,
    );
  }
}

// A component whose card has no ds-docs section behind it ships invisible. Most resolve by name;
// the rest are the hand-kept `sections` map in config.json, which is where a sub-component points at
// the section documenting its parent. Checked here so the failure lands on a PR rather than on the
// person running the release build.
const sectionSlugs = new Set(
  JSON.parse(
    readFileSync(
      join(repo, '.design-sync', 'elements', 'gen', 'sections.json'),
      'utf8',
    ),
  ).sections.map((section) => section.slug),
);
const sectionMap =
  JSON.parse(readFileSync(join(repo, '.design-sync', 'config.json'), 'utf8'))
    .sections ?? {};
for (const tag of [...componentTags].sort()) {
  const name = pascalOfTag(tag);
  const ownChapter = `components/${tag.replace(/^ds-/, '')}`;
  const slug = sectionMap[name] ?? ownChapter;
  if (slug !== ownChapter && sectionSlugs.has(ownChapter)) {
    errors.push(
      `✗ config.json maps ${name} to "${slug}", but ${tag} has a chapter of its own, "${ownChapter}" — drop the entry, or no card is built from it`,
    );
  }
  if (sectionSlugs.has(slug)) continue;
  errors.push(
    `✗ ${tag} resolves to the ds-docs section "${slug}", which GROUP_PAGES does not register — its card would be empty. Add a section in ds-docs, or point config.json's \`sections\` at the one that documents it`,
  );
}
for (const [name, slug] of Object.entries(sectionMap).sort()) {
  if (!sectionSlugs.has(slug)) {
    errors.push(
      `✗ config.json maps ${name} to the ds-docs section "${slug}", which does not exist`,
    );
  }
}

// A component whose chapter marks no block for it falls back to ONE whole-chapter card, which is
// the tall unreadable shape this design exists to avoid — the pane fits a card's declared viewport
// into a fixed tile, so height is zoom. Reported, not failed: giving such a part a block of its own
// is a ds-docs authoring decision, not something a build can invent.
// Height is no longer zoom: a card declares at most VIEWPORT_CAP (build-cards.mjs) and the frame
// scrolls past it, which is measured on the live pane. So a very tall card is no longer unreadable
// — it is a long scroll, and past this much it is a chapter that wants splitting into blocks.
// Reported rather than failed: splitting is ds-docs authoring, not something a build can invent.
const TALL = 3000;
const heights = JSON.parse(
  readFileSync(join(repo, '.design-sync', 'viewports.json'), 'utf8'),
).heights;
const tall = Object.entries(heights).filter(([, height]) => height > TALL);
for (const [card, height] of tall.sort((a, b) => b[1] - a[1])) {
  console.log(
    `· ${card} renders ${height}px of content — past ${TALL}px that is a long scroll inside the card; consider giving it a block of its own in ds-docs`,
  );
}

// Both directions, because only one of them was checked until 2026-09-01 and two orphans sat
// there unnoticed: a doc and a preview for `Tooltip`, which is a DIRECTIVE and can therefore
// never have a card. A doc for something that does not exist is worse than a missing one — it
// teaches the design agent an API it will not find.
const liveNames = new Set([...componentTags].map(pascalOfTag));
for (const name of [...docNames].sort()) {
  if (!liveNames.has(name)) {
    errors.push(
      `✗ .design-sync/docs/${name}.md documents no live component — delete it, or the design agent is taught an API that does not exist`,
    );
  }
}
for (const name of Object.keys(sectionMap).sort()) {
  if (!liveNames.has(name)) {
    errors.push(
      `✗ config.json's \`sections\` maps "${name}", which is no live component — drop the key`,
    );
  }
}
const overrideNames = Object.keys(
  JSON.parse(readFileSync(join(repo, '.design-sync', 'config.json'), 'utf8'))
    .overrides ?? {},
);
for (const name of overrideNames.sort()) {
  if (!liveNames.has(name)) {
    errors.push(
      `✗ config.json overrides "${name}", which is no live component — drop the key`,
    );
  }
}

// Matched as a backticked token, not a bare substring: `badge` would otherwise
// be satisfied by the word "title-badge" appearing anywhere in the prose.
const docs = readFileSync(
  join(repo, '.design-sync', 'MANUAL-SURFACE.md'),
  'utf8',
);
for (const entry of conditionalProjection) {
  const component = entry.split('/').pop().replace('.component.html', '');
  if (!docs.includes(`\`${component}\``)) {
    errors.push(
      `✗ ${component} is in the manifest but MANUAL-SURFACE.md never mentions it — an unexplained entry is an excuse, not a record`,
    );
  }
}

const isDirectiveListParagraph = (paragraph) =>
  /`\[ds\w+\]`/.test(paragraph) &&
  paragraph.replace(/`\[ds\w+\]`|·|\s/g, '') === '';
const docsOutsideDirectiveList = docs
  .split(/\n\s*\n/)
  .filter((paragraph) => !isDirectiveListParagraph(paragraph))
  .join('\n\n');
for (const selector of attributeDirectives) {
  const name = selector.slice(1, -1);
  if (
    !docsOutsideDirectiveList.includes(`\`${name}\``) &&
    !docsOutsideDirectiveList.includes(`\`${selector}\``)
  ) {
    errors.push(
      `✗ ${selector} is in MANUAL-SURFACE.md's directive list but nowhere else: a list entry is not an explanation; say what it does and what a card loses without it`,
    );
  }
}

for (const error of errors) console.log(error);
console.log(
  `${errors.length ? '✗' : '✓'} manual surface: ${conditionalProjection.length} conditional-projection template(s), ${attributeDirectives.length} attribute directive(s), ${componentTags.size} components documented, ${sectionSlugs.size} ds-docs section(s), ${errors.length} problem(s)`,
);
process.exit(errors.length ? 1 : 0);
