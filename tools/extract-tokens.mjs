import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseVarCall, withoutComments } from './scss-custom-properties.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function extractComponentTokens(scssText, component) {
  const out = [];
  const seen = new Set();
  let idx = 0;
  // `var(` and not `var(--ds-`: a resolver wrapped across lines puts a newline
  // between them, and searching the joined string silently dropped the token from
  // the reference. The name filter below does the narrowing.
  while ((idx = scssText.indexOf('var(', idx)) !== -1) {
    const { name, fallback, endIndex } = parseVarCall(scssText, idx);
    idx = endIndex;
    if (!name.startsWith('--ds-') || seen.has(name)) continue;
    seen.add(name);
    out.push({ name, value: fallback || '—', component });
  }
  return out;
}

// Matches `  --name: value;` declaration lines (not `var(--name` reads).
function extractRootDeclarations(rawScssText) {
  const scssText = withoutComments(rawScssText);
  const out = [];
  const re = /(^|\n)\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(scssText))) {
    const name = m[2];
    if (name.endsWith('-value')) continue; // internal alias
    // HSL channel triplet only: skip --X-h/-s/-l when BOTH sibling channels exist.
    // Avoids self-matching (--topbar-h is a height, not a hue) and coincidental
    // -s/-l endings (--font-size-s).
    const ch = name.match(/^(.*)-(h|s|l)$/);
    if (ch) {
      const esc = ch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const others = { h: ['s', 'l'], s: ['h', 'l'], l: ['h', 's'] }[ch[2]];
      if (
        others.every((sfx) =>
          new RegExp(esc + '-' + sfx + '\\s*:').test(scssText),
        )
      )
        continue;
    }
    out.push({ name, value: m[3].trim() });
  }
  return out;
}

const SCALE_RULES = [
  [/^--space-/, 'spacing'],
  [/^--radius-/, 'radius'],
  [/^--shadow-|^--blur-/, 'elevation'],
  [/^--duration-|^--ease-/, 'motion'],
  [/^--hit-/, 'density'],
  [/^--bp-|^--col-cap-/, 'layout'],
  [/^--icon-(2xs|xs|sm|md|lg)$/, 'icons'],
  [/^--border-width-|^--opacity-|^--layer-/, 'misc'],
  [
    /^--font-size-|^--font-weight-|^--line-height-|^--letter-spacing-|^--font-/,
    'typography',
  ],
];
const COLOUR_ROLE =
  /^--(primary|secondary|tertiary|accent|success|warning|error|info|surface-|text-|icon-|border-|focus-|status-|link-|static-|scrollbar-|select-bg)/;
const RAMP =
  /^--(neutral|blue|red|green|yellow|orange|sky|slate|gray|purple|teal|indigo)-/;

function categorize(name) {
  for (const [re, cat] of SCALE_RULES) if (re.test(name)) return cat;
  if (COLOUR_ROLE.test(name)) return 'colour-role';
  if (RAMP.test(name)) return 'colour-ramp';
  return 'uncategorized';
}
const titleCase = (s) =>
  s
    .replace(/(^|-)([a-z])/g, (_, d, c) => (d ? ' ' : '') + c.toUpperCase())
    .trim();

// --ds-t-* are per-axis hooks on the .t-* utilities, read inside _typography.scss
// rather than declared, so the note is templated from the name instead of by hand.
const T_PROPS = [
  'font-weight',
  'font-size',
  'line-height',
  'letter-spacing',
  'text-transform',
  'bg-color',
  'border-color',
  'border-radius',
  'radius',
  'font-family',
  'color',
];
function typographyNote(name) {
  if (!name.startsWith('--ds-t-')) return null;
  const rest = name.slice('--ds-t-'.length);
  const prop = T_PROPS.find((p) => rest.endsWith('-' + p));
  if (!prop) return null;
  const util = rest.slice(0, rest.length - prop.length - 1);
  const label =
    prop === 'bg-color' ? 'background color' : prop.replace(/-/g, ' ');
  return `Per-axis override for the \`.t-${util}\` utility's ${label}.`;
}

