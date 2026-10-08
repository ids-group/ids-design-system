// Proves the heavy-check slot both ways: a second taker waits while the first holds it, and nobody
// waits on a holder that is gone. Uses its own lock path, never the real one.
import { spawn } from 'node:child_process';
import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { acquireHeavyLock } from './heavy-lock.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const path = join(tmpdir(), `heavy-lock-selftest.${process.pid}.lock`);
process.on('exit', () => rmSync(path, { force: true }));
const quiet = () => {};
const failures = [];
const expect = (ok, message) => ok || failures.push(message);

// 1. Taken and given back: the file exists while held and is gone after.
{
  const release = acquireHeavyLock('case 1', { path, log: quiet });
  expect(existsSync(path), 'a held slot has no lock file');
  release();
  expect(!existsSync(path), 'a released slot left its lock file');
}

// 2. A holder that no longer exists does not block: its file is taken over at once.
{
  writeFileSync(path, '999999 a crashed run');
  const started = Date.now();
  const release = acquireHeavyLock('case 2', { path, log: quiet });
  expect(
    Date.now() - started < 1000,
    'a stale lock from a dead pid was waited on',
  );
  release();
}

// 3. A live holder makes the next taker wait until it lets go.
{
  const holder = spawn(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { acquireHeavyLock } from ${JSON.stringify(pathToFileURL(join(HERE, 'heavy-lock.mjs')).href)};
       const release = acquireHeavyLock('holder', { path: ${JSON.stringify(path)}, log: () => {} });
       process.stdout.write('held\\n');
       setTimeout(() => { release(); process.exit(0); }, 3000);`,
    ],
    { stdio: ['ignore', 'pipe', 'inherit'] },
  );
  await new Promise((resolve) => holder.stdout.once('data', resolve));
  const started = Date.now();
  const release = acquireHeavyLock('case 3', { path, log: quiet });
  const waited = Date.now() - started;
  release();
  await new Promise((resolve) => holder.once('exit', resolve));
  expect(
    waited >= 1500,
    `the second taker did not wait for a live holder (waited ${waited} ms)`,
  );
}

// 4. The opt-out takes nothing.
{
  process.env.DS_HEAVY_LOCK = 'off';
  const release = acquireHeavyLock('case 4', { path, log: quiet });
  expect(!existsSync(path), 'DS_HEAVY_LOCK=off still took the slot');
  release();
  delete process.env.DS_HEAVY_LOCK;
}

if (failures.length) {
  console.error(
    `heavy-lock:selftest: ${failures.length} case(s) failed:\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  'heavy-lock:selftest: OK - 4 cases: held and released, stale taken over, live waited on, opt-out.',
);
