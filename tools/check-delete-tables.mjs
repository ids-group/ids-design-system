#!/usr/bin/env node
// `migrations/README.md` asks for two copies of every delete row — the array a tool runs, the
// table a person reads — and nothing held them together.
//
// The test is not row COUNT. A hand-written table legitimately merges related entries into one
// row, so parity by count reports phantom gaps. What has to hold is that each entry is findable:
// at least one row carries one of the entry's `find` shapes verbatim, which is the same string a
// consumer greps their own code with. A row that only paraphrases the shape ("absolutely
// positioned" for `position: absolute`) fails on purpose — the reader cannot search for it.
//
// The DRAFT is checked too, and it is the only copy that can still be fixed. `preversion` runs
// this before `npm version`, so at that moment the manifest is still `unreleased.json` and the
// `## Unreleased` block is still open — a version-only sweep sees neither, and a missing table
// ships silently and first fails a release LATER, against a block nobody is editing any more.
//
//   node tools/check-delete-tables.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEADING = '### What you can now DELETE';
const DRAFT = 'unreleased.json';

const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8').replace(
  /\r\n/g,
  '\n',
);
const problems = [];
let checked = 0;

const manifests = readdirSync(join(ROOT, 'migrations'))
  .filter((file) => /^\d[\d.]*\.json$/.test(file))
  .sort()
  .map((file) => ({ file, label: file.replace(/\.json$/, ''), needle: null }));

if (existsSync(join(ROOT, 'migrations', DRAFT))) {
  // A released heading carries its date (`## 0.10.3 — …`); the draft's does not.
  manifests.push({
    file: DRAFT,
    label: 'unreleased',
    needle: '## Unreleased\n',
  });
}

for (const { file, label, needle } of manifests) {
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'migrations', file), 'utf8'),
  );
  const entries = manifest.deleteList ?? [];
  if (!entries.length) continue;

  // The trailing space is what keeps `## 0.1.0` from matching the start of `## 0.10.0`. The draft's
  // heading is the FIRST line of the file, so it has to be matched at index 0 as well: a needle
  // carrying a leading newline never found it, and the check reported a missing block for a table
  // that was sitting right there.
  const start = needle
    ? changelog.startsWith(needle)
      ? 0
      : changelog.indexOf(`\n${needle}`) + 1 || -1
    : changelog.indexOf(`\n## ${label} `);
  if (start < 0) {
    problems.push(
      `${label}: ${entries.length} delete entr(ies) and no CHANGELOG block`,
    );
    continue;
  }
  let end = changelog.indexOf('\n## ', start + 1);
  if (end < 0) end = changelog.length;
  const block = changelog.slice(start, end);

  const headingAt = block.indexOf(HEADING);
  if (headingAt < 0) {
    problems.push(
      `${label}: ${entries.length} delete entr(ies) and no "${HEADING}" table`,
    );
    continue;
  }
  // The FIRST column only. The second is the "Delete it, because" prose, which routinely names the
  // replacement API — so scanning the whole line let three entries pass on a shape that appeared
  // in the explanation rather than in the locator a reader actually greps with.
  const rows = block
    .slice(headingAt)
    .split('\n')
    .filter((line) => /^\| (?!---|If you have)/.test(line))
    // Split on unescaped pipes only, then unescape. Markdown forces `\|` inside a cell, so a
    // locator holding one — an Angular pipe, a TypeScript union, a `|=` selector — had no correct
    // spelling at all: escaped, the raw text did not match the manifest; unescaped, the cell was
    // truncated at the pipe.
    .map((line) => (line.split(/(?<!\\)\|/)[1] ?? '').replace(/\\\|/g, '|'));

  // A shape several entries share cannot identify a row: matching on `ds-table` alone let four
  // 0.9.0 entries pass on one unrelated row.
  const shapeUses = new Map();
  for (const entry of entries) {
    for (const shape of [entry.find ?? []].flat()) {
      shapeUses.set(shape, (shapeUses.get(shape) ?? 0) + 1);
    }
  }

  for (const entry of entries) {
    checked++;
    const distinctive = [entry.find ?? []]
      .flat()
      .filter((shape) => shapeUses.get(shape) === 1);
    if (!distinctive.length) {
      problems.push(
        `${label}#${entry.id}: every find shape is shared with a sibling entry, so no row can ` +
          `identify it — give it one shape of its own`,
      );
      continue;
    }
    if (
      !rows.some((cell) => distinctive.some((shape) => cell.includes(shape)))
    ) {
      problems.push(
        `${label}#${entry.id}: no table row names a shape unique to it ` +
          `(${distinctive.slice(0, 3).join(', ')})`,
      );
    }
  }
}

for (const line of problems)
  console.error(`check-delete-tables: ERROR  ${line}`);

if (problems.length) {
  console.error(`check-delete-tables: FAILED — ${problems.length} problem(s)`);
  process.exit(1);
}

console.log(
  `check-delete-tables: ${checked} delete entr(ies) all reachable from the CHANGELOG.`,
);
