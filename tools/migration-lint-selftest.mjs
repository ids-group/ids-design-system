#!/usr/bin/env node
// Does each migration-lint rule still FIRE? A rule that cannot match is invisible:
// the lint stays green either way, which is how M033 spent its whole life testing
// `^DELETE-LIST` while every manifest wrote the marker mid-line.
//
// Each entry breaks one manifest the way its rule forbids, runs the lint, and asserts that code
// appears. Nothing tracked is written: the whole migrations directory is copied to a per-process
// path first, so a crash leaves the repository untouched and two sessions cannot collide.
//
//   node tools/migration-lint-selftest.mjs
import { readFileSync, writeFileSync, rmSync, cpSync } from 'node:fs';
import { dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

// The fixtures go into a per-process COPY of the whole migrations directory, never into the
// tracked manifests. Mutating them and restoring afterwards is safe alone and corrupting in
// parallel: a second run copies the first run's fixture over the shared backup and then restores
// that, so a tracked manifest ends up broken while both runs exit 0. The whole directory is copied
// rather than the one file, because the lint reads every manifest and a thinner input would change
// which rules can fire.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = join(tmpdir(), `migration-lint-selftest.${process.pid}`);
rmSync(MIGRATIONS, { recursive: true, force: true });
// The dirty-baseline branch leaves through process.exit, before the cleanup at the end.
process.on('exit', () => rmSync(MIGRATIONS, { recursive: true, force: true }));
cpSync(join(ROOT, 'migrations'), MIGRATIONS, { recursive: true });
const F = join(MIGRATIONS, '0.9.0.json');
const PRISTINE = readFileSync(F, 'utf8');

// A case lints the one manifest it breaks; the rest still load, so `supersedes` resolves. Only the
// baseline sweeps every file, because M047 reads two release trees per manifest it checks.
const run = (only = []) => {
  try {
    execFileSync('node', ['tools/migration-lint.mjs', ...only], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
      env: { ...process.env, DS_MIGRATIONS_DIR: MIGRATIONS },
    });
    return '';
  } catch (e) {
    return (e.stdout ?? '') + (e.stderr ?? '');
  }
};

const mutations = {
  M002: (m) => delete m.version,
  M003: (m) => (m.version = '9.9.9'),
  M004: (m) => delete m.items,
  M005: (m) => delete m.informational,
  M010: (m) => (m.items[0].id = 'Bad_Id'),
  M011: (m) => (m.items[1].id = m.items[0].id),
  M012: (m) => (m.items[0].kind = 'nonsense'),
  M013: (m) => {
    const i = m.items.find((x) => x.kind === 'behavior');
    i.note = 'short';
  },
  M014: (m) => {
    const i = m.items.find((x) => x.kind === 'value-remap');
    if (i) delete i.map;
    else m.items[0] = { ...m.items[0], kind: 'value-remap', map: undefined };
  },
  M015: (m) => {
    const i = m.items.find((x) => x.kind === 'behavior');
    i.map = { a: 'b' };
  },
  M016: (m) => {
    const i = m.items.find((x) => x.kind === 'behavior');
    i.new = 'something';
  },
  M017: (m) => {
    const i = m.items.find((x) => x.kind !== 'behavior');
    delete i.searchHints;
    delete i.detect;
  },
  M018: (m) => {
    const i = m.items.find((x) => x.kind.endsWith('-rename'));
    if (i) delete i.new;
  },
  M020: (m) => delete m.items[0].surface,
  M021: (m) => (m.items[0].surface = 'nope'),
  M022: (m) => {
    const i = m.items.find((x) => x.kind === 'behavior');
    delete i.verify;
  },
  M024: (m) => {
    const i = m.items.find((x) => x.kind === 'behavior');
    i.note = i.note + ' The value now defaults to false.';
    delete i.restore;
  },
  M025: (m) => (m.items[0].supersedes = ['garbage']),
  M026: (m) => (m.items[0].supersedes = ['99.9.9#whatever']),
  M027: (m) => (m.items[0].supersedes = ['0.8.0#no-such-item']),
  M028: (m) => (m.items[0].supersededBy = '0.10.0#x'),
  M029: (m) => {
    m.items[0].note =
      m.items[0].note + ' This is reversed later, in a future release.';
  },
  M030: (m) => delete m.deleteList[0].find,
  M031: (m) => (m.deleteList[0].why = 'short'),
  M032: (m) => (m.deleteList[0].surface = 'nope'),
  M023: (m) => {
    const i = m.items.find((x) => x.kind === 'behavior');
    i.surface = 'typescript';
    delete i.detect;
  },
  M039: (m) => delete m.items[0].action,
  M040: (m) => {
    const i = m.items.find((x) => x.note);
    i.note = i.note + ' ACTION: do the thing.';
  },
  M041: (m) => {
    const i = m.items.find((x) => x.note);
    i.note = i.note + ' filler'.repeat(200);
  },
  M042: (m) => (m.items[0].pitfal = 'typo'),
  M037: (m) => delete m.deleteList,
  M035: (m) => delete m.deleteList[0].replaceWith,
  M036: (m) => (m.deleteList[0].id = 'Not_Kebab'),
  M034: (m) => {
    const i = m.informational.findIndex((s) => s.includes('(delete list:'));
    m.informational[i] = m.informational[i].replace(
      / \(delete list: [a-z0-9-]+\)/,
      '',
    );
  },
  M043: (m) => {
    const i = m.items.find((x) => x.kind === 'value-remap') ?? m.items[0];
    i.kind = 'value-remap';
    i.old = 'ds-x[attr]';
    i.map = { compact: 'count' };
  },
  M044: (m) => {
    const i = m.items.find((x) => x.kind === 'value-remap') ?? m.items[0];
    i.kind = 'value-remap';
    i.map = { a: 'attr="b"' };
    i.old = 'attr="a"';
  },
  M045: (m) => {
    const i = m.items.find((x) => x.kind === 'selector-rename');
    i.surface = 'template';
  },
  M046: (m) => {
    m.informational.push({ verify: 'open it and look' });
  },
  M047: (m) => {
    const i = m.items.find((x) => x.kind === 'selector-rename');
    i.new = 'ds-auth-layout variant="card"';
  },
};

