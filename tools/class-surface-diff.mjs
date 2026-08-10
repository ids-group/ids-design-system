#!/usr/bin/env node
/**
 * Which exported component classes grew or lost members since a ref.
 *
 * Subclassing a DS component is unsupported, but consumers do it, and then a
 * release that only ADDS fails their build: TS4114 wants `override`, TS2415 fires
 * on a redeclared private. This has been missed twice — 0.8.0's notes named the
 * public additions but not the private `saveLayout` that actually broke a
 * consumer, and 0.9.0 shipped with no collision entry at all while sixteen
 * classes grew. Both were found by reading a consumer's build log after the fact.
 *
 *   node tools/class-surface-diff.mjs [base-ref]     # default: last release tag
 *
 * Reports per class, so the answer can be pasted into the migration entry. Prints
 * nothing but a clean line when no surface moved.
 */
import { execFileSync } from 'node:child_process';

const base = process.argv[2] ?? git(['describe', '--tags', '--abbrev=0']).trim();

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function show(ref, path) {
  try {
    // stdio pipe on stderr: a path that did not exist at `ref` is the normal case
    // for a new or renamed file, and git says so on stderr rather than exiting quietly.
    return execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

// A member a subclass can collide with: a signal-based field, or a method at class
// depth. `constructor` is excluded — it does not take `override` and only ever adds
// noise to the report.
const FIELD = /^ {2}(?:protected |public |private )?readonly (\w+) = (?:input|model|output|viewChild|viewChildren|contentChild|contentChildren|computed|signal)/gm;
const METHOD = /^ {2}(?:protected |public |private )?(?:override )?(?:async )?(\w+)\(/gm;
const NOT_A_MEMBER = new Set(['constructor', 'if', 'for', 'while', 'switch', 'catch', 'return']);

function surface(source) {
  if (source === null) return null;
  const names = new Set();
  for (const [, name] of source.matchAll(FIELD)) names.add(name);
  for (const [, name] of source.matchAll(METHOD)) {
    if (!NOT_A_MEMBER.has(name)) names.add(name);
  }

  return names;
}

const files = git(['diff', '--name-only', `${base}..HEAD`, '--', 'src/lib'])
  .split('\n')
  .filter((path) => path.endsWith('.ts') && !path.endsWith('.spec.ts'));

const grew = [];
const shrank = [];
for (const path of files) {
  const before = surface(show(base, path));
  const after = surface(show('HEAD', path));
  if (after === null) continue;
  const known = before ?? new Set();
  const added = [...after].filter((name) => !known.has(name)).sort();
  const removed = [...known].filter((name) => !after.has(name)).sort();
  const label = path.replace('src/lib/', '');
  if (added.length) grew.push([label, added, before === null]);
  if (removed.length) shrank.push([label, removed]);
}

if (!grew.length && !shrank.length) {
  console.log(`class-surface: no exported member changed since ${base}.`);
  process.exit(0);
}

console.log(`class-surface: comparing ${base}..HEAD\n`);
if (grew.length) {
  console.log('GAINED members — a subclass declaring the same name stops building:');
  for (const [label, names, isNew] of grew) {
    console.log(`  ${label}${isNew ? '  (new or renamed file)' : ''}`);
    console.log(`    ${names.join(', ')}`);
  }
  console.log('');
}
if (shrank.length) {
  console.log('LOST members — a subclass that overrode one now overrides nothing:');
  for (const [label, names] of shrank) {
    console.log(`  ${label}\n    ${names.join(', ')}`);
  }
  console.log('');
}
console.log(
  'Mirror this into the release as ONE `behavior` migration entry (see 0.8.0 / 0.9.0\n' +
    '`exported-class-members-grew`). A changed SIGNATURE will not appear here — it is not a\n' +
    'new name — so check the diff for those separately: they compile and misbehave.',
);
