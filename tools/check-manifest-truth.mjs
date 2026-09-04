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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ONLY = process.argv.slice(2).find((arg) => /^\d+\.\d+\.\d+$/.test(arg));

const git = (args) =>
  execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'ignore'],
  });

const tags = git(['tag', '--list', 'v*', '--sort=v:refname']).split('\n').filter(Boolean);

// One `git cat-file --batch` per tag, not one `git show` per file: a tag's surface is ~400 files
// and the per-spawn cost dominates everything else. Nothing is written to disk.
function readTreeAt(tag) {
  let paths;
  try {
    paths = git(['ls-tree', '-r', '--name-only', tag, '--', 'src/lib'])
      .split('\n')
      .filter((path) => /\.(ts|scss|html)$/.test(path) && !path.endsWith('.spec.ts'));
  } catch {
    return null;
  }
  if (!paths.length) return null;

  // No `encoding`, so the result is a Buffer: the record headers carry byte sizes, and decoding
  // the whole stream as utf8 first would shift every offset on any multi-byte character.
  const batch = execFileSync('git', ['-C', ROOT, 'cat-file', '--batch'], {
    input: Buffer.from(paths.map((path) => `${tag}:${path}`).join('\n') + '\n', 'utf8'),
    maxBuffer: 1 << 28,
    stdio: ['pipe', 'pipe', 'ignore'],
  });

  // Each record is `<oid> <type> <size>\n<contents>\n`, so the size header is what walks the buffer.
  const files = [];
  let at = 0;
  for (const path of paths) {
    const newline = batch.indexOf(10, at);
    if (newline === -1) break;
    const header = batch.toString('utf8', at, newline);
    const size = Number(header.split(' ')[2]);
    if (!Number.isFinite(size)) break;
    const start = newline + 1;
    files.push({ path, text: batch.toString('utf8', start, start + size) });
    at = start + size + 1;
  }
  return files;
}

const DECL =
  /^export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

