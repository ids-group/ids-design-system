#!/usr/bin/env node
// Does each changelog-lint rule still FIRE? A rule that cannot match is invisible:
// the lint stays green either way, and a green gate over a leaking file is worse
// than no gate, because it is evidence of the wrong thing.
//
// Each case writes ONE offending line into a throwaway fixture and asserts that
// rule's code appears. Nothing real is mutated — unlike the migration-lint
// selftest, which edits a live manifest and restores it, this cannot leave a
// published file broken if it crashes.
//
//   node tools/changelog-lint-selftest.mjs
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = 'changelog-lint-selftest.fixture.md';
const FIXTURE_PATH = join(ROOT, FIXTURE);
// A second fixture for the manifest rules. It lives at the root, NOT in `migrations/`,
// so a crash between write and cleanup cannot leave a stray file that ships.
const MANIFEST = 'changelog-lint-selftest.fixture.json';
const MANIFEST_PATH = join(ROOT, MANIFEST);

// One line per rule, each the shape the rule exists to catch. The prose around the
// offending token is deliberately plausible — a rule that only fires on a bare
// token would miss every real occurrence.
const cases = {
  C001: 'Fixes a table header issue mm-broker reported on a detail screen.',
  C002: 'The clipped label is fixed (MBP-245), so an option keeps its descenders.',
  C003: 'Found by Stas while testing the docs on a phone.',
  C004: 'The recipe lives in `src/lib/styles/_press.scss` if you want to read it.',
  C005: 'Run `npm run class-surface` for the authoritative list of changed members.',
  C006: 'Body cells have had per-side hooks since 07-31, so the header follows.',
  C007: 'Four rules hold the contract — `action` required (M039) among them.',
  C008: 'The fill was corrected in `4b9e0c2` and has not moved since.',
  C009: 'Two dogfooding audits read the consumer stylesheets as a record.',
  // Resolved from the export graph, so this case also proves the graph loaded at all:
  // if the resolution silently returns nothing, every C010 stops firing and the rule
  // is dead while the gate still reports green.
  C010: 'The seven shared inputs are declared once, on `DsFieldBase`.',
  C011: 'Reverted at HEAD, so the shape you see is the second one.',
};

