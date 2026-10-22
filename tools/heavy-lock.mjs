// One machine-wide queue for the checks that build Angular or compile against extracted release
// trees, so several sessions running the full check set at once do not each hold a gigabyte or more
// at the same time.
//
// Where the machine has the shared heavy-command gate (`~/.claude/bin/heavy-queue.mjs`), a check
// takes a `test` ticket there and waits behind every other heavy command, not only behind other
// checks. The ticket is exported as HEAVY_QUEUE_TICKET to the child, so a build the check spawns
// through an agent shell is seen as nested and does not queue a second time. Without the gate (CI,
// another machine), or when it fails to answer, every worktree shares one lock file in the OS temp
// dir.
//
//   DS_HEAVY_LOCK=off        run without waiting (a CI runner owns the whole machine)
//   DS_HEAVY_QUEUE_BIN=path  the gate script, run with node; a missing file means no gate
import { spawnSync } from 'node:child_process';
import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  rmSync,
  writeSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

export const LOCK_PATH = join(tmpdir(), 'ids-design-system-heavy-check.lock');
const POLL_MS = 2000;
const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const gatePath = () =>
  process.env.DS_HEAVY_QUEUE_BIN ??
  join(homedir(), '.claude', 'bin', 'heavy-queue.mjs');

const holderOf = (path) => {
  try {
    const [pid, ...label] = readFileSync(path, 'utf8').trim().split(' ');
    return { pid: Number(pid), label: label.join(' ') };
  } catch {
    return null;
  }
};

const alive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
};

// Returns a release function, or null when the gate is absent or did not admit, so the caller falls
// back to the lock file rather than running unqueued.
const acquireFromGate = (label) => {
  const gate = gatePath();
  if (!existsSync(gate)) return null;
  const acquired = spawnSync(
    process.execPath,
    [gate, 'acquire', 'test', label],
    {
      env: { ...process.env, HEAVY_QUEUE_OWNER: String(process.pid) },
      stdio: ['ignore', 'pipe', 'inherit'],
      encoding: 'utf8',
    },
  );
  const ticket = acquired.status === 0 ? acquired.stdout.trim() : '';
  if (!ticket) return null;
  process.env.HEAVY_QUEUE_TICKET = ticket;
  let released = false;
  const release = (exitCode) => {
    if (released) return;
    released = true;
    delete process.env.HEAVY_QUEUE_TICKET;
    spawnSync(
      process.execPath,
      [
        gate,
        'release',
        ticket,
        ...(exitCode === undefined ? [] : [String(exitCode)]),
      ],
      { stdio: 'ignore' },
    );
  };
  process.once('exit', () => release());
  return release;
};

// Blocks until this process holds the slot; the returned function takes the check's exit code. A
// lock-file holder whose process is gone left the file behind after a crash or a kill, so its slot is
// taken over rather than waited on forever.
export function acquireHeavyLock(
  label,
  { path = LOCK_PATH, log = console.error } = {},
) {
  if (process.env.DS_HEAVY_LOCK === 'off') return () => {};
  // Already holding a gate ticket further up the process tree.
  if (process.env.HEAVY_QUEUE_TICKET) return () => {};
  const fromGate = acquireFromGate(label);
  if (fromGate) return fromGate;
  let announced = false;
  for (;;) {
    try {
      const fd = openSync(path, 'wx');
      writeSync(fd, `${process.pid} ${label}`);
      closeSync(fd);
      let released = false;
      const release = () => {
        if (released) return;
        released = true;
        if (holderOf(path)?.pid === process.pid) rmSync(path, { force: true });
      };
      process.once('exit', release);
      return release;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    const holder = holderOf(path);
    if (holder && !alive(holder.pid)) {
      rmSync(path, { force: true });
      continue;
    }
    if (!announced) {
      log(
        `${label}: waiting for ${holder?.label ?? 'another heavy check'} (pid ${holder?.pid}) to finish`,
      );
      announced = true;
    }
    sleep(POLL_MS);
  }
}