// A rule that fires on the defect and on the fix alike is a rule nobody can satisfy, so a rule
// with a shape the corpus does not exercise gets its own control: the same mutation with the
// requirement met, which must stay green.
const negativeControls = [
  {
    label: 'M045 stays quiet on a selector-rename whose surface includes style',
    code: 'M045',
    mutate: (m) => {
      const i = m.items.find((x) => x.kind === 'selector-rename');
      i.surface = ['template', 'style'];
    },
  },
  {
    label: 'M046 stays quiet on a well-formed { text, verify } informational object',
    code: 'M046',
    mutate: (m) => {
      m.informational.push({
        text: 'A rendering-only change to the layout.',
        verify: 'open it and look',
      });
    },
  },
  {
    label: 'M034 stays quiet on an informational object whose text cites a real delete-list id',
    code: 'M034',
    mutate: (m) => {
      m.informational.push({
        text: 'That override was doing nothing after the fix and can go. (delete list: search-height-pinned-for-a-short-row)',
        verify: 'open it and look',
      });
    },
  },
  {
    label: 'M047 stays quiet on an element-scoped rename whose action cites a delete-list row',
    code: 'M047',
    mutate: (m) => {
      const i = m.items.find((x) => x.kind === 'selector-rename');
      i.kind = 'input-rename';
      i.old = 'ds-auth-shell[variant]';
      i.new = 'ds-auth-layout[appearance]';
      i.action = `${i.action} (delete list: ${m.deleteList[0].id})`;
    },
  },
  {
    label: 'M013 stays quiet when a non-rename item has no `note` at all',
    code: 'M013',
    mutate: (m) => {
      const i = m.items.find((x) => x.kind === 'behavior');
      delete i.note;
    },
  },
];

// A defect anywhere in the corpus makes a case pass without its own mutation firing, because the
// lint sweeps every manifest. Assert the baseline is clean first, or every result below is noise.
{
  const baseline = run();
  if (baseline.trim()) {
    console.error(
      'migration-lint-selftest: the manifests are not clean before any fixture is written, so a ' +
        `case could pass on somebody else's defect:
${baseline}`,
    );
    process.exit(1);
  }
  console.log('ok     the corpus is clean before the first fixture');
}

