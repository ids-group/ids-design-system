#!/usr/bin/env node
// The DEFAULT a consumer sees for every public custom property, at two points in history, and the
// difference between them. A rename gate checks names; this reads values, because a release can
// keep every name and still move what renders: 0.13.3's `ds-bar` fill defaults to `--accent`
// where `ds-meter`'s defaulted to `--ds-chart-series-1-color`.
//
// Two sources of a default:
//   * a token: `--x: value;` declared in src/lib/styles or src/lib/themes at `:root`, inside a
//     theme or palette mixin, or under a `[data-*]` / `@media` switch of the root. Each switch is
//     its own entry (`--hit-md (token, [data-density="compact"])`), and the dark theme is one;
//   * a hook: the fallback of `var(--ds-x, <fallback>)` in a component or style-partial
//     stylesheet, the private resolver `--_x: var(--ds-x, <fallback>)` included. That fallback IS
//     what an unset hook renders. A hook read in several places carries every distinct fallback.
//
// Classified as Adobe Spectrum's token diff does: added, deleted, renamed (a deleted and an added
// name with the same default in the same component, or with the same suffix where the component
// itself was renamed), updated (same name, default changed). Values compare as text with notation
// set aside (whitespace, case, colour-function syntax: `canonical`), then with `var()` resolved
// on either side:
//   * text differs, equal within two levels -> `cosmetic` (a fallback rewritten through a private
//     variable that holds the same value, `var(--primary)` -> `var(--accent)` while `--accent`
//     is `var(--primary)`, or a lockstep rename of a private variable inside a value);
//   * text equal, text resolved one level differs -> `updated` at level 1, `via` naming the
//     referenced property whose own value moved (a hook defaulting to `--accent` when `--accent`
//     moved).
// Deeper chains are not followed: a level-2 move shows up on the level-1 property itself, and a
// refactor three levels deep reads as `updated`.
//
//   node tools/token-diff.mjs v0.13.2 v0.13.3        # two tags
//   node tools/token-diff.mjs v0.14.8                # a tag against the working tree
//   node tools/token-diff.mjs v0.13.2 v0.13.3 --json
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readTreeAt } from './check-manifest-truth.mjs';
import { parseVarCall, withoutComments } from './scss-custom-properties.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const display = (value) => value.replace(/\s+/g, ' ').trim();

function closingParen(text, open) {
  let depth = 0;
  for (let index = open; index < text.length; index++) {
    if (text[index] === '(') depth++;
    else if (text[index] === ')' && --depth === 0) return index;
  }
  return text.length;
}

function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '(') depth++;
    else if (text[index] === ')') depth--;
    else if (text[index] === separator && depth === 0) {
      parts.push(text.slice(start, index).trim());
      start = index + 1;
    }
  }
  return [...parts, text.slice(start).trim()];
}

// `hsla(229, 100%, 59%, .5)` and `hsl(229deg 100% 59% / 50%)` are one colour: the legacy comma
// form, the `-a` name, a `deg` hue and a bare alpha are notation.
function canonicalColour(name, inner) {
  let parts = inner.includes(',') ? splitTopLevel(inner, ',') : null;
  if (parts)
    inner =
      parts.length === 4
        ? `${parts.slice(0, 3).join(' ')} / ${parts[3]}`
        : parts.join(' ');
  let [channels, alpha] = splitTopLevel(inner, '/');
  channels = display(channels);
  if (name === 'hsl') channels = channels.replace(/^(-?[\d.]+)deg\b/, '$1');
  if (alpha !== undefined && /^[\d.]+$/.test(alpha))
    alpha = `${Math.round(Number(alpha) * 1000) / 10}%`;
  return `${name}(${channels}${alpha === undefined || alpha === '100%' ? '' : ` / ${alpha}`})`;
}

// Text compared for equality: whitespace, letter case outside strings, quote style, a leading
// zero, a doubled hex digit and colour-function notation are not differences in the default.
export function canonical(value) {
  let text = display(value)
    .replace(/"[^"]*"|'[^']*'|[^"']+/g, (part) =>
      /^['"]/.test(part) ? `"${part.slice(1, -1)}"` : part.toLowerCase(),
    )
    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3\b/g, '#$1$2$3')
    .replace(/(?<![\w.])\.(\d)/g, '0.$1')
    .replace(/(?<![\w-])white(?![\w-])/g, '#fff')
    .replace(/(?<![\w-])black(?![\w-])/g, '#000');
  const colour = /\b(rgb|hsl)a?\(/g;
  let match;
  while ((match = colour.exec(text))) {
    const open = match.index + match[0].length - 1;
    const close = closingParen(text, open);
    const replaced = canonicalColour(
      match[1],
      canonical(text.slice(open + 1, close)),
    );
    text = text.slice(0, match.index) + replaced + text.slice(close + 1);
    colour.lastIndex = match.index + replaced.length;
  }
  return text.replace(/\s*([(),:/])\s*/g, '$1');
}