// `chart` cannot join the family list below: half that namespace is geometry
// (--chart-bar-gap, --chart-dot-radius), so it is matched by the two shapes a
// chart COLOUR actually takes — a named ramp stop, or a `-color` suffix.
const COLOR_VALUE =
  /(#[0-9a-f]{3,8}\b|\brgb|\bhsl|\boklch|color-mix|var\(--chart-(?:categorical|sequential|divergent)\b|var\(--chart-[a-z0-9-]*color\b|var\(--(?:accent|primary|secondary|tertiary|success|warning|error|info|surface|text|icon|border|focus|link|static|neutral|blue|red|green|yellow|orange|sky)\b)/i;
function kindOf(name, value, category) {
  const v = value.trim();
  if (/^-?[\d.]+$/.test(v)) return 'other'; // unitless (alpha, 0, etc.)
  if (/^-?[\d.]+(px|rem|em|%)$/.test(v)) return 'length'; // pure length literal
  if (/^-?[\d.]+m?s$/.test(v) || /^cubic-bezier/.test(v)) return 'motion';
  if (category === 'colour-role' || category === 'colour-ramp') return 'color';
  if (COLOR_VALUE.test(v)) return 'color';
  if (category === 'typography') return 'font';
  if (/\b\d+m?s\b|cubic-bezier/.test(v)) return 'motion';
  if (
    /\d(px|rem|em|%)|var\(--(space|radius|hit|icon|size|bp|col-cap|border-width|blur)/.test(
      v,
    )
  )
    return 'length';
  return 'other';
}
const invertedOf = (name) =>
  /(--text-on-|--icon-on-|-on-media|-inverted\b|--surface-inverted|--border-inverted)/.test(
    name,
  );

function findScss(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory()
      ? findScss(p)
      : p.endsWith('.component.scss')
        ? [p]
        : [];
  });
}
// CRLF is stripped at every read, not at write time: a multi-line token value (the focus rings)
// carries its line breaks INSIDE the emitted string, where `.gitattributes` cannot reach them. Left
// alone, the generated file differs between a CRLF and an LF checkout of the same commit.
const readSource = (p) => readFileSync(p, 'utf8').replaceAll('\r\n', '\n');
const readIf = (p) => {
  try {
    return readSource(p);
  } catch {
    return '';
  }
};

const compFiles = findScss(join(ROOT, 'src/lib/components'));
const comp = compFiles.flatMap((f) =>
  extractComponentTokens(readSource(f), basename(dirname(f))),
);

// findScss only walks *.component.scss, so a public hook exposed by a shared partial
// has to be listed here or the reference never sees it.
const sharedPartials = [
  ['src/lib/styles/_dropdown-overlay.scss', 'dropdown-panel'],
];
comp.push(
  ...sharedPartials.flatMap(([path, group]) =>
    extractComponentTokens(readIf(join(ROOT, path)), group),
  ),
);

const globalFiles = [
  'src/lib/styles/_tokens.scss',
  'src/lib/themes/_semantic.scss',
  'src/lib/themes/light/_palette.scss',
  'src/lib/themes/_base-palette.scss',
  'src/lib/styles/_tokens-charts.scss',
  'src/lib/styles/_page-grid.scss',
].map((p) => join(ROOT, p));
let globals = globalFiles.flatMap((p) => extractRootDeclarations(readIf(p)));

// --bp-* come from a Sass map (@each), not literal declarations:
const bpText = readIf(join(ROOT, 'src/lib/styles/_breakpoints.scss'));
for (const m of bpText.matchAll(/'([a-z0-9]+)':\s*([0-9]+px)/gi))
  globals.push({ name: `--bp-${m[1]}`, value: m[2] });

// dedupe globals by name (theme + palette may re-declare)
const seenG = new Set();
globals = globals.filter((t) => !seenG.has(t.name) && seenG.add(t.name));

const DESCRIPTIONS = JSON.parse(
  readIf(
    join(
      ROOT,
      'ds-docs/src/app/sections/tokens-reference/token-descriptions.json',
    ),
  ) || '{}',
);

