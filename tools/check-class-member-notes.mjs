#!/usr/bin/env node
// Does the manifest account for every member an exported class gained or lost, NAME BY NAME?
// `check-class-surface-entry` asks only that the class is named somewhere; a note that names the
// class and lists half its new members passes it, and the subclass collides on the other half.
//
// What it reads, per boundary v<PREV>..v<V> (the draft: the last tag..the working tree):
//   * both trees, parsed per exported class with `classMembers()` from class-surface-diff.mjs, and
//     each class's members resolved through its `extends` chain inside the library - a subclass of
//     InputComponent collides with what DsFieldBase gained although no line of input.component.ts
//     moved, and a member that only moved up to a base is no change at all to its subclasses;
//   * the classes reachable from the entry points (every ng-package.json's entryFile), at BOTH tags:
//     a class nobody could import at v<PREV> could not have been subclassed, the same reason a class
//     new in the range is skipped.
//
// What fails, per such class whose resolved members moved:
//   * no `behavior` item has a `detect` naming it (`ClassName` or `extends ClassName`);
//   * the notes of those items leave a gained or lost member unnamed (backticked or bare word, on a
//     word boundary), unless they state the count next to the class - "`LineSeriesComponent`
//     gained 18", "`A` and `B` each gained 2", likewise "lost N" - and a stated count must equal
//     the measured one;
//   * a sentence of such a note that reports a change backticks a member-shaped name that neither
//     moved nor changed type on any class in the boundary: a phantom, which a subclasser renames
//     for nothing.
//
//   node tools/check-class-member-notes.mjs            # migrations/unreleased.json, exit 1 on a hit
//   node tools/check-class-member-notes.mjs --audit    # every published manifest, reports, exit 0
//   node tools/check-class-member-notes.mjs 0.13.2     # one published manifest, exit 1 on a hit
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { classMembers } from './class-surface-diff.mjs';
import { readTreeAt } from './check-manifest-truth.mjs';
import { previousBoundary, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE_NAME = JSON.parse(
  readFileSync(join(ROOT, 'package.json'), 'utf8'),
).name;

const isSource = (path) =>
  (path.endsWith('.ts') && !path.endsWith('.spec.ts')) ||
  path.endsWith('ng-package.json');

// The facade moved from src/public-api.ts to src/lib/public-api.ts when the package was split into
// entry points, so the tree is read from `src` and the root ng-package.json says which one it is.
function treeAt(tag) {
  const files = readTreeAt(tag, ['src', 'ng-package.json'], isSource);
  return files && new Map(files.map(({ path, text }) => [path, text]));
}

function workingTree() {
  const files = new Map();
  const crawl = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full);
      else {
        const path = relative(ROOT, full).split('\\').join('/');
        if (isSource(path)) files.set(path, readFileSync(full, 'utf8'));
      }
    }
  };
  crawl(join(ROOT, 'src'));
  const rootPackage = join(ROOT, 'ng-package.json');
  if (existsSync(rootPackage))
    files.set('ng-package.json', readFileSync(rootPackage, 'utf8'));
  return files;
}

function resolveSpecifier(files, fromPath, specifier) {
  let base;
  if (specifier === PACKAGE_NAME) base = 'src/lib/public-api';
  else if (specifier.startsWith(`${PACKAGE_NAME}/`))
    base = `src/lib/${specifier.slice(PACKAGE_NAME.length + 1)}`;
  else if (specifier.startsWith('.'))
    base = posix.join(posix.dirname(fromPath), specifier);
  else return null;
  return (
    [`${base}.ts`, `${base}/index.ts`].find((path) => files.has(path)) ?? null
  );
}

const CLASS_DECLARATION = /^export\s+(?:abstract\s+)?class\s+(\w+)/gm;

