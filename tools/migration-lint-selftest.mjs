#!/usr/bin/env node
// Does each migration-lint rule still FIRE? A rule that cannot match is invisible:
// the lint stays green either way, which is how M033 spent its whole life testing
// `^DELETE-LIST` while every manifest wrote the marker mid-line.
//
// Each entry breaks one real manifest the way its rule forbids, runs the lint, and
// asserts that code appears. Every case starts from a fresh copy of the backup, but the
// manifest itself is only restored at the end; a crash leaves it mutated, with the backup
// at the path below.
//
//   node tools/migration-lint-selftest.mjs
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const F = 'migrations/0.9.0.json';
const BAK = join(tmpdir(), 'migration-lint-selftest.bak.json');
copyFileSync(F, BAK);

const run = () => {
  try {
    execFileSync('node', ['tools/migration-lint.mjs'], { encoding: 'utf8', stdio: 'pipe' });
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
  M013: (m) => { const i = m.items.find((x) => x.kind === 'behavior'); i.note = 'short'; },
  M014: (m) => { const i = m.items.find((x) => x.kind === 'value-remap'); if (i) delete i.map; else m.items[0] = { ...m.items[0], kind: 'value-remap', map: undefined }; },
  M015: (m) => { const i = m.items.find((x) => x.kind === 'behavior'); i.map = { a: 'b' }; },
  M016: (m) => { const i = m.items.find((x) => x.kind === 'behavior'); i.new = 'something'; },
  M017: (m) => { const i = m.items.find((x) => x.kind !== 'behavior'); delete i.searchHints; delete i.detect; },
  M018: (m) => { const i = m.items.find((x) => x.kind.endsWith('-rename')); if (i) delete i.new; },
  M020: (m) => delete m.items[0].surface,
  M021: (m) => (m.items[0].surface = 'nope'),
  M022: (m) => { const i = m.items.find((x) => x.kind === 'behavior'); delete i.verify; },
  M024: (m) => { const i = m.items.find((x) => x.kind === 'behavior'); i.note = i.note + ' The value now defaults to false.'; delete i.restore; },
  M025: (m) => (m.items[0].supersedes = ['garbage']),
  M026: (m) => (m.items[0].supersedes = ['99.9.9#whatever']),
  M027: (m) => (m.items[0].supersedes = ['0.8.0#no-such-item']),
  M028: (m) => (m.items[0].supersededBy = '0.10.0#x'),
  M029: (m) => { m.items[0].note = m.items[0].note + ' This is reversed later, in a future release.'; },
  M030: (m) => delete m.deleteList[0].find,
  M031: (m) => (m.deleteList[0].why = 'short'),
  M032: (m) => (m.deleteList[0].surface = 'nope'),
  M023: (m) => { const i = m.items.find((x) => x.kind === 'behavior'); i.surface = 'typescript'; delete i.detect; },
  M039: (m) => delete m.items[0].action,
  M040: (m) => { const i = m.items.find((x) => x.note); i.note = i.note + ' ACTION: do the thing.'; },
  M041: (m) => { const i = m.items.find((x) => x.note); i.note = (i.note + ' filler'.repeat(200)); },
  M042: (m) => (m.items[0].pitfal = 'typo'),
  M037: (m) => delete m.deleteList,
  M035: (m) => delete m.deleteList[0].replaceWith,
  M036: (m) => (m.deleteList[0].id = 'Not_Kebab'),
  M034: (m) => { const i = m.informational.findIndex((s) => s.includes('(delete list:')); m.informational[i] = m.informational[i].replace(/ \(delete list: [a-z0-9-]+\)/, ''); },
};

const dead = [];
for (const [code, mutate] of Object.entries(mutations)) {
  const m = JSON.parse(readFileSync(BAK, 'utf8'));
  try { mutate(m); } catch { /* mutation not applicable */ }
  writeFileSync(F, JSON.stringify(m, null, 2).replace(/\n/g, '\r\n') + '\r\n');
  const out = run();
  const fired = out.includes(`  ${code}  `);
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
];

for (const { label, code, mutate, raw: text } of extraCases) {
  if (text) {
    writeFileSync(F, text);
  } else {
    const m = JSON.parse(readFileSync(BAK, 'utf8'));
    mutate(m);
    writeFileSync(F, JSON.stringify(m, null, 2).replace(/\n/g, '\r\n') + '\r\n');
  }
  const fired = run().includes(`  ${code}  `);
  if (!fired) dead.push(label);
  console.log(`${fired ? 'fires ' : 'DEAD  '} ${label}`);
}

copyFileSync(BAK, F);
if (dead.length) process.exitCode = 1;
console.log(`\n${dead.length ? 'RULES THAT DID NOT FIRE: ' + dead.join(', ') : 'every rule fired'}`);