// Hooks declared in a style PARTIAL rather than in a component stylesheet: a mixin every field
// includes, a rule for a panel portaled outside its component, the shared checkbox box. The
// component sweep walks `*.component.scss` only, so each of these was named here by hand and the
// list fell behind the code — `_check-mark.scss`, `_focus.scss`, `_link.scss` and others declare
// hooks nobody was collecting. Swept instead; only the group name is stated, and only where it is
// not the file's own name.
const PARTIAL_GROUPS = {
  '_typography.scss': 't',
  '_overlay-motion.scss': 'overlay',
  '_field-label.scss': 'field',
  '_field-box.scss': 'field',
  '_field-state.scss': 'field',
  '_field-group-segment.scss': 'field',
  '_check-box.scss': 'checkbox',
  '_check-mark.scss': 'checkbox',
};
const stylesDir = join(ROOT, 'src/lib/styles');
const partialHooks = readdirSync(stylesDir)
  .filter((file) => file.startsWith('_') && file.endsWith('.scss'))
  .flatMap((file) =>
    extractComponentTokens(
      readIf(join(stylesDir, file)),
      PARTIAL_GROUPS[file] ?? file.replace(/^_|\.scss$/g, ''),
    ),
  );

const all = [
  ...comp.map((t) => ({ ...t, category: 'component' })),
  ...partialHooks.map((t) => ({ ...t, category: 'component' })),
  ...globals.map((t) => ({ ...t, category: categorize(t.name) })),
];
for (const t of all)
  t.notes = DESCRIPTIONS[t.name] ?? typographyNote(t.name) ?? '';

const names = new Set(all.map((t) => t.name));
const undescribed = all.filter((t) => !t.notes).map((t) => t.name);
const orphaned = Object.keys(DESCRIPTIONS).filter((k) => !names.has(k));
console.log(
  `tokens: ${all.length}, undescribed: ${undescribed.length}, orphaned: ${orphaned.length}`,
);
if (undescribed.length) {
  console.log('undescribed tokens:');
  for (const name of undescribed) console.log(`  ${name}`);
}
if (orphaned.length)
  console.warn('orphaned descriptions:\n  ' + orphaned.join('\n  '));

// ============================================================================
// CONFIG-DRIVEN EMIT
// Rebuild every named array the ORIGINAL section imported — auto-populated from
// the live `all` list by prefix rules. `used` tracks every token a rule claims;
// whatever is left over lands in NEW_TOKENS so a newly-added token can never
// silently go missing from the reference.
// ============================================================================

const used = new Set();
const globalsOnly = all.filter((t) => t.category !== 'component');
const byName = new Map(all.map((t) => [t.name, t]));

/** Globals (SCSS declaration order) matching a prefix regex, claimed as `used`. */
function pick(re, extraNames = []) {
  const out = [];
  for (const t of globalsOnly) {
    if (used.has(t.name)) continue;
    if (re.test(t.name)) {
      used.add(t.name);
      out.push(t);
    }
  }
  for (const name of extraNames) {
    const t = byName.get(name);
    if (t && !used.has(name)) {
      used.add(name);
      out.push(t);
    }
  }
  return out;
}

// ---- Colour roles (ColourRow) ---------------------------------------------
const INVERTED = /(-on-|--text-on-|--icon-on-|-inverted|-on$|on-media)/;
const colourRow = (t) => ({
  name: t.name,
  value: t.value,
  notes: t.notes,
  ...(INVERTED.test(t.name) ? { inverted: true } : {}),
});
const SEMANTIC_PRIMARY = pick(/^--primary/).map(colourRow);
const SEMANTIC_TERTIARY = pick(/^--tertiary/).map(colourRow);
const SEMANTIC_ERROR = pick(/^--error/).map(colourRow);
const SEMANTIC_SUCCESS = pick(/^--success/).map(colourRow);
const SEMANTIC_WARNING = pick(/^--warning/).map(colourRow);
const SEMANTIC_INFO = pick(/^--info/).map(colourRow);
const SEMANTIC_TEXT = pick(/^--text-/).map(colourRow);
const SEMANTIC_SURFACE = pick(/^--surface-/).map(colourRow);
const SEMANTIC_BORDER = pick(/^--border-(?!width-)/).map(colourRow);
const SEMANTIC_FOCUS = pick(/^--focus-/).map(colourRow);
const SEMANTIC_SECONDARY = pick(/^--secondary/).map(colourRow);
const SEMANTIC_ACCENT = pick(/^--accent/).map(colourRow);
const SEMANTIC_STATUS = pick(/^--status-/).map(colourRow);
const SEMANTIC_LINK = pick(/^--link/).map(colourRow);

