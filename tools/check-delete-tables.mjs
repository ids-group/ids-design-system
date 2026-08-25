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
//   node tools/check-delete-tables.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HEADING = '### What you can now DELETE';

const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8').replace(/\r\n/g, '\n');
const problems = [];
let checked = 0;

for (const file of readdirSync(join(ROOT, 'migrations')).sort()) {
  if (!/^\d[\d.]*\.json$/.test(file)) continue;
  const version = file.replace(/\.json$/, '');
  const manifest = JSON.parse(readFileSync(join(ROOT, 'migrations', file), 'utf8'));
  const entries = manifest.deleteList ?? [];
  if (!entries.length) continue;

  const start = changelog.indexOf(`\n## ${version} `);
  if (start < 0) {
    problems.push(`${version}: ${entries.length} delete entr(ies) and no CHANGELOG block`);
    continue;
  }
  let end = changelog.indexOf('\n## ', start + 1);
  if (end < 0) end = changelog.length;
  const block = changelog.slice(start, end);

  const headingAt = block.indexOf(HEADING);
  if (headingAt < 0) {
    problems.push(`${version}: ${entries.length} delete entr(ies) and no "${HEADING}" table`);
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
        `${version}#${entry.id}: no table row carries any of its find shapes ` +
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
