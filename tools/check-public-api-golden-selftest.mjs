#!/usr/bin/env node
// Does `public-api-golden` still go red? Each case runs the check over a per-process copy of the
// committed goldens, so nothing tracked is written: an untouched copy must pass, and a copy with one
// golden edited, one deleted, or one extra must fail and name the file.
//
//   node tools/check-public-api-golden-selftest.mjs
import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  cpSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GOLDENS = join(ROOT, 'goldens/public-api');
const COPY = join(tmpdir(), `public-api-golden-selftest.${process.pid}`);
process.on('exit', () => rmSync(COPY, { recursive: true, force: true }));

const fresh = () => {
  rmSync(COPY, { recursive: true, force: true });
  cpSync(GOLDENS, COPY, { recursive: true });
};
const check = () =>
  spawnSync(
    process.execPath,
    [join(ROOT, 'tools/check-public-api-golden.mjs')],
    {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, DS_GOLDEN_DIR: COPY },
    },
  );
const target = readdirSync(GOLDENS).find((name) => name.endsWith('.api.md'));

const cases = [
  ['fresh copy passes', () => {}, 0, null],
  [
    'stale golden fails',
    () => appendFileSync(join(COPY, target), 'export const stale = 1;\n'),
    1,
    '-export const stale = 1;',
  ],
  ['missing golden fails', () => rmSync(join(COPY, target)), 1, target],
  [
    'leftover golden fails',
    () => writeFileSync(join(COPY, 'removed-entry.api.md'), 'gone\n'),
    1,
    'removed-entry.api.md',
  ],
];

let failures = 0;
for (const [label, mutate, expectedStatus, expectedText] of cases) {
  fresh();
  mutate();
  const result = check();
  const output = `${result.stdout}${result.stderr}`;
  const ok =
    result.status === expectedStatus &&
    (expectedText === null || output.includes(expectedText));
  if (!ok) {
    failures++;
    console.error(
      `public-api-golden:selftest: "${label}" expected exit ${expectedStatus}${expectedText ? ` and "${expectedText}"` : ''}, got ${result.status}:\n${output.slice(0, 2000)}`,
    );
  }
}
console.log(
  failures
    ? `public-api-golden:selftest: ${failures} of ${cases.length} case(s) failed.`
    : `public-api-golden:selftest: ${cases.length} case(s) behave.`,
);
process.exitCode = failures ? 1 : 0;