// A root switch, never a component rule: `.page-grid` and `ds-badge[data-status]` set a property
// on one element, which is a rule and not a default. A mixin counts only without parameters, as
// the theme and palette mixins are: `family-vars($family)` is included on an element that picked
// a colour family, so what it declares is that element's value, not the default.
const ROOT_PRELUDE = /^(?::root\b.*|\[data-[^\]]*\]|@mixin [\w-]+|@media\b.*)$/;

// Every `--name: value;` with the chain of block preludes around it, `#{…}` interpolation kept
// inside the prelude or value it belongs to.
function declarations(text) {
  const found = [];
  const preludes = [];
  let buffer = '';
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '{' && text[index - 1] !== '#') {
      preludes.push(display(buffer));
      buffer = '';
    } else if (character === '}' && !/#\{[^}]*$/.test(buffer)) {
      preludes.pop();
      buffer = '';
    } else if (character === ';') {
      const match = /^\s*(--[a-z0-9_-]+)\s*:([\s\S]*)$/i.exec(buffer);
      if (match)
        found.push({
          name: match[1],
          value: display(match[2]),
          preludes: [...preludes],
        });
      buffer = '';
    } else buffer += character;
  }
  return found;
}

function rootContext(path, preludes) {
  if (!preludes.every((prelude) => ROOT_PRELUDE.test(prelude))) return null;
  const switches = preludes.filter(
    (prelude) => !/^@mixin\b/.test(prelude) && prelude !== ':root',
  );
  if (path.includes('/themes/dark/')) switches.unshift('dark theme');
  return switches.join(' ');
}

export function defaultsOf(files) {
  const entries = new Map();
  const locals = new Map();
  const roots = new Map();
  const partials = new Map();
  const record = (key, fields, value, path) => {
    const entry = entries.get(key) ?? {
      ...fields,
      groups: new Set(),
      values: new Map(),
    };
    entries.set(key, entry);
    entry.groups.add(fields.group);
    if (!entry.values.has(value)) entry.values.set(value, path);
  };
  for (const file of files) {
    const path = file.path.replaceAll('\\', '/');
    if (!path.endsWith('.scss')) continue;
    const component = /^src\/lib\/components\/([^/]+)\//.exec(path)?.[1];
    const globalSource = /^src\/lib\/(?:styles|themes)\//.test(path);
    if (!component && !globalSource) continue;
    const text = withoutComments(file.text.replaceAll('\r\n', '\n'));

    const fileLocals = new Map();
    locals.set(path, fileLocals);
    for (const { name, value, preludes } of declarations(text)) {
      if (!fileLocals.has(name)) fileLocals.set(name, value);
      if (globalSource && !partials.has(name)) partials.set(name, value);
      if (!globalSource || name.startsWith('--_')) continue;
      const context = rootContext(path, preludes);
      if (context === null) continue;
      if (!context && !roots.has(name)) roots.set(name, { value, path });
      record(
        `token ${name} ${context}`,
        { name, kind: 'token', group: context || 'root' },
        value,
        path,
      );
    }

    const group =
      component ??
      path
        .split('/')
        .at(-1)
        .replace(/^_|\.scss$/g, '');
    let index = 0;
    // Advanced past `var(` rather than past the call, so a hook read inside another hook's
    // fallback is collected too.
    while ((index = text.indexOf('var(', index)) !== -1) {
      const { name, fallback } = parseVarCall(text, index);
      index += 4;
      if (!/^--ds-[a-z0-9-]+$/.test(name)) continue;
      record(
        `hook ${name}`,
        { name, kind: 'hook', group },
        fallback ? display(fallback) : '(none)',
        path,
      );
    }
  }
  // A read with no fallback renders the root declaration of the same name, so that is its
  // default: rewriting `var(--ds-x)` as `var(--ds-x, <what :root says>)` changes nothing. With
  // no root declaration it defaults to nothing of its own, and beside a read that does carry a
  // fallback it is the same hook passed through (`--_x: var(--ds-x)` under a rule that sets it).
  for (const entry of entries.values()) {
    if (entry.kind !== 'hook' || !entry.values.has('(none)')) continue;
    const declared = roots.get(entry.name);
    if (declared === undefined && entry.values.size === 1) continue;
    entry.values.delete('(none)');
    if (declared !== undefined && !entry.values.has(declared.value))
      entry.values.set(declared.value, declared.path);
  }
  return {
    entries,
    locals,
    roots: new Map([...roots].map(([name, { value }]) => [name, value])),
    partials,
    contextual: new Set(
      [...entries.values()]
        .filter((entry) => entry.kind === 'token' && entry.group !== 'root')
        .map((entry) => entry.name),
    ),
  };
}

