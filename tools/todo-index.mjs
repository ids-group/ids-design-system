#!/usr/bin/env node
// Rebuilds `docs/todo.md`'s index from its own items, priority first.
//
//   node tools/todo-index.mjs            # rewrite the index in place
//   node tools/todo-index.mjs --check    # exit 1 if it is out of date
//
// Reads `- [ ] **[Pn] …**` items and their enclosing `## ` section, so closing an item means
// deleting the item and nothing else.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODO = join(ROOT, 'docs', 'todo.md');
const START = '<!-- todo-index:start -->';
const END = '<!-- todo-index:end -->';

const text = readFileSync(TODO, 'utf8');
const lines = text.split('\n');

const items = [];
let section = '';
for (const line of lines) {
  if (line.startsWith('## ')) {
    section = line.slice(3).trim();
    continue;
  }
  const match = /^- \[([ ~])\] \*\*\[(P\d)\] (.*)$/.exec(line);
  if (!match) continue;
  const [, mark, priority, rest] = match;
  let title = (rest.split('**')[0] || rest)
    .replace(/\s+/g, ' ')
    .replace(/[.:,;—-]\s*$/, '')
    .trim();
  // A title from a bold run that closes mid-clause is marked as cut, not left reading whole.
  if (
    /(?:^|\s)(?:a|an|the|and|or|of|to|in|on|for|with|that|which|no|not|longer|than|by|from|as)$/i.test(
      title,
    )
  ) {
    title += ' …';
  }
  items.push({ priority, mark, section, title });
}

const ORDER = ['P1', 'P2', 'P3'];
const counts = ORDER.map((p) => [
  p,
  items.filter((i) => i.priority === p).length,
]);
const partial = items.filter((i) => i.mark === '~').length;

const out = [START, ''];
out.push(
  `**${items.length} open — ${counts.map(([p, n]) => `${n} ${p}`).join(', ')}**` +
    (partial
      ? `, ${partial} of them half-done and waiting on a verdict`
      : '') +
    `. Counted by \`node tools/todo-index.mjs\` from the items themselves.`,
);
out.push('');

for (const priority of ORDER) {
  const group = items.filter((item) => item.priority === priority);
  if (!group.length) continue;
  out.push(`### ${priority} — ${group.length}`);
  out.push('');
  let lastSection = null;
  for (const item of group) {
    if (item.section !== lastSection) {
      out.push(`- **${item.section}**`);
      lastSection = item.section;
    }
    out.push(`  - ${item.mark === '~' ? '½ ' : ''}${item.title}`);
  }
  out.push('');
}
out.push(END);

const rebuilt = out.join('\n');
const from = text.indexOf(START);
const to = text.indexOf(END);
if (from === -1 || to === -1) {
  console.error(
    `todo-index: ${START} / ${END} markers not found in docs/todo.md`,
  );
  process.exit(1);
}
const next = text.slice(0, from) + rebuilt + text.slice(to + END.length);

if (process.argv.includes('--check')) {
  if (next !== text) {
    console.error(
      'todo-index: the index does not match the items — run `node tools/todo-index.mjs`',
    );
    process.exit(1);
  }
  console.log(`todo-index: OK — ${items.length} item(s), index matches.`);
} else {
  writeFileSync(TODO, next);
  console.log(
    `todo-index: ${items.length} item(s) indexed — ${counts.map(([p, n]) => `${p} ${n}`).join(', ')}.`,
  );
}
