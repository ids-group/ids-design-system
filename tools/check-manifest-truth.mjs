#!/usr/bin/env node
// Every other manifest check reads the JSON. This one reads the TREE, at the boundary the manifest
// describes: `migrations/X.json` is checked against `v<prev>..vX`, never against HEAD. An item can
// be perfectly shaped and still name a token that never existed — 0.2.0 shipped that.
//
// Three claims per item, and each one is a different way of being wrong:
//   * `old` must resolve at v<prev>            — or there is nothing to migrate FROM
//   * `old` must be GONE at vX, for a rename or a removal   — or the change did not happen
//   * `new` must resolve at vX                 — or the target does not exist
//
// Resolution has to be STRUCTURAL rather than textual: `variant` as a bare word lives on a dozen
// components, and an item that renames one of `ds-tabs`'s OUTPUTS leaves the element itself in
// place. So each tag is parsed into a surface — selectors with their inputs and outputs, exported
// symbols, custom properties, CSS class names — and `ds-tabs[tabClose]` is asked of `ds-tabs`.
//
//   node tools/check-manifest-truth.mjs             # every published manifest
//   node tools/check-manifest-truth.mjs 0.11.4      # one of them
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { previousBoundary, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ONLY = process.argv
  .slice(2)
  .find((arg) => /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?|unreleased)$/.test(arg));

const git = (args) =>
  execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'ignore'],
  });

// Guarded because this module is IMPORTED by check-manifest-coverage, which runs in `lint:all`
// and in the PR gate where this one does not. Unguarded, a checkout without git turned that
// gate's verdict into a node stack trace from a file it never asked to run.
const tags = (() => {
  // Overridable so the selftest can simulate the shallow clone CI actually makes: with 15 of 28
  // tags present, half the manifests are unreadable, and the branch that says so had no coverage.
  if (process.env.DS_TRUTH_TAGS)
    return process.env.DS_TRUTH_TAGS.split(',').filter(Boolean);
  return releaseTags(ROOT);
})();

// One `git cat-file --batch` per tag, not one `git show` per file: a tag's surface is ~400 files
// and the per-spawn cost dominates everything else. Nothing is written to disk.
export function readTreeAt(
  tag,
  pathspecs = ['src/lib'],
  keep = (path) => /\.(ts|scss|html)$/.test(path) && !path.endsWith('.spec.ts'),
) {
  let paths;
  try {
    paths = git(['ls-tree', '-r', '--name-only', tag, '--', ...pathspecs])
      .split('\n')
      .filter(keep);
  } catch {
    return null;
  }
  if (!paths.length) return null;

  // No `encoding`, so the result is a Buffer: the record headers carry byte sizes, and decoding
  // the whole stream as utf8 first would shift every offset on any multi-byte character.
  const batch = execFileSync('git', ['-C', ROOT, 'cat-file', '--batch'], {
    input: Buffer.from(
      paths.map((path) => `${tag}:${path}`).join('\n') + '\n',
      'utf8',
    ),
    maxBuffer: 1 << 28,
    stdio: ['pipe', 'pipe', 'ignore'],
  });

  // Each record is `<oid> <type> <size>\n<contents>\n`, so the size header is what walks the buffer.
  const files = [];
  let at = 0;
  for (const path of paths) {
    const newline = batch.indexOf(10, at);
    const header = newline === -1 ? '' : batch.toString('utf8', at, newline);
    const size = Number(header.split(' ')[2]);
    // Bailing out quietly here truncates the tag's surface, and a truncated surface is what a
    // removal claim wants to see: `old` reads as gone because the file holding it was dropped.
    if (newline === -1 || !Number.isFinite(size))
      throw new Error(
        `check-manifest-truth: cat-file gave no readable record for ${tag}:${path} ` +
          `(${files.length} of ${paths.length} read). The surface would be short, and a ` +
          'removal claim passes against a short surface.',
      );
    const start = newline + 1;
    files.push({ path, text: batch.toString('utf8', start, start + size) });
    at = start + size + 1;
  }
  return files;
}

const DECL =
  /^export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

const surfaceCache = new Map();
export function surfaceAt(tag) {
  if (surfaceCache.has(tag)) return surfaceCache.get(tag);
  const files = readTreeAt(tag);
  if (!files) return null;
  const surface = buildSurface(files);
  surfaceCache.set(tag, surface);
  return surface;
}

