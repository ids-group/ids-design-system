#!/usr/bin/env node
// Static attributes on ds-* elements that no input of that component answers to.
//
// Only STATIC ones. A wrong [binding] or (event) fails the build; a wrong plain attribute is the
// silent case — Angular leaves it on the DOM and the input keeps its default. That is how
// fill="ghost" rendered three ghost buttons as solid primary for however long.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const src = readFileSync(
  'ds-docs/src/app/shared/component-api.generated.ts',
  'utf8',
);
const open = src.indexOf('{', src.indexOf('COMPONENT_API'));
let depth = 0;
let end = open;
for (let i = open; i < src.length; i += 1) {
  const c = src[i];
  if (c === '{') depth += 1;
  else if (c === '}') {
    depth -= 1;
    if (!depth) {
      end = i;
      break;
    }
  }
}
const api = JSON.parse(src.slice(open, end + 1));

const allowed = new Map();
for (const entry of Object.values(api)) {
  for (const sel of String(entry.selector ?? '')
    .split(',')
    .map((s) => s.trim().replace(/[[\]]/g, ''))) {
    if (!sel.startsWith('ds-')) continue;
    const set = allowed.get(sel) ?? new Set();
    for (const i of entry.inputs ?? []) set.add(i.name);
    allowed.set(sel, set);
  }
}

// The platform's own vocabulary, plus `type`/`disabled`, which a host element answers to even
// where no input declares them. Anything short of the whole list accuses correct markup.
const GLOBAL = new Set([
  'accesskey',
  'autocapitalize',
  'autocorrect',
  'autofocus',
  'class',
  'contenteditable',
  'dir',
  'draggable',
  'enterkeyhint',
  'exportparts',
  'hidden',
  'id',
  'inert',
  'inputmode',
  'is',
  'itemid',
  'itemprop',
  'itemref',
  'itemscope',
  'itemtype',
  'lang',
  'nonce',
  'part',
  'popover',
  'role',
  'slot',
  'spellcheck',
  'style',
  'tabindex',
  'title',
  'translate',
  'writingsuggestions',
  'type',
  'disabled',
]);
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }

  return out;
};

// The two other things a bare attribute can legitimately be: a projection slot the component's own
// template selects on, and an attribute-selector directive. Read from the library, not listed here,
// or the check becomes a second opinion about the surface.
const slots = new Set();
for (const file of walk('src/lib')) {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.html')) {
    for (const m of text.matchAll(/select="\[([\w-]+)\]"/g)) slots.add(m[1]);
  }
  // A styling hook is a contract too: field-group takes the slack with `::ng-deep > [grow]` and
  // documents it. Only hooks reached through a combinator count — every `[attr]` in a stylesheet
  // would hand back `label`, `hint`, `size` and `icon`, which are real input names, and the check
  // would then wave them through on any element that does not have them.
  if (file.endsWith('.scss')) {
    for (const m of text.matchAll(
      /(?:::ng-deep\s*>?\s*|>\s*)\[([a-z][\w-]*)\]/g,
    ))
      slots.add(m[1]);
  }
  if (file.endsWith('.ts')) {
    for (const m of text.matchAll(/selector:\s*'([^']*)'/g)) {
      for (const s of m[1].split(',')) {
        const attr = s.trim().match(/^\[([\w-]+)\]$/);
        if (attr) slots.add(attr[1]);
      }
    }
  }
}

const bad = [];
for (const file of walk('ds-docs/src/app').filter((f) => f.endsWith('.html'))) {
  const text = readFileSync(file, 'utf8');
  for (const tag of text.matchAll(
    /<(ds-[a-z0-9-]+)((?:[^>"']|"[^"]*"|'[^']*')*?)\/?>/g,
  )) {
    const set = allowed.get(tag[1]);
    if (!set) continue;
    // Values out first, so `[(value)]="owner"` cannot leave `owner` looking like an attribute.
    const names = tag[2]
      .replace(/\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
    for (const name of names) {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) continue;
      if (/^(data|aria|ng|ds)[-A-Z]/.test(name) || name.startsWith('ng'))
        continue;
      if (GLOBAL.has(name) || set.has(name)) continue;
      if (slots.has(name)) continue;
      bad.push(`${file.replace(/.*app./, '')}: <${tag[1]}> ${name}`);
    }
  }
}
if (bad.length) {
  console.error(
    `✗ ${bad.length} static attribute(s) on a ds-* element that nothing answers to:`,
  );
  for (const line of bad) console.error(`    ${line}`);
  console.error('');
  console.error(
    'Each is silent at runtime: Angular leaves the attribute on the DOM and the input',
  );
  console.error(
    'keeps its default. Check the name against the component API table.',
  );
  process.exit(1);
}
console.log(
  'check-docs-attrs: OK — every static attribute on a ds-* element is an input, a slot or a directive',
);
