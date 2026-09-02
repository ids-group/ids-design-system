#!/usr/bin/env node
// `npm run lint` globs `{src,ds-docs/src}/**/*.{ts,html}`, so nothing else parses these files
// and a syntax error in one surfaces only when that file happens to run. `preflight.mjs` is the
// worst case: it refuses to run off `main`, so it is never exercised before the cut.
//
//   node tools/check-tools-parse.mjs
import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOTS = ['tools', 'eslint-rules'];

const scripts = [];
const walk = (dir) => {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
    else if (name.endsWith('.mjs') || name.endsWith('.js')) scripts.push(rel);
  }
};
ROOTS.forEach(walk);

const broken = [];
for (const script of scripts) {
  try {
    execFileSync(process.execPath, ['--check', join(ROOT, script)], {
      stdio: 'pipe',
    });
  } catch (error) {
    const detail = (error.stderr?.toString() ?? '')
      .split('\n')
      .find((line) => /Error|error/.test(line));
    broken.push(`${script} — ${detail?.trim() ?? 'does not parse'}`);
  }
}

if (broken.length) {
  for (const line of broken) console.error(`check-tools-parse: ERROR  ${line}`);
  console.error(
    `check-tools-parse: FAILED — ${broken.length} of ${scripts.length} script(s) do not parse.`,
  );
  process.exit(1);
}

console.log(`check-tools-parse: ${scripts.length} script(s) parse.`);
