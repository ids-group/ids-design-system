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
import { patternsIn } from './check-manifest-coverage.mjs';

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
    entry:
      '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost.',
    expect: 'red',
  },
  {
    name: 'EXEMPT: the same entry under Added is not asked for a line',
    section: 'Added',
    entry:
      '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost.',
    expect: 'green',
  },
  {
    name: 'EXEMPT: a Fixed entry naming no real surface is not asked for a line',
    section: 'Fixed',
    entry:
      '- **The shimmer stepped instead of sweeping.** Purely visual, nothing to name.',
    expect: 'green',
  },
  {
    name: 'EXEMPT: prose that merely looks like surface (`Enter`, `ACTION`, `Router`)',
    section: 'Fixed',
    entry:
      '- **`Enter` did nothing.** The `Router` never fired and `ACTION` was ignored.',
    expect: 'green',
  },
  {
    name: 'FIRES on a real tag, not only a token',
    section: 'Changed',
    entry:
      '- **`ds-accordion` collapses its body fully.** The padding moved off the wrapper.',
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
    // A token the cycle INTRODUCED is the one a consumer greps for and finds nothing, so one
    // mention of an unrelated tag must not answer for it.
    name: 'FIRES on a token this cycle introduced, even beside a covered tag',
    section: 'Fixed',
    entry:
      '- **`ds-table` selection got a mark.** It animates over ' +
      '`--ds-check-mark-enter-duration`.',
    expect: 'red',
  },
  {
    // The `--space-1-5` shape: a token the library already had, read by the change rather than
    // introduced by it. Demanding a line here is filler, and points at a knob that is not the
    // supported one.
    name: 'EXEMPT: a pre-existing token beside a covered tag is not asked for a line',
    section: 'Fixed',
    entry:
      '- **`ds-table` selection got a mark.** It sits under `--layer-toast`.',
    expect: 'green',
  },
  {
    // The boundary itself. `ds-tab` is a real element the manifest never spells; it says
    // `ds-table` and `ds-tabs`. Every other red case here fires because NO hook is mentioned, so
    // none of them can see a boundary that has been loosened rather than removed — which is how
    // a `\w` written inside a plain template literal, where it degrades to the letter `w`,
    // shipped as a working fix.
    name: 'FIRES on a tag the manifest only ever spells as a longer name',
    section: 'Fixed',
    entry:
      '- **A `ds-tab` header lost its ring.** The indicator sat under the panel edge.',
    expect: 'red',
  },
  {
    name: 'the exemption needs the phrase — the same entry without it still FIRES',
    section: 'Fixed',
    entry:
      '- **A scrim sat under the toast layer.** It read `--layer-toast` and lost. No API change.',
    expect: 'red',
  },
];

let failed = 0;
let ran = 0;

// A family-wide rename is filed once with a placeholder — `--ds-*-bg` -> `--ds-*-bg-color` — and a
// literal substring test reads the whole family as uncovered. Asserted on the rule itself rather
// than on a released block's verdict: that verdict answers to every other item in the block too,
// so it stopped proving anything about placeholders the moment one of those items changed.
{
  const covers = (placeholder, token) =>
    patternsIn(placeholder).some((pattern) => pattern.test(token));
  const cases = [
    ['--ds-*-bg covers a member', '--ds-*-bg', '--ds-avatar-bg', true],
    ['--ds-*-bg does not reach the renamed name', '--ds-*-bg', '--ds-avatar-bg-color', false],
    ['<component> placeholders resolve', '--ds-<component>-focus-shadow', '--ds-button-focus-shadow', true],
    ['a placeholder stays inside its family', '--ds-segmented-*', '--ds-modal-pad-y', false],
    // Prose, not a placeholder: eight published manifests say "not a `--ds-*` component hook" in
    // a note, and each was answering for all 836 tokens in the namespace.
    ['a bare --ds-* names nothing and is refused', '--ds-*', '--ds-avatar-bg', false],
  ];
  for (const [name, placeholder, token, expected] of cases) {
    ran++;
    const got = covers(placeholder, token);
    const ok = got === expected;
    if (!ok) failed++;
    console.log(
      `${ok ? 'ok   ' : 'FAIL '} ${name} — expected ${expected}, got ${got}`,
    );
  }
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
    writeFileSync(
      CHANGELOG,
      original.replace(/^## Unreleased\r?\n/m, `${block}`),
      'utf8',
    );

    const { red } = run();
    ran++;
    const got = red ? 'red' : 'green';
    const ok = got === testCase.expect;
    if (!ok) failed++;
    console.log(
      `${ok ? 'ok   ' : 'FAIL '} ${testCase.name} — expected ${testCase.expect}, got ${got}`,
    );
  }

  // An unreadable `## ` heading does not skip its block, it MERGES the entries into the block
  // above, which then answers to the previous version's manifest. Silence is the failure mode
  // this check exists to catch, so it must not have one of its own.
  {
    const merged = original.replace(
      /^## Unreleased\r?\n/m,
      '## 0.99.0 - 2026-01-01' + eol + eol,
    );
    writeFileSync(CHANGELOG, merged, 'utf8');
    const { red, out } = run();
    ran++;
    const ok = red && out.includes('cannot read');
    if (!ok) failed++;
    console.log(
      (ok ? 'ok   ' : 'FAIL ') +
        'a version heading with a plain hyphen is refused, not silently merged into the ' +
        'block above — expected red naming the line, got ' +
        (red ? 'red' : 'green'),
    );
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
// Counted from what actually ran, never from the `cases` array: two checks live outside it, and
// a tally read off the array reported seven while nine had run.
const fires = cases.filter((testCase) => testCase.expect === 'red').length + 1;
console.log(
  `\nevery case behaved: ${ran} check(s) ran, ${fires} of them expected red`,
);
