// A `var(--token)` that resolves to nothing does not degrade — it is invalid at computed-value
// time, which drops the WHOLE declaration it sits in. Nothing looks broken enough to notice.
//
// This shipped in the docs sidebar on 2026-09-08:
// `.chapter { padding: 5px var(--space-2-5) 5px var(--space-7) }` with --space-7 declared nowhere
// (the scale runs 6 → 8), so every chapter row rendered at padding 0 — 16.8px tall instead of
// 26.8px, text flush against its thread. `deck-lint`'s D012 had caught exactly this class of bug
// in `presentations/`, but the rule stopped at that folder.
//
// Four rules earn their keep, measured on this repo's own history: without them the sweep reports
// 26 non-defects.
//   1. Comments are documentation, not references — three hits were inside `//` or `/* */`.
//   2. A custom property may be written from the template (`[style.--x]`) or from script
//      (`setProperty('--x')`) — that is how --_table-virtual-row-h and --demo-dur arrive.
//   3. Tokens can be emitted by a Sass loop, so no literal `--bp-sm:` exists to grep for. The
//      compiled `presentations/ds.css` is the authority on what the library actually emits.
//   4. A fallback is only consulted when the primary is undeclared, so
//      `var(--warning-subtitle, var(--surface-subtitle))` is sound while --warning-subtitle
//      resolves — the void fallback is dead code, not a defect.
//
// Known limit: only `.scss`/`.css` files are scanned. A component with inline `styles:` in its
// TypeScript is not read, so a void token there is invisible to this gate.
//
//   node tools/check-void-tokens.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can point at its own fixture tree instead of the real one.
const TREES = (process.env.DS_VOID_TOKEN_DIRS || 'src,ds-docs/src')
  .split(',')
  .map((dir) => join(ROOT, dir.trim()))
  .filter(existsSync);

const filesUnder = (dir) => {
  const found = [];
  const walk = (at) => {
    for (const entry of readdirSync(at)) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      const path = join(at, entry);
      if (statSync(path).isDirectory()) walk(path);
      else found.push(path);
    }
  };
  walk(dir);
  return found;
};

const stripComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|\s)\/\/[^\n]*/g, '$1');

/**
 * The arguments of one `var(` at `openParen`, split on the first top-level comma:
 * `{ token, fallback, end }`. Hand-parsed because a fallback nests further `var()` calls and a
 * regex cannot balance them — and it is the nesting that decides which name is even consulted.
 */
function readVar(css, openParen) {
  let depth = 1;
  let comma = -1;
  let at = openParen + 1;
  for (; at < css.length && depth > 0; at += 1) {
    const char = css[at];
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 1 && comma === -1) comma = at;
  }
  const close = at - 1;
  const token = css.slice(openParen + 1, comma === -1 ? close : comma).trim();
  const fallback = comma === -1 ? null : css.slice(comma + 1, close).trim();
  return { token, fallback, end: close };
}

/**
 * Every name the browser would actually try to resolve, given rule 4.
 *
 * A nested `var()` is reached ONLY through its parent's fallback, never by the flat scan — walking
 * into one directly is how the first version of this gate reported the sound
 * `var(--warning-subtitle, var(--surface-subtitle))` as a defect: it skipped the resolved primary
 * and then found the dead fallback on its own.
 */
function consultedTokens(css, declared) {
  const names = [];
  const visit = (text) => {
    let at = text.indexOf('var(');
    while (at !== -1) {
      const { token, fallback, end } = readVar(text, at + 3);
      if (!/^--[\w-]+$/.test(token)) {
        at = text.indexOf('var(', at + 4);
        continue;
      }
      if (!declared.has(token)) {
        if (fallback === null) {
          names.push(token);
        } else {
          // The primary is undeclared, so the fallback IS consulted — its own voids count.
          visit(fallback);
        }
      }
      at = text.indexOf('var(', end + 1);
    }
  };
  visit(css);
  return names;
}

const sources = TREES.flatMap(filesUnder);
const styleFiles = sources.filter((f) => /\.(scss|css)$/.test(f));

const declared = new Set();

// Rule 3: the compiled stylesheet is what the library really emits, loop-generated tokens included.
const compiled = join(ROOT, 'presentations', 'ds.css');
if (!existsSync(compiled)) {
  console.error(
    'check-void-tokens: presentations/ds.css is missing — run build:deck-css.',
  );
  process.exit(1);
}
for (const [, token] of readFileSync(compiled, 'utf8').matchAll(
  /(--[\w-]+)\s*:/g,
)) {
  declared.add(token);
}

for (const file of sources.filter((f) => /\.(scss|css|html|ts)$/.test(f))) {
  const text = readFileSync(file, 'utf8');
  const scannable = /\.(scss|css)$/.test(file) ? stripComments(text) : text;
  for (const [, token] of scannable.matchAll(/(--[\w-]+)\s*:/g)) {
    declared.add(token);
  }
  // Rule 2: written from a template binding or from script rather than declared in CSS.
  for (const [, token] of text.matchAll(/\[style\.(--[\w-]+)/g)) {
    declared.add(token);
  }
  for (const [, token] of text.matchAll(/setProperty\(\s*['"`](--[\w-]+)/g)) {
    declared.add(token);
  }
}

const problems = [];
for (const file of styleFiles) {
  const lines = stripComments(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    for (const token of consultedTokens(line, declared)) {
      problems.push(
        `${relative(ROOT, file)}:${index + 1}  var(${token}) resolves to nothing — no fallback, declared nowhere. The whole declaration is dropped.`,
      );
    }
  });
}

if (problems.length > 0) {
  console.error(
    `check-void-tokens: ${problems.length} unresolvable token reference(s).\n\n${problems.join('\n')}\n`,
  );
  process.exit(1);
}

console.log(
  `check-void-tokens: OK — ${styleFiles.length} stylesheet(s), every consulted var() resolves against ${declared.size} known custom properties.`,
);