const dead = [];
for (const [code, mutate] of Object.entries(mutations)) {
  const m = JSON.parse(PRISTINE);
  try {
    mutate(m);
  } catch {
    /* mutation not applicable */
  }
  writeFileSync(F, JSON.stringify(m, null, 2).replace(/\n/g, '\r\n') + '\r\n');
  const out = run([F]);
  const fired = out.includes(`${basename(F)}  ${code}  `);
  if (!fired) dead.push(code);
  console.log(`${fired ? 'fires ' : 'DEAD  '} ${code}`);
}
// Two cases the map above cannot express: one whose input is not valid JSON, and a second
// angle on a rule whose first mutation proves only half of what it now does.
const extraCases = [
  {
    label: 'M001 on a manifest that does not parse',
    code: 'M001',
    raw: '{ "version": "0.9.0", "items": [ }',
  },
  {
    label: 'M034 on a third-person delete instruction in an item pitfall',
    code: 'M034',
    mutate: (m) => {
      const item = m.items.find((x) => x.pitfall);
      item.pitfall = `${item.pitfall} That override can now be removed.`;
    },
  },
  {
    label: 'M034 via the clause-separated subject…can-go branch alone',
    code: 'M034',
    mutate: (m) => {
      m.informational.push(
        'That override was doing nothing after the fix and can go.',
      );
    },
  },
  {
    label: 'M044 on a value-remap with no `old` at all',
    code: 'M044',
    mutate: (m) => {
      const i = m.items.find((x) => x.kind === 'value-remap') ?? m.items[0];
      i.kind = 'value-remap';
      i.map = { a: 'attr="b"' };
      delete i.old;
    },
  },
  {
    label: 'M014 on a value-remap whose map is an array',
    code: 'M014',
    mutate: (m) => {
      const i = m.items.find((x) => x.kind === 'value-remap') ?? m.items[0];
      i.kind = 'value-remap';
      i.old = 'ds-x[attr]';
      i.map = ['attr="b"'];
    },
  },
  {
    label: 'M046 on an informational object with an unknown key',
    code: 'M046',
    mutate: (m) => {
      m.informational.push({ text: 'A rendering-only change.', proof: 'no', verify: 'open it and look' });
    },
  },
  {
    label: 'M034 fires on an uncited delete instruction inside an informational object\'s `text`',
    code: 'M034',
    mutate: (m) => {
      m.informational.push({
        text: 'That override was doing nothing after the fix and can go.',
        verify: 'open it and look',
      });
    },
  },
  {
    label: 'M047 on a rename whose action deletes a value as well',
    code: 'M047',
    mutate: (m) => {
      const i = m.items.find((x) => x.kind === 'token-rename');
      i.action = `${i.action} A value equal to the old default is deleted instead.`;
    },
  },
  {
    label: 'M047 on a token family whose expansion names a token the release does not have',
    code: 'M047',
    mutate: (m) => {
      const i = m.items.find((x) => x.id === 'auth-shell-tokens-to-auth-layout');
      i.new = '--ds-auth-frame-';
    },
  },
  {
    label: 'M046 on an informational object with text but no verify',
    code: 'M046',
    mutate: (m) => {
      m.informational.push({ text: 'A rendering-only change.' });
    },
  },
];

for (const { label, code, mutate, raw: text } of extraCases) {
  if (text) {
    writeFileSync(F, text);
  } else {
    const m = JSON.parse(PRISTINE);
    mutate(m);
    writeFileSync(
      F,
      JSON.stringify(m, null, 2).replace(/\n/g, '\r\n') + '\r\n',
    );
  }
  const fired = run([F]).includes(`${basename(F)}  ${code}  `);
  if (!fired) dead.push(label);
  console.log(`${fired ? 'fires ' : 'DEAD  '} ${label}`);
}

for (const { label, code, mutate } of negativeControls) {
  const m = JSON.parse(PRISTINE);
  mutate(m);
  writeFileSync(F, JSON.stringify(m, null, 2).replace(/\n/g, '\r\n') + '\r\n');
  const fired = run([F]).includes(`${basename(F)}  ${code}  `);
  if (fired) dead.push(label);
  console.log(`${fired ? 'FIRED ' : 'quiet '} ${label}`);
}

rmSync(MIGRATIONS, { recursive: true, force: true });
if (dead.length) process.exitCode = 1;
console.log(
  `\n${dead.length ? 'RULES THAT DID NOT BEHAVE: ' + dead.join(', ') : 'every rule fired, and every control stayed quiet'}`,
);