// Names a consumer can import: every value export reachable from an entry file. `export type`
// is skipped, because a class re-exported as a type cannot be extended. Names rather than files,
// because a named re-export publishes one class of a file that may declare several.
export function publicNames(files) {
  const entries = [];
  for (const [path, text] of files) {
    if (!path.endsWith('ng-package.json')) continue;
    const entryFile = JSON.parse(text).lib?.entryFile;
    if (!entryFile) continue;
    const entry = posix.join(posix.dirname(path), entryFile);
    if (files.has(entry)) entries.push(entry);
  }
  const names = new Set();
  const visited = new Set();
  const visit = (path) => {
    if (visited.has(path)) return;
    visited.add(path);
    const text = files.get(path);
    for (const declaration of text.matchAll(CLASS_DECLARATION))
      names.add(declaration[1]);
    for (const statement of text.matchAll(
      /^export\s+(type\s+)?(\*|\{[^}]*\})\s*from\s*'([^']+)'/gm,
    )) {
      const [, typeOnly, what, specifier] = statement;
      if (typeOnly) continue;
      const target = resolveSpecifier(files, path, specifier);
      if (what === '*') {
        if (target) visit(target);
        continue;
      }
      for (const part of what.slice(1, -1).split(',')) {
        const name = /^\s*(\w+)/.exec(part.replace(/^\s*type\s+/, ''));
        if (name && !/^\s*type\s/.test(part)) names.add(name[1]);
      }
    }
  };
  for (const entry of entries) visit(entry);
  return names;
}

// Every exported class with its members resolved through `extends`. A base outside the library
// (an Angular class) contributes nothing: its members are not ours to report.
function ownMembers(files) {
  const own = new Map();
  for (const [path, text] of files)
    if (path.startsWith('src/') && path.endsWith('.ts'))
      for (const [name, entry] of classMembers(text)) own.set(name, entry);
  return own;
}

export function resolvedMembers(own) {
  const resolved = new Map();
  for (const name of own.keys()) {
    const members = new Set();
    for (
      let current = name, depth = 0;
      current && own.has(current) && depth < 20;
      current = own.get(current).parent, depth++
    )
      for (const member of own.get(current).names) members.add(member);
    resolved.set(name, members);
  }
  return resolved;
}

// `changes` is what the manifest must account for. The rest decides what a note may mention
// without it being a phantom: a member that moved on any class at all, public or not, new or not;
// one whose declared type changed (a widening item names it legitimately); and a name that is not
// a class member at either tag but does occur in the tree - a config key, an interface field, an
// Angular input of a directive we wrap - since only a member can be claimed as one.
export function boundaryChanges(beforeFiles, afterFiles) {
  const ownBefore = ownMembers(beforeFiles);
  const ownAfter = ownMembers(afterFiles);
  const before = resolvedMembers(ownBefore);
  const after = resolvedMembers(ownAfter);
  const publicBefore = publicNames(beforeFiles);
  const publicAfter = publicNames(afterFiles);
  const changes = [];
  const moved = new Set();
  for (const [className, members] of after) {
    const earlier = before.get(className) ?? new Set();
    const gained = [...members].filter((name) => !earlier.has(name)).sort();
    const lost = [...earlier].filter((name) => !members.has(name)).sort();
    for (const name of [...gained, ...lost]) moved.add(name);
    if (!gained.length && !lost.length) continue;
    if (!before.has(className)) continue;
    if (!publicAfter.has(className) || !publicBefore.has(className)) continue;
    changes.push({ className, gained, lost });
  }
  for (const [className, members] of before)
    if (!after.has(className)) for (const name of members) moved.add(name);
  const retyped = new Set();
  for (const [className, { heads }] of ownAfter)
    for (const [name, head] of heads) {
      const earlier = ownBefore.get(className)?.heads.get(name);
      if (earlier && earlier !== head) retyped.add(name);
    }
  const members = new Set(
    [...ownBefore.values(), ...ownAfter.values()].flatMap(({ names }) => [
      ...names,
    ]),
  );
  const treeText = [...beforeFiles.values(), ...afterFiles.values()].join('\n');
  const isPhantom = (name) =>
    !moved.has(name) &&
    !retyped.has(name) &&
    (members.has(name) || !namesWord(treeText, name));
  return { changes: changes.sort(byClass), isPhantom };
}