// ---- Charts (ColourRow; mostly colour, a few sizes — size rows just render
// without a swatch since ColourRow has no renderAs) ----------------------
// Both layers: `--chart-*` is the palette and `--ds-chart-*` is the contract a
// consumer is told to set. Routing only the palette left the contract in
// NEW_TOKENS, i.e. the one thing documented as public rendered as unresolved.
const CHARTS = pick(/^--(?:ds-)?chart-/).map(colourRow);

// ---- Colour ramps (RampSpec) ----------------------------------------------
// Fixed labels/prefixes/notes VERBATIM from the original; stops auto-derived
// from which --<prefix>-<n> tokens actually exist (sorted numerically).
const RAMP_SPEC = [
  {
    label: 'Neutral',
    prefix: 'neutral',
    notes: '13 stops. Base for surface/border/text.',
  },
  {
    label: 'Blue (primary)',
    prefix: 'blue',
    notes:
      'HSL-channel split — default theme maps --primary here; drives focus halos and re-skin.',
  },
  {
    label: 'Orange',
    prefix: 'orange',
    notes: 'Secondary signal, focus accent.',
  },
  {
    label: 'Green (success)',
    prefix: 'green',
    notes: 'Status — success / confirmed.',
  },
  {
    label: 'Yellow (warning)',
    prefix: 'yellow',
    notes: 'Status — attention / warning.',
  },
  {
    label: 'Red (error)',
    prefix: 'red',
    notes:
      'HSL-channel split — default theme maps --error here; drives error halos.',
  },
  {
    label: 'Sky (info)',
    prefix: 'sky',
    notes:
      'Informational — a brighter blue, distinct from the primary --blue ramp.',
  },
];
const RAMPS = RAMP_SPEC.map(({ label, prefix, notes }) => {
  const stopRe = new RegExp(`^--${prefix}-(\\d+)$`);
  const stops = [];
  for (const t of globalsOnly) {
    const m = t.name.match(stopRe);
    if (m) {
      stops.push(Number(m[1]));
      used.add(t.name);
    }
  }
  stops.sort((a, b) => a - b);
  return { label, prefix, stops, notes };
});

// ---- Scales ---------------------------------------------------------------
const scaleRow = (t) => ({ name: t.name, value: t.value, notes: t.notes });
const SPACING = pick(/^--space-/, ['--ds-surface-padding']).map(scaleRow);
const RADIUS = pick(/^--radius-/).map(scaleRow);

// Shadows: alias = the value when it is a single var(--shadow-N) alias or a
// channel value (pure number / percentage); else '' so --shadow-1..4 keep an
// empty alias and hasShadowSample() renders the box-shadow preview.
const SHADOWS = pick(/^--shadow-/, ['--text-on-media-shadow']).map((t) => {
  const isAlias = /^var\(--shadow-\d+\)$/.test(t.value);
  const isChannel = /^-?[\d.]+%?$/.test(t.value);
  return {
    name: t.name,
    alias: isAlias || isChannel ? t.value : '',
    notes: t.notes,
  };
});

const MOTION_DUR = pick(/^--duration-/).map(scaleRow);
const MOTION_EASE = pick(/^--ease-/).map(scaleRow);
const DENSITY_HIT = pick(/^--hit-/).map(scaleRow);
const LAYOUT_BP = pick(/^--bp-/).map(scaleRow);
const LAYOUT_COL = pick(/^--col-cap-/).map(scaleRow);
const ICONS = pick(/^--icon-(2xs|xs|sm|md|lg)$/).map(scaleRow);

// Misc — carry a renderAs the template switches on.
const miscRow = (renderAs) => (t) => ({
  name: t.name,
  value: t.value,
  renderAs,
  notes: t.notes,
});
const MISC_BW = pick(/^--border-width-/).map(miscRow('bar'));
const MISC_OPACITY = pick(/^--opacity-/).map(miscRow('opacity'));
const MISC_BLUR = pick(/^--blur-/).map(miscRow('literal'));

