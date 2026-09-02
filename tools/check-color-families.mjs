#!/usr/bin/env node
// Every family `ds-color` offers must resolve every role the accent pointers read.
//
//   node tools/check-color-families.mjs
//
// A role that does not resolve is not a wrong colour: the pointer becomes a guaranteed-invalid
// value, so every declaration reading it is invalid at computed-value time and resets to `unset`.
// `--accent-strong` was unresolvable under `ds-color="error|success|warning"` from the day
// `ds-color` shipped — two months, three families, and nothing said a word.
//
// WHAT THIS READS, AND WHY IT IS THE COMPILED CSS
// The first version of this file parsed `_ds-color.scss` line by line and asked whether a role's
// NAME was declared. Both halves were wrong, and an adversarial pass took it apart: a trailing
// comment on a pointer line, a pointer wrapped over two lines, or a role declared as
// `var(--typo)` all passed green while the zone was dead. The compiled stylesheet has none of
// those problems — the pointers are already expanded, one declaration per line, no interpolation
// and no comments — and it is also the thing the browser actually loads.
//
// THE CONTRACT IS DERIVED, NOT DECLARED. Comparing one pointer across the five emitted
// `[ds-color=…]` blocks says which of its links are family roles and which are shared barriers:
// a link that differs per family is a role that family must answer, a link identical in all five
// is the crash barrier. So there is no "the last link is the barrier" rule to get wrong, and
// adding a family or a pointer in `_ds-color.scss` extends this check with no edit here.
//
// WHAT IT DELIBERATELY DOES NOT MODEL. This is not a browser. It does not evaluate `@media`,
// `@supports` or `@container` conditions, cascade order, specificity, `!important`, `@layer`,
// `@property` registrations, `initial`/`inherit`/empty values, `color-mix()` or relative colour,
// or the grammar of the property a value lands in. It answers one question — does every var()
// chain reach a value with nothing unresolved left in it — and it answers that per theme block.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const fail = (message) => {
  console.error(`check-color-families: ${message}`);
  process.exit(1);
};

// ── compile ───────────────────────────────────────────────────────────────
let css;
try {
  const sass = createRequire(join(repo, 'package.json'))('sass');
  ({ css } = sass.compile(join(repo, 'src/lib/styles/ds.scss'), {
    loadPaths: [join(repo, 'src')],
    style: 'expanded',
  }));
} catch (error) {
  fail(`could not compile src/lib/styles/ds.scss — ${error.message}`);
}

// ── scan ──────────────────────────────────────────────────────────────────
// Brace-depth aware, so a `:root` inside `@media` is not mistaken for the unconditional one —
// which it was, silently, in the version this replaces. Comments go first: sass keeps `/* */`
// in expanded output and one of them contains a `:root[data-theme="squared"] { … }` example.
function scanRules(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const stack = [];
  let buffer = '';
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '{') {
      stack.push(buffer.trim().split('\n').pop().trim());
      buffer = '';
    } else if (character === '}') {
      const selector = stack.pop() ?? '';
      if (selector && !selector.startsWith('@')) {
        rules.push({
          selector,
          conditional: stack.some((entry) => entry.startsWith('@')),
          body: buffer,
        });
      }
      buffer = '';
    } else {
      buffer += character;
    }
  }
  return rules;
}

const declarationsOf = (body) => {
  const declarations = new Map();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]*)/g)) {
    declarations.set(name, value.trim());
  }
  return declarations;
};

