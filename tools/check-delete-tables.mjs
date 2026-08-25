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
// (2026-08-25: four entries had accumulated under `## Unreleased` with no table at all.)
//
//   node tools/check-delete-tables.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEADING = '### What you can now DELETE';
const DRAFT = 'unreleased.json';

const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8').replace(/\r\n/g, '\n');
const problems = [];
let checked = 0;

const manifests = readdirSync(join(ROOT, 'migrations'))
  .filter((file) => /^\d[\d.]*\.json$/.test(file))
  .sort()
  .map((file) => ({ file, label: file.replace(/\.json$/, ''), needle: null }));

if (existsSync(join(ROOT, 'migrations', DRAFT))) {
  // A released heading carries its date (`## 0.10.3 — …`); the draft's does not.
  manifests.push({ file: DRAFT, label: 'unreleased', needle: '\n## Unreleased\n' });
}

for (const { file, label, needle } of manifests) {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'migrations', file), 'utf8'));
  const entries = manifest.deleteList ?? [];
  if (!entries.length) continue;

  const start = changelog.indexOf(needle ?? `\n## ${label} `);
  if (start < 0) {
    problems.push(`${label}: ${entries.length} delete entr(ies) and no CHANGELOG block`);
    continue;
  }
  let end = changelog.indexOf('\n## ', start + 1);
  if (end < 0) end = changelog.length;
  const block = changelog.slice(start, end);

  const headingAt = block.indexOf(HEADING);
  if (headingAt < 0) {
    problems.push(`${label}: ${entries.length} delete entr(ies) and no "${HEADING}" table`);
    continue;
  }
  const rows = block
    .slice(headingAt)
    .split('\n')
    .filter((line) => /^\| (?!---|If you have)/.test(line));

  for (const entry of entries) {
    checked++;
    const shapes = [entry.find ?? []].flat();
    if (!rows.some((row) => shapes.some((shape) => row.includes(shape)))) {
      problems.push(
        `${label}#${entry.id}: no table row carries any of its find shapes ` +
          `(${shapes.slice(0, 3).join(', ')})`,
      );
    }
  }
}

for (const line of problems) console.error(`check-delete-tables: ERROR  ${line}`);

if (problems.length) {
  console.error(`check-delete-tables: FAILED — ${problems.length} problem(s)`);
  process.exit(1);
}

console.log(`check-delete-tables: ${checked} delete entr(ies) all reachable from the CHANGELOG.`);
