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

function findScss(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? findScss(p) : p.endsWith('.component.scss') ? [p] : [];
  });
}
const compFiles = findScss(join(ROOT, 'src/lib/components'));
const comp = compFiles.flatMap((f) =>
  extractComponentTokens(readFileSync(f, 'utf8'), basename(dirname(f))));
const byCat = {};
for (const t of comp) (byCat[t.component] ??= new Set()).add(t.name);
console.log('components:', Object.keys(byCat).length);
console.log(Object.entries(byCat).map(([c, s]) => `  ${c}: ${s.size}`).join('\n'));