// The same parser over the files on disk. `migrations/unreleased.json` describes the boundary
// between the last tag and HEAD, so the AFTER side of it is the working tree and not a tag.
export function surfaceOfWorkingTree() {
  const files = [];
  const crawl = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full);
      else if (
        /\.(ts|scss|html)$/.test(item.name) &&
        !item.name.endsWith('.spec.ts')
      )
        files.push({ path: full, text: readFileSync(full, 'utf8') });
    }
  };
  try {
    crawl(join(ROOT, 'src/lib'));
  } catch {
    return null;
  }
  return files.length ? buildSurface(files) : null;
}

function buildSurface(files) {
  const tokens = new Set();
  const symbols = new Set();
  const classes = new Set();
  const elements = new Map();
  const classOwn = new Map();
  const classParent = new Map();
  const elementClass = new Map();
  const tokenPrefixes = new Set();
  const directives = new Set();

  for (const { path: file, text } of files) {
    for (const match of text.matchAll(/--[a-z][a-z0-9-]*/g))
      if (!match[0].endsWith('-')) tokens.add(match[0]);

    // A name cut off by interpolation — `--bp-#{$name}`, `--focus-ring-#{$family}` — reads as a
    // trailing hyphen and is dropped above, so the whole family is missing from the surface and
    // an honest item naming a member is accused of migrating from nowhere. Two answers, in order:
    // expand the loop where its keys are in the same file, and otherwise remember the PREFIX so
    // the member is set aside as unresolvable rather than declared absent.
    for (const interpolated of text.matchAll(
      /(--[a-z][a-z0-9-]*-)#\{\$([a-z][a-z0-9-]*)\}/g,
    )) {
      const [, prefix, variable] = interpolated;
      tokenPrefixes.add(prefix);
      const loop = new RegExp(
        `@each\\s+\\$${variable}\\s*(?:,[^)]*?)?\\s+in\\s+\\$([a-z][a-z0-9-]*)`,
      ).exec(text);
      if (!loop) continue;
      const map = new RegExp(
        `\\$${loop[1]}\\s*:\\s*\\(([\\s\\S]*?)\\n\\s*\\);`,
      ).exec(text);
      if (!map) continue;
      for (const key of map[1].matchAll(/'([a-z0-9]+)'\s*:/gi))
        tokens.add(`${prefix}${key[1]}`);
    }
    // `[class.expanded]` puts a class on the element as surely as `class="expanded"` does, and
    // a component's own host classes are declared that way in its .ts, not in its template.
    for (const bound of text.matchAll(/\[class\.([a-z][a-z0-9-]*)\]/g))
      classes.add(bound[1]);
    if (!file.endsWith('.ts')) {
      // Two precise readings rather than one loose one. A template's `items().length,` and a
      // comment naming `input.component.scss` both match a bare `.name` pattern, and a
      // `class-rename` claiming a class that never existed would resolve against that noise.
      if (file.endsWith('.scss'))
        // A selector chain starts at a non-word boundary, which is what separates `.a.b` (two
        // classes) from `focus.outline-indicator` and `map.get` (a namespaced member, and never a
        // class). Matching the chain and splitting it keeps the second half of `.a.b`, which a
        // plain lookbehind on each dot would throw away. What may FOLLOW a class is anything at
        // all, including the `)` of `:host(.bordered)`.
        for (const chain of text
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|\s)\/\/.*$/gm, '$1')
          .matchAll(/(?<![\w.-])((?:\.[a-z][a-z0-9-]*)+)(?!\()/g))
          for (const name of chain[1].split('.').filter(Boolean))
            classes.add(name);
      else
        for (const attribute of text.matchAll(/\bclass="([^"]*)"/g))
          for (const name of attribute[1].split(/\s+/))
            if (/^[a-z][a-z0-9-]*$/.test(name)) classes.add(name);
      continue;
    }
    for (const decl of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DECL))
      symbols.add(decl[1]);

    // Every signal-based member a template can bind, indexed by the class that declares it, not
    // by the file: a field's `error`, `hint` and `touched` live on DsFieldBase in another file
    // entirely, and reading only the file with the `selector:` lost 139 real bindings across 16
    // elements. `alias` forms count under the alias, which is what a consumer writes.
    // Sliced per class, not per file: `control-value-accessor.ts` declares two of them, and
    // taking the first match dropped the second's `extends` edge — which is the link a checkbox
    // walks to reach `touched`.
    // The header is read separately from the name. Written as one optional group, a lazy match
    // skips `extends` whenever it sits on its own line — which is exactly how the field bases
    // are written, so every one of their subclasses lost its parent link.
    const declarations = [
      ...text.matchAll(
        /export\s+(?:abstract\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/g,
      ),
    ];
    const memberSets = declarations.map((declaration, at) => {
      const from = declaration.index;
      const to = declarations[at + 1]?.index ?? text.length;
      const slice = text.slice(from, to);
      // The generic parameter list comes off first, by angle depth. `TableComponent<T extends
      // object>` otherwise reads `object` as its superclass, and `<T extends { id: string }>`
      // puts a brace before the class body so the header truncates mid-constraint. Both are
      // silent: the chain is simply dropped, and every inherited binding reads as a phantom.
      let header = '';
      let depth = 0;
      for (const character of slice) {
        if (character === '<') depth++;
        else if (character === '>') depth = Math.max(0, depth - 1);
        else if (depth === 0) {
          if (character === '{') break;
          header += character;
        }
      }
      const parent = /\bextends\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(header);
      if (parent) declaration[2] = parent[1];
      const own = new Set();
      for (const member of slice.matchAll(
        /(?:readonly\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(input|output|model)(?:\.required)?\s*[<(]/g,
      )) {
        own.add(member[1]);
        // A `model()` also publishes `<name>Change`, which Angular generates and no source line
        // declares — `ds-pagination[currentPageChange]` is a real binding with nothing to grep.
        if (member[2] === 'model') own.add(`${member[1]}Change`);
      }
      classOwn.set(declaration[1], own);
      if (declaration[2]) classParent.set(declaration[1], declaration[2]);
      return own;
    });

    // The decorator sits ABOVE its class, so these belong to the first one declared.
    const first = memberSets[0];
    if (first) {
      for (const alias of text.matchAll(/alias:\s*'([^']+)'/g))
        first.add(alias[1]);
      // A hostDirective's declared inputs are bindable on the host element and appear in no
      // `input()` line of its own — `ds-modal[staticPreview]` is one.
      for (const host of text.matchAll(/inputs:\s*\[([^\]]*)\]/g))
        for (const name of host[1].matchAll(/'([A-Za-z_][A-Za-z0-9_]*)'/g))
          first.add(name[1]);
    }

    for (const block of text.matchAll(/selector:\s*'([^']+)'/g)) {
      for (const part of block[1].split(',')) {
        // An attribute directive is written on someone else's element, so it is a name a consumer
        // puts THERE — `ds-table dsTableExport`. Without it the surface knows only the component's
        // own inputs, and an item whose `new` is a directive was accused of naming a member that
        // does not exist on the element it sits on.
        const attribute =
          /^\s*(?:[a-z][a-z0-9-]*)?\[([A-Za-z][A-Za-z0-9]*)\]\s*$/.exec(part);
        if (attribute) {
          directives.add(attribute[1]);
          continue;
        }
        const tag_ = /^\s*([a-z][a-z0-9-]*)\s*$/.exec(part);
        if (!tag_) continue;
        elements.set(tag_[1], first ?? new Set());
        if (declarations.length) elementClass.set(tag_[1], declarations[0][1]);
      }
    }
  }

  for (const [tag_, className] of elementClass) {
    const members = new Set(elements.get(tag_));
    for (
      let parent = classParent.get(className), guard = 0;
      parent && guard < 20;
      parent = classParent.get(parent), guard++
    )
      for (const name of classOwn.get(parent) ?? []) members.add(name);
    elements.set(tag_, members);
  }

  const partials = new Set();
  const keyframes = new Set();
  for (const { path: file, text } of files) {
    for (const match of text.matchAll(/@keyframes\s+([a-z][a-z0-9-]*)/g))
      keyframes.add(match[1]);
    const partial =
      /src\/lib\/((?:styles|themes)\/(?:[\w-]+\/)*)_?([\w-]+)\.scss$/.exec(
        file.replace(/\\/g, '/'),
      );
    if (!partial) continue;
    partials.add(`${partial[1]}${partial[2]}`);
    if (partial[2] === 'index') partials.add(partial[1].replace(/\/$/, ''));
  }

  return {
    tokens,
    symbols,
    classes,
    elements,
    tokenPrefixes,
    directives,
    partials,
    keyframes,
  };
}

