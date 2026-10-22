// Proves the heavy-check slot both ways: a second taker waits while the first holds it, and nobody
// waits on a holder that is gone. Then the shared gate: a ticket taken and given back, no second
// ticket when nested, and the lock file when the gate refuses. Uses its own lock path and a stub
// gate, never the real ones.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { acquireHeavyLock } from './heavy-lock.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const path = join(tmpdir(), `heavy-lock-selftest.${process.pid}.lock`);
const stubGate = join(tmpdir(), `heavy-lock-selftest.${process.pid}.gate.mjs`);
const gateCalls = join(tmpdir(), `heavy-lock-selftest.${process.pid}.calls`);
process.on('exit', () => {
  for (const file of [path, stubGate, gateCalls]) rmSync(file, { force: true });
});
// Cases 1-4 are the lock-file path, so they run with a gate that is not there.
process.env.DS_HEAVY_QUEUE_BIN = join(
  tmpdir(),
  'heavy-lock-selftest-no-gate.mjs',
);
delete process.env.HEAVY_QUEUE_TICKET;
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

// The stub answers like the gate's CLI and records each call with the owner it was given.
writeFileSync(
  stubGate,
  `import { appendFileSync } from 'node:fs';
   const [command, ...rest] = process.argv.slice(2);
   appendFileSync(${JSON.stringify(gateCalls)}, [command, ...rest, 'owner=' + process.env.HEAVY_QUEUE_OWNER].join(' ') + '\\n');
   if (command === 'acquire' && process.env.STUB_GATE_REFUSES) process.exit(1);
   if (command === 'acquire') console.log('stub-ticket');`,
);
const readCalls = () => {
  const calls = existsSync(gateCalls)
    ? readFileSync(gateCalls, 'utf8').trim().split('\n').filter(Boolean)
    : [];
  rmSync(gateCalls, { force: true });
  return calls;
};
process.env.DS_HEAVY_QUEUE_BIN = stubGate;

// 5. With the gate present, a test ticket owned by this process, exported while held, released
// with the exit code, and no lock file.
{
  const release = acquireHeavyLock('case 5', { path, log: quiet });
  expect(
    process.env.HEAVY_QUEUE_TICKET === 'stub-ticket',
    'a gate ticket was not exported to the child as HEAVY_QUEUE_TICKET',
  );
  expect(!existsSync(path), 'the gate path also took the lock file');
  release(3);
  expect(
    !process.env.HEAVY_QUEUE_TICKET,
    'HEAVY_QUEUE_TICKET outlived its release',
  );
  const calls = readCalls();
  expect(
    calls[0] === `acquire test case 5 owner=${process.pid}`,
    `the gate was not asked for a test ticket owned by this pid: ${calls[0]}`,
  );
  expect(
    calls[1]?.startsWith('release stub-ticket 3 '),
    `the ticket was not released with the exit code: ${calls[1]}`,
  );
}

// 6. Nested under a held ticket, nothing is acquired again.
{
  process.env.HEAVY_QUEUE_TICKET = 'outer-ticket';
  const release = acquireHeavyLock('case 6', { path, log: quiet });
  release(0);
  expect(readCalls().length === 0, 'a nested run asked the gate again');
  expect(!existsSync(path), 'a nested run took the lock file');
  delete process.env.HEAVY_QUEUE_TICKET;
}

// 7. A gate that refuses leaves the lock file to queue on, not an unqueued run.
{
  process.env.STUB_GATE_REFUSES = '1';
  const release = acquireHeavyLock('case 7', { path, log: quiet });
  expect(existsSync(path), 'a refusing gate left the check unqueued');
  expect(
    !process.env.HEAVY_QUEUE_TICKET,
    'a refused acquire exported a ticket',
  );
  release();
  readCalls();
  delete process.env.STUB_GATE_REFUSES;
}

// 8. The opt-out asks no gate either.
{
  process.env.DS_HEAVY_LOCK = 'off';
  acquireHeavyLock('case 8', { path, log: quiet })();
  expect(readCalls().length === 0, 'DS_HEAVY_LOCK=off still asked the gate');
  delete process.env.DS_HEAVY_LOCK;
}

if (failures.length) {
  console.error(
    `heavy-lock:selftest: ${failures.length} case(s) failed:\n  ${failures.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  'heavy-lock:selftest: OK - 8 cases: held and released, stale taken over, live waited on, opt-out; gate ticket taken and released, nested, refused, opt-out.',
);
