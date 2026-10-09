// One machine-wide slot for the checks that build Angular or compile against extracted release trees.
// Every worktree of this repository shares the OS temp dir, so several sessions running the full
// check set at once queue here instead of each holding a gigabyte or more at the same time.
//
//   DS_HEAVY_LOCK=off   run without waiting (a CI runner owns the whole machine)
import { closeSync, openSync, readFileSync, rmSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const LOCK_PATH = join(tmpdir(), 'ids-design-system-heavy-check.lock');
const POLL_MS = 2000;
const sleep = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

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

// Blocks until this process holds the slot. A holder whose process is gone left the file behind
// after a crash or a kill, so its slot is taken over rather than waited on forever.
export function acquireHeavyLock(
  label,
  { path = LOCK_PATH, log = console.error } = {},
) {
  if (process.env.DS_HEAVY_LOCK === 'off') return () => {};
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
