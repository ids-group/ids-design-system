#!/usr/bin/env node
// Does each changelog-lint rule still FIRE? A rule that cannot match is invisible: the
// lint stays green either way, so a green gate becomes evidence of the wrong thing.
//
// Every case writes into a throwaway fixture, never a real file, so a crash cannot leave a
// published file broken.
//
//   node tools/changelog-lint-selftest.mjs
import { writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = 'changelog-lint-selftest.fixture.md';
const FIXTURE_PATH = join(ROOT, FIXTURE);
// At the root, NOT in `migrations/`: a crash between write and cleanup would otherwise
// leave a stray file that ships.
const MANIFEST = 'changelog-lint-selftest.fixture.json';
const MANIFEST_PATH = join(ROOT, MANIFEST);

// The prose around each offending token is deliberately plausible: a rule that only fires
// on a bare token would miss every real occurrence.
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
  // Also proves the export graph loaded: if resolution returns nothing, every C010 stops
  // firing and the gate still reports green.
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

  // `core.autocrlf` checks the published files out CRLF, and they wrap at ~100 columns, so
  // a two-word phrase routinely lands with a `\r` and a newline inside it.
  writeFileSync(
    FIXTURE_PATH,
    '# Fixture\r\n\r\n- **Members changed.** Run `npm run\r\n  class-surface` for the list.\r\n',
  );
  const wrapCaught = run(FIXTURE).includes('  C005  ');
  console.log(
    `${wrapCaught ? 'fires ' : 'DEAD  '} C005 across a CRLF line wrap`,
  );
  if (!wrapCaught) dead.push('C005-wrapped');

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

  // A ticket typed in lower case and a client name joined with an underscore are the same
  // disclosure.
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

  // A gate that cries wolf gets switched off, so each loosening above is paired with the
  // innocent line it must not flag.
  const innocent = [
    ['C006 page range', '- See pages 10-12 of the spec for the full grid.'],
    [
      'C009 substring',
      '- Requests are backlogged behind the render, not dropped.',
    ],
    ['C004 substring', '- Both representations stay in step automatically.'],
    [
      'C010 public type',
      '- `DsStatus` and `DsControlWidth` are exported for your own maps.',
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

  // An exemption is how a leak gets in, so both halves are asserted: the locator passes,
  // and the same name outside one — plus a client name inside one — still fails.
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

  // "internal" has to sit beside the NAME. A loose window lets an unrelated one silence a
  // real hit lines away, and the changelog carries 27 of them.
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

  // The exemption must not follow the string's VALUE out of a locator field: no finder
  // greps `informational`.
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

  // ...and it must not depend on one-value-per-line formatting, or a manifest written
  // compactly by hand loses the exemption.
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

  // C012, the repeat half — a section opened twice ranks EQUAL, so the order test cannot see it.
  const REPEATED_SECTION =
    '# Fixture\n\n## Unreleased\n\n### Fixed\n\n- **A.** x\n\n### Fixed\n\n- **B.** y\n';
  // 0.9.0's real shape: two breaking headings, one slot, both deliberate.
  const TWO_BREAKING_HALVES =
    '# Fixture\n\n## 0.9.0 — 2026-01-01\n\n### Changed (breaking, behaviour)\n\n- **A.** x\n\n### Changed (breaking, visual)\n\n- **B.** y\n';

  writeFileSync(FIXTURE_PATH, REPEATED_SECTION);
  const repeatCaught = run(FIXTURE).includes('  C012  ');
  console.log(
    `${repeatCaught ? 'fires ' : 'DEAD  '} C012 on a section opened twice`,
  );
  if (!repeatCaught) dead.push('C012 repeat');

  writeFileSync(FIXTURE_PATH, TWO_BREAKING_HALVES);
  const halvesQuiet = !run(FIXTURE).includes('  C012  ');
  console.log(
    `${halvesQuiet ? 'quiet ' : 'FALSE+'} C012 on two breaking halves in one slot`,
  );
  if (!halvesQuiet) dead.push('C012 false positive on the split breaking half');

  // C014 — an entry announcing that we repaired one of our own files. Three releases in a row
  // shipped one before the rule existed.
  const OUR_RECORD_ENTRY =
    '# Fixture\n\n## Unreleased\n\n### Fixed\n\n- **Four published migration manifests were corrected**, so re-read them.\n';
  const REAL_DEFECT =
    '# Fixture\n\n## Unreleased\n\n### Fixed\n\n- **The scrim blocked the pointer and not the keyboard.** It is `inert` now.\n';

  writeFileSync(FIXTURE_PATH, OUR_RECORD_ENTRY);
  const recordCaught = run(FIXTURE).includes('  C014  ');
  console.log(
    `${recordCaught ? 'fires ' : 'DEAD  '} C014 on an entry about our own bookkeeping`,
  );
  if (!recordCaught) dead.push('C014');

  writeFileSync(FIXTURE_PATH, REAL_DEFECT);
  const defectQuiet = !run(FIXTURE).includes('  C014  ');
  console.log(
    `${defectQuiet ? 'quiet ' : 'FALSE+'} C014 on a plainly described defect`,
  );
  if (!defectQuiet) dead.push('C014 false positive on a real defect');

  // C013 — a name that resolves to nothing. C010 walks the symbols that exist and are not
  // exported, so it could never see one that was never declared.
  const PHANTOM =
    '# Fixture\n\n## Unreleased\n\n### Added\n\n- **A.** One helper, `DsListCursor`, exported for you.\n';
  // The mirror: a name that DOES resolve must not trip C013 (C010 may still speak, which is
  // why this asserts on the code and not on a clean run).
  const REAL =
    '# Fixture\n\n## Unreleased\n\n### Added\n\n- **A.** The internal `DsControlValueAccessor` base is unchanged.\n';

  writeFileSync(FIXTURE_PATH, PHANTOM);
  const phantomCaught = run(FIXTURE).includes('  C013  ');
  console.log(
    `${phantomCaught ? 'fires ' : 'DEAD  '} C013 on a symbol nothing declares`,
  );
  if (!phantomCaught) dead.push('C013');

  writeFileSync(FIXTURE_PATH, REAL);
  const realQuiet = !run(FIXTURE).includes('  C013  ');
  console.log(
    `${realQuiet ? 'quiet ' : 'FALSE+'} C013 on a symbol that resolves`,
  );
  if (!realQuiet) dead.push('C013 false positive on a real symbol');

  // Announcing a removal is the one entry that MUST name a symbol nothing declares.
  const REMOVED =
    '# Fixture\n\n## Unreleased\n\n### Breaking\n\n- **A.** The `DsToastConfig` interface is removed with its token.\n';
  writeFileSync(FIXTURE_PATH, REMOVED);
  const removalQuiet = !run(FIXTURE).includes('  C013  ');
  console.log(
    `${removalQuiet ? 'quiet ' : 'FALSE+'} C013 on a symbol the entry says was removed`,
  );
  if (!removalQuiet) dead.push('C013 false positive on an announced removal');

  // C012 — the section order, which arrived wrong twice in two days before anything checked it.
  const WRONG_ORDER =
    '# Fixture\n\n## Unreleased\n\n### Changed\n\n- **A.** x\n\n### Added\n\n- **B.** y\n';
  const HOUSE_ORDER =
    '# Fixture\n\n## Unreleased\n\n### Added\n\n- **B.** y\n\n### Changed\n\n- **A.** x\n';
  // 0.9.0 spells its breaking half `Changed (breaking, visual)`, which is the Breaking slot.
  const BREAKING_ALIAS =
    '# Fixture\n\n## 0.9.0 — 2026-01-01\n\n### Changed (breaking, visual)\n\n- **A.** x\n\n### Added\n\n- **B.** y\n';

  writeFileSync(FIXTURE_PATH, WRONG_ORDER);
  const orderCaught = run(FIXTURE).includes('  C012  ');
  console.log(
    `${orderCaught ? 'fires ' : 'DEAD  '} C012 on Changed before Added`,
  );
  if (!orderCaught) dead.push('C012');

  for (const [what, body] of [
    ['C012 on the house order', HOUSE_ORDER],
    ['C012 on a breaking section under another name', BREAKING_ALIAS],
  ]) {
    writeFileSync(FIXTURE_PATH, body);
    const quiet = run(FIXTURE).includes('OK');
    if (!quiet) dead.push(what);
    console.log(`${quiet ? 'quiet ' : 'FALSE+'} ${what}`);
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