// Density tiers — fixed pseudo-rows VERBATIM (not real tokens; nothing claimed).
const DENSITY_TIERS = [
  {
    name: 'ultra-compact',
    value: '24px hit',
    notes: 'Power-user tier — keyboard-first, opt-in only.',
  },
  { name: 'compact', value: '32px hit', notes: 'Dense desktop default.' },
  { name: 'cozy', value: '40px hit', notes: 'Default — most products.' },
  { name: 'comfy', value: '48px hit', notes: 'Touch-friendly.' },
];

// ---- Typography (TypeRow) -------------------------------------------------
// sample specimens reuse the original strings; families/weights/etc. use a short
// specimen per kind. Sizes → 'Aa' by default; weights/LH/LS → a descriptive line.
const typeRow = (sampleClass, sampleFor) => (t) => ({
  name: t.name,
  value: t.value,
  sample: sampleFor(t),
  sampleClass,
  notes: t.notes,
});
const TYPOGRAPHY_FONT = pick(/^--font-(sans|serif|mono|display|heading)/).map(
  typeRow('sample-font', (t) =>
    t.name === '--font-mono'
      ? 'const total = items.reduce(sum, 0);'
      : 'The quick brown fox jumps over the lazy dog',
  ),
);
const TYPOGRAPHY_SIZE = pick(/^--font-size-/).map(
  typeRow('sample-fs', (t) =>
    t.name === '--font-size-mono' ? 'const x = 42;' : 'Aa',
  ),
);
const TYPOGRAPHY_LH = pick(/^--line-height-/).map(
  typeRow('sample-lh', () => 'Base leading — body copy\nand most UI.'),
);
const TYPOGRAPHY_LS = pick(/^--letter-spacing-/).map(
  typeRow('sample-ls', () => 'The quick brown fox'),
);
const TYPOGRAPHY_FW = pick(/^--font-weight-/).map(
  typeRow('sample-fw', () => 'The quick brown fox'),
);

// ---- Component tokens (ComponentTokenGroup) -------------------------------
// Each folder owns its --ds-<folder>-* reads PLUS scattered global geometry
// --<folder>-* (longest-prefix owner match). Groups sorted alphabetically by
// component; tokens within a group keep extraction order.
const folderSet = readdirSync(join(ROOT, 'src/lib/components')).filter((e) =>
  statSync(join(ROOT, 'src/lib/components', e)).isDirectory(),
);
// Geometry prefixes that don't literally match their owning folder name.
// Only unambiguous cases — leave anything contested (--field-*, --calendar-*,
// --matrix-*, --kbd-*, etc.) unaliased so it still surfaces in NEW_TOKENS.
const FOLDER_ALIAS = { btn: 'button', check: 'checkbox', 'sort-ic': 'table' };
function ownerFolder(name) {
  // longest `--<folder>-` prefix match
  for (const [prefix, folder] of Object.entries(FOLDER_ALIAS)) {
    if (name.startsWith(`--${prefix}-`)) return folder;
  }
  const hits = folderSet.filter((f) => name.startsWith(`--${f}-`));
  return hits.sort((a, b) => b.length - a.length)[0] || null;
}
const componentRow = (t) => ({ name: t.name, value: t.value, notes: t.notes });
const compGroups = {}; // folder -> rows[] (extraction order)
for (const t of all) {
  if (used.has(t.name)) continue;
  let folder = null;
  if (t.category === 'component') folder = t.component;
  else folder = ownerFolder(t.name);
  if (!folder) continue;
  used.add(t.name);
  (compGroups[folder] ??= []).push(componentRow(t));
}
const titleCaseFolder = (s) =>
  s
    .replace(/(^|-)([a-z])/g, (_, d, c) => (d ? ' ' : '') + c.toUpperCase())
    .trim();
// Groups that aren't component folders — global partials surfaced alongside them.
const PSEUDO_FOLDERS = {
  t: {
    component: 'Typography utilities',
    selector: '.t-*',
    description: 'Per-axis --ds-t-* override hooks on the .t-* type utilities.',
  },
  overlay: {
    component: 'Overlay panels',
    selector: '.ds-overlay-pane',
    description:
      'Enter-motion hooks shared by every portaled DS panel — select, multi-select, autocomplete, date / time / colour picker, popover, tooltip, menu submenu.',
  },
};
const COMPONENT_TOKENS = Object.keys(compGroups)
  .sort((a, b) => titleCaseFolder(a).localeCompare(titleCaseFolder(b)))
  .map((folder) => ({
    component: PSEUDO_FOLDERS[folder]?.component ?? titleCaseFolder(folder),
    selector: PSEUDO_FOLDERS[folder]?.selector ?? `.${folder}`,
    description: PSEUDO_FOLDERS[folder]?.description ?? '',
    tokens: compGroups[folder],
  }));

