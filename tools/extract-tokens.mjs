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

function findScss(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? findScss(p) : p.endsWith('.component.scss') ? [p] : [];
  });
}
const compFiles = findScss(join(ROOT, 'src/lib/components'));
const comp = compFiles.flatMap((f) =>
  extractComponentTokens(readFileSync(f, 'utf8'), basename(dirname(f))));
console.log('component --ds-* tokens:', new Set(comp.map((t) => t.name)).size);