const surfaceCache = new Map();
function surfaceAt(tag) {
  if (surfaceCache.has(tag)) return surfaceCache.get(tag);
  const files = readTreeAt(tag);
  if (!files) return null;

  const tokens = new Set();
  const symbols = new Set();
  const classes = new Set();
  const elements = new Map();

  for (const { path: file, text } of files) {
    for (const match of text.matchAll(/--[a-z][a-z0-9-]*/g))
      if (!match[0].endsWith('-')) tokens.add(match[0]);
    for (const match of text.matchAll(/\.([a-z][a-z0-9-]*)\s*[,{:.[]/g)) classes.add(match[1]);
    if (!file.endsWith('.ts')) continue;
    for (const decl of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DECL)) symbols.add(decl[1]);

    // A component's own members: the selector it answers to, and every signal-based member a
    // template can bind. `alias` forms count under the alias, which is what a consumer writes.
    for (const block of text.matchAll(/selector:\s*'([^']+)'/g)) {
      for (const part of block[1].split(',')) {
        const tag_ = /^\s*([a-z][a-z0-9-]*)\s*$/.exec(part);
        if (!tag_) continue;
        const members = elements.get(tag_[1]) ?? new Set();
        for (const member of text.matchAll(
          /(?:readonly\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(input|output|model)(?:\.required)?\s*[<(]/g,
        )) {
          members.add(member[1]);
          // A `model()` also publishes `<name>Change`, which Angular generates and no source line
          // declares — `ds-pagination[currentPageChange]` is a real binding with nothing to grep.
          if (member[2] === 'model') members.add(`${member[1]}Change`);
        }
        for (const alias of text.matchAll(/alias:\s*'([^']+)'/g)) members.add(alias[1]);
        elements.set(tag_[1], members);
      }
    }
  }

  const surface = { tokens, symbols, classes, elements };
  surfaceCache.set(tag, surface);
  return surface;
}

function claims(value) {
  if (typeof value !== 'string' || !value.trim()) return [];
  const text = value.trim();
  if (/[*<>]|\.\.\./.test(text)) return []; // a family placeholder is not one name

  // `bare` marks a value that IS the identifier, as opposed to one lifted out of a sentence.
  // Only a bare claim can be asked to have disappeared: `class MyTable extends TableComponent`
  // mentions TableComponent, but the item removes a member of it, not the class.
  const attr = /^([a-z][\w-]*)\[([\w-]+)\]$/.exec(text);
  if (attr) return [{ kind: 'member', element: attr[1], name: attr[2], bare: true }];

  const found = [];
  for (const match of text.matchAll(/--[a-z][a-z0-9-]*/g))
    if (!match[0].endsWith('-'))
      found.push({ kind: 'token', name: match[0], bare: text === match[0] });
  if (found.length) return found;

  const bareClass = /^\.([a-z][a-z0-9-]*)$/.exec(text);
  if (bareClass) return [{ kind: 'class', name: bareClass[1], bare: true }];

  for (const match of text.matchAll(/\b[A-Z][A-Za-z0-9]{3,}\b/g))
    found.push({ kind: 'symbol', name: match[0], bare: text === match[0] });
  return found;
}

function resolves(surface, claim) {
  if (claim.kind === 'token') return surface.tokens.has(claim.name);
  if (claim.kind === 'symbol') return surface.symbols.has(claim.name);
  if (claim.kind === 'class') return surface.classes.has(claim.name);
  if (claim.kind === 'member') {
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
]);

const label = (claim) =>
  claim.kind === 'member' ? `${claim.element}[${claim.name}]` : claim.name;

function sweep() {
const defects = [];
const unresolved = [];

const manifests = readdirSync(join(ROOT, 'migrations'))
  .filter((f) => /^\d+\.\d+\.\d+\.json$/.test(f))
  .filter((f) => !ONLY || f === `${ONLY}.json`)
  .sort();

// "Nothing was checkable" must never read as "nothing is wrong": a caller sees only the exit code,
// and one asks per version before trusting that manifest. A clone without tags is the way to hit
// it — `git tag --list` comes back empty, so every version is skipped at once.
const skipped = [];
let checked = 0;

for (const file of manifests) {
  const version = file.replace('.json', '');
  const index = tags.indexOf(`v${version}`);
  if (index < 0) {
    skipped.push(`${file}: no tag v${version} in this checkout`);
    continue;
  }
  if (index === 0) {
    skipped.push(`${file}: v${version} is the earliest tag, so there is no boundary to check`);
    continue;
  }
  const prev = tags[index - 1];
  const before = surfaceAt(prev);
  const after = surfaceAt(`v${version}`);
  if (!before || !after) {
    skipped.push(`${file}: could not read src/lib at ${!before ? prev : `v${version}`}`);
    continue;
  }
  checked++;

  const doc = JSON.parse(readFileSync(join(ROOT, 'migrations', file), 'utf8'));
  for (const item of doc.items ?? []) {
    const verdict = checkItem(item, before, after, prev, `v${version}`);
    defects.push(...verdict.defects.map((line) => `${file}  ${item.id}\n      ${line}`));
    unresolved.push(...verdict.unresolved.map((line) => `${file} ${item.id}: ${line}`));
  }
}
if (ONLY && !manifests.length) {
  console.error(`check-manifest-truth: there is no migrations/${ONLY}.json to check.`);
  process.exit(1);
}
if (!checked) {
  console.error(
    'check-manifest-truth: nothing could be checked, which is not the same as nothing being ' +
      `wrong:\n  ${skipped.join('\n  ') || 'no published manifest found'}`,
  );
  process.exit(1);
}
report(defects, unresolved, checked, skipped);
}

// Exported so the selftest can exercise the rules against synthetic surfaces: the checkout is
// shared with other sessions, so a test that mutates a real manifest can lose a race for the file.
export function checkItem(item, before, after, prevTag, tag) {
  const defects = [];
  const unresolved = [];

  const oldMember = claims(item.old).find((claim) => claim.kind === 'member');
  const newClaims =
      oldMember && typeof item.new === 'string' && /^[\w-]+$/.test(item.new.trim())
        ? [{ kind: 'member', element: oldMember.element, name: item.new.trim(), bare: true }]
        : claims(item.new);
    const targetExists = newClaims.some((claim) => resolves(after, claim) === true);

    for (const claim of claims(item.old)) {
      const wasThere = resolves(before, claim);
      // A name neither tag declares is usually a consumer's own example (`class MyTable extends …`)
      // or a framework type (`InputSignal`). But when the item is a TYPE or CLASS rename, `old` is
      // a name the consumer had to IMPORT — and an import of something that never existed does not
      // compile, so nobody ever wrote it and the rename is fiction. That is not true of a template
      // binding: `ds-banner[dismissed]` against a phantom output compiles and silently does
      // nothing, which is why the catalogue could promise it and consumers could write it.
      const isImportedName = item.kind === 'type-rename' || item.kind === 'class-rename';
      if (
        claim.kind === 'symbol' &&
        wasThere === false &&
        resolves(after, claim) === false &&
        !(isImportedName && claim.bare)
      ) {
        unresolved.push(`\`${claim.name}\` is declared at neither tag`);
        continue;
      }
      if (wasThere === null) {
        if (resolves(after, claim) === null)
          unresolved.push(`old \`${label(claim)}\` — cannot be resolved at either tag`);
        continue;
      }
      if (!wasThere) {
        // Same distinction as above: the phantom exemption is only for a name a consumer could
        // have written, which an imported one never was.
        if (targetExists && !(isImportedName && claim.bare)) continue;
        defects.push(
          `old \`${label(claim)}\` does not exist at ${prevTag}, and \`new\` names nothing that does — the item migrates from nowhere to nowhere`,
        );
      } else if (claim.bare && GONE_AFTER.has(item.kind) && resolves(after, claim) === true) {
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
  return { defects, unresolved };
}

function report(defects, unresolved, count, skipped = []) {
  console.log(`check-manifest-truth: ${count} manifest(s) against ${surfaceCache.size} tree(s).`);
  if (skipped.length) {
    console.log(`\n${skipped.length} manifest(s) not checked:`);
    for (const line of skipped) console.log(`  ${line}`);
  }
  if (unresolved.length) {
    console.log(`\n${unresolved.length} name(s) neither tag declares — consumer examples, not checked:`);
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
  console.log('every old/new resolves against its own boundary.');
}

// Guarded so importing `checkItem` does not trigger a 27-tree sweep: module top-level code runs
// on import.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) sweep();