const byClass = (a, b) => a.className.localeCompare(b.className);

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
];

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const namesWord = (text, word) =>
  new RegExp(`(?<![\\w$])${escape(word)}(?![\\w$])`).test(text);

// A class may share its count with the classes listed after it ("`A`, `B` and `C` each gained
// 2"), and a lost count may follow a gained one ("`A` gained 3 and lost 1").
function statedCount(note, className, verb) {
  const count = `(\\d+|${NUMBER_WORDS.join('|')})`;
  const gainedFirst =
    verb === 'lost' ? `(?:gained\\s+${count}\\s+and\\s+)?` : '';
  const match = new RegExp(
    `\`?\\b${escape(className)}\\b\`?(?:(?:,\\s*|\\s+and\\s+)\`?\\w+\`?)*\\s+(?:each\\s+)?${gainedFirst}${verb}\\s+${count}\\b`,
  ).exec(note);
  if (!match) return null;
  const stated = match.at(-1);
  return /^\d+$/.test(stated) ? Number(stated) : NUMBER_WORDS.indexOf(stated);
}

// Words a note backticks that are syntax or values, never a member a subclass could declare.
const NOT_A_MEMBER_NAME = new Set([
  'abstract',
  'any',
  'boolean',
  'false',
  'never',
  'new',
  'null',
  'number',
  'object',
  'override',
  'private',
  'protected',
  'public',
  'readonly',
  'static',
  'string',
  'this',
  'true',
  'undefined',
  'unknown',
  'void',
]);

const CHANGE_VERB =
  /\b(?:gain(?:s|ed)?|los(?:es|t)|add(?:s|ed)|remov(?:es|ed)|gr[eo]w(?:s|n)?|dropp(?:ed|ing))\b/i;

