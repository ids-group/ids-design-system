// Every probe file, found by glob rather than by a list: a hand-kept list of probe names is a
// list someone forgets to extend, and a probe that runs nowhere is worse than no probe at all.
// Each one runs in its own process because `finish()` exits the process on the first failure, so
// a shared one would stop at the first failing probe and report the rest as passing.
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const probeDir = join(dirname(fileURLToPath(import.meta.url)), 'probes');
const probes = readdirSync(probeDir)
  .filter((name) => name.endsWith('.probe.mjs'))
  .sort();

if (probes.length === 0) {
  console.error('run-probes: no *.probe.mjs found in tools/probes.');
  process.exit(1);
}

const failed = probes.filter(
  (probe) =>
    spawnSync(process.execPath, [join(probeDir, probe)], { stdio: 'inherit' })
      .status !== 0,
);

if (failed.length > 0) {
  console.error(`\nrun-probes: ${failed.length} of ${probes.length} failed — ${failed.join(', ')}`);
  process.exit(1);
}

console.log(`\nrun-probes: ${probes.length} probe(s) passed`);
