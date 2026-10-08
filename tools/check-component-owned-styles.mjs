#!/usr/bin/env node
// A component's look must ship with the component. A consumer may assemble the global partials one
// by one instead of `styles/ds`, and whatever a component borrows from a partial they left out
// disappears without an error. Three shapes of that borrowing fail here:
//
//   1. A library template (src/lib/components/**/*.html, or an inline `template:`) uses a class that
//      only a global partial defines - `.t-s` from typography, `.grid-2`, `.page-grid`, `.link`. A
//      class the component's own stylesheets also define is the component's, and passes.
//   2. A global partial targets a component's host element - `ds-skeleton::after` - so the rule
//      reaches the component only where that partial is loaded.
//   3. A component stylesheet (`*.component.scss`) that does not include `component-base.rules`,
//      which gives the component's own elements what `styles/reset` and `styles/focus` give a page:
//      `border-box`, form controls in the inherited font, heading margins and the base focus ring.
//      A stylesheet that genuinely needs none of it says so: `component-owned-styles: base <reason>`.
//
// A partial that IS a component's stylesheet and can only be global is listed in GLOBAL_BY_NECESSITY
// with its reason, and both rules skip it. The list lives here rather than as a marker in the
// partial because partials ship verbatim. A template that genuinely needs a global class names it,
// with a reason, in a comment in the same file: `component-owned-styles: .t-s <reason>`.
//
// Not read: classes set through `[class]`, `[ngClass]` or an interpolation, whose names are values.
//
//   node tools/check-component-owned-styles.mjs
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import postcss from 'postcss';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can point at its own fixture tree instead of the real one.
const LIB = resolve(ROOT, process.env.DS_OWNED_STYLES_LIB || 'src/lib');
const STYLES = join(LIB, 'styles');
const COMPONENTS = join(LIB, 'components');
const GLOBAL_BY_NECESSITY = new Map([
  [
    '_dropdown-overlay.scss',
    'the picker panels portal to the overlay container, outside the host and its encapsulation',
  ],
]);
const TEMPLATE_WAIVER = /component-owned-styles:\s*\.([\w-]+)\s+(\S[^\n]*?)\s*(?:-->|\*\/|$)/gm;

const name = (file) => relative(ROOT, file).replace(/\\/g, '/');
const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
const withoutComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const lineOf = (text, index) => text.slice(0, index).split('\n').length;