export function checkManifest(doc, { changes, isPhantom }) {
  const hits = [];
  const behaviorItems = (doc.items ?? []).filter(
    (item) => item.kind === 'behavior',
  );
  const detecting = (className) =>
    behaviorItems.filter((item) =>
      (item.detect ?? []).some((shape) => namesWord(shape, className)),
    );
  const itemsInPlay = new Set();
  for (const { className, gained, lost } of changes) {
    const items = detecting(className);
    if (!items.length) {
      hits.push({
        item: '-',
        field: 'detect',
        className,
        why: `no \`behavior\` item's detect names ${className}, which gained ${gained.length} and lost ${lost.length}: ${describe(gained, lost)}`,
      });
      continue;
    }
    for (const item of items) itemsInPlay.add(item);
    const note = items.map((item) => item.note ?? '').join('\n');
    const ids = items.map((item) => item.id).join(', ');
    for (const [verb, names] of [
      ['gained', gained],
      ['lost', lost],
    ]) {
      if (!names.length) continue;
      const count = statedCount(note, className, verb);
      if (count !== null) {
        if (count !== names.length)
          hits.push({
            item: ids,
            field: 'note',
            className,
            why: `says ${className} ${verb} ${count}, the tree says ${names.length}: ${names.join(', ')}`,
          });
        continue;
      }
      const unnamed = names.filter((name) => !namesWord(note, name));
      if (unnamed.length)
        hits.push({
          item: ids,
          field: 'note',
          className,
          why: `${className} ${verb} ${names.length}, the note names ${names.length - unnamed.length}; unnamed: ${unnamed.join(', ')}`,
        });
    }
  }
  for (const item of itemsInPlay) {
    // Only a sentence that reports a change lists members; elsewhere a note may name an
    // unchanged member for context ("a toast queued behind `maxVisible`"), which is no claim.
    const listing = (item.note ?? '')
      .split(/(?<=\.)\s+(?=[A-Z`])/)
      .filter((sentence) => CHANGE_VERB.test(sentence))
      .join('\n');
    const phantoms = [
      ...new Set(
        [...listing.matchAll(/`([a-z_$][\w$]*)(?:\(\))?`/g)]
          .map((match) => match[1])
          .filter((name) => !NOT_A_MEMBER_NAME.has(name) && isPhantom(name)),
      ),
    ];
    if (phantoms.length)
      hits.push({
        item: item.id,
        field: 'note',
        className: '-',
        why: `names member(s) that neither moved nor changed type on any class in this boundary: ${phantoms.join(', ')}`,
      });
  }
  return hits;
}

const describe = (gained, lost) =>
  [
    gained.length ? `gained ${gained.join(', ')}` : '',
    lost.length ? `lost ${lost.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('; ');

function readManifest(file) {
  return JSON.parse(readFileSync(join(ROOT, 'migrations', file), 'utf8'));
}

function main() {
  const argv = process.argv.slice(2);
  const audit = argv.includes('--audit');
  const only = argv.find((arg) =>
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/.test(arg),
  );
  const unknown = argv.find((arg) => arg !== '--audit' && arg !== only);
  if (unknown) {
    console.error(
      `check-class-member-notes: "${unknown}" is neither \`--audit\` nor an <x.y.z> version.`,
    );
    return 1;
  }

  const tags = releaseTags(ROOT);
  if (!tags.length) {
    console.error(
      'check-class-member-notes: no release tags in this checkout, so there is no boundary to read.',
    );
    return 1;
  }

  const boundaries = [];
  if (audit || only) {
    const versions = readdirSync(join(ROOT, 'migrations'))
      .map((file) => /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)\.json$/.exec(file))
      .filter(Boolean)
      .map((match) => match[1])
      .filter((version) => !only || version === only);
    if (only && !versions.length) {
      console.error(
        `check-class-member-notes: there is no migrations/${only}.json.`,
      );
      return 1;
    }
    for (const version of versions) {
      const prev = previousBoundary(tags, version);
      if (!prev) continue;
      boundaries.push({ file: `${version}.json`, prev, head: `v${version}` });
    }
  } else {
    boundaries.push({ file: 'unreleased.json', prev: tags.at(-1), head: null });
  }

  const trees = new Map();
  const tree = (ref) => {
    if (!trees.has(ref)) trees.set(ref, ref ? treeAt(ref) : workingTree());
    return trees.get(ref);
  };

  const report = [];
  let classes = 0;
  for (const { file, prev, head } of boundaries.sort((a, b) =>
    a.file.localeCompare(b.file, undefined, { numeric: true }),
  )) {
    const before = tree(prev);
    const after = tree(head);
    if (!before || !after) {
      console.error(
        `check-class-member-notes: ${file}: could not read the tree at ${!before ? prev : head}.`,
      );
      return 1;
    }
    const boundary = boundaryChanges(before, after);
    classes += boundary.changes.length;
    if (!boundary.changes.length) continue;
    const path = join(ROOT, 'migrations', file);
    if (!existsSync(path)) {
      report.push(
        `migrations/${file}  (absent)\n      ${boundary.changes.length} exported class(es) moved since ${prev} and no draft manifest exists to name them: ${boundary.changes.map((change) => change.className).join(', ')}`,
      );
      continue;
    }
    for (const hit of checkManifest(readManifest(file), boundary))
      report.push(
        `migrations/${file}  ${hit.item}  ${hit.field}  ${hit.className}\n      ${hit.why}`,
      );
  }

  const scope = `${boundaries.length} boundar${boundaries.length === 1 ? 'y' : 'ies'}, ${classes} class change(s)`;
  if (!report.length) {
    console.log(
      `check-class-member-notes: every moved member of every exported class is accounted for (${scope}).`,
    );
    return 0;
  }
  const stream = audit ? console.log : console.error;
  stream(
    `check-class-member-notes: ${report.length} hit(s) over ${scope}:\n\n  ${report.join('\n  ')}`,
  );
  if (audit) return 0;
  stream(
    '\nName every member the line lists in the note of the item whose `detect` names the class, ' +
      'or state the count next to the class ("`TableComponent` gained 12"). The list comes from ' +
      'the trees; do not assemble it by eye.',
  );
  return 1;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  process.exitCode = main();
