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
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
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
    if (text[i] === '@' && /^@(if|else|for|switch|case|default|empty|placeholder|loading|error)\b/.test(text.slice(i))) {
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
    return template.includes('<ng-content') && hasConditionalProjection(template);
  })
  .map(relPath)
  .sort();

const directiveSelector = /selector:\s*'(\[[A-Za-z][\w-]*\])'/g;
const attributeDirectives = [
  ...new Set(
    walk(join(repo, 'src', 'lib'), '.ts')
      .flatMap((file) => [...readFileSync(file, 'utf8').matchAll(directiveSelector)].map((m) => m[1])),
  ),
].sort();

const found = { conditionalProjection, attributeDirectives };

if (bless) {
  const previous = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  writeFileSync(MANIFEST, `${JSON.stringify({ ...previous, ...found }, null, 2)}\n`);
  console.log(
    `blessed: ${conditionalProjection.length} conditional-projection template(s), ${attributeDirectives.length} attribute directive(s)`,
  );
  process.exit(0);
}

const recorded = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const errors = [];

for (const [key, label] of [
  ['conditionalProjection', 'component template with <ng-content> inside a control-flow block'],
  ['attributeDirectives', 'attribute directive with no element to register'],
]) {
  const before = new Set(recorded[key] ?? []);
  const after = new Set(found[key]);
  for (const entry of after) {
    if (!before.has(entry)) {
      errors.push(`✗ NEW ${label}: ${entry} — decide how the elements route covers it, note it in MANUAL-SURFACE.md, then --bless`);
    }
  }
  for (const entry of before) {
    if (!after.has(entry)) {
      errors.push(`✗ GONE ${label}: ${entry} — its MANUAL-SURFACE.md entry is now stale, delete it, then --bless`);
    }
  }
}

// Every registered component needs a usage doc: the design agent reads these, and a
// component that ships without one is invisible to it. Previews are deliberately not
// gated — a child component (ListItem, Tab, MenuItem) appears inside its parent's
// preview and has none of its own.
const pascalOfTag = (tag) => tag.replace(/^ds-/, '').replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
const componentTags = new Set();
for (const file of walk(join(repo, 'src', 'lib'), '.component.ts')) {
  const match = /selector:\s*'(ds-[a-z0-9-]+)'/.exec(readFileSync(file, 'utf8'));
  if (match) componentTags.add(match[1]);
}
const docNames = new Set(
  readdirSync(join(repo, '.design-sync', 'docs'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => name.slice(0, -3)),
);
for (const tag of [...componentTags].sort()) {
  if (!docNames.has(pascalOfTag(tag))) {
    errors.push(`✗ ${tag} has no .design-sync/docs/${pascalOfTag(tag)}.md — the design agent reads these, so an undocumented component is unusable to it`);
  }
}

// Matched as a backticked token, not a bare substring: `badge` would otherwise
// be satisfied by the word "title-badge" appearing anywhere in the prose.
const docs = readFileSync(join(repo, '.design-sync', 'MANUAL-SURFACE.md'), 'utf8');
for (const entry of conditionalProjection) {
  const component = entry.split('/').pop().replace('.component.html', '');
  if (!docs.includes(`\`${component}\``)) {
    errors.push(`✗ ${component} is in the manifest but MANUAL-SURFACE.md never mentions it — an unexplained entry is an excuse, not a record`);
  }
}

for (const error of errors) console.log(error);
console.log(
  `${errors.length ? '✗' : '✓'} manual surface: ${conditionalProjection.length} conditional-projection template(s), ${attributeDirectives.length} attribute directive(s), ${componentTags.size} components all documented, ${errors.length} problem(s)`,
);
process.exit(errors.length ? 1 : 0);