function claims(value) {
  if (typeof value !== 'string' || !value.trim()) return [];
  const text = value.trim();
  const openingTag = /^<(ds-[a-z0-9]+(?:-[a-z0-9]+)*)\s*\/?>$/.exec(text);
  if (openingTag) return [{ kind: 'element', name: openingTag[1], bare: true }];
  const family = familyClaims(text);
  if (family) return family;
  const lines = text.split('\n').map((line) => line.trim());
  const partials = lines.map(
    (line) =>
      /^@use\s+'@ids-group-ltd\/ids-design-system\/((?:styles|themes)\/[a-z0-9/-]+)'(?:\s+as\s+[\w-]+)?;?$/.exec(
        line,
      )?.[1],
  );
  if (
    partials[0] &&
    lines.every((line, index) => partials[index] || /^@include\s/.test(line))
  )
    return partials
      .filter(Boolean)
      .map((name) => ({ kind: 'partial', name, bare: false }));
  // A family placeholder is not one name; a spaced `>` is a child combinator, not a placeholder.
  if (/[*<]|\.\.\.|\S>|>\S/.test(text)) return [];

  // `bare` marks a value that IS the identifier, as opposed to one lifted out of a sentence.
  // Only a bare claim can be asked to have disappeared: `class MyTable extends TableComponent`
  // mentions TableComponent, but the item removes a member of it, not the class.
  // The value form too — `ds-button[variant=outline]` names the same input as `ds-button[variant]`.
  // `data-*` is excluded: the component writes those itself, so they are not inputs to resolve.
  const attr =
    /^([a-z][\w-]*)\[([\w-]+)(?:\s*[~|^$*]?=\s*['"]?[^\]'"]*['"]?)?\]$/.exec(
      text,
    );
  if (attr && !attr[2].startsWith('data-'))
    return [{ kind: 'member', element: attr[1], name: attr[2], bare: true }];

  // A custom element is a claim in its own right: `ds-bottom-sheet` was reaching none of the
  // branches below and passed unchecked, as did 127 other values. The `ds-` prefix is what keeps
  // it to elements: every element this library publishes carries it, and without it any
  // hyphenated value — `data-density`, `aria-expanded`, an input alias like `menu-items` — is
  // looked up among elements, found missing, and accused of migrating from nowhere.
  const bareTag = /^(ds-[a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(text);
  if (bareTag) return [{ kind: 'element', name: bareTag[1], bare: true }];

  const found = [];
  // A value that is NOTHING BUT tokens and separators is a list of bare claims, not prose. Read
  // per-value, one item listing five renamed toast tokens made every claim non-bare, so the
  // "gone at the new tag" half — the half that proves the rename happened — was skipped for all
  // five. `TableComponent.sortKey.set()` is not a list and stays exempt, which is the case the
  // bare/non-bare distinction exists for.
  const listOnly =
    text.replace(/--[a-z][a-z0-9-]*/g, '').replace(/[\s,/|]+/g, '').length ===
    0;
  for (const match of text.matchAll(/--[a-z][a-z0-9-]*/g))
    if (!match[0].endsWith('-'))
      found.push({
        kind: 'token',
        name: match[0],
        bare: text === match[0] || listOnly,
      });
  if (found.length) return found;

  const bareClass = /^\.([a-z][a-z0-9-]*)$/.exec(text);
  if (bareClass) return [{ kind: 'class', name: bareClass[1], bare: true }];

  // `ds-modal .danger` is the element-scoped shape AUTHORING prescribes for a class rename, so
  // the parts are read one by one. None is bare: the scope element survives its class's rename.
  const ELEMENT = /(?<![\w-])(ds-[a-z0-9]+(?:-[a-z0-9]+)*)/g;
  const CLASS =
    /(?<![\w-])\.([a-z][a-z0-9-]*)|(?<=[a-z0-9])\.([a-z][a-z0-9-]*)/g;
  const selector = text.replace(/\s*\{[^}]*\}\s*$/, '');
  const selectorOnly =
    selector
      .replace(/\[[^\]]*\]/g, '')
      .replace(/::ng-deep|::?[a-z-]+(?:\([^)]*\))?/g, '')
      .replace(ELEMENT, '')
      .replace(CLASS, '')
      .replace(/[\s,>+~]/g, '').length === 0;
  if (selectorOnly) {
    for (const match of selector.matchAll(ELEMENT))
      found.push({ kind: 'element', name: match[1], bare: false, scope: true });
    for (const match of selector.matchAll(CLASS))
      found.push({
        kind: 'class',
        name: match[1] ?? match[2],
        bare: false,
        scope: true,
      });
    if (found.length) return found;
  }

  // `modal-out / drawer-panel-close-right|left|top|bottom`: keyframe names, a `|` swapping the last
  // word of the one before it.
  if (/^[a-z][a-z0-9|-]*(\s+\/\s+[a-z][a-z0-9|-]*)+$/.test(text))
    return text.split(/\s+\/\s+/).flatMap((part) => {
      const [first, ...alternatives] = part.split('|');
      const stem = first.slice(0, first.lastIndexOf('-') + 1);
      return [first, ...alternatives.map((word) => `${stem}${word}`)].map(
        (name) => ({ kind: 'keyframes', name, bare: false }),
      );
    });

  if (/^[a-z][a-z0-9]*[A-Z][A-Za-z0-9]*$/.test(text))
    return [{ kind: 'symbol', name: text, bare: false, member: true }];

  for (const match of text.matchAll(/\b[A-Z][A-Za-z0-9_]{3,}\b/g))
    found.push({ kind: 'symbol', name: match[0], bare: text === match[0] });
  // An exported function is called, not imported by type: `avatarTint(seed, { chroma })`.
  for (const match of text.matchAll(/(?<![.\w])([a-z][A-Za-z0-9]{3,})\(/g))
    found.push({ kind: 'symbol', name: match[1], bare: false });
  return found;
}

