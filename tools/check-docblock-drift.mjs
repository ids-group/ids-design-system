#!/usr/bin/env node
// Does every `/** */` still sit on the member it describes?
//
// Three times now a docblock has been separated from its symbol by a later insertion: a new
// member landed between the two, and the doc silently became the NEW member's — while the one
// it was written for was left bare. `TableSortMode` lost its doc to `TableFilterMode` that way,
// and `ariaSort` lost its to `rowKey`. Nothing catches it: both files compile, both lint clean,
// and the generated API table happily prints the wrong description under the wrong name.
//
// The shape is always the same and is exactly checkable: a doc comment whose next non-blank line
// opens ANOTHER doc comment. A doc documents one symbol, so a doc directly above a doc means the
// first one lost its subject.
//
//   node tools/check-docblock-drift.mjs [glob-root...]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['src/lib', 'ds-docs/src/app'];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') && !full.endsWith('.generated.ts')) {
      files.push(full);
    }
  }
};
for (const root of ROOTS) walk(root);

const findings = [];

for (const file of files) {
  const lines = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (!/^\s*\/\*\*/.test(lines[i])) continue;

    // A single-line `/** … */` closes on its own opening line.
    let close = i;
    while (close < lines.length && !/\*\//.test(lines[close])) close += 1;

    let next = close + 1;
    while (next < lines.length && lines[next].trim() === '') next += 1;

    const block = lines.slice(i, close + 1).join('\n');
    const isFileOverview = /@fileoverview|@module/.test(block);

    if (
      !isFileOverview &&
      next < lines.length &&
      /^\s*\/\*\*/.test(lines[next])
    ) {
      const subject = lines[i]
        .replace(/^\s*\/\*\*\s?/, '')
        .replace(/\s*\*\/\s*$/, '')
        .trim();
      findings.push({
        file: file.replace(/\\/g, '/'),
        line: i + 1,
        text: subject || lines[i + 1]?.replace(/^\s*\*\s?/, '').trim() || '',
      });
    }
    i = close;
  }
}

if (!findings.length) {
  console.log(
    `check-docblock-drift: OK — every doc comment across ${files.length} files sits on a symbol.`,
  );
  process.exit(0);
}

console.error(
  'check-docblock-drift: a doc comment is followed by another doc comment, so it documents nothing.\n' +
    'The symbol it was written for is the one now missing a doc — move it back down onto that symbol.\n',
);
for (const found of findings) {
  console.error(`  ${found.file}:${found.line}`);
  console.error(`    ${found.text.slice(0, 100)}\n`);
}
process.exit(1);
