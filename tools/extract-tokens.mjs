// tools/extract-tokens.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Given text and the index of the "v" in a `var(--ds-...` occurrence, return
 *  the token name, its fallback expression (trimmed), and the index just past
 *  the matching close paren. Handles nested parens in the fallback. */
function parseVarCall(text, varIndex) {
  const open = text.indexOf('(', varIndex);
  let depth = 0;
  let i = open;
  for (; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')') { depth--; if (depth === 0) break; }
  }
  const inner = text.slice(open + 1, i); // "--ds-x, <fallback>"
  const comma = inner.indexOf(',');
  const name = (comma === -1 ? inner : inner.slice(0, comma)).trim();
  const fallback = comma === -1 ? '' : inner.slice(comma + 1).trim();
  return { name, fallback, endIndex: i + 1 };
}

function extractComponentTokens(scssText, component) {
  const out = [];
  const seen = new Set();
  let idx = 0;
  while ((idx = scssText.indexOf('var(--ds-', idx)) !== -1) {
    const { name, fallback, endIndex } = parseVarCall(scssText, idx);
    idx = endIndex;
    if (!name.startsWith('--ds-') || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, value: fallback || '—', component });
  }
  return out;
}

// Matches `  --name: value;` declaration lines (not `var(--name` reads).
function extractRootDeclarations(scssText) {
  const out = [];
  const re = /(^|\n)\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(scssText))) {
    const name = m[2];
    if (/-(h|s|l)$/.test(name) || name.endsWith('-value')) continue; // channels/internals
    out.push({ name, value: m[3].trim() });
  }
  return out;
}

const SCALE_RULES = [
  [/^--space-/, 'spacing'], [/^--radius-/, 'radius'],
  [/^--shadow-|^--blur-/, 'elevation'],
  [/^--duration-|^--ease-/, 'motion'],
  [/^--hit-/, 'density'], [/^--bp-|^--col-cap-/, 'layout'],
  [/^--icon-(2xs|xs|sm|md|lg)$/, 'icons'],
  [/^--border-width-|^--opacity-|^--layer-/, 'misc'],
  [/^--font-size-|^--font-weight-|^--line-height-|^--letter-spacing-|^--font-/, 'typography'],
];
const COLOUR_ROLE = /^--(primary|secondary|tertiary|accent|success|warning|error|info|surface-|text-|icon-|border-|focus-|status-|link-|static-|scrollbar-|select-bg)/;
const RAMP = /^--(neutral|blue|red|green|yellow|orange|sky|slate|gray|purple|teal|indigo)-/;

function categorize(name) {
  for (const [re, cat] of SCALE_RULES) if (re.test(name)) return cat;
  if (COLOUR_ROLE.test(name)) return 'colour-role';
  if (RAMP.test(name)) return 'colour-ramp';
  return 'uncategorized';
}
const titleCase = (s) => s.replace(/(^|-)([a-z])/g, (_, d, c) => (d ? ' ' : '') + c.toUpperCase()).trim();

const COLOR_VALUE = /(#[0-9a-f]{3,8}\b|\brgb|\bhsl|\boklch|color-mix|var\(--(?:accent|primary|secondary|tertiary|success|warning|error|info|surface|text|icon|border|focus|link|static|neutral|blue|red|green|yellow|orange|sky)\b)/i;
function kindOf(name, value, category) {
  const v = value.trim();
  if (/^-?[\d.]+$/.test(v)) return 'other';                      // unitless (alpha, 0, etc.)
  if (/^-?[\d.]+(px|rem|em|%)$/.test(v)) return 'length';        // pure length literal
  if (/^-?[\d.]+m?s$/.test(v) || /^cubic-bezier/.test(v)) return 'motion';
  if (category === 'colour-role' || category === 'colour-ramp') return 'color';
  if (COLOR_VALUE.test(v)) return 'color';
  if (category === 'typography') return 'font';
  if (/\b\d+m?s\b|cubic-bezier/.test(v)) return 'motion';
  if (/\d(px|rem|em|%)|var\(--(space|radius|hit|icon|size|bp|col-cap|border-width|blur)/.test(v)) return 'length';
  return 'other';
}
const invertedOf = (name) =>
  /(--text-on-|--icon-on-|-on-media|-inverted\b|--surface-inverted|--border-inverted)/.test(name);

function findScss(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? findScss(p) : p.endsWith('.component.scss') ? [p] : [];
  });
}
const compFiles = findScss(join(ROOT, 'src/lib/components'));
const comp = compFiles.flatMap((f) =>
  extractComponentTokens(readFileSync(f, 'utf8'), basename(dirname(f))));

