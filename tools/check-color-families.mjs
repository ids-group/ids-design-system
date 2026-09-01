#!/usr/bin/env node
// Every family `ds-color` offers must define every role the accent pointers read.
//
//   node tools/check-color-families.mjs
//
// A role that is missing does not render a wrong colour: the pointer resolves to a
// guaranteed-invalid value, so every declaration reading it is invalid at computed-value
// time and resets to `unset`. A selected list row, an active sidenav rail and an active
// tab pill just render as body text, with nothing in the console. `--accent-strong` went
// unresolved under `ds-color="error|success|warning"` from the day `ds-color` shipped —
// two months, three families, no report.
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

// A pointer is a CHAIN, not one name: `var(--x-strong, var(--x-text, var(--x)))` says the
// role may be expressed under any of those names, so demanding the FIRST would force a
// family to duplicate a role it already carries under its own name.
//
// The LAST link is not one of those names, it is the crash barrier — the thing that keeps
// a miss from rendering as body text. Satisfying a role through the barrier is still a
// miss (the accent would silently become the family's flat base colour), so a multi-link
// chain must be answered before its last link. A single-link pointer has no barrier and
// the one name is the requirement.
const chains = [];
for (const line of mixin[1].split('\n')) {
  const links = [...line.matchAll(/var\(\s*(--[a-z0-9-]*#\{\$family\}[a-z0-9-]*|--[a-z0-9-]+)/g)]
    .map((match) => match[1]);
  if (!links.some((link) => link.includes('#{$family}'))) continue;
  const pointer = /^\s*(--[a-z0-9-]+)\s*:/.exec(line)?.[1] ?? '(unnamed)';
  chains.push({ pointer, names: links.length > 1 ? links.slice(0, -1) : links });
}
if (!chains.length) {
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
    for (const chain of chains) {
      const names = chain.names.map((link) => link.replace('#{$family}', family));
      if (names.some((name) => declared.has(name))) continue;
      problems.push(`✗ ${theme}: ds-color="${family}" leaves ${chain.pointer} unresolved — no ${names.join(' or ')}`);
    }
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  console.error(`check-color-families: FAILED — ${problems.length} missing role(s)`);
  process.exit(1);
}

console.log(
  `check-color-families: OK — ${families.length} famil${families.length === 1 ? 'y' : 'ies'}`
  + ` × ${chains.length} pointer${chains.length === 1 ? '' : 's'} resolve in ${blocks.size} theme blocks.`,
);