// sass emits attribute values unquoted where the source quotes them, and a selector read out of
// SCSS carries whatever preceded it on earlier lines.
const normalizeSelector = (selector) => selector.trim().split('\n').pop().trim().replace(/['"]/g, '');
const rules = scanRules(css).map((rule) => ({ ...rule, selector: normalizeSelector(rule.selector) }));

// ── which selectors are colour themes ─────────────────────────────────────
// Read from the activation file rather than hard-coded: `data-theme` also carries shape themes,
// which declare no colour roles at all.
const activation = readFileSync(join(repo, 'src/lib/styles/_theme-activation.scss'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|\s)\/\/[^\n]*/g, '');
const themeSelectors = [];
for (const [, selector, body] of activation.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
  if (/@include\s+[\w-]+\.theme\b/.test(body)) themeSelectors.push(normalizeSelector(selector));
}
if (themeSelectors.length < 2) {
  fail(`found ${themeSelectors.length} theme selector(s) in _theme-activation.scss, expected light and dark at least`);
}

// Every unconditional `:root` contributes to the environment a theme resolves in — the palette,
// the scale and the roles are spread across several of them.
const rootDeclarations = new Map();
for (const rule of rules) {
  if (rule.selector === ':root' && !rule.conditional) {
    for (const [name, value] of declarationsOf(rule.body)) rootDeclarations.set(name, value);
  }
}

const environments = new Map();
for (const selector of themeSelectors) {
  const environment = new Map(rootDeclarations);
  let matched = 0;
  for (const rule of rules) {
    if (rule.selector === selector && !rule.conditional) {
      matched += 1;
      for (const [name, value] of declarationsOf(rule.body)) environment.set(name, value);
    }
  }
  // Counted, not sized: a sibling theme redeclares the same names, so the map does not grow.
  if (!matched) {
    fail(`_theme-activation.scss applies ${selector}, but no unconditional rule for it reached the CSS`);
  }
  environments.set(selector, environment);
}

// ── the zones ─────────────────────────────────────────────────────────────
const zones = new Map();
for (const rule of rules) {
  const match = /^\[ds-color=([\w-]+)\]$/.exec(rule.selector);
  if (!match || rule.conditional) continue;
  zones.set(match[1], declarationsOf(rule.body));
}
if (zones.size < 2) {
  fail(`found ${zones.size} unconditional [ds-color=…] rule(s) in the compiled CSS — the @each in _ds-color.scss emits nothing`);
}

// ── resolution ────────────────────────────────────────────────────────────
// Every var() in a value, not only a top-level chain: `hsl(var(--x) …)` hides a reference that a
// chain-walker would miss, and that is how a renamed palette channel kills a whole family.
function varReferences(value) {
  const references = [];
  for (let index = 0; index < value.length; index += 1) {
    if (!value.startsWith('var(', index)) continue;
    let depth = 0;
    let end = index;
    for (; end < value.length; end += 1) {
      if (value[end] === '(') depth += 1;
      else if (value[end] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    const inner = value.slice(index + 4, end);
    const comma = (() => {
      let nested = 0;
      for (let position = 0; position < inner.length; position += 1) {
        if (inner[position] === '(') nested += 1;
        else if (inner[position] === ')') nested -= 1;
        else if (inner[position] === ',' && nested === 0) return position;
      }
      return -1;
    })();
    references.push({
      name: (comma === -1 ? inner : inner.slice(0, comma)).trim(),
      fallback: comma === -1 ? null : inner.slice(comma + 1).trim(),
      whole: value.slice(index, end + 1),
    });
    index = end;
  }
  return references;
}

// The names of a fallback CHAIN, flattened: `var(--a, var(--b, var(--c)))` is [a, b, c]. Anything
// that is not a bare chain — `hsl(var(--x) …)` — returns its references as they stand, because
// there is no "or" between them.
function chainOf(value) {
  const references = varReferences(value);
  if (references.length !== 1 || references[0].whole !== value.trim()) {
    return references.map((reference) => reference.name);
  }
  const [reference] = references;
  return reference.fallback === null
    ? [reference.name]
    : [reference.name, ...chainOf(reference.fallback)];
}

function resolves(value, environment, seen = new Set()) {
  for (const reference of varReferences(value)) {
    if (seen.has(reference.name)) return false;
    const declared = environment.get(reference.name);
    const viaName = declared !== undefined
      && resolves(declared, environment, new Set([...seen, reference.name]));
    if (viaName) continue;
    if (reference.fallback === null) return false;
    if (!resolves(reference.fallback, environment, seen)) return false;
  }
  return true;
}

// ── the derived contract ──────────────────────────────────────────────────
// A link that differs across the families is a role that family must answer; a link identical in
// all of them is the shared crash barrier and proves nothing about the family.
const families = [...zones.keys()].sort();
const pointerNames = new Set();
for (const declarations of zones.values()) for (const name of declarations.keys()) pointerNames.add(name);

for (const pointer of [...pointerNames].sort()) {
  const missing = families.filter((family) => !zones.get(family).has(pointer));
  if (missing.length) {
    problems.push(`✗ ${pointer} is declared for ${families.length - missing.length} of ${families.length} families but not for ${missing.join(', ')}`);
    continue;
  }
  const chains = families.map((family) => ({ family, links: chainOf(zones.get(family).get(pointer)) }));
  const depth = Math.min(...chains.map((chain) => chain.links.length));
  const familyLinks = [];
  for (let position = 0; position < depth; position += 1) {
    if (new Set(chains.map((chain) => chain.links[position])).size > 1) familyLinks.push(position);
  }
  if (!familyLinks.length) continue; // every link is shared: nothing family-specific to demand

  for (const [themeSelector, environment] of environments) {
    for (const chain of chains) {
      const answered = familyLinks.some((position) => {
        const declared = environment.get(chain.links[position]);
        return declared !== undefined && resolves(declared, environment);
      });
      if (answered) continue;
      const names = familyLinks.map((position) => chain.links[position]).join(' or ');
      problems.push(`✗ ${themeSelector}: ds-color="${chain.family}" leaves ${pointer} unanswered — no resolving ${names}`);
    }
  }
}

// ── the unscoped state ────────────────────────────────────────────────────
// The default accent block is written by hand in _semantic.scss, not emitted by the mixin, so it
// can lose a pointer the zones still map — or keep one they dropped — and nothing else notices.
// It is also the state every consumer gets without a `ds-color` attribute.
for (const [themeSelector, environment] of environments) {
  for (const pointer of pointerNames) {
    const value = environment.get(pointer);
    if (value === undefined) {
      problems.push(`✗ ${themeSelector}: the default accent has no ${pointer}, though ds-color zones map it`);
    } else if (!resolves(value, environment)) {
      problems.push(`✗ ${themeSelector}: the default accent's ${pointer} does not resolve — ${value}`);
    }
  }
}

// ── no reference without an answer ────────────────────────────────────────
// Beyond the accent family: any `var(--x)` written WITHOUT a fallback has to resolve, or the
// declaration holding it is dead. A reference that carries a fallback is opting into being
// optional and is left alone — that is how `--ds-*` consumer overrides are meant to be written.
for (const [themeSelector, environment] of environments) {
  const dangling = new Set();
  for (const [, value] of environment) {
    for (const reference of varReferences(value)) {
      if (reference.fallback === null && !environment.has(reference.name)) dangling.add(reference.name);
    }
  }
  for (const name of [...dangling].sort()) {
    problems.push(`✗ ${themeSelector}: ${name} is read without a fallback and declared nowhere`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  fail(`FAILED — ${problems.length} problem(s)`);
}

console.log(
  `check-color-families: OK — ${families.length} famil${families.length === 1 ? 'y' : 'ies'}`
  + ` × ${pointerNames.size} pointers resolve in ${environments.size} theme blocks,`
  + ` and the default accent resolves in each.`,
);
