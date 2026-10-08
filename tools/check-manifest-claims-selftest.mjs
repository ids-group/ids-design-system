#!/usr/bin/env node
// Does each manifest-claims rule still FIRE, and stay quiet where it must? Every case writes a
// draft manifest and a `## Unreleased` block into a per-process temporary directory, points the
// check at them, and asserts the rule it names appears, or that the run is clean. Nothing tracked
// is read as input or written.
//
//   node tools/check-manifest-claims-selftest.mjs
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sentenceHash } from './check-manifest-claims.mjs';
import { releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORK = join(tmpdir(), `manifest-claims-selftest.${process.pid}`);
const git = (args) =>
  execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8' }).trim();

const lastTag = releaseTags(ROOT).at(-1);
const insideCommit = lastTag
  ? git(['rev-list', '-n1', `${lastTag}..HEAD`])
  : '';
const rootCommit = git(['rev-list', '--max-parents=0', 'HEAD']).split('\n')[0];

const item = (fields) => ({
  id: 'probe',
  kind: 'behavior',
  old: 'ds-probe',
  new: null,
  surface: 'none',
  action: 'None.',
  ...fields,
});
const draft = (items, informational = []) => ({
  version: '0.0.0',
  items,
  informational,
  deleteList: [],
});
const UNRELEASED_CLEAN =
  '## Unreleased\n\n### Fixed\n\n- **Nothing here.** A plain fix.\n';
const unreleasedSaying = (sentence) =>
  `## Unreleased\n\n### Fixed\n\n- **\`ds-probe\` fix.** ${sentence}\n\n## 0.0.1 - 2026-01-01\n\n- **Old.** It renders identically.\n`;

const cases = [
  {
    label: 'sameness fires on "renders identically"',
    manifest: draft([item({ appliesWhen: 'A probe renders identically.' })]),
    expect: 'sameness',
  },
  {
    label: 'sameness fires on "unchanged" about behaviour',
    manifest: draft([item({ note: 'The dark theme is unchanged.' })]),
    expect: 'sameness',
  },
  {
    label: 'sameness stays quiet on "unchanged" about a signature',
    manifest: draft([item({ note: 'The signature is unchanged.' })]),
    expect: null,
  },
  {
    label: 'compile fires on a TS code in a pitfall',
    manifest: draft([item({ pitfall: 'An override fails with TS2416.' })]),
    expect: 'compile',
  },
  {
    label: 'compile fires on "still compiles"',
    manifest: draft([item({ pitfall: 'The old call still compiles.' })]),
    expect: 'compile',
  },
  {
    label: 'compile stays quiet in verify, which is the build check itself',
    manifest: draft([item({ verify: 'The app compiles with no TS2416.' })]),
    expect: null,
  },
  {
    label: 'count fires on a spelled count of tokens',
    manifest: draft([item({ action: 'Rename all seventeen tokens.' })]),
    expect: 'count',
  },
  {
    label: 'count fires on a numeral count of members',
    manifest: draft([
      item({ note: 'ChartComponent gained 21 public members.' }),
    ]),
    expect: 'count',
  },
  {
    label: 'count stays quiet on CSS values and versions',
    manifest: draft([
      item({ note: 'Set `3rem`, wait 140 ms, read 0.7 as in v0.13.2.' }),
    ]),
    expect: null,
  },
  {
    label: 'count stays quiet when the code spans beside it match',
    manifest: draft([item({ note: 'Three tokens: `--a`, `--b` and `--c`.' })]),
    expect: null,
  },
  {
    label: 'informational bare string with a claim fires',
    manifest: draft([], ['A probe looks the same.']),
    expect: 'sameness',
  },
  {
    label: 'informational object with fixture evidence is quiet',
    manifest: draft(
      [],
      [{ text: 'A probe looks the same.', evidence: ['fixture:probe.ts'] }],
    ),
    fixture: 'probe.ts',
    expect: null,
  },
  {
    label: 'evidence of an unknown kind fires',
    manifest: draft([item({ evidence: ['url:https://example.com'] })]),
    expect: 'evidence',
  },
  {
    label: 'evidence naming a missing fixture fires',
    manifest: draft([item({ evidence: ['fixture:missing.ts'] })]),
    expect: 'evidence',
  },
  {
    label: 'evidence escaping the fixtures folder fires',
    manifest: draft([item({ evidence: ['fixture:../README.md'] })]),
    expect: 'evidence',
  },
  {
    label: 'evidence naming a commit before the boundary fires',
    manifest: draft([item({ evidence: [`commit:${rootCommit}`] })]),
    expect: 'evidence',
  },
  {
    label: 'pixels, tokens and command evidence are accepted shapes',
    manifest: draft([
      item({
        note: 'It renders identically.',
        evidence: [
          'pixels:button-sizes',
          'tokens:--ds-button-height',
          'command:npm run build',
        ],
      }),
    ]),
    expect: null,
  },
  {
    label: '## Unreleased claim with no manifest backing fires',
    changelog: unreleasedSaying('It renders identically.'),
    expect: 'sameness',
  },
  {
    label:
      '## Unreleased claim backed by an evidence-carrying item naming its code is quiet',
    changelog: unreleasedSaying('It renders identically.'),
    manifest: draft([
      item({
        appliesWhen: 'A probe renders identically.',
        evidence: ['command:npm run build'],
      }),
    ]),
    expect: null,
  },
  {
    label:
      '## Unreleased claim whose code spans are only substrings of the backing still fires',
    changelog:
      '## Unreleased\n\n### Fixed\n\n- **`ro` and `rob` fix.** It renders identically.\n',
    manifest: draft([
      item({
        appliesWhen: 'A probe renders identically.',
        evidence: ['command:npm run build'],
      }),
    ]),
    expect: 'sameness',
  },
  {
    label: '## Unreleased claim backed by a different rule still fires',
    changelog: unreleasedSaying('It renders identically.'),
    manifest: draft([
      item({ pitfall: 'It fails with TS2416.', evidence: ['command:npx tsc'] }),
    ]),
    expect: 'sameness',
  },
  {
    label: 'released blocks are not judged in strict mode',
    changelog:
      UNRELEASED_CLEAN +
      '\n## 0.0.1 - 2026-01-01\n\n- **Old.** It renders identically.\n',
    expect: null,
  },
];
if (insideCommit)
  cases.push({
    label: 'evidence naming a commit inside last tag..HEAD is quiet',
    manifest: draft([
      item({
        note: 'It renders identically.',
        evidence: [`commit:${insideCommit}`],
      }),
    ]),
    expect: null,
  });
else
  console.log(
    `  skipped: HEAD is ${lastTag}, so no commit lies inside the unreleased boundary`,
  );

const prepare = ({ manifest, changelog, fixture }) => {
  rmSync(WORK, { recursive: true, force: true });
  mkdirSync(join(WORK, 'migrations', 'fixtures'), { recursive: true });
  if (manifest)
    writeFileSync(
      join(WORK, 'migrations', 'unreleased.json'),
      JSON.stringify(manifest, null, 2),
    );
  if (fixture)
    writeFileSync(join(WORK, 'migrations', 'fixtures', fixture), '// probe\n');
  writeFileSync(join(WORK, 'CHANGELOG.md'), changelog ?? UNRELEASED_CLEAN);
  writeFileSync(join(WORK, 'ledger.json'), '[]');
};
const runCheck = (...args) =>
  spawnSync(
    process.execPath,
    [join(ROOT, 'tools/check-manifest-claims.mjs'), ...args],
    {
      cwd: ROOT,
      encoding: 'utf8',
      env: {
        ...process.env,
        DS_MIGRATIONS_DIR: join(WORK, 'migrations'),
        DS_CHANGELOG_PATH: join(WORK, 'CHANGELOG.md'),
        DS_CLAIMS_LEDGER_PATH: join(WORK, 'ledger.json'),
      },
    },
  );

const failures = [];
try {
  for (const testCase of cases) {
    prepare(testCase);
    const { status, stdout, stderr } = runCheck();
    const output = stdout + stderr;
    const passed = testCase.expect
      ? status === 1 && output.includes(`[${testCase.expect}]`)
      : status === 0;
    if (!passed)
      failures.push(
        `${testCase.label}\n      exit ${status}: ${output.trim().split('\n').slice(0, 4).join(' | ')}`,
      );
  }

  // The audit reports a published claim and still exits 0.
  prepare({ changelog: unreleasedSaying('Plain.') });
  writeFileSync(
    join(WORK, 'migrations', '0.0.1.json'),
    JSON.stringify(
      draft([item({ note: 'All seventeen tokens render identically.' })]),
    ),
  );
  const audit = runCheck('--audit');
  const auditOutput = audit.stdout + audit.stderr;
  if (
    audit.status !== 0 ||
    !/^0\.0\.1 /m.test(auditOutput) ||
    !/  sameness .*\n.*0\.0\.1\.json  probe  note/.test(auditOutput) ||
    !/  count /.test(auditOutput) ||
    !/CHANGELOG\.md  line \d+  0\.0\.1: It renders identically/.test(
      auditOutput,
    )
  )
    failures.push(
      `--audit reports published hits grouped by version and rule, exit 0\n      exit ${audit.status}: ${auditOutput.trim().slice(0, 300)}`,
    );

  // The ledger: an entry silences exactly its sentence, an edit brings the sentence back, and an
  // entry whose sentence is gone is reported as stale.
  const VERIFIED = 'All seventeen tokens render identically.';
  const ledgerEntry = (sentence) => ({
    version: '0.0.1',
    file: 'migrations/0.0.1.json',
    location: 'probe note',
    hash: sentenceHash(sentence),
  });
  const auditWithLedger = (note, ledger) => {
    prepare({ changelog: UNRELEASED_CLEAN });
    writeFileSync(
      join(WORK, 'migrations', '0.0.1.json'),
      JSON.stringify(draft([item({ note })])),
    );
    writeFileSync(join(WORK, 'ledger.json'), JSON.stringify(ledger));
    const run = runCheck('--audit');
    return { status: run.status, output: run.stdout + run.stderr };
  };
  const ledgerCases = [
    {
      label: 'a ledger entry silences its sentence',
      run: auditWithLedger(VERIFIED, [ledgerEntry(VERIFIED)]),
      passes: (output) =>
        !/0\.0\.1\.json  probe  note/.test(output) &&
        /: 0 unverified claim\(s\)/.test(output) &&
        /2 verified in /.test(output) &&
        /0 stale ledger/.test(output),
    },
    {
      label: 'whitespace alone does not unsilence a sentence',
      run: auditWithLedger(VERIFIED.replace(' ', '  '), [
        ledgerEntry(VERIFIED),
      ]),
      passes: (output) => /: 0 unverified claim\(s\)/.test(output),
    },
    {
      label: 'an edited sentence is reported again and its entry is stale',
      run: auditWithLedger('All eighteen tokens render identically.', [
        ledgerEntry(VERIFIED),
      ]),
      passes: (output) =>
        /0\.0\.1\.json  probe  note: All eighteen/.test(output) &&
        /stale - .*\(1\)\n {4}0\.0\.1 {2}migrations\/0\.0\.1\.json {2}probe note/.test(
          output,
        ),
    },
    {
      label: 'an entry whose sentence no longer exists is reported as stale',
      run: auditWithLedger(VERIFIED, [
        ledgerEntry(VERIFIED),
        { ...ledgerEntry('Gone.'), location: 'gone note' },
      ]),
      passes: (output) =>
        /: 0 unverified claim\(s\)/.test(output) &&
        /1 stale ledger/.test(output) &&
        /    0\.0\.1  migrations\/0\.0\.1\.json  gone note/.test(output),
    },
  ];
  for (const { label, run, passes } of ledgerCases)
    if (run.status !== 0 || !passes(run.output))
      failures.push(
        `${label}\n      exit ${run.status}: ${run.output.trim().slice(0, 300)}`,
      );
} finally {
  rmSync(WORK, { recursive: true, force: true });
}

if (failures.length) {
  console.error(
    `manifest-claims selftest: ${failures.length} case(s) failed:\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `manifest-claims selftest: ${cases.length + 5} case(s), every rule fired and every control stayed quiet.`,
);
