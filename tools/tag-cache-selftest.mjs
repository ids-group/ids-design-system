#!/usr/bin/env node
// Does the tag cache hand back what a cold read would, and does it refuse what it should not
// trust? A cache that returns a stale or half-written surface keeps every audit green against a
// tree nobody read, so each case below is one way of being wrong that would otherwise go unseen.
//
// Entries go to a per-process directory, never to node_modules/.cache, so a run neither reads a
// stale real entry nor leaves one behind.
//
//   node tools/tag-cache-selftest.mjs
import assert from 'node:assert/strict';
import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { releaseTags } from './release-tags.mjs';

const ROOT = join(import.meta.dirname, '..');
const DIRECTORY = join(tmpdir(), `tag-cache-selftest.${process.pid}`);
rmSync(DIRECTORY, { recursive: true, force: true });
process.on('exit', () => rmSync(DIRECTORY, { recursive: true, force: true }));
process.env.DS_TAG_CACHE_DIR = DIRECTORY;

const { cachedAtTag } = await import('./tag-cache.mjs');
const { readTreeAt, surfaceAt } = await import('./check-manifest-truth.mjs');

const tag = releaseTags(ROOT).at(-1);
if (!tag) {
  console.error('tag-cache selftest: no release tag in this checkout to read.');
  process.exit(1);
}
const entries = () => {
  try {
    return readdirSync(DIRECTORY);
  } catch {
    return [];
  }
};
const failures = [];
const test = (name, body) => {
  try {
    body();
    console.log(`ok    ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(
      `FAIL  ${name}\n      ${error.message.split('\n').join('\n      ')}`,
    );
  }
};

process.env.DS_TAG_CACHE = 'off';
const coldFiles = readTreeAt(tag);
const coldSurface = surfaceAt(tag);
delete process.env.DS_TAG_CACHE;

test('DS_TAG_CACHE=off reads git and writes nothing', () => {
  assert.ok(coldFiles?.length, `no files read at ${tag}`);
  assert.deepEqual(entries(), []);
});

test('a hit returns the same files as a cold read', () => {
  readTreeAt(tag);
  assert.equal(entries().length, 1, 'the first read did not store an entry');
  assert.deepEqual(readTreeAt(tag), coldFiles);
});

test('a hit returns the same surface as a cold read, Sets and Maps included', () => {
  let builds = 0;
  const build = () => (builds++, coldSurface);
  cachedAtTag(tag, ['surface-selftest'], build);
  const hit = cachedAtTag(tag, ['surface-selftest'], build);
  assert.equal(builds, 1, 'the second call built again instead of hitting');
  assert.ok(hit.tokens instanceof Set && hit.elements instanceof Map);
  assert.ok(
    [...hit.elements.values()].every((members) => members instanceof Set),
  );
  assert.deepEqual(hit, coldSurface);
});

test('a changed parser hash misses and builds again', () => {
  let builds = 0;
  cachedAtTag(tag, ['parser-a'], () => (builds++, ['a']));
  const changed = cachedAtTag(tag, ['parser-b'], () => (builds++, ['b']));
  assert.equal(builds, 2);
  assert.deepEqual(changed, ['b']);
});

test('a corrupt entry is rebuilt, not trusted', () => {
  let builds = 0;
  const build = () => (builds++, ['whole']);
  const before = new Set(entries());
  cachedAtTag(tag, ['corrupt'], build);
  const [file] = entries().filter((name) => !before.has(name));
  for (const broken of [
    '{"key":"',
    '{"key":"someone-else","value":["stale"]}',
  ]) {
    writeFileSync(join(DIRECTORY, file), broken);
    assert.deepEqual(cachedAtTag(tag, ['corrupt'], build), ['whole']);
  }
  assert.equal(builds, 3, 'a corrupt entry was returned instead of rebuilt');
  assert.deepEqual(cachedAtTag(tag, ['corrupt'], build), ['whole']);
  assert.equal(builds, 3, 'the rebuilt entry was not written back');
});

test('a ref that is not a tag is never cached', () => {
  const before = entries().length;
  let builds = 0;
  for (const ref of ['HEAD', 'not-a-tag'])
    cachedAtTag(ref, ['x'], () => (builds++, ['x']));
  cachedAtTag('HEAD', ['x'], () => (builds++, ['x']));
  assert.equal(builds, 3);
  assert.equal(entries().length, before);
});

test('a failed read is not stored', () => {
  const before = entries().length;
  assert.equal(
    cachedAtTag(tag, ['failed'], () => null),
    null,
  );
  assert.equal(entries().length, before);
  assert.ok(
    !entries().some((name) => name.endsWith('.tmp')),
    'a temp file was left behind',
  );
});

if (failures.length) {
  console.error(`\ntag-cache selftest: ${failures.length} case(s) failed.`);
  process.exit(1);
}
console.log('\ntag-cache selftest: every case holds.');