// `--ds-*-bg`, `--<role>-subtle`, `--ds-combobox-` and `--ds-*-w | -h | -maxw`: each part is a
// pattern over the token set, answered by whether any token matches. A part that starts with a
// bare `-` completes the first part's stem.
function familyClaims(text) {
  const parts = text.split(/\s*\|\s*/);
  const stem = /^(--[^|]*\*)/.exec(parts[0])?.[1];
  const patterns = [];
  for (const raw of parts) {
    const part = raw.startsWith('--') ? raw : stem ? `${stem}${raw}` : null;
    if (!part || !/^--[a-z0-9<>*-]+$/.test(part)) return null;
    if (!/[*<]|-$/.test(part)) return null;
    const source = part
      .replace(/<[a-z-]+>/g, '\u0000')
      .replace(/\*/g, '\u0001')
      .replace(/-$/, '-\u0002')
      .replace(/[-]/g, '\\-')
      .replace(/\u0000/g, '[a-z0-9-]+')
      .replace(/\u0001/g, '[a-z0-9-]*')
      .replace(/\u0002/g, '[a-z0-9-]+');
    patterns.push({
      kind: 'family',
      name: part,
      pattern: new RegExp(`^${source}$`),
      bare: false,
    });
  }
  return patterns.length ? patterns : null;
}

