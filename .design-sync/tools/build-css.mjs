// Compiles the DS's real SCSS into one unscoped stylesheet for the React
// binding layer (design-sync). Angular's emulated encapsulation is emulated
// textually: each component's styles are re-scoped under its `ds-*` tag,
// which the React bindings render as real custom elements.
//
//   node .design-sync/tools/build-css.mjs
//
// Output (gitignored): .design-sync/react-bindings/dist/ds-all.css + fonts/
// Deps resolve from .ds-sync/node_modules (see tools/bootstrap.mjs), falling
// back to the repo's own node_modules through node's parent-dir walk.
import { createRequire } from 'node:module';
import {
  cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync,
} from 'node:fs';
import { join, dirname, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require_ = createRequire(join(repo, '.ds-sync', 'package.json'));
const sass = require_('sass');
const postcss = require_('postcss');

const OUT_DIR = join(repo, '.design-sync', 'react-bindings', 'dist');
mkdirSync(OUT_DIR, { recursive: true });

const problems = [];
function fail(message) {
  problems.push(message);
  console.error(`! ${message}`);
}

// ── 1. global layer: the DS's public stylesheet entry, verbatim ──────────
const global_ = sass.compile(join(repo, 'src/lib/styles/ds.scss'), {
  style: 'expanded',
  loadPaths: [join(repo, 'src/lib/styles'), join(repo, 'src/lib')],
});

// ── 2. per-component layer ────────────────────────────────────────────────
// For every *.component.ts under src/lib, read the Angular selector +
// encapsulation and re-scope its stylesheet(s):
//   :host(SEL)        -> ds-tag SEL (fused)
//   :host-context(S)  -> S ds-tag          (ancestor approximation)
//   :host             -> ds-tag
//   ` ::ng-deep `     -> descendant combinator (scope pierce = stop scoping)
//   anything else     -> ds-tag <selector>  (descendant-scoped)
// ViewEncapsulation.None -> pass through untouched (matches Angular).

function componentMeta(tsPath) {
  const src = readFileSync(tsPath, 'utf8');
  const sel = src.match(/selector:\s*['"]([^'"]+)['"]/)?.[1] ?? null;
  const none = /encapsulation:\s*ViewEncapsulation\.None/.test(src);
  return { sel, none };
}

// A regex can't find the end of `styles: [...]`: CSS inside the array contains
// `]` (attribute selectors), so a lazy `\[.*?\]` truncates mid-stylesheet.
// Scan string literals instead, tracking quotes, and stop at the first `]` that
// is outside one. The key is anchored to its own line so the word "styles:"
// appearing inside a template literal can't hijack the scan.
function literalsAfter(source, key) {
  const start = source.search(new RegExp(`^\\s*${key}:\\s*`, 'm'));
  if (start < 0) return [];
  let index = source.indexOf(':', start) + 1;
  while (/\s/.test(source[index])) index += 1;
  const isArray = source[index] === '[';
  if (isArray) index += 1;
  const entries = [];
  while (index < source.length && source[index] !== ']') {
    const char = source[index];
    if (char === '`' || char === "'" || char === '"') {
      index += 1;
      let literal = '';
      while (index < source.length && source[index] !== char) {
        if (source[index] === '\\') { literal += source.slice(index, index + 2); index += 2; continue; }
        literal += source[index];
        index += 1;
      }
      index += 1;
      entries.push(literal);
      if (!isArray) break;
      continue;
    }
    if (char === ',' || /\s/.test(char)) { index += 1; continue; }
    break; // spread, identifier, anything non-literal — leave it to the caller
  }
  return entries;
}

/** All entries of `styleUrl: 'a'` / `styleUrls: ['a', 'b']`, in source order. */
function styleUrlsOf(src) {
  return literalsAfter(src, 'styleUrls?');
}

/** All entries of an inline `styles: [...]` — template literals or quoted. */
function inlineStylesOf(src) {
  return literalsAfter(src, 'styles').filter((css) => css.trim() !== '');
}

function rescopeSelector(sel, tag) {
  let s = sel.replace(/\s*::ng-deep\s*/g, ' ').trim();
  const hadHost = /:host/.test(s);
  const ctx = s.match(/^:host-context\(([^)]+)\)\s*(.*)$/);
  if (ctx) return `${ctx[1]} ${tag}${ctx[2] ? ' ' + ctx[2] : ''}`.trim();
  s = s.replace(/:host\(([^)]+)\)/g, (_, inner) => `${tag}${inner}`);
  s = s.replace(/:host/g, tag);
  return hadHost ? s.trim() : `${tag} ${s}`;
}