const declaration = (name, path, side) =>
  side.locals.get(path)?.get(name) ??
  side.roots.get(name) ??
  side.partials.get(name);

// A hook nobody declares renders its fallback, so `var(--ds-field-border-color, X)` IS `X` until
// a consumer sets it. Unwrapping that is not a level of resolution: no declaration is read.
function unsetHooks(value, path, side) {
  for (;;) {
    const read = /^var\((--ds-[a-z0-9-]+)\s*,/.exec(value);
    if (!read || declaration(read[1], path, side) !== undefined) return value;
    const { fallback, endIndex } = parseVarCall(value, 0);
    if (endIndex !== value.length) return value;
    value = fallback;
  }
}

// One level: each top-level `var(--a…)` in the value becomes what `--a` is declared as, in the
// same file first, at the root second, and in a style partial third (a private `--_x` a mixin
// declares for the component that includes it); an undeclared one becomes its own fallback.
function resolveOnce(value, path, side) {
  const used = new Map();
  let text = '';
  let at = 0;
  let index;
  while ((index = value.indexOf('var(', at)) !== -1) {
    const { name, fallback, endIndex } = parseVarCall(value, index);
    const declared = declaration(name, path, side);
    const target =
      declared !== undefined
        ? unsetHooks(declared, path, side)
        : fallback || null;
    text += value.slice(at, index) + (target ?? value.slice(index, endIndex));
    if (target !== null) used.set(name, target);
    at = endIndex;
  }
  return { text: unsetHooks(text + value.slice(at), path, side), used };
}

const label = (entry) =>
  entry.kind === 'hook'
    ? `hook in ${[...entry.groups].sort().join(', ')}`
    : `token, ${entry.group}`;
const valuesText = (entry) => [...entry.values.keys()].sort().join(' | ');

// `same`: equal as written, notation aside. `resolvedSame`: every old value meets a new one at
// most two levels of `var()` apart, on either side, so `var(--primary)` -> `var(--accent)` holds
// while `--accent` is declared as `var(--primary)`. `via`: the properties whose declaration moved.
function compare(old, oldSide, current, currentSide) {
  const texts = (values) => values.map(canonical).sort().join('|');
  // Two depths meet when their text is equal AND they resolved through the same properties that
  // have a context of their own: the root value of `--neutral-0` equals `--static-white`, its
  // `[data-neutrals='brand']` one does not, while two reads of `--ds-control-focus-shadow` agree
  // under every `data-focus`.
  const forms = (entry, side) =>
    [...entry.values].map(([value, path]) => {
      const resolved = resolveOnce(value, path, side);
      const second = resolveOnce(resolved.text, path, side);
      const once = [...resolved.used.keys()];
      const depth = (text, through) =>
        `${canonical(text)}\n${[...new Set(through)]
          .filter((name) => side.contextual.has(name))
          .sort()
          .join()}`;
      return {
        raw: canonical(value),
        resolved: canonical(resolved.text),
        depths: [
          depth(value, []),
          depth(resolved.text, once),
          depth(second.text, [...once, ...second.used.keys()]),
        ],
        used: resolved.used,
        path,
      };
    });
  const oldForms = forms(old, oldSide);
  const newForms = forms(current, currentSide);
  const meets = (a, b) => a.depths.some((depth) => b.depths.includes(depth));
  // Both directions rather than one-to-one: the values are a SET, and two fallbacks rewritten to
  // the same text collapse into one.
  const everyValueMeetsOne =
    oldForms.every((form) => newForms.some((other) => meets(form, other))) &&
    newForms.every((form) => oldForms.some((other) => meets(other, form)));
  // A referenced property counts only when ITS move is real: `--primary-on` going from
  // `var(--static-white)` to `white` moves nothing for the tokens that read it.
  const via = new Set();
  for (const { used, path } of oldForms)
    for (const [name, target] of used) {
      const now = newForms.find((form) => form.used.has(name))?.used.get(name);
      if (now === undefined) {
        via.add(name);
        continue;
      }
      const was = canonical(target);
      const is = canonical(now);
      const wasResolved = canonical(resolveOnce(target, path, oldSide).text);
      const isResolved = canonical(resolveOnce(now, path, currentSide).text);
      if (
        ![is, isResolved].includes(was) &&
        ![is, isResolved].includes(wasResolved)
      )
        via.add(name);
    }
  const same =
    texts([...old.values.keys()]) === texts([...current.values.keys()]);
  return {
    written:
      [...old.values.keys()].join('|') === [...current.values.keys()].join('|'),
    same,
    // An unchanged text meets itself, so there only the resolved forms decide.
    resolvedSame: same
      ? texts(oldForms.map((form) => form.resolved)) ===
        texts(newForms.map((form) => form.resolved))
      : everyValueMeetsOne,
    via: [...via].sort(),
  };
}

// The verdict on one pair of defaults, or null when nothing a consumer renders could differ.
function classify(verdict) {
  if (verdict.same && verdict.resolvedSame)
    return verdict.written
      ? null
      : { level: 0, cosmetic: 'notation only', via: [] };
  if (verdict.same)
    return verdict.via.length
      ? { level: 1, cosmetic: null, via: verdict.via }
      : { level: 1, cosmetic: 'what it reads moved in notation only', via: [] };
  if (verdict.resolvedSame)
    return {
      level: 0,
      cosmetic: 'equal within two levels of var() resolution',
      via: [],
    };
  return { level: 0, cosmetic: null, via: [] };
}

export function diffDefaults(before, after) {
  const changes = [];
  const namesAfter = new Set(
    [...after.entries.values()].map((entry) => entry.name),
  );
  const namesBefore = new Set(
    [...before.entries.values()].map((entry) => entry.name),
  );

  for (const [key, old] of before.entries) {
    const current = after.entries.get(key);
    if (!current) continue;
    const verdict = classify(compare(old, before, current, after));
    if (!verdict) continue;
    changes.push({
      change: 'updated',
      name: old.name,
      kind: old.kind,
      where: label(current),
      before: valuesText(old),
      after: valuesText(current),
      ...verdict,
    });
  }
  // A key on one side only whose name the other side still declares is a context that came or
  // went (`dark theme`, `[data-density="compact"]`, a changed `@media` prelude): the name lives
  // on, so that context's default was updated from or to nothing.
  const contextOnly = (side, other, names) =>
    [...side.entries]
      .filter(
        ([key, entry]) => !other.entries.has(key) && names.has(entry.name),
      )
      .map(([, entry]) => entry);
  const contextChange = (entry, beforeText, afterText) =>
    changes.push({
      change: 'updated',
      name: entry.name,
      kind: entry.kind,
      where: label(entry),
      before: beforeText,
      after: afterText,
      level: 0,
      cosmetic: null,
      via: [],
    });
  for (const old of contextOnly(before, after, namesAfter))
    contextChange(old, valuesText(old), '(none)');
  for (const current of contextOnly(after, before, namesBefore))
    contextChange(current, '(none)', valuesText(current));

  const gone = [...before.entries.values()].filter(
    (entry) => !namesAfter.has(entry.name),
  );
  const fresh = [...after.entries.values()].filter(
    (entry) => !namesBefore.has(entry.name),
  );
  const groupsBefore = new Set(
    [...before.entries.values()].flatMap((entry) => [...entry.groups]),
  );
  const groupsAfter = new Set(
    [...after.entries.values()].flatMap((entry) => [...entry.groups]),
  );
  const suffix = (entry) => {
    const group = [...entry.groups][0];
    return entry.name.startsWith(`--ds-${group}-`)
      ? entry.name.slice(`--ds-${group}-`.length)
      : null;
  };
  const paired = new Set();
  const pair = (old, current) => {
    paired.add(old).add(current);
    const verdict = classify(compare(old, before, current, after));
    changes.push({
      change: 'renamed',
      name: current.name,
      from: old.name,
      kind: current.kind,
      where: label(current),
      before: valuesText(old),
      after: valuesText(current),
      level: verdict?.level ?? 0,
      cosmetic: verdict?.cosmetic ?? null,
      defaultChanged: Boolean(verdict && !verdict.cosmetic),
      via: verdict?.via ?? [],
    });
  };
  // Same component, the same default, and a first or last name segment in common, and only where
  // the match is unique: across all of :root a value like `320px` pairs `--search-maxw` with
  // `--drawer-w-sm`.
  const segments = (name) => name.replace(/^--(?:ds-)?/, '').split('-');
  const related = (a, b) =>
    segments(a)[0] === segments(b)[0] ||
    segments(a).at(-1) === segments(b).at(-1);
  for (const old of gone) {
    const sameSlot = (entry) =>
      entry.kind === old.kind &&
      [...entry.groups].sort().join() === [...old.groups].sort().join() &&
      valuesText(entry) === valuesText(old) &&
      related(entry.name, old.name);
    const candidates = fresh.filter(
      (entry) => !paired.has(entry) && sameSlot(entry),
    );
    if (candidates.length === 1 && gone.filter(sameSlot).length === 1)
      pair(old, candidates[0]);
  }
  // A renamed component takes its hooks with it: `--ds-meter-fill-color` -> `--ds-bar-fill-color`.
  for (const old of gone) {
    if (paired.has(old) || old.kind !== 'hook' || old.groups.size !== 1)
      continue;
    const [oldGroup] = old.groups;
    if (groupsAfter.has(oldGroup) || suffix(old) === null) continue;
    const match = fresh.find(
      (entry) =>
        !paired.has(entry) &&
        entry.kind === 'hook' &&
        entry.groups.size === 1 &&
        !groupsBefore.has([...entry.groups][0]) &&
        suffix(entry) === suffix(old),
    );
    if (match) pair(old, match);
  }
  for (const entry of gone.filter((entry) => !paired.has(entry)))
    changes.push({
      change: 'deleted',
      name: entry.name,
      kind: entry.kind,
      where: label(entry),
      before: valuesText(entry),
      after: null,
      level: 0,
      cosmetic: null,
      via: [],
    });
  for (const entry of fresh.filter((entry) => !paired.has(entry)))
    changes.push({
      change: 'added',
      name: entry.name,
      kind: entry.kind,
      where: label(entry),
      before: null,
      after: valuesText(entry),
      level: 0,
      cosmetic: null,
      via: [],
    });

  const order = ['updated', 'deleted', 'renamed', 'added'];
  return changes.sort(
    (a, b) =>
      order.indexOf(a.change) - order.indexOf(b.change) ||
      a.name.localeCompare(b.name),
  );
}

function workingTreeFiles() {
  const files = [];
  const crawl = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full);
      else if (item.name.endsWith('.scss'))
        files.push({
          path: relative(ROOT, full),
          text: readFileSync(full, 'utf8'),
        });
    }
  };
  crawl(join(ROOT, 'src/lib'));
  return files;
}