function resolves(surface, claim) {
  if (claim.kind === 'token') {
    if (surface.tokens.has(claim.name)) return true;
    // null, not false: the family exists but its members are built by interpolation, so absence
    // here means "cannot be read", and a `false` would accuse an honest item.
    for (const prefix of surface.tokenPrefixes ?? [])
      if (claim.name.startsWith(prefix)) return null;
    return false;
  }
  if (claim.kind === 'family') {
    for (const token of surface.tokens)
      if (claim.pattern.test(token)) return true;
    const stem = claim.name.split(/[*<]/)[0];
    for (const prefix of surface.tokenPrefixes ?? [])
      if (prefix.startsWith(stem) || stem.startsWith(prefix)) return null;
    return false;
  }
  if (claim.kind === 'partial')
    return surface.partials ? surface.partials.has(claim.name) : null;
  if (claim.kind === 'keyframes')
    return surface.keyframes ? surface.keyframes.has(claim.name) : null;
  if (claim.kind === 'symbol')
    return (
      surface.symbols.has(claim.name) ||
      (claim.member === true &&
        (surface.directives?.has(claim.name) ||
          [...surface.elements.values()].some((members) =>
            members.has(claim.name),
          )))
    );
  if (claim.kind === 'class') return surface.classes.has(claim.name);
  if (claim.kind === 'element') return surface.elements.has(claim.name);
  if (claim.kind === 'member') {
    // A directive selector is bindable on any element it is applied to, so it answers before the
    // element's own member list is consulted.
    if (surface.directives?.has(claim.name)) return true;
    const members = surface.elements.get(claim.element);
    return members ? members.has(claim.name) : null; // null: the element itself is unknown here
  }
  return null;
}

const GONE_AFTER = new Set([
  'token-rename',
  'input-rename',
  'output-rename',
  'class-rename',
  'type-rename',
  'removed-api',
  // Renaming a custom element is a disappearance like any other, and it was the one kind
  // never asked to prove it: five published items claim one and none was read.
  'selector-rename',
]);

// Prose that names a token in order to say it does not exist: the spelling a blind replace
// produces, a name the text explains away. Keyed `<tag> <item or row id | informational> <token>`.
const DELIBERATE_PHANTOMS = new Set([
  'v0.9.0 dropdown-panel-radius --ds-select-panel-radius',
  'v0.10.0 informational --ds-pagehdr',
  'v0.10.0 informational --ds-topbar-margin-b',
  'v0.13.0 button-border-token-names-the-colour --ds-button-border-color-width',
  'v0.13.3 progress-and-meter-tokens-renamed-to-bar --ds-bar-bar-color',
]);

const label = (claim) =>
  claim.kind === 'member' ? `${claim.element}[${claim.name}]` : claim.name;

