// Compiles the DS's real SCSS into one unscoped stylesheet for the React
// binding layer (design-sync). Angular's emulated encapsulation is emulated
// textually: each component's styles are re-scoped under its `ds-*` tag,
// which the React bindings render as real custom elements.
//
//   node .design-sync/tools/build-css.mjs
//
// Output (gitignored): .design-sync/react-bindings/dist/ds-all.css + fonts/
// Deps resolve from .ds-sync/node_modules (converter staging).
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import {
  cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync,
} from 'node:fs';
import { join, dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require_ = createRequire(join(repo, '.ds-sync', 'package.json'));
const sass = require_('sass');
const postcss = require_('postcss');

const OUT_DIR = join(repo, '.design-sync', 'react-bindings', 'dist');
mkdirSync(OUT_DIR, { recursive: true });

// ── 1. global layer: the DS's public stylesheet entry, verbatim ──────────
const global_ = sass.compile(join(repo, 'src/lib/styles/ds.scss'), {
  style: 'expanded',
  loadPaths: [join(repo, 'src/lib/styles'), join(repo, 'src/lib')],
});

// ── 2. per-component layer ────────────────────────────────────────────────
// For every <stem>.component.scss with a sibling <stem>.component.ts, read the
// Angular selector + encapsulation and re-scope:
//   :host(SEL)        -> ds-tag SEL (fused)
//   :host-context(S)  -> S ds-tag          (ancestor approximation)
//   :host             -> ds-tag
//   ` ::ng-deep `     -> descendant combinator (scope pierce = stop scoping)
//   anything else     -> ds-tag <selector>  (descendant-scoped)
// ViewEncapsulation.None -> pass through untouched (matches Angular).

function componentMeta(tsPath) {
  const src = readFileSync(tsPath, 'utf8');
  const sel = src.match(/selector:\s*'([^']+)'/)?.[1] ?? null;
  const none = /ViewEncapsulation\.None/.test(src);
  return { sel, none };
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

// Walk every *.component.ts and emit its styleUrl sheet under ITS selector —
// Angular emulated encapsulation gives each component its OWN scoped copy, so
// a shared sheet (e.g. modal-card.component.ts -> styleUrl modal.component.scss)
// must be emitted once per referencing component, not once per file.
const componentsDir = join(repo, 'src/lib/components');
const blocks = [];
const tsFiles = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.component.ts')) tsFiles.push(p);
  }
})(componentsDir);
tsFiles.sort(); // deterministic output → stable hashes

const compileCache = new Map();
for (const tsPath of tsFiles) {
  const src = readFileSync(tsPath, 'utf8');
  const styleUrl = src.match(/styleUrls?:\s*\[?\s*'([^']+)'/)?.[1];
  if (!styleUrl) continue; // inline-styles components handled below
  const scssPath = resolve(dirname(tsPath), styleUrl);
  if (!existsSync(scssPath)) { console.error(`! styleUrl ${styleUrl} missing for ${tsPath} — skipped`); continue; }
  const { sel, none } = componentMeta(tsPath);
  if (!sel) { console.error(`! no selector in ${tsPath} — skipped`); continue; }
  if (!compileCache.has(scssPath)) {
    compileCache.set(scssPath, sass.compile(scssPath, {
      style: 'expanded',
      loadPaths: [join(repo, 'src/lib/styles'), dirname(scssPath)],
    }).css);
  }
  const compiled = compileCache.get(scssPath);
  const scoped = none ? compiled : rescopeCss(compiled, sel);
  blocks.push(`/* ── ${basename(scssPath)} (${sel}) ── */\n${scoped}`);
}

// ── 3. inline `styles: [\`…\`]` components (accordion, tab, icon) ─────────
const inlineStyled = [
  join(repo, 'src/lib/components/accordion/accordion.component.ts'),
  join(repo, 'src/lib/components/tabs/tab.component.ts'),
  join(repo, 'src/lib/icons/icon.component.ts'),
];
for (const tsPath of inlineStyled) {
  if (!existsSync(tsPath)) { console.error(`! inline-styles source missing: ${tsPath}`); continue; }
  const src = readFileSync(tsPath, 'utf8');
  const m = src.match(/styles:\s*\[\s*`([\s\S]*?)`\s*,?\s*\]/)
    ?? src.match(/styles:\s*\[\s*'([^']*)'\s*,?\s*\]/);
  if (!m) { console.error(`! no inline styles matched in ${tsPath}`); continue; }
  const { sel, none } = componentMeta(tsPath);
  const compiled = sass.compileString(m[1], { style: 'expanded' }).css;
  const scoped = none ? compiled : rescopeCss(compiled, sel);
  blocks.push(`/* ── ${basename(tsPath)} inline (${sel}) ── */\n${scoped}`);
}

// ── 4. assemble + fonts ───────────────────────────────────────────────────
const out = `/* IDS Design System — compiled from src/lib SCSS by design-sync build-css.mjs.
   Global layer is ds.scss verbatim; component layers are re-scoped from
   Angular emulated encapsulation onto their ds-* host tags. */
${global_.css}

${blocks.join('\n\n')}
`;
writeFileSync(join(OUT_DIR, 'ds-all.css'), out);
cpSync(join(repo, 'src/lib/styles/fonts'), join(OUT_DIR, 'fonts'), { recursive: true });
console.error(`✓ ds-all.css (${(out.length / 1024).toFixed(0)} KB, ${blocks.length} component blocks) + fonts/`);
