#!/usr/bin/env node
// `presentations/backlog-board.html` embeds `docs/todo.md` and `docs/done.md` verbatim so its
// popover works over `file://`, and a copy nobody diffs rots: it carried a three-week-old backlog
// with three deck filenames that no longer existed.
//
// Deliberately NOT in `lint:all`, for the reason `todo-index:check` is not either: `docs/todo.md`
// is edited by parallel sessions in a shared checkout, so a byte-equality check against it fails a
// run that has nothing to do with the branch in hand. Run it before committing the board.
//
//   node tools/check-board-embed.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BOARD = join(ROOT, 'presentations', 'backlog-board.html');

const problems = [];

if (!existsSync(BOARD)) {
  console.error(
    'check-board-embed: presentations/backlog-board.html is missing.',
  );
  process.exit(1);
}

const html = readFileSync(BOARD, 'utf8');

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
  if (embedded.trim() !== live.trim()) {
    problems.push(
      `the embedded \`#${id}\` no longer matches ${file} — re-embed it, then rebuild the cards and MAP.`,
    );
  }
}

if (problems.length > 0) {
  console.error(`check-board-embed: ${problems.length} problem(s).`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  'check-board-embed: OK — the board carries the live docs/todo.md and docs/done.md.',
);
