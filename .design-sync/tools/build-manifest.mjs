#!/usr/bin/env node
// Writes `_ds_manifest.json` — the file the Design System pane reads to build its index.
//
// This has to be OURS. The copy sitting on the project was written by the `/design-sync` CLI
// (`"source": "design-sync-cli"`) and nothing has regenerated it since, so it still listed 79
// components including `AppShell`, which was renamed in e282b99, and none of the thirteen cards
// added when the showcase moved to ds-docs. The pane indexes from the manifest and reads the card
// html only for content — so a stale manifest shows a stale project no matter what else is
// uploaded. That is why a refreshed card kept rendering the old preview grid.
//
//   node .design-sync/tools/build-manifest.mjs      # after build-cards.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const elements = join(syncDir, 'elements');
const OUT = join(syncDir, 'upload');

const config = JSON.parse(readFileSync(join(syncDir, 'config.json'), 'utf8'));
const surface = JSON.parse(readFileSync(join(elements, 'gen', 'surface.json'), 'utf8'));

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }

  return out;
}

const posix = (path) => relative(OUT, path).split('\\').join('/');

// ── cards ────────────────────────────────────────────────────────────────
// From the marker each card carries, not from a second list: the marker is what the app itself
// parses, so reading it here keeps the index and the page from ever disagreeing.
const cards = [];
for (const file of walk(join(OUT, 'components')).filter((f) => f.endsWith('.html')).sort()) {
  const marker = readFileSync(file, 'utf8').match(/<!--\s*@dsCard([^>]*?)-->/);
  if (!marker) continue;
  const group = marker[1].match(/group="([^"]*)"/)?.[1];
  const viewport = marker[1].match(/viewport="([^"]*)"/)?.[1];
  cards.push(viewport ? { path: posix(file), group, viewport } : { path: posix(file), group });
}

const components = [...surface.components]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((component) => {
    const card = cards.find((entry) => entry.path.endsWith(`/${component.name}.html`));

    return { name: component.name, sourcePath: card?.path.replace(/\.html$/, '.jsx') };
  })
  .filter((entry) => entry.sourcePath);

// ── tokens ───────────────────────────────────────────────────────────────
// Every custom-property DECLARATION in the shipped stylesheet, with the selector it was declared
// under. Declarations only: a `var()` reference is a use, and listing uses would report a token
// under a component that merely consumes it.
const bundleCss = readFileSync(join(elements, 'dist', 'ds-bundle.css'), 'utf8');

/** Selector → declarations, in source order, ignoring at-rule wrappers. */
function ruleBlocks(css) {
  const blocks = [];
  const RULE = /([^{}@][^{}]*)\{([^{}]*)\}/g;
  for (const [, selector, body] of css.matchAll(RULE)) {
    const trimmed = selector.trim().replace(/\s+/g, ' ');
    if (trimmed && body.includes('--')) blocks.push([trimmed, body]);
  }

  return blocks;
}

const VAR_REF = /^var\(\s*(--[\w-]+)/;
const COLOR_LITERAL =
  /^(#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|oklch\(|oklab\(|color-mix\(|transparent\b|currentColor\b|white\b|black\b)/i;
const LENGTH_LITERAL = /^-?[\d.]+(px|rem|em|vh|vw|vmin|vmax|%|ch)\b/;
const TIME_LITERAL = /^-?[\d.]+(ms|s)\b/;

const declared = new Map();

// Deliberately NOT bug-compatible with the CLI's own labels. Its rule was crude enough to file
// `--page-gutter-mobile: var(--space-3)` under `color`, because anything whose value began with
// `var(` fell into that bucket. `kind` only groups the pane's token list, so a correct label is
// worth more than a matching one.
function classify(name, value, depth = 0) {
  if (name.includes('shadow')) return 'shadow';
  if (name.includes('radius')) return 'radius';
  if (/font|letter-spacing|line-height|weight/.test(name)) return 'font';

  const literal = value.trim();
  if (COLOR_LITERAL.test(literal)) return 'color';
  if (LENGTH_LITERAL.test(literal)) return 'spacing';
  if (TIME_LITERAL.test(literal)) return 'other';

  const reference = literal.match(VAR_REF);
  if (reference && depth < 8) {
    const target = declared.get(reference[1]);
    if (target !== undefined) return classify(reference[1], target, depth + 1);
  }
  if (/space|gap|pad|gutter|margin|inset|width|height|size|indent|offset/.test(name)) {
    return 'spacing';
  }
  if (/duration|layer|opacity|ease|alpha|-[hsl]$/.test(name)) return 'other';

  return 'color';
}

const tokens = [];
for (const [selector, body] of ruleBlocks(bundleCss)) {
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)) {
    if (!declared.has(name)) declared.set(name, value.trim());
    tokens.push({ name, value: value.trim(), selector });
  }
}
const withKind = tokens.map(({ name, value, selector }) => {
  const entry = { name, value, kind: classify(name, value), definedIn: '_ds_bundle.css' };
  if (selector !== ':root') entry.scope = selector;

  return entry;
});