const readIf = (p) => { try { return readFileSync(p, 'utf8'); } catch { return ''; } };
const globalFiles = [
  'src/lib/styles/_tokens.scss',
  'src/lib/themes/_semantic.scss',
  'src/lib/themes/light/_palette.scss',
  'src/lib/themes/_base-palette.scss',
].map((p) => join(ROOT, p));
let globals = globalFiles.flatMap((p) => extractRootDeclarations(readIf(p)));

// --bp-* come from a Sass map (@each), not literal declarations:
const bpText = readIf(join(ROOT, 'src/lib/styles/_breakpoints.scss'));
for (const m of bpText.matchAll(/'([a-z0-9]+)':\s*([0-9]+px)/gi))
  globals.push({ name: `--bp-${m[1]}`, value: m[2] });

// dedupe globals by name (theme + palette may re-declare)
const seenG = new Set();
globals = globals.filter((t) => !seenG.has(t.name) && seenG.add(t.name));

const DESCRIPTIONS = JSON.parse(readIf(join(ROOT,
  'ds-docs/src/app/sections/tokens-reference/token-descriptions.json')) || '{}');

const all = [
  ...comp.map((t) => ({ ...t, category: 'component' })),
  ...globals.map((t) => ({ ...t, category: categorize(t.name) })),
];
for (const t of all) t.notes = DESCRIPTIONS[t.name] ?? '';

const names = new Set(all.map((t) => t.name));
const undescribed = all.filter((t) => !t.notes).map((t) => t.name);
const orphaned = Object.keys(DESCRIPTIONS).filter((k) => !names.has(k));
console.log(`tokens: ${all.length}, undescribed: ${undescribed.length}, orphaned: ${orphaned.length}`);
if (orphaned.length) console.warn('orphaned descriptions:\n  ' + orphaned.join('\n  '));

// Scatter globals into component groups (by owning folder), else by category.
const folderSet = readdirSync(join(ROOT, 'src/lib/components'))
  .filter((e) => statSync(join(ROOT, 'src/lib/components', e)).isDirectory());
function ownerFolder(name) {                 // longest `--<folder>-` prefix match
  const hits = folderSet.filter((f) => name.startsWith(`--${f}-`));
  return hits.sort((a, b) => b.length - a.length)[0] || null;
}
const CATEGORY_LABEL = {
  spacing: 'Spacing', radius: 'Radius', elevation: 'Elevation', motion: 'Motion',
  density: 'Density / hit targets', layout: 'Layout', icons: 'Icon sizes',
  typography: 'Typography', 'colour-role': 'Colour roles', 'colour-ramp': 'Colour ramps',
  misc: 'Misc', uncategorized: 'Uncategorized',
};
const toRow = (t) => ({
  name: t.name, value: t.value, notes: t.notes,
  kind: kindOf(t.name, t.value, t.category),
  ...(invertedOf(t.name) ? { inverted: true } : {}),
});
const compGroups = {};   // folder -> rows[]
const catGroups = {};    // category -> rows[]
for (const t of all) {
  if (t.category === 'component') { (compGroups[t.component] ??= []).push(toRow(t)); continue; }
  const owner = ownerFolder(t.name);
  if (owner) (compGroups[owner] ??= []).push(toRow(t));
  else (catGroups[t.category] ??= []).push(toRow(t));
}

// Serialize the uniform model.
const COMPONENT_GROUPS = Object.keys(compGroups).sort()
  .map((folder) => ({ title: titleCase(folder), subtitle: `ds-${folder}`, rows: compGroups[folder] }));
const CAT_ORDER = ['colour-role','colour-ramp','spacing','radius','typography','elevation','motion','density','icons','layout','misc','uncategorized'];
const GLOBAL_GROUPS = CAT_ORDER.filter((c) => catGroups[c])
  .map((c) => ({ title: CATEGORY_LABEL[c], subtitle: c, rows: catGroups[c] }));
const TOKEN_STATS = { total: all.length, undescribed: undescribed.length };

const OUT = join(ROOT, 'ds-docs/src/app/sections/tokens-reference/tokens.generated.ts');
const banner = '// AUTO-GENERATED by tools/extract-tokens.mjs — do not edit. Run `npm run extract-tokens`.\n'
  + '// Token descriptions live in token-descriptions.json.\n\n';
const body =
  `import type { GenTokenGroup } from './tokens-reference.types';\n\n`
  + `export const COMPONENT_GROUPS: readonly GenTokenGroup[] = ${JSON.stringify(COMPONENT_GROUPS, null, 2)};\n\n`
  + `export const GLOBAL_GROUPS: readonly GenTokenGroup[] = ${JSON.stringify(GLOBAL_GROUPS, null, 2)};\n\n`
  + `export const TOKEN_STATS = ${JSON.stringify(TOKEN_STATS)} as const;\n`;
writeFileSync(OUT, banner + body);
console.log(`wrote tokens.generated.ts: ${COMPONENT_GROUPS.length} component groups, ${GLOBAL_GROUPS.length} global groups`);