function sweep() {
  const defects = [];
  const unresolved = [];

  const manifests = readdirSync(join(ROOT, 'migrations'))
    .filter((f) =>
      /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?|unreleased)\.json$/.test(f),
    )
    .filter((f) => !ONLY || f === `${ONLY}.json`)
    .sort();

  // "Nothing was checkable" must never read as "nothing is wrong": a caller sees only the exit code,
  // and one asks per version before trusting that manifest. A clone without tags is the way to hit
  // it — `git tag --list` comes back empty, so every version is skipped at once.
  const skipped = [];
  // A boundary that could not be READ is not the same as one with nothing to check. The only
  // legitimate skip is the earliest tag, which has no predecessor; anything else means a tree was
  // missing, and one readable manifest was enough to green a run where the other 26 were not.
  const unreadable = [];
  const unchecked = [];
  const coverage = { values: 0, read: 0 };
  let checked = 0;

  for (const file of manifests) {
    const version = file.replace('.json', '');
    // `unreleased.json` describes the boundary between the last tag and the working tree, and it
    // is the ONE manifest that can still be corrected. Skipping it left the check silent at the
    // cut and red only after publication, when the choice is to rewrite a published record or to
    // route around the gate.
    const draft = version === 'unreleased';
    const index = draft ? tags.length : tags.indexOf(`v${version}`);
    if (index < 0) {
      unreadable.push(`${file}: no tag v${version} in this checkout`);
      continue;
    }
    if (index === 0) {
      skipped.push(
        `${file}: v${version} is the earliest tag, so there is no boundary to check`,
      );
      continue;
    }
    const prev = draft ? tags.at(-1) : previousBoundary(tags, version);
    const before = surfaceAt(prev);
    const after = draft ? surfaceOfWorkingTree() : surfaceAt(`v${version}`);
    if (!before || !after) {
      unreadable.push(
        `${file}: could not read src/lib at ${!before ? prev : `v${version}`}`,
      );
      continue;
    }
    checked++;

    const doc = JSON.parse(
      readFileSync(join(ROOT, 'migrations', file), 'utf8'),
    );
    for (const item of doc.items ?? []) {
      const verdict = checkItem(
        item,
        before,
        after,
        prev,
        draft ? 'the working tree' : `v${version}`,
      );
      defects.push(
        ...verdict.defects.map((line) => `${file}  ${item.id}\n      ${line}`),
      );
      unresolved.push(
        ...verdict.unresolved.map((line) => `${file} ${item.id}: ${line}`),
      );
      unchecked.push(...verdict.unchecked.map((line) => `${file} ${line}`));
      coverage.values += verdict.values;
      coverage.read += verdict.readValues;
    }
    defects.push(
      ...checkFileProse(
        doc,
        before,
        after,
        prev,
        draft ? 'the working tree' : `v${version}`,
      ).map((line) => `${file}\n      ${line}`),
    );
  }
  if (ONLY && !manifests.length) {
    console.error(
      `check-manifest-truth: there is no migrations/${ONLY}.json to check.`,
    );
    process.exit(1);
  }
  if (unreadable.length) {
    // Said BEFORE the defects, because `report()` exits: printing it afterwards meant the line
    // never appeared whenever there was a defect to print, and a CI clone that carries 15 of 28
    // tags reported on half the manifests without saying so.
    console.error(
      `check-manifest-truth: ${unreadable.length} manifest(s) could not be read at their own ` +
        `boundary, so nothing is known about them:\n  ${unreadable.join('\n  ')}`,
    );
    if (defects.length)
      report(defects, unresolved, checked, skipped, unchecked, coverage);
    process.exit(1);
  }
  if (!checked) {
    console.error(
      'check-manifest-truth: nothing could be checked, which is not the same as nothing being ' +
        `wrong:\n  ${skipped.join('\n  ') || 'no published manifest found'}`,
    );
    process.exit(1);
  }
  report(defects, unresolved, checked, skipped, unchecked, coverage);
}