// ── themes ───────────────────────────────────────────────────────────────
// The scoped selectors that retarget tokens, which is what the pane offers as a preview switch.
// A component selector is not a theme — only the document-level switches are.
const THEME_SELECTOR = /^(:root\[[^\]]+\]|\[[^\]]+\])$/;
const label = (selector) =>
  selector
    .replace(/^:root/, 'Root')
    .replace(/\[data-/g, '[')
    .replace(/[[\]]/g, ' ')
    .replace(/[=-]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');

const themes = [...new Set(withKind.map((token) => token.scope).filter(Boolean))]
  .filter((selector) => THEME_SELECTOR.test(selector))
  .map((selector) => ({ selector, label: label(selector) }));

// ── fonts ────────────────────────────────────────────────────────────────
const fontsCss = readFileSync(join(OUT, 'fonts', 'fonts.css'), 'utf8');
const fonts = (fontsCss.match(/@font-face\s*\{[^}]*\}/g) ?? []).map((face) => {
  const field = (name) => face.match(new RegExp(`${name}\\s*:\\s*([^;]+)`))?.[1].trim();

  return {
    family: (field('font-family') ?? '').replace(/['"]/g, ''),
    weight: field('font-weight') ?? '400',
    style: field('font-style') ?? 'normal',
    cssPath: 'fonts/fonts.css',
    files: [...face.matchAll(/url\("\.\/([^"]+)"\)/g)].map((match) => `fonts/${match[1]}`),
  };
});

// Which family each font ROLE resolves to, so the pane can report a role bound to a face it does
// not ship. `status` is the check, not decoration: an unshipped family renders as a fallback and
// nothing else would say so.
const families = new Set(fonts.map((face) => face.family));
const brandFonts = ['--font-sans', '--font-mono']
  .map((role) => {
    const value = declared.get(role) ?? '';
    const family = value.split(',')[0].replace(/['"]/g, '').trim();

    return {
      family,
      status: families.has(family) ? 'ok' : 'missing',
      tokens: [role],
      path: 'fonts/fonts.css',
    };
  })
  .filter((entry) => entry.family);

const manifest = {
  namespace: config.globalName,
  components,
  startingPoints: [],
  cards,
  templates: [],
  hasThumbnailHtml: false,
  globalCssPaths: ['fonts/fonts.css', '_ds_bundle.css', 'styles.css'],
  tokens: withKind,
  themes,
  fonts,
  brandFonts,
  source: 'ids-design-system',
};

writeFileSync(join(OUT, '_ds_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const kinds = withKind.reduce((counts, token) => {
  counts[token.kind] = (counts[token.kind] ?? 0) + 1;

  return counts;
}, {});
console.log(
  `✓ _ds_manifest.json — ${components.length} component(s), ${cards.length} card(s)`
    + ` (${cards.filter((card) => card.viewport).length} with a viewport), ${withKind.length} token(s)`
    + ` [${Object.entries(kinds).map(([kind, count]) => `${kind} ${count}`).join(', ')}],`
    + ` ${themes.length} theme(s), ${fonts.length} face(s)`,
);