const defaultsCache = new Map();
// `null` is the working tree.
export function defaultsAt(ref) {
  if (defaultsCache.has(ref)) return defaultsCache.get(ref);
  const files = ref === null ? workingTreeFiles() : readTreeAt(ref);
  const defaults = files ? defaultsOf(files) : null;
  defaultsCache.set(ref, defaults);
  return defaults;
}

export function tokenDiff(beforeRef, afterRef) {
  const before = defaultsAt(beforeRef);
  const after = defaultsAt(afterRef);
  if (!before || !after)
    throw new Error(
      `token-diff: cannot read src/lib at ${!before ? beforeRef : (afterRef ?? 'the working tree')}`,
    );
  return diffDefaults(before, after);
}

export function describe(change) {
  const where = `(${change.where})`;
  if (change.change === 'added')
    return `${change.name} ${where}: ${change.after}`;
  if (change.change === 'deleted')
    return `${change.name} ${where}: was ${change.before}`;
  if (change.change === 'renamed')
    return (
      `${change.from} -> ${change.name} ${where}` +
      (change.defaultChanged
        ? `, default ${change.before} -> ${change.after}`
        : change.cosmetic
          ? `, default ${change.before} -> ${change.after} [cosmetic: ${change.cosmetic}]`
          : `: ${change.after}`)
    );
  const how = change.cosmetic
    ? ` [cosmetic: ${change.cosmetic}]`
    : change.level === 1
      ? ` [level 1: via ${change.via.join(', ')}]`
      : '';
  return `${change.name} ${where}: ${change.before} -> ${change.after}${how}`;
}

function main() {
  const argv = process.argv.slice(2);
  const refs = argv.filter((argument) => !argument.startsWith('--'));
  if (refs.length < 1 || refs.length > 2) {
    console.error(
      'usage: node tools/token-diff.mjs <before-tag> [<after-tag>] [--json]',
    );
    return 1;
  }
  const changes = tokenDiff(refs[0], refs[1] ?? null);
  if (argv.includes('--json')) {
    console.log(JSON.stringify(changes, null, 2));
    return 0;
  }
  for (const kind of ['updated', 'deleted', 'renamed', 'added']) {
    const listed = changes.filter((change) => change.change === kind);
    console.log(`\n${kind} (${listed.length})`);
    for (const change of listed) console.log(`  ${describe(change)}`);
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
