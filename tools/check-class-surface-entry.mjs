#!/usr/bin/env node
// Does the `## Unreleased` class-collision entry still name every class whose member surface
// moved? The entry is a SNAPSHOT of `npm run class-surface`, so any feature commit landing after
// it is written invalidates it without touching it.
//
// A missed class is not cosmetic: subclassing is unsupported but consumers do it, and the entry
// is the only place one learns their build is about to stop on TS4114. Run at the cut — the last
// moment the entry can still be corrected.
//
//   node tools/check-class-surface-entry.mjs [baseRef]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const base =
  process.argv[2] ??
  execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();

let draft = null;
try {
  draft = JSON.parse(readFileSync('migrations/unreleased.json', 'utf8'));
} catch {
  draft = null;
}

// A static `ngTemplateContextGuard` is invisible to class-surface-diff, and it turns a context the
// consumer's template read as `any` into a typed one, so every `let-row` read that compiled before
// can stop compiling under strictTemplates. A file that is new in the range has no consumer yet.
const filesWithGuard = (ref) =>
  execSync(`git grep -l "static ngTemplateContextGuard" ${ref} -- src/lib`, {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/^[^:]+:/, ''));
const listGuarded = (ref) => {
  try {
    return filesWithGuard(ref);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
};
const existsAtBase = (path) => {
  try {
    execSync(`git cat-file -e ${base}:${path}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};
const guardedAtBase = new Set(listGuarded(base));
const templateItems = (draft?.items ?? [])
  .filter((item) => [item.surface].flat().includes('template'))
  .map((item) => JSON.stringify(item));
const unnamedGuards = listGuarded('HEAD')
  .filter((path) => !guardedAtBase.has(path) && existsAtBase(path))
  .map((path) => {
    const source = execSync(`git show HEAD:${path}`, { encoding: 'utf8' });
    const guarded = [
      ...source.matchAll(/export\s+(?:abstract\s+)?class\s+(\w+)/g),
    ].map((m) => m[1]);
    return { path, guarded };
  })
  .filter(
    ({ guarded }) =>
      !guarded.some((name) => templateItems.some((item) => item.includes(name))),
  );

if (unnamedGuards.length) {
  console.error(
    'check-class-surface-entry: a template context guard appeared since ' +
      `${base} on ${unnamedGuards.length} class(es) no \`surface: template\` item in ` +
      'migrations/unreleased.json names:',
  );
  for (const { path, guarded } of unnamedGuards)
    console.error(`  ${path.replace(/^src\/lib\//, '')} — ${guarded.join(' / ')}`);
  console.error(
    '  A context typed `any` before the guard is now checked: add a `behavior` item on',
  );
  console.error(
    '  `surface: template` with the consumer build error in `detect` (AUTHORING.md, tightened context).',
  );
}

let report;
try {
  report = execSync(`node tools/class-surface-diff.mjs ${base} HEAD`, {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
  });
} catch (error) {
  console.error(
    `check-class-surface-entry: class-surface-diff failed — ${error.message}`,
  );
  process.exit(1);
}

// The report indents a source path by two spaces and its member names by four, and annotates a
// path it did not see at the base ref. A file that is new in the range has no pre-existing
// subclass to collide, so it is reported for completeness and checked against nothing.
const files = [
  ...new Set(
    report
      .split('\n')
      .filter((line) => /^ {2}\S.*\.ts/.test(line))
      // Both spellings: class-surface-diff said "new or renamed file" until 001d9efb narrowed
      // the label to "new file", and this filter kept matching only the old one — so every new
      // component file was reported as a collision risk from then until 2026-09-12.
      .filter((line) => !/\(new( or renamed)? file\)/.test(line))
      .map((line) => line.trim().replace(/\s+\(.*\)$/, '')),
  ),
];

if (!files.length) {
  if (unnamedGuards.length) process.exit(1);
  console.log(
    'check-class-surface-entry: no class member surface moved since ' +
      base +
      '.',
  );
  process.exit(0);
}

const changelog = readFileSync('CHANGELOG.md', 'utf8').replace(/\r\n/g, '\n');
const unreleased = changelog.match(/^## Unreleased$\n([\s\S]*?)(?=^## )/m);
if (!unreleased) {
  console.error(
    "check-class-surface-entry: no '## Unreleased' section in CHANGELOG.md.",
  );
  process.exit(1);
}
const block = unreleased[1];

// `detect` is the field the consumer's updater greps with, so a class named in the prose but
// missing from `detect` is a subclass the update never surfaces.
const draftDetect = draft
  ? (draft.items ?? []).flatMap((item) => item.detect ?? []).join('\n')
  : null;

const missingProse = [];
const missingDetect = [];
for (const file of files) {
  let source;
  try {
    source = readFileSync(`src/lib/${file}`, 'utf8');
  } catch {
    // A DELETED component is the loudest possible member loss, and its classes are exactly the
    // ones a subclasser needs named — so read them from the base tag rather than refusing to run.
    // Exiting here made a release that removes a component impossible to pass, whatever the notes
    // said.
    try {
      source = execSync(`git show ${base}:src/lib/${file}`, {
        encoding: 'utf8',
        maxBuffer: 1 << 28,
      });
    } catch {
      console.error(
        `check-class-surface-entry: src/lib/${file} is in the report but readable at neither ` +
          `HEAD nor ${base}, so its classes cannot be named.`,
      );
      process.exit(1);
    }
  }
  const named = [
    ...source.matchAll(/export\s+(?:abstract\s+)?class\s+(\w+)/g),
  ].map((m) => m[1]);
  if (!named.length) continue;
  // Any exported class in the file counts: a file can hold more than one, and the entry only has
  // to name the one it is talking about.
  if (!named.some((name) => block.includes(name))) {
    missingProse.push(`${file} — ${named.join(' / ')}`);
  }
  if (
    draftDetect !== null &&
    !named.some((name) => draftDetect.includes(name))
  ) {
    missingDetect.push(`${file} — ${named.join(' / ')}`);
  }
}

if (missingProse.length) {
  console.error(
    'check-class-surface-entry: `## Unreleased` does not name ' +
      `${missingProse.length} class(es) whose member surface moved since ${base}:`,
  );
  for (const line of missingProse) console.error(`  ${line}`);
  console.error(
    `  Re-run \`npm run class-surface ${base} HEAD\` and extend the entry — an unnamed class`,
  );
  console.error(
    '  is a consumer whose build stops with nothing in the release notes to explain it.',
  );
}

if (missingDetect.length) {
  console.error(
    'check-class-surface-entry: no `detect` in migrations/unreleased.json names ' +
      `${missingDetect.length} class(es) whose member surface moved since ${base}:`,
  );
  for (const line of missingDetect) console.error(`  ${line}`);
  console.error(
    "  Add it to the subclass item's `detect` — the prose naming a class is not enough,",
  );
  console.error("  `detect` is what the consumer's updater greps with.");
}

if (missingProse.length || missingDetect.length || unnamedGuards.length)
  process.exit(1);

console.log(
  `check-class-surface-entry: all ${files.length} class(es) with a moved member surface are named in \`## Unreleased\`.`,
);