// ---- NEW / unresolved -----------------------------------------------------
// Everything not claimed above (e.g. --secondary-*, --accent-*, --status-*,
// --link-*, --scrollbar-*, --layer-*, chart tokens, misc geometry with no owner).
const NEW_TOKENS = all
  .filter((t) => !used.has(t.name))
  .map((t) => ({
    name: t.name,
    value: t.value,
    kind: kindOf(t.name, t.value, t.category),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// ---- Emit -----------------------------------------------------------------
const stringify = (v) => JSON.stringify(v, null, 2);
const constLine = (name, type, value) =>
  `export const ${name}: readonly ${type}[] = ${stringify(value)};\n`;

const OUT = join(
  ROOT,
  'ds-docs/src/app/sections/tokens-reference/tokens.generated.ts',
);
const banner =
  '// AUTO-GENERATED by tools/extract-tokens.mjs — do not edit. Run `npm run extract-tokens`.\n' +
  '// Every reference array is auto-populated from the live SCSS tokens by prefix rules.\n' +
  '// Tokens matching no section land in NEW_TOKENS and render in the "New / unresolved\n' +
  '// tokens" group at the top of the reference until someone files them into a section.\n\n';

const body = [
  `import type {`,
  `  ColourRow,`,
  `  RampSpec,`,
  `  TypeRow,`,
  `  SpacingRow,`,
  `  RadiusRow,`,
  `  ShadowRow,`,
  `  MotionRow,`,
  `  SizeRow,`,
  `  LayoutRow,`,
  `  MiscRow,`,
  `  ComponentTokenGroup,`,
  `} from './tokens-reference.types';`,
  ``,
  `export interface NewToken { name: string; value: string; kind: string; }`,
  ``,
  constLine('SEMANTIC_PRIMARY', 'ColourRow', SEMANTIC_PRIMARY),
  constLine('SEMANTIC_TERTIARY', 'ColourRow', SEMANTIC_TERTIARY),
  constLine('SEMANTIC_ERROR', 'ColourRow', SEMANTIC_ERROR),
  constLine('SEMANTIC_SUCCESS', 'ColourRow', SEMANTIC_SUCCESS),
  constLine('SEMANTIC_WARNING', 'ColourRow', SEMANTIC_WARNING),
  constLine('SEMANTIC_INFO', 'ColourRow', SEMANTIC_INFO),
  constLine('SEMANTIC_TEXT', 'ColourRow', SEMANTIC_TEXT),
  constLine('SEMANTIC_SURFACE', 'ColourRow', SEMANTIC_SURFACE),
  constLine('SEMANTIC_BORDER', 'ColourRow', SEMANTIC_BORDER),
  constLine('SEMANTIC_FOCUS', 'ColourRow', SEMANTIC_FOCUS),
  constLine('SEMANTIC_SECONDARY', 'ColourRow', SEMANTIC_SECONDARY),
  constLine('SEMANTIC_ACCENT', 'ColourRow', SEMANTIC_ACCENT),
  constLine('SEMANTIC_STATUS', 'ColourRow', SEMANTIC_STATUS),
  constLine('SEMANTIC_LINK', 'ColourRow', SEMANTIC_LINK),
  constLine('CHARTS', 'ColourRow', CHARTS),
  constLine('RAMPS', 'RampSpec', RAMPS),
  constLine('TYPOGRAPHY_FONT', 'TypeRow', TYPOGRAPHY_FONT),
  constLine('TYPOGRAPHY_SIZE', 'TypeRow', TYPOGRAPHY_SIZE),
  constLine('TYPOGRAPHY_LH', 'TypeRow', TYPOGRAPHY_LH),
  constLine('TYPOGRAPHY_LS', 'TypeRow', TYPOGRAPHY_LS),
  constLine('TYPOGRAPHY_FW', 'TypeRow', TYPOGRAPHY_FW),
  constLine('SPACING', 'SpacingRow', SPACING),
  constLine('RADIUS', 'RadiusRow', RADIUS),
  constLine('SHADOWS', 'ShadowRow', SHADOWS),
  constLine('MOTION_DUR', 'MotionRow', MOTION_DUR),
  constLine('MOTION_EASE', 'MotionRow', MOTION_EASE),
  constLine('DENSITY_HIT', 'SizeRow', DENSITY_HIT),
  `export const DENSITY_TIERS: readonly { name: string; value: string; notes: string }[] = ${stringify(DENSITY_TIERS)};\n`,
  constLine('LAYOUT_BP', 'LayoutRow', LAYOUT_BP),
  constLine('LAYOUT_COL', 'LayoutRow', LAYOUT_COL),
  constLine('ICONS', 'SizeRow', ICONS),
  constLine('MISC_BW', 'MiscRow', MISC_BW),
  constLine('MISC_OPACITY', 'MiscRow', MISC_OPACITY),
  constLine('MISC_BLUR', 'MiscRow', MISC_BLUR),
  constLine('COMPONENT_TOKENS', 'ComponentTokenGroup', COMPONENT_TOKENS),
  constLine('NEW_TOKENS', 'NewToken', NEW_TOKENS),
].join('\n');

writeFileSync(OUT, banner + body);

const summary = {
  SEMANTIC_PRIMARY: SEMANTIC_PRIMARY.length,
  SEMANTIC_TERTIARY: SEMANTIC_TERTIARY.length,
  SEMANTIC_ERROR: SEMANTIC_ERROR.length,
  SEMANTIC_SUCCESS: SEMANTIC_SUCCESS.length,
  SEMANTIC_WARNING: SEMANTIC_WARNING.length,
  SEMANTIC_INFO: SEMANTIC_INFO.length,
  SEMANTIC_TEXT: SEMANTIC_TEXT.length,
  SEMANTIC_SURFACE: SEMANTIC_SURFACE.length,
  SEMANTIC_BORDER: SEMANTIC_BORDER.length,
  SEMANTIC_FOCUS: SEMANTIC_FOCUS.length,
  SEMANTIC_SECONDARY: SEMANTIC_SECONDARY.length,
  SEMANTIC_ACCENT: SEMANTIC_ACCENT.length,
  SEMANTIC_STATUS: SEMANTIC_STATUS.length,
  SEMANTIC_LINK: SEMANTIC_LINK.length,
  CHARTS: CHARTS.length,
  RAMPS: RAMPS.length,
  TYPOGRAPHY_FONT: TYPOGRAPHY_FONT.length,
  TYPOGRAPHY_SIZE: TYPOGRAPHY_SIZE.length,
  TYPOGRAPHY_LH: TYPOGRAPHY_LH.length,
  TYPOGRAPHY_LS: TYPOGRAPHY_LS.length,
  TYPOGRAPHY_FW: TYPOGRAPHY_FW.length,
  SPACING: SPACING.length,
  RADIUS: RADIUS.length,
  SHADOWS: SHADOWS.length,
  MOTION_DUR: MOTION_DUR.length,
  MOTION_EASE: MOTION_EASE.length,
  DENSITY_HIT: DENSITY_HIT.length,
  LAYOUT_BP: LAYOUT_BP.length,
  LAYOUT_COL: LAYOUT_COL.length,
  ICONS: ICONS.length,
  MISC_BW: MISC_BW.length,
  MISC_OPACITY: MISC_OPACITY.length,
  MISC_BLUR: MISC_BLUR.length,
  COMPONENT_TOKENS: `${COMPONENT_TOKENS.length} groups / ${COMPONENT_TOKENS.reduce((n, g) => n + g.tokens.length, 0)} tokens`,
};
// Prefixed because these keys are export NAMES: an unprefixed `SEMANTIC_ERROR: 10`
// in a CI log reads as a build failure, and a grep for /error/i finds it.
console.log('wrote tokens.generated.ts — per-export counts:');
for (const [k, v] of Object.entries(summary))
  console.log(`  rows in ${k}: ${v}`);
console.log(`  NEW_TOKENS: ${NEW_TOKENS.length}`);
console.log(`(of ${all.length} live tokens; ${used.size} placed)`);
