#!/usr/bin/env node
// Does each deck-lint rule still FIRE? A rule that cannot match is invisible: the
// lint stays green either way, and a green gate that means nothing is worse than no
// gate, because it is trusted. D012 is the one with a known real failure to
// reproduce — it is how ten decks were found referencing --space-7, --border-subtle,
// --shadow-md and --shadow-lg, none of which the DS defines.
//
// Each case writes ONE throwaway deck that is valid except for the thing under test,
// runs the lint, and asserts that code appears. Throwaway files rather than mutations
// of real decks, because this checkout is shared with other sessions: a crash here
// must not be able to leave a real deck broken. Every temp file is removed after its
// case and again at the end.
//
//   node tools/deck-lint-selftest.mjs
import { writeFileSync, rmSync, cpSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Fixtures go into a per-process COPY of presentations/, never into the tracked directory. Written
// there they are seen by the real gate, so a concurrent session goes red on a file it never made,
// and a crash leaves a `selftest-*.html` that `git add -A` would stage.
const DECKS = join(tmpdir(), `deck-lint-selftest.${process.pid}`);
const ARCHIVE = join(DECKS, 'implemented');
rmSync(DECKS, { recursive: true, force: true });
cpSync(join(ROOT, 'presentations'), DECKS, { recursive: true });
// On 'exit', not in a finally: the baseline branch leaves through process.exit, which skips finally.
process.on('exit', () => rmSync(DECKS, { recursive: true, force: true }));

const run = () => {
  try {
    execFileSync('node', ['tools/deck-lint.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, DS_DECKS_DIR: DECKS },
    });
    return '';
  } catch (error) {
    return (error.stdout ?? '') + (error.stderr ?? '');
  }
};

const deck = ({
  title = '<title>selftest</title>',
  status = '<meta name="ds-deck-status" content="open">',
  evidence = '',
  stylesheet = '<link rel="stylesheet" href="ds.css">',
  body = '<style>h1 { margin: var(--space-4); }</style><main><h1>selftest</h1></main>',
} = {}) =>
  `<meta charset="utf-8">\n${title}\n${status}\n${evidence}\n${stylesheet}\n${body}\n`;

const IMPLEMENTED = '<meta name="ds-deck-status" content="implemented">';
const GOOD_EVIDENCE = '<meta name="ds-deck-evidence" content="docs/todo.md">';

const cases = [
  ['D001', DECKS, '5001-selftest.html', deck({ status: '' })],
  [
    'D002',
    DECKS,
    '5002-selftest.html',
    deck({ status: '<meta name="ds-deck-status" content="nonsense">' }),
  ],
  [
    'D003',
    DECKS,
    '5003-selftest.html',
    deck({ status: IMPLEMENTED, evidence: GOOD_EVIDENCE }),
  ],
  [
    'D004',
    ARCHIVE,
    'selftest-d004.html',
    deck({ stylesheet: '<link rel="stylesheet" href="../ds.css">' }),
  ],
  [
    'D005',
    ARCHIVE,
    'selftest-d005.html',
    deck({
      status: IMPLEMENTED,
      stylesheet: '<link rel="stylesheet" href="../ds.css">',
    }),
  ],
  ['D006', DECKS, 'selftest-d006.html', deck()],
  ['D007', DECKS, '1-selftest.html', deck()],
  ['D008', DECKS, '5008-selftest.html', deck()],
  [
    'D009',
    ARCHIVE,
    '5009-selftest.html',
    deck({
      status: IMPLEMENTED,
      evidence: GOOD_EVIDENCE,
      stylesheet: '<link rel="stylesheet" href="../ds.css">',
    }),
  ],
  [
    'D010',
    ARCHIVE,
    'selftest-d010.html',
    deck({ status: IMPLEMENTED, evidence: GOOD_EVIDENCE }),
  ],
  [
    'D011',
    DECKS,
    '5011-selftest.html',
    deck({ stylesheet: '<link rel="stylesheet" href="../ds.css">' }),
  ],
  [
    'D012',
    DECKS,
    '5012-selftest.html',
    deck({ body: '<style>h1 { margin: var(--space-7); }</style>' }),
  ],
  [
    'D013',
    DECKS,
    '5013-selftest.html',
    deck({
      status: IMPLEMENTED,
      evidence:
        '<meta name="ds-deck-evidence" content="docs/does-not-exist.md">',
    }),
  ],
  ['D015', DECKS, '5015-selftest.html', deck({ title: '' })],
];

// The negative control. Without it a linter that reported every deck broken would
// pass every case above, and the suite would read as proof of nothing.
const CLEAN = [
  'selftest-clean.html',
  deck({
    status: '<meta name="ds-deck-status" content="tool">',
    stylesheet: '<link rel="stylesheet" href="ds.css">',
  }),
];

const failures = [];
const written = [];

const write = (dir, name, html) => {
  const path = join(dir, name);
  writeFileSync(path, html, 'utf8');
  written.push(path);

  return path;
};
const cleanup = () => {
  for (const path of written.splice(0)) if (existsSync(path)) rmSync(path);
};

try {
  const baseline = run();
  if (baseline !== '') {
    console.error(
      'deck-lint-selftest: the lint is not green to start with, so no case below proves anything.',
    );
    console.error(baseline);
    process.exit(1);
  }

  for (const [code, dir, name, html] of cases) {
    write(dir, name, html);
    const output = run();
    cleanup();
    if (!output.includes(code)) {
      failures.push(
        `${code} did not fire for ${name} — the rule cannot match, so it is guarding nothing.`,
      );
    }
  }

  const [cleanName, cleanHtml] = CLEAN;
  write(DECKS, cleanName, cleanHtml);
  const cleanOutput = run();
  cleanup();
  if (cleanOutput !== '') {
    failures.push(
      `the negative control ${cleanName} was reported broken, so a green run means nothing:\n${cleanOutput}`,
    );
  }
} finally {
  cleanup();
}

if (failures.length > 0) {
  console.error(`deck-lint-selftest: ${failures.length} rule(s) not proven.`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `deck-lint-selftest: OK — ${cases.length} rules each fired on a control, and a valid deck stayed green.`,
);
