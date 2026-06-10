import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { computeContentHash } from './source-hash.mjs';

async function fixture() {
  const base = await mkdtemp(join(tmpdir(), 'dshash-'));
  await mkdir(join(base, 'a'), { recursive: true });
  await mkdir(join(base, 'b'), { recursive: true });
  return base;
}

test('hash is stable across repeated runs', async () => {
  const base = await fixture();
  await writeFile(join(base, 'a', 'x.ts'), 'export const x = 1;\n');
  await writeFile(join(base, 'b', 'y.scss'), '.z { color: red; }\n');
  const h1 = await computeContentHash(['a', 'b'], base);
  const h2 = await computeContentHash(['a', 'b'], base);
  assert.equal(h1, h2);
  assert.match(h1, /^[0-9a-f]{64}$/);
  await rm(base, { recursive: true, force: true });
});

test('CRLF vs LF produce the same hash for text files', async () => {
  const base = await fixture();
  await writeFile(join(base, 'a', 'x.ts'), 'a\nb\n');
  const lf = await computeContentHash(['a'], base);
  await writeFile(join(base, 'a', 'x.ts'), 'a\r\nb\r\n');
  const crlf = await computeContentHash(['a'], base);
  assert.equal(lf, crlf);
  await rm(base, { recursive: true, force: true });
});

test('changing content changes the hash', async () => {
  const base = await fixture();
  await writeFile(join(base, 'a', 'x.ts'), 'v1\n');
  const before = await computeContentHash(['a'], base);
  await writeFile(join(base, 'a', 'x.ts'), 'v2\n');
  const after = await computeContentHash(['a'], base);
  assert.notEqual(before, after);
  await rm(base, { recursive: true, force: true });
});

test('binary files are hashed raw (not EOL-normalized)', async () => {
  const base = await fixture();
  await writeFile(join(base, 'a', 'f.woff2'), Buffer.from([0x0d, 0x0a, 0x00, 0x0d]));
  const h1 = await computeContentHash(['a'], base);
  await writeFile(join(base, 'a', 'f.woff2'), Buffer.from([0x0a, 0x00, 0x0d]));
  const h2 = await computeContentHash(['a'], base);
  assert.notEqual(h1, h2); // raw bytes differ → hash differs
  await rm(base, { recursive: true, force: true });
});
