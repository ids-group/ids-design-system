#!/usr/bin/env node
// Every family `ds-color` offers must define every role the accent pointers read.
//
//   node tools/check-color-families.mjs
//
// A role that is missing does not render a wrong colour: the pointer resolves to a
// guaranteed-invalid value, so every declaration reading it is invalid at computed-value
// time and resets to `unset`. A selected list row, an active sidenav rail and an active
// tab pill just render as body text, with nothing in the console. `--error-strong`,
// `--success-strong` and `--warning-strong` were missing from the day `ds-color`
// shipped and nobody saw it.
//
// The contract is READ from `_ds-color.scss` — the `$families` list and the roles the
// `family-vars` mixin dereferences — so adding a family or a pointer there extends this
// check automatically instead of drifting from it.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(join(repo, 'src/lib/styles/_ds-color.scss'), 'utf8');

const familyList = /\$families:\s*([^;]+);/.exec(source);
if (!familyList) {
  console.error('check-color-families: no `$families:` list in _ds-color.scss — has the mixin been renamed?');
  process.exit(1);
}
const families = familyList[1].split(',').map((name) => name.trim()).filter(Boolean);

const mixin = /@mixin family-vars\(\$family\)\s*\{([\s\S]*?)\n\}/.exec(source);
if (!mixin) {
  console.error('check-color-families: no `@mixin family-vars` in _ds-color.scss — has the mixin been renamed?');
  process.exit(1);
}

// Only the FIRST var() of each declaration is the role being demanded; a second one is
// this check's own safety net (the fallback), and demanding it too would be circular.
const required = new Set();
for (const line of mixin[1].split('\n')) {
  const first = /var\(\s*(--[a-z0-9-]*#\{\$family\}[a-z0-9-]*)/.exec(line);
  if (first) required.add(first[1]);
}
if (!required.size) {
  console.error('check-color-families: family-vars dereferences no per-family role — the parse is wrong.');
  process.exit(1);
}

const sass = createRequire(join(repo, 'package.json'))('sass');
const { css } = sass.compile(join(repo, 'src/lib/styles/ds.scss'), {
  loadPaths: [join(repo, 'src')],
  style: 'expanded',
});

// Which selectors are COLOUR themes is read from `_theme-activation.scss` — the ones
// that apply a theme mixin. `data-theme` also carries shape themes (a `squared` radius
// example lives in a comment), and those declare no colour roles at all.
// sass emits attribute values unquoted; the source writes them in single quotes.
const normalize = (selector) => selector.trim().split('\n').pop().trim().replace(/['"]/g, '');

const activation = readFileSync(join(repo, 'src/lib/styles/_theme-activation.scss'), 'utf8');
const themeSelectors = new Set();
for (const [, selector, body] of activation.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/@include\s+[a-z-]+\.theme\b/.test(body)) themeSelectors.add(normalize(selector));
}
if (themeSelectors.size < 2) {
  console.error(`check-color-families: found ${themeSelectors.size} theme selector(s) in _theme-activation.scss, expected light and dark at least.`);
  process.exit(1);
}

// Both themes declare the complete set (siblings, not a delta-patch), so a role has to
// be present in each block on its own — a light-only declaration would leave dark
// resolving nothing. Comments are stripped first: sass keeps `/* */` in expanded output,
// and one of them holds a `:root[data-theme="squared"] { … }` example that a plain brace
// scan reads as a real rule.
const blocks = new Map();
const rules = css.replace(/\/\*[\s\S]*?\*\//g, '');
for (const [, selector, body] of rules.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  const name = normalize(selector);
  if (!themeSelectors.has(name)) continue;
  if (!blocks.has(name)) blocks.set(name, new Set());
  const declared = blocks.get(name);
  for (const [, token] of body.matchAll(/(--[a-z0-9-]+)\s*:/g)) declared.add(token);
}
if (blocks.size !== themeSelectors.size) {
  console.error(`check-color-families: _theme-activation.scss applies ${themeSelectors.size} themes, but ${blocks.size} matching :root block(s) reached the CSS.`);
  process.exit(1);
}

const problems = [];
for (const [theme, declared] of blocks) {
  for (const family of families) {
    for (const pattern of required) {
      const token = pattern.replace('#{$family}', family);
      if (!declared.has(token)) problems.push(`✗ ${theme}: ds-color="${family}" reads ${token}, which no theme block declares`);
    }
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(`check-color-families: FAILED — ${problems.length} missing role(s)`);
  process.exit(1);
}

const roles = required.size;
console.log(
  `check-color-families: OK — ${families.length} famil${families.length === 1 ? 'y' : 'ies'}`
  + ` × ${roles} role${roles === 1 ? '' : 's'} resolve in ${blocks.size} theme blocks.`,
);
