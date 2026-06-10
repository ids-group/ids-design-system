// Recomputes the current source hash and (re)writes showcase/source-stamp.js.
// Cheap: hashing only, no Angular build. Invoked by the pre-commit hook.
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { computeContentHash } from './source-hash.mjs';
import { renderSourceStamp, readGitCommit } from './version.mjs';

const HASH_ROOTS = ['src/lib', 'ds-docs/src'];
const OUT = join('showcase', 'source-stamp.js');

const hash = await computeContentHash(HASH_ROOTS);

// Idempotent: if source-stamp.js already encodes this exact hash, leave it
// untouched. This preserves its date and avoids a spurious diff on every
// commit (the timestamp would otherwise change each run).
if (existsSync(OUT)) {
  const existing = await readFile(OUT, 'utf8');
  if (existing.includes(`"hash": "${hash}"`)) {
    console.log(`showcase: source-stamp.js already current (${hash.slice(0, 8)})`);
    process.exit(0);
  }
}

const payload = { hash, commit: readGitCommit(), date: new Date().toISOString() };
await mkdir('showcase', { recursive: true });
await writeFile(OUT, renderSourceStamp(payload), 'utf8');
console.log(`showcase: source-stamp.js updated (${hash.slice(0, 8)})`);
