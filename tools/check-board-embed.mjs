#!/usr/bin/env node
// `presentations/backlog-board.html` embeds `docs/todo.md` and `docs/done.md` verbatim so its
// popover works over `file://`. The embed is a copy, so it needs diffing against its source.
//
// Deliberately NOT in `lint:all`, for the reason `todo-index:check` is not either: `docs/todo.md`
// is edited by parallel sessions in a shared checkout, so a byte-equality check against it fails a
// run that has nothing to do with the branch in hand. Run it before committing the board, and run
// it with `--fix` after committing either doc — `--fix` is idempotent and touches nothing else in
// the board, so the cards and MAP array survive it untouched.
//
//   node tools/check-board-embed.mjs [--fix]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BOARD = join(ROOT, 'presentations', 'backlog-board.html');
const fix = process.argv.includes('--fix');

const problems = [];
const fixed = [];

if (!existsSync(BOARD)) {
  console.error(
    'check-board-embed: presentations/backlog-board.html is missing.',
  );
  process.exit(1);
}

let html = readFileSync(BOARD, 'utf8');

for (const [id, file] of [
  ['todo-md', 'docs/todo.md'],
  ['done-md', 'docs/done.md'],
]) {
  const opening = `<script type="text/plain" id="${id}">`;
  const from = html.indexOf(opening);
  const to = from < 0 ? -1 : html.indexOf('</script>', from);
  if (to < 0) {
    problems.push(`has no \`#${id}\` block to compare.`);
    continue;
  }
  const embedded = html.slice(from + opening.length, to);
  const live = readFileSync(join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
  if (embedded.trim() === live.trim()) continue;

  if (!fix) {
    problems.push(
      `the embedded \`#${id}\` no longer matches ${file} — re-embed it with --fix, then check the cards and MAP.`,
    );
    continue;
  }
  html =
    html.slice(0, from + opening.length) +
    `\n${live.trim()}\n` +
    html.slice(to);
  fixed.push(file);
}

if (fixed.length > 0) writeFileSync(BOARD, html);

if (problems.length > 0) {
  console.error(`check-board-embed: ${problems.length} problem(s).`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

// A doc whose ITEMS changed also changes what the board should show, and that part is hand-curated.
if (fixed.length > 0) {
  console.log(
    `check-board-embed: re-embedded ${fixed.join(' and ')} — check the cards and MAP against the new items.`,
  );
} else {
  console.log(
    'check-board-embed: OK — the board carries the live docs/todo.md and docs/done.md.',
  );
}