const libFiles = walk(LIB);
const hosts = new Set(
  libFiles
    .filter((file) => file.endsWith('.ts'))
    .flatMap((file) =>
      [...readFileSync(file, 'utf8').matchAll(/selector:\s*['"`]([^'"`]+)['"`]/g)].flatMap((match) =>
        match[1].split(',').map((part) => part.trim()),
      ),
    )
    .filter((selector) => /^[a-z][a-z0-9]*-[a-z0-9-]+$/.test(selector)),
);

// Each partial is compiled on its own, as `@use` alone would emit it: a mixin a component includes
// is that component's stylesheet, and only top-level output is global.
const globalClasses = new Map();
const hostRules = [];
const marked = [];
for (const file of readdirSync(STYLES).filter((entry) => /^_.+\.scss$/.test(entry))) {
  const path = join(STYLES, file);
  if (GLOBAL_BY_NECESSITY.has(file)) {
    marked.push(`${name(path)} - ${GLOBAL_BY_NECESSITY.get(file)}`);
    continue;
  }
  const css = sass.compileString(`@use '${file.slice(1, -5)}';`, {
    url: pathToFileURL(join(STYLES, 'check-entry.scss')),
    loadPaths: [LIB],
    silenceDeprecations: ['import'],
  }).css;
  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    for (const selector of rule.selectors) {
      const bare = selector.replace(/\[[^\]]*\]/g, '[]').replace(/\([^)]*\)/g, '()');
      for (const compound of bare.split(/[\s>+~]+/)) {
        const head = /^(?:[a-z][\w-]*)?\.([\w-]+)/.exec(compound);
        if (head) {
          const owners = globalClasses.get(head[1]) ?? new Set();
          owners.add(file);
          globalClasses.set(head[1], owners);
        }
        const element = /^([a-z][a-z0-9]*-[a-z0-9-]+)/.exec(compound);
        if (element && hosts.has(element[1])) {
          hostRules.push({ partial: name(path), host: element[1], selector });
        }
      }
    }
  });
}

const templatesOf = (file) => {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) return [{ text, offset: 0, waiverSource: text }];
  return [...text.matchAll(/template:\s*`([\s\S]*?)`/g)].map((match) => ({
    text: match[1],
    offset: match.index + match[0].indexOf('`') + 1,
    waiverSource: text,
    whole: text,
  }));
};

// Compiled, not read: a class a component gets from a mixin it includes (`chart-frame`'s `.empty`)
// is in its own stylesheet all the same.
const compileOwn = (source, file) => {
  try {
    return sass.compileString(source, {
      url: pathToFileURL(file),
      loadPaths: [LIB],
      silenceDeprecations: ['import'],
    }).css;
  } catch {
    return source;
  }
};
const ownClassesIn = (dir) => {
  const own = new Set();
  for (const file of readdirSync(dir).map((entry) => join(dir, entry))) {
    if (statSync(file).isDirectory() || /(^|[\\/])_[^\\/]+$/.test(file)) continue;
    let styles = '';
    if (file.endsWith('.scss') || file.endsWith('.css')) {
      styles = compileOwn(readFileSync(file, 'utf8'), file);
    }
    if (file.endsWith('.ts')) {
      styles = [...readFileSync(file, 'utf8').matchAll(/styles:\s*\[?\s*`([\s\S]*?)`/g)]
        .map((match) => compileOwn(match[1], file))
        .join('\n');
    }
    for (const match of withoutComments(styles).matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) own.add(match[1]);
  }
  return own;
};

const violations = [];
const waived = [];
const ownCache = new Map();
for (const file of libFiles.filter(
  (path) =>
    path.startsWith(COMPONENTS) &&
    (path.endsWith('.html') || (path.endsWith('.ts') && !path.endsWith('.spec.ts'))),
)) {
  for (const { text, offset, waiverSource, whole } of templatesOf(file)) {
    const waivers = new Map(
      [...waiverSource.matchAll(TEMPLATE_WAIVER)].map((match) => [match[1], match[2]]),
    );
    const markup = text.replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ' '));
    const used = [
      ...[...markup.matchAll(/(?<![\w.[-])class="([^"]*)"/g)].flatMap((match) =>
        match[1]
          .replace(/\{\{[\s\S]*?\}\}/g, ' ')
          .split(/\s+/)
          .filter(Boolean)
          .map((token) => ({ token, index: match.index })),
      ),
      ...[...markup.matchAll(/\[class\.([\w-]+)\]/g)].map((match) => ({
        token: match[1],
        index: match.index,
      })),
    ];
    const dir = dirname(file);
    if (!ownCache.has(dir)) ownCache.set(dir, ownClassesIn(dir));
    for (const { token, index } of used) {
      const owners = globalClasses.get(token);
      if (!owners || ownCache.get(dir).has(token)) continue;
      const line = lineOf(whole ?? text, offset + index);
      if (waivers.has(token)) {
        waived.push(`${name(file)}:${line} .${token} - ${waivers.get(token)}`);
        continue;
      }
      violations.push(
        `${name(file)}:${line}  class "${token}" is defined only by ${[...owners].join(', ')}, a global ` +
          `partial a consumer may not load. Style it in the component's own stylesheet, or waive it ` +
          `with a comment: component-owned-styles: .${token} <reason>`,
      );
    }
  }
}

for (const { partial, host, selector } of hostRules) {
  violations.push(
    `${partial}  \`${selector}\` targets the host of <${host}> from a global partial, so the rule ` +
      `reaches it only where that partial is loaded. Move it into the component's own stylesheet.`,
  );
}

const BASE_WAIVER = /component-owned-styles:\s*base\s+(\S[^\n]*?)\s*(?:\*\/|$)/m;
for (const file of libFiles.filter(
  (path) => path.startsWith(COMPONENTS) && path.endsWith('.component.scss'),
)) {
  const text = readFileSync(file, 'utf8');
  if (/@include\s+component-base\.rules\b/.test(withoutComments(text))) continue;
  const waiver = text.match(BASE_WAIVER);
  if (waiver) {
    waived.push(`${name(file)} base - ${waiver[1]}`);
    continue;
  }
  violations.push(
    `${name(file)}  does not include \`component-base.rules\`, so its elements take box-sizing, form ` +
      `fonts, heading margins and the base focus ring from whatever the page loads. Add ` +
      `\`@use '../../styles/component-base'; @include component-base.rules;\` first in the file.`,
  );
}

for (const line of [...marked, ...waived]) console.log(`check-component-owned-styles: waived  ${line}`);
if (violations.length > 0) {
  for (const line of violations) console.error(`check-component-owned-styles: ERROR  ${line}`);
  process.exit(1);
}
console.log(
  `check-component-owned-styles: OK - ${globalClasses.size} global classes, ${hosts.size} host ` +
    `selectors, no template or partial crossing them.`,
);