// Exported so the selftest can exercise the rules against synthetic surfaces: the checkout is
// shared with other sessions, so a test that mutates a real manifest can lose a race for the file.
export function checkItem(item, before, after, prevTag, tag) {
  const defects = [];
  const unresolved = [];
  // A composite selector (`ds-list-item ::ng-deep .activator`) or a call signature
  // (`avatarTint(seed, { chroma })`) yields no single name to look up. Counting them is the
  // difference between a green that means "verified" and one that means "nothing was read".
  const unchecked = [];

  const oldMember = claims(item.old).find((claim) => claim.kind === 'member');
  // A bare `new` beside an element-scoped `old` means the same element's new member name — but
  // only while that element still answers at the new tag. Where the selector was renamed in the
  // same release the element is unknown there, `resolves` returns null, and ANY string passed.
  const scopeSurvives =
    oldMember && after.elements.has(oldMember.element) ? oldMember : null;
  const newClaims =
    scopeSurvives &&
    typeof item.new === 'string' &&
    /^[\w-]+$/.test(item.new.trim())
      ? [
          {
            kind: 'member',
            element: scopeSurvives.element,
            name: item.new.trim(),
            bare: true,
          },
        ]
      : claims(item.new);

  // Counted from the lists the check actually consumes. Reading `claims(item.new)` here instead
  // reported 21 items as "nothing was verified about these" while their `new` had in fact been
  // resolved, through the member reinterpretation just above.
  for (const [field, list] of [
    ['old', claims(item.old)],
    ['new', newClaims],
  ]) {
    const value = item[field];
    if (typeof value === 'string' && value.trim() && !list.length)
      unchecked.push(`${item.id}: ${field} \`${value.trim()}\``);
  }
  const targetExists = newClaims.some(
    (claim) => resolves(after, claim) === true,
  );

  // A name neither tag declares is usually a consumer's own example (`class MyTable extends …`)
  // or a framework type (`InputSignal`). But when the item is a TYPE or CLASS rename, `old` is
  // a name the consumer had to IMPORT — and an import of something that never existed does not
  // compile, so nobody ever wrote it and the rename is fiction. That is not true of a template
  // binding: `ds-banner[dismissed]` against a phantom output compiles and silently does
  // nothing, which is why the catalogue could promise it and consumers could write it.
  const isImportedName =
    item.kind === 'type-rename' || item.kind === 'class-rename';
  const declaredAtNeither = (claim) =>
    claim.kind === 'symbol' &&
    resolves(before, claim) === false &&
    resolves(after, claim) === false &&
    !(isImportedName && claim.bare);

  const unresolvedBeforeOld = unresolved.length;
  for (const claim of claims(item.old)) {
    const wasThere = resolves(before, claim);
    if (declaredAtNeither(claim)) {
      unresolved.push(`\`${claim.name}\` is declared at neither tag`);
      continue;
    }
    if (wasThere === null) {
      if (resolves(after, claim) === null)
        unresolved.push(
          `old \`${label(claim)}\` — cannot be resolved at either tag`,
        );
      continue;
    }
    if (!wasThere) {
      // Same distinction as above: the phantom exemption is only for a name a consumer could
      // have written, which an imported one never was.
      // Only a template binding earns this. A phantom `ds-banner[dismissed]` compiles and does
      // nothing, so a consumer really could have written one — but a token, an element or a class
      // that never existed is a manifest describing a rename that never happened, and forgiving
      // it because the REPLACEMENT is real leaves the rarer half of the failure as the only half
      // caught, across a large share of the 99 published rename and removal items.
      if (
        claim.kind === 'member' &&
        targetExists &&
        !(isImportedName && claim.bare)
      )
        continue;
      // A scope element renamed in the same release carries its new name in both halves.
      if (claim.scope && resolves(after, claim) === true) continue;
      defects.push(
        targetExists
          ? `old \`${label(claim)}\` does not exist at ${prevTag} — \`new\` is real, so the item renames something that was never there`
          : `old \`${label(claim)}\` does not exist at ${prevTag}, and \`new\` names nothing that does — the item migrates from nowhere to nowhere`,
      );
    } else if (
      claim.bare &&
      GONE_AFTER.has(item.kind) &&
      resolves(after, claim) === true
    ) {
      // Reached by `X` -> `X<T>` too, and that is deliberate: a type that gains a parameter with
      // a default is not a rename, so the bare name is meant to survive and the item is
      // mis-filed. Firing here is what says so; the fix is `behavior`, not an exemption.
      defects.push(
        `old \`${label(claim)}\` still resolves at ${tag} — the ${item.kind} did not happen`,
      );
    }
  }
  for (const claim of newClaims) {
    const isThere = resolves(after, claim);
    if (isThere === false)
      defects.push(
        `new \`${label(claim)}\` does not exist at ${tag} — the target is not there`,
      );
  }
  // A token named in the PROSE, where `old`/`new` are a family placeholder that `claims` cannot
  // read. Two items shipped a spelling produced by chaining two of our own rules — a name that
  // existed at neither tag — so a consumer grepping for it found nothing and kept a dead
  // override. `searchHints` and `detect` are recall seeds and legitimately carry bare prefixes,
  // so they are not read here; a prose name that is a PREFIX of a real token is a family, not a
  // claim.
  for (const field of ['action', 'appliesWhen', 'note', 'pitfall'])
    for (const name of phantomTokens(
      item[field],
      before,
      after,
      `${tag} ${item.id}`,
    ))
      defects.push(
        `${field} names \`${name}\`, which exists at neither ${prevTag} nor ${tag}`,
      );
  // A value counts as read when at least one name in it resolved at its tag, true or false.
  const oldRead = claims(item.old).some(
    (claim) => resolves(before, claim) !== null && !declaredAtNeither(claim),
  );
  const newRead = newClaims.some((claim) => resolves(after, claim) !== null);
  if (
    claims(item.old).length &&
    !oldRead &&
    unresolved.length === unresolvedBeforeOld
  )
    unresolved.push(
      `old \`${item.old.trim()}\` — nothing in it resolves at ${prevTag}`,
    );
  if (newClaims.length && !newRead)
    unresolved.push(
      `new \`${item.new.trim()}\` — nothing in it resolves at ${tag}`,
    );
  const values = ['old', 'new'].filter(
    (field) => typeof item[field] === 'string' && item[field].trim(),
  ).length;
  return {
    defects,
    unresolved,
    unchecked,
    values,
    readValues: Number(oldRead) + Number(newRead),
  };
}