const run = (file) => {
  try {
    return execFileSync('node', ['tools/changelog-lint.mjs', file], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
  } catch (error) {
    return (error.stdout ?? '') + (error.stderr ?? '');
  }
};

const dead = [];
try {
  for (const [code, line] of Object.entries(cases)) {
    writeFileSync(FIXTURE_PATH, `# Fixture\n\n- ${line}\n`);
    const fired = run(FIXTURE).includes(`  ${code}  `);
    if (!fired) dead.push(code);
    console.log(`${fired ? 'fires ' : 'DEAD  '} ${code}`);
  }

  // The published files are committed CRLF and wrap at ~100 columns, so a two-word
  // phrase routinely lands with a `\r` and a newline in the middle of it. The first
  // version of the lint split on '\n' alone and walked past `npm run\r\n  class-surface`
  // in the changelog it was written to check.
  writeFileSync(
    FIXTURE_PATH,
    '# Fixture\r\n\r\n- **Members changed.** Run `npm run\r\n  class-surface` for the list.\r\n',
  );
  const wrapCaught = run(FIXTURE).includes('  C005  ');
  console.log(
    `${wrapCaught ? 'fires ' : 'DEAD  '} C005 across a CRLF line wrap`,
  );
  if (!wrapCaught) dead.push('C005-wrapped');

  // C005 was not the only rule the wrap could hide: every multi-word token can land
  // with the break inside it, and the client names are the ones that matter.
  const wrapped = {
    C001: '- The fix came out of a Kit\r\n  Movement screen, and the ports saw it too.\r\n',
    C002: '- The clipped label is fixed (MBP-\r\n  245), so descenders survive.\r\n',
    C009: '- Carried over from our\r\n  backlog, where it had sat for a while.\r\n',
  };
  for (const [code, body] of Object.entries(wrapped)) {
    writeFileSync(FIXTURE_PATH, `# Fixture\r\n\r\n${body}`);
    const caught = run(FIXTURE).includes(`  ${code}  `);
    if (!caught) dead.push(`${code}-wrapped`);
    console.log(
      `${caught ? 'fires ' : 'DEAD  '} ${code} across a CRLF line wrap`,
    );
  }

  // Spelling is not the rule. A ticket typed in lower case and a client name joined
  // with an underscore are the same disclosure, and a Windows author writes the
  // separator the other way round.
  const spellings = {
    C002: '- Restores the descenders (mbp-245), long overdue.',
    C001: '- Reported against mm_broker by way of a support ticket.',
    C004: '- The recipe lives in `src\\lib\\styles\\_press.scss` if you want it.',
  };
  for (const [code, line] of Object.entries(spellings)) {
    writeFileSync(FIXTURE_PATH, `# Fixture\n\n${line}\n`);
    const caught = run(FIXTURE).includes(`  ${code}  `);
    if (!caught) dead.push(`${code}-spelling`);
    console.log(
      `${caught ? 'fires ' : 'DEAD  '} ${code} regardless of case or separator`,
    );
  }

  // Loosening a rule buys false positives, and a gate that cries wolf gets switched
  // off. Each of these tripped a draft of the rule above it.
  const innocent = [
    ['C006 page range', '- See pages 10-12 of the spec for the full grid.'],
    [
      'C009 substring',
      '- Requests are backlogged behind the render, not dropped.',
    ],
    ['C004 substring', '- Both representations stay in step automatically.'],
    [
      'C010 public type',
      '- `DsStatus` and `DsButtonColor` are exported for your own maps.',
    ],
    [
      'C010 named internal',
      '- Declared once on an internal `DsFieldBase` every field extends.',
    ],
  ];
  for (const [what, line] of innocent) {
    writeFileSync(FIXTURE_PATH, `# Fixture\n\n${line}\n`);
    const output = run(FIXTURE);
    const quiet = output.includes('OK');
    if (!quiet) {
      dead.push(what);
      console.log(output.trim());
    }
    console.log(`${quiet ? 'quiet ' : 'FALSE+'} ${what}`);
  }

  // A manifest's locators are exempt from the private-symbol rule, because a consumer's
  // finder greps their source for every one of them. An exemption is how a leak gets in,
  // so both halves are asserted: the locator passes, and the same name in a `note` — plus
  // a client name in the same locator array — still fails.
  const manifest = (items) => {
    writeFileSync(
      MANIFEST_PATH,
      JSON.stringify({ version: '9.9.9', items }, null, 2),
    );

    return run(MANIFEST);
  };

  const locatorExempt = manifest([
    {
      id: 'fixture',
      old: 'class MyField extends DsFieldBase',
      searchHints: ['extends DsFieldBase', 'extends DsControlValueAccessor'],
      detect: ['DsMessageBase'],
      action: 'Rename your own member.',
    },
  ]).includes('  C010  ');
  console.log(
    `${locatorExempt ? 'FALSE+' : 'quiet '} C010 spares a manifest locator`,
  );
  if (locatorExempt) dead.push('C010-locator-exemption');

  const noteStillCaught = manifest([
    {
      id: 'fixture',
      old: 'x',
      action: 'Declare it once on DsFieldBase instead.',
    },
  ]).includes('  C010  ');
  console.log(
    `${noteStillCaught ? 'fires ' : 'DEAD  '} C010 outside a locator field`,
  );
  if (!noteStillCaught) dead.push('C010-exemption-too-wide');

  const clientInLocator = manifest([
    {
      id: 'fixture',
      old: 'x',
      searchHints: ['mm-broker/src/app'],
      action: 'Rename it.',
    },
  ]).includes('  C001  ');
  console.log(`${clientInLocator ? 'fires ' : 'DEAD  '} C001 inside a locator`);
  if (!clientInLocator) dead.push('C001-in-locator');

  // Four holes an adversarial pass proved with fixtures. Each is asserted in BOTH
  // directions, because an exemption is how a leak gets in.

  // 1. The private-symbol escape hatch used to accept "internal" anywhere within 800
  //    characters. With 27 of them in the changelog, that disarmed roughly a tenth of it.
  writeFileSync(
    FIXTURE_PATH,
    '# Fixture\n\n- The overlay now uses an internal cache, which is a detail.\n' +
      '- Unrelated paragraph, padding padding padding padding padding padding padding.\n' +
      '- The seven shared inputs are declared once on `DsFieldBase`, extend it freely.\n',
  );
  const farAway = run(FIXTURE).includes('  C010  ');
  console.log(
    `${farAway ? 'fires ' : 'DEAD  '} C010 when "internal" is a paragraph away`,
  );
  if (!farAway) dead.push('C010-proximity');

  // 2. The brand this sweep removed from `themes/README.md` by hand was in no word list,
  //    so the regression it fixes was unguarded. All four spellings.
  for (const spelling of [
    'brand-manage-my',
    '[data-brand="manage-my"]',
    'the Manage My portal',
    'brand-mm',
  ]) {
    writeFileSync(
      FIXTURE_PATH,
      `# Fixture\n\n- Authored on light: ${spelling}.\n`,
    );
    const caught = run(FIXTURE).includes('  C001  ');
    if (!caught) dead.push(`C001-${spelling}`);
    console.log(`${caught ? 'fires ' : 'DEAD  '} C001 on "${spelling}"`);
  }

  // 3. The locator exemption was keyed on the string VALUE, so the same string in
  //    `informational` — which has no `find` for a finder to run — was exempt too.
  writeFileSync(
    MANIFEST_PATH,
    JSON.stringify(
      {
        version: '9.9.9',
        items: [
          {
            id: 'one',
            old: 'x',
            searchHints: ['DsMessageBase'],
            action: 'Rename it.',
          },
        ],
        informational: ['DsMessageBase'],
      },
      null,
      2,
    ),
  );
  const escaped = !run(MANIFEST).includes('  C010  ');
  console.log(
    `${escaped ? 'FALSE-' : 'fires '} C010 on a locator string reused in informational`,
  );
  if (escaped) dead.push('C010-exemption-escapes-to-informational');

  // 4. ...and it depended on one-value-per-line formatting, so a manifest written
  //    compactly by hand lost the exemption entirely.
  writeFileSync(
    MANIFEST_PATH,
    '{ "version": "9.9.9", "items": [ { "id": "one", "old": "class X extends DsFieldBase", ' +
      '"searchHints": ["extends DsFieldBase"], "action": "Rename." } ] }\n',
  );
  const compactQuiet = run(MANIFEST).includes('OK');
  console.log(
    `${compactQuiet ? 'quiet ' : 'FALSE+'} C010 spares a compact one-line locator`,
  );
  if (!compactQuiet) dead.push('C010-compact-manifest');

  // Two rules used to fire the wrong way, which is how a gate teaches authors to ignore it.
  const relaxed = [
    [
      'C005 generic script',
      '- Run `npm run lint` afterwards to confirm nothing else moved.',
    ],
    [
      'C008 hex colour',
      '- A scrim of #1a2b3c4d over the surface, and #0f172aE6 for the veil.',
    ],
  ];
  for (const [what, line] of relaxed) {
    writeFileSync(FIXTURE_PATH, `# Fixture\n\n${line}\n`);
    const output = run(FIXTURE);
    const quiet = output.includes('OK');
    if (!quiet) {
      dead.push(what);
      console.log(output.trim());
    }
    console.log(`${quiet ? 'quiet ' : 'FALSE+'} ${what}`);
  }

  // A person's name reaches an entry in two shapes, and a two-name list catches neither.
  for (const line of [
    '- Found by Alex Park while testing the docs on a phone.',
    '- Ask Alex Park or your team lead.',
  ]) {
    writeFileSync(FIXTURE_PATH, `# Fixture\n\n${line}\n`);
    const caught = run(FIXTURE).includes('  C003  ');
    if (!caught) dead.push('C003-shape');
    console.log(
      `${caught ? 'fires ' : 'DEAD  '} C003 on a name not in the list`,
    );
  }

  // The mirror case: a line that trips nothing must stay green, or every rule
  // above is passing for the wrong reason.
  writeFileSync(
    FIXTURE_PATH,
    '# Fixture\n\n- **`ds-button` gains `disabledReason`.** The reason renders inside the button, and\n' +
      '  the control switches to `aria-disabled` so it stays focusable. Restore the old behaviour by\n' +
      '  leaving it unset. Partials are imported from `styles/ds` as before.\n',
  );
  const cleanOutput = run(FIXTURE);
  const cleanPassed = cleanOutput.includes('OK');
  console.log(`${cleanPassed ? 'clean ' : 'FALSE+'} a clean entry stays green`);
  if (!cleanPassed) {
    dead.push('false-positive-on-clean-entry');
    console.log(cleanOutput.trim());
  }
} finally {
  if (existsSync(FIXTURE_PATH)) rmSync(FIXTURE_PATH);
  if (existsSync(MANIFEST_PATH)) rmSync(MANIFEST_PATH);
}

if (dead.length) process.exitCode = 1;
console.log(
  `\n${dead.length ? 'NOT PROVEN: ' + dead.join(', ') : 'every rule fired, and a clean entry passed'}`,
);
