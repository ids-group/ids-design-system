#!/usr/bin/env node
// Does the coverage check still FIRE, and do its exemptions still HOLD? Both halves matter equally:
// the rule is narrow on purpose, so a narrowing that silently widened would start demanding the
// filler the gate exists to avoid, and one that silently broke would go green on the entries that
// shipped uncovered.
//
// The tracked CHANGELOG.md is never written: fixtures go to a per-process copy under the temp
// directory, so a crash leaves the repository untouched and two sessions cannot collide.
//
//   node tools/check-manifest-coverage-selftest.mjs
import { readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { patternsIn } from './check-manifest-coverage.mjs';
import { releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Fixtures go to a private copy, never to the tracked file. Writing CHANGELOG.md and restoring it
// afterwards is safe alone and corrupting in parallel: a second run backs up the first run's
// fixture and then "restores" that, leaving a red gate with no bad commit behind it. The path is
// per-process so two runs cannot meet.
const CHANGELOG = join(
  tmpdir(),
  `check-manifest-coverage-selftest.${process.pid}.md`,
);
const MIGRATIONS = join(
  tmpdir(),
  `check-manifest-coverage-selftest.${process.pid}.migrations`,
);
// On 'exit', not in the finally: the verdict leaves through process.exit, which skips finally.
process.on('exit', () => rmSync(MIGRATIONS, { recursive: true, force: true }));

const original = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
writeFileSync(CHANGELOG, original, 'utf8');
const eol = original.includes('\r\n') ? '\r\n' : '\n';

// A token this cycle really introduced. The case that uses it writes its own manifest naming a
// DIFFERENT hook, so what is proved is the introduced rule and not the blunter "no hook mentioned
// at all" one. A cycle that introduced nothing is normal, so the case skips rather than fails.
const introducedToken = (() => {
  const at = (ref) => {
    const found = new Set();
    try {
      const out = execFileSync(
        'git',
        [
          'grep',
          '-oh',
          '-e',
          '--ds-[a-z0-9-]*',
          ...(ref ? [ref] : []),
          '--',
          'src/lib',
        ],
        { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 },
      );
      for (const match of out.matchAll(/--ds-[a-z0-9-]*/g))
        if (!match[0].endsWith('-')) found.add(match[0]);
    } catch {
      /* no such tag, or nothing matched */
    }
    return found;
  };
  const tags = releaseTags(ROOT);
  if (!tags.length) return '';
  const before = at(tags.at(-1));
  return [...at('')].find((token) => !before.has(token)) ?? '';
})();

// Two real library tokens where one name contains the other. The boundary case writes a manifest
// naming only the LONGER one and an entry naming only the shorter: a working word boundary reports
// the shorter as uncovered, a loosened one lets the longer answer for it. Both halves have to be
// real hooks or the entry resolves nothing and the case proves nothing.
const [shortHook, longHook] = (() => {
  const hooks = new Set();
  try {
    const out = execFileSync(
      'git',
      ['grep', '-oh', '-e', '--[a-z][a-z0-9-]*', '--', 'src/lib'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 },
    );
    for (const match of out.matchAll(/--[a-z][a-z0-9-]*/g))
      if (!match[0].endsWith('-')) hooks.add(match[0]);
  } catch {
    return ['', ''];
  }
  const all = [...hooks];
  for (const short of all) {
    // The next character must be a LETTER, not a hyphen: a hyphen sits in both the correct
    // boundary class and the degraded one, so a pair like `--error` inside `--error-subtitle`
    // answers the same either way and proves nothing.
    const long = all.find(
      (candidate) =>
        candidate.length > short.length &&
        candidate.startsWith(short) &&
        /[a-z0-9]/.test(candidate[short.length]),
    );
    if (long) return [short, long];
  }
  return ['', ''];
})();

const run = (manifest) => {
  const env = { ...process.env, DS_CHANGELOG_PATH: CHANGELOG };
  if (manifest) {
    mkdirSync(MIGRATIONS, { recursive: true });
    writeFileSync(
      join(MIGRATIONS, 'unreleased.json'),
      JSON.stringify(
        { version: 'unreleased', items: [], ...manifest },
        null,
        2,
      ),
      'utf8',
    );
    env.DS_MIGRATIONS_DIR = MIGRATIONS;
  }
  try {
    execFileSync('node', ['tools/check-manifest-coverage.mjs'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env,
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
    // mention of a hook the manifest DOES carry must not answer for it. The covered half has to
    // be there, or the entry goes red through "no hook mentioned at all" and proves nothing about
    // this rule.
    name: 'FIRES on a token this cycle introduced, even beside a covered hook',
    section: 'Fixed',
    entry: `- **A control gained a mark.** It reads \`${longHook}\` and animates over \`${introducedToken}\`.`,
    expect: 'red',
    manifest: { informational: [`Only ${longHook} is documented here.`] },
    skipWhen: () => !longHook || !introducedToken,
  },
  {
    // The `--space-1-5` shape: a token the library already had, read by the change rather than
    // introduced by it. Demanding a line here is filler, and points at a knob that is not the
    // supported one. The covered half is read from the manifest AT RUN TIME — naming a fixed one
    // made the case answer to whatever the current cycle happens to document, and a release cut
    // empties the file, so it went red on a tree nobody had touched.
    name: 'EXEMPT: a pre-existing token beside a covered hook is not asked for a line',
    section: 'Fixed',
    entry: `- **A control moved a pixel.** It reads \`${longHook}\` and sits under \`--layer-toast\`.`,
    expect: 'green',
    manifest: { informational: [`Only ${longHook} is documented here.`] },
    skipWhen: () => !longHook,
  },
  {
    // The boundary itself: a real hook the manifest never spells on its own, only inside a longer
    // name. Every other red case fires because NO hook is mentioned, so none of them can see a
    // boundary that has been loosened rather than removed — which is how a `\w` written inside a
    // plain template literal, where it degrades to the letter `w`, shipped as a working fix. The
    // pair is derived from the live manifest, because a hardcoded one stops being a substring the
    // first time the documented surface changes.
    name: 'FIRES on a hook the manifest only ever spells as a longer name',
    section: 'Fixed',
    entry: `- **A control lost its ring.** The indicator read \`${shortHook}\`.`,
    expect: 'red',
    manifest: { informational: [`Only ${longHook} is documented here.`] },
    skipWhen: () => !shortHook,
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
    [
      '--ds-*-bg does not reach the renamed name',
      '--ds-*-bg',
      '--ds-avatar-bg-color',
      false,
    ],
    [
      '<component> placeholders resolve',
      '--ds-<component>-focus-shadow',
      '--ds-button-focus-shadow',
      true,
    ],
    [
      'a placeholder stays inside its family',
      '--ds-segmented-*',
      '--ds-modal-pad-y',
      false,
    ],
    // Prose, not a placeholder: eight published manifests say "not a `--ds-*` component hook" in
    // a note, and each was answering for all 836 tokens in the namespace.
    [
      'a bare --ds-* names nothing and is refused',
      '--ds-*',
      '--ds-avatar-bg',
      false,
    ],
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
    if (testCase.skipWhen?.()) {
      console.log(
        `skip  ${testCase.name} — the manifest names no hook to build it from`,
      );
      continue;
    }
    const block = [
      '## Unreleased',
      '',
      `### ${testCase.section}`,
      '',
      testCase.entry,
      '',
    ].join(eol);
    // Every case gets a changelog holding ONLY its own block and a manifest of its own. Inserting
    // the fixture ahead of the live entries left them in the block, so a case was judged together
    // with somebody else's line: seven of them went red on a tree nobody had touched whenever an
    // Unreleased entry was uncovered, and others reported the expected red for that entry rather
    // than for their fixture. The live records are the thing under test everywhere else; here they
    // are noise. What stays live is the library tree, which is what the rules read.
    writeFileSync(
      CHANGELOG,
      [block, '## 0.0.0 — 2000-01-01', ''].join(eol),
      'utf8',
    );

    const { red } = run(testCase.manifest ?? {});
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
  rmSync(CHANGELOG, { force: true });
  const tracked = join(ROOT, 'CHANGELOG.md');
  if (readFileSync(tracked, 'utf8') !== original) {
    console.error(
      'CHANGELOG.md changed while the selftest ran — it writes only its own copy, so this is ' +
        'another session editing the file, not this run.',
    );
    process.exit(1);
  }
  console.log('the tracked CHANGELOG.md was never written');
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