function phantomTokens(text, before, after, location) {
  if (typeof text !== 'string') return [];
  const knownTokens = [...before.tokens, ...after.tokens];
  const phantoms = [];
  for (const match of text.matchAll(/--ds-[a-z0-9-]*[a-z0-9]/g)) {
    const name = match[0];
    if (DELIBERATE_PHANTOMS.has(`${location} ${name}`)) continue;
    if (resolves(before, { kind: 'token', name }) !== false) continue;
    if (resolves(after, { kind: 'token', name }) !== false) continue;
    if (knownTokens.some((known) => known.startsWith(`${name}-`))) continue;
    phantoms.push(name);
  }
  return phantoms;
}

export function checkFileProse(doc, before, after, prevTag, tag) {
  const defects = [];
  for (const [index, line] of (doc.informational ?? []).entries())
    for (const name of phantomTokens(
      typeof line === 'string' ? line : line?.text,
      before,
      after,
      `${tag} informational`,
    ))
      defects.push(
        `informational[${index}] names \`${name}\`, which exists at neither ${prevTag} nor ${tag}`,
      );
  for (const row of doc.deleteList ?? [])
    for (const field of ['find', 'why', 'replaceWith']) {
      const values = Array.isArray(row[field]) ? row[field] : [row[field]];
      for (const value of values)
        for (const name of phantomTokens(
          value,
          before,
          after,
          `${tag} ${row.id}`,
        ))
          defects.push(
            `deleteList ${row.id} ${field} names \`${name}\`, which exists at neither ${prevTag} nor ${tag}`,
          );
    }
  return defects;
}

function report(
  defects,
  unresolved,
  count,
  skipped = [],
  unchecked = [],
  coverage = null,
) {
  console.log(
    `check-manifest-truth: ${count} manifest(s) against ${surfaceCache.size} tree(s).`,
  );
  if (skipped.length) {
    console.log(`\n${skipped.length} manifest(s) not checked:`);
    for (const line of skipped) console.log(`  ${line}`);
  }
  if (unchecked.length) {
    console.log(
      `\n${unchecked.length} value(s) hold no single name to look up — composite selectors and ` +
        'call signatures. Nothing was verified about these:',
    );
    for (const line of unchecked) console.log(`  ${line}`);
  }
  if (unresolved.length) {
    console.log(
      `\n${unresolved.length} name(s) no tag could resolve — framework types and elements a tag does not know, not checked:`,
    );
    for (const line of unresolved) console.log(`  ${line}`);
  }
  if (defects.length) {
    console.error(`\n${defects.length} claim(s) the tree does not support:\n`);
    for (const line of defects) console.error(`  ${line}`);
    console.error(
      '\nA published manifest is executed. Correct the file so it reads as the final instruction, ' +
        'and say nothing anywhere about the repair.',
    );
    process.exit(1);
  }
  const read = coverage
    ? `${coverage.read} of ${coverage.values} old/new value(s) were read against their boundary`
    : 'every old/new was read against its boundary';
  console.log(
    coverage && coverage.read < coverage.values
      ? `${read} and hold; the other ${coverage.values - coverage.read} are listed above and nothing is known about them.`
      : `${read} and hold.`,
  );
}

// Guarded so importing `checkItem` does not trigger a 27-tree sweep: module top-level code runs
// on import.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) sweep();
