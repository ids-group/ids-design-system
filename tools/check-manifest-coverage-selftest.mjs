#!/usr/bin/env node
// Does the coverage check still FIRE, and do its exemptions still HOLD? Both halves matter equally:
// the rule is narrow on purpose, so a narrowing that silently widened would start demanding the
// filler the gate exists to avoid, and one that silently broke would go green on the entries that
// shipped uncovered.
//
// A crash leaves CHANGELOG.md mutated, with the backup at the path printed below.
//
//   node tools/check-manifest-coverage-selftest.mjs
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHANGELOG = join(ROOT, 'CHANGELOG.md');
const BAK = join(tmpdir(), 'check-manifest-coverage-selftest.bak.md');
copyFileSync(CHANGELOG, BAK);
console.log(`backup: ${BAK}`);

const original = readFileSync(CHANGELOG, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';

const run = () => {
  try {
    execFileSync('node', ['tools/check-manifest-coverage.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    return { red: false, out: '' };
  } catch (e) {
    return { red: true, out: (e.stdout ?? '') + (e.stderr ?? '') };
  }
};

// `--layer-toast` is a real token and `migrations/unreleased.json` does not exist, so an entry
// naming it under a non-Added heading is exactly the shape that shipped uncovered six times.
const cases = [
  {
    name: 'FIRES on a Fixed entry naming a real token no manifest covers',
    section: 'Fixed',
    entry: '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost.',
    expect: 'red',
  },
  {
    name: 'EXEMPT: the same entry under Added is not asked for a line',
    section: 'Added',
    entry: '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost.',
    expect: 'green',
  },
  {
    name: 'EXEMPT: a Fixed entry naming no real surface is not asked for a line',
    section: 'Fixed',
    entry: '- **The shimmer stepped instead of sweeping.** Purely visual, nothing to name.',
    expect: 'green',
  },
  {
    name: 'EXEMPT: prose that merely looks like surface (`Enter`, `ACTION`, `Router`)',
    section: 'Fixed',
    entry: '- **`Enter` did nothing.** The `Router` never fired and `ACTION` was ignored.',
    expect: 'green',
  },
  {
    name: 'FIRES on a real tag, not only a token',
    section: 'Changed',
    entry: '- **`ds-accordion` collapses its body fully.** The padding moved off the wrapper.',
    expect: 'red',
  },
  {
    name: 'EXEMPT: the entry says for itself that nothing changed for the consumer',
    section: 'Fixed',
    entry:
      '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost. No API change, ' +
      'and nothing to do on your side.',
    expect: 'green',
  },
  {
    name: 'the exemption needs the phrase — the same entry without it still FIRES',
    section: 'Fixed',
    entry: '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost. No API change.',
    expect: 'red',
  },
];

let failed = 0;

// A family-wide rename is filed once with a placeholder, so a literal substring test reads the
// whole family as uncovered — it did, for both of 0.3.0's token renames. This is the case that
// keeps the pattern support from being dropped as unnecessary.
{
  const versionMode = (version) => {
    try {
      execFileSync('node', ['tools/check-manifest-coverage.mjs', version], {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      return 'green';
    } catch {
      return 'red';
    }
  };
  const got = versionMode('0.3.0');
  const ok = got === 'green';
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok   ' : 'FAIL '} a placeholder rename (--ds-*-bg → --ds-*-bg-color) covers its ` +
      `members — expected green, got ${got}`,
  );
}

try {
  for (const testCase of cases) {
    const block = [
      '## Unreleased',
      '',
      `### ${testCase.section}`,
      '',
      testCase.entry,
      '',
    ].join(eol);
    writeFileSync(CHANGELOG, original.replace(/^## Unreleased\r?\n/m, `${block}`), 'utf8');

    const { red } = run();
    const got = red ? 'red' : 'green';
    const ok = got === testCase.expect;
    if (!ok) failed++;
    console.log(`${ok ? 'ok   ' : 'FAIL '} ${testCase.name} — expected ${testCase.expect}, got ${got}`);
  }
} finally {
  writeFileSync(CHANGELOG, original, 'utf8');
  if (readFileSync(CHANGELOG, 'utf8') !== original) {
    console.error(`RESTORE FAILED — recover CHANGELOG.md from ${BAK}`);
    process.exit(1);
  }
  console.log('restored: CHANGELOG.md is back, byte for byte');
}

if (failed) {
  console.error(`\n${failed} case(s) wrong.`);
  process.exit(1);
}
// Counted, not written down: the tally said three while a fourth exemption was already in the list.
const fires = cases.filter((testCase) => testCase.expect === 'red').length;
const exempt = cases.filter((testCase) => testCase.expect === 'green').length;
console.log(
  `\nevery case behaved: ${fires} case(s) fire, ${exempt} exemption(s) hold`,
);