function rescopeCss(css, tag) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    const inKeyframes = rule.parent?.type === 'atrule'
      && /^(-\w+-)?keyframes$/.test(rule.parent.name);
    if (inKeyframes) return;
    rule.selectors = rule.selectors.map((s) => rescopeSelector(s, tag));
  });
  return root.toString();
}

// Walk every *.component.ts and emit its stylesheet(s) under ITS selector —
// Angular emulated encapsulation gives each component its OWN scoped copy, so
// a shared sheet (e.g. modal-card.component.ts -> styleUrl modal.component.scss)
// must be emitted once per referencing component, not once per file. The walk
// covers all of src/lib (not just components/) so icons/ and any future
// directory are picked up without a hand-maintained list.
const blocks = [];
const tsFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith('.component.ts')) tsFiles.push(path);
  }
})(join(repo, 'src/lib'));
tsFiles.sort(); // deterministic output → stable hashes

const compileCache = new Map();
let styleless = 0;
for (const tsPath of tsFiles) {
  const rel = relative(repo, tsPath).replace(/\\/g, '/');
  const src = readFileSync(tsPath, 'utf8');
  const styleUrls = styleUrlsOf(src);
  const inlineStyles = inlineStylesOf(src);
  if (!styleUrls.length && !inlineStyles.length) {
    if (/styleUrls?:|styles:/.test(src)) {
      fail(`${rel} declares styles but none could be parsed`);
    } else {
      styleless += 1;
    }
    continue;
  }
  const { sel, none } = componentMeta(tsPath);
  if (!sel) { fail(`no selector in ${rel} — styles dropped`); continue; }

  for (const styleUrl of styleUrls) {
    const scssPath = resolve(dirname(tsPath), styleUrl);
    if (!existsSync(scssPath)) { fail(`styleUrl ${styleUrl} missing for ${rel}`); continue; }
    if (!compileCache.has(scssPath)) {
      compileCache.set(scssPath, sass.compile(scssPath, {
        style: 'expanded',
        loadPaths: [join(repo, 'src/lib/styles'), dirname(scssPath)],
      }).css);
    }
    const compiled = compileCache.get(scssPath);
    blocks.push(`/* ── ${basename(scssPath)} (${sel}) ── */\n${
      none ? compiled : rescopeCss(compiled, sel)}`);
  }

  for (const [index, css] of inlineStyles.entries()) {
    const compiled = sass.compileString(css, { style: 'expanded' }).css;
    const label = inlineStyles.length > 1 ? ` #${index + 1}` : '';
    blocks.push(`/* ── ${basename(tsPath)} inline${label} (${sel}) ── */\n${
      none ? compiled : rescopeCss(compiled, sel)}`);
  }
}

// ── 3. assemble + fonts ───────────────────────────────────────────────────
const out = `/* IDS Design System — compiled from src/lib SCSS by design-sync build-css.mjs.
   Global layer is ds.scss verbatim; component layers are re-scoped from
   Angular emulated encapsulation onto their ds-* host tags. */
${global_.css}

${blocks.join('\n\n')}
`;
writeFileSync(join(OUT_DIR, 'ds-all.css'), out);
cpSync(join(repo, 'src/lib/styles/fonts'), join(OUT_DIR, 'fonts'), { recursive: true });
console.error(
  `${problems.length ? '✗' : '✓'} ds-all.css (${(out.length / 1024).toFixed(0)} KB, `
  + `${blocks.length} blocks from ${tsFiles.length - styleless}/${tsFiles.length} components, `
  + `${styleless} styleless) + fonts/`,
);
// A silently skipped component ships a design system with an unstyled part, so
// any parse miss is fatal — the whole point of the strict pass.
if (problems.length) {
  console.error(`✗ ${problems.length} component(s) could not be compiled — see ! lines above`);
  process.exit(1);
}
