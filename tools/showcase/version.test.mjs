import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBuildStamp } from './version.mjs';

test('renderBuildStamp emits a readable classic-script __DS_BUILD_STAMP__ assignment', () => {
  const out = renderBuildStamp({ srcHash: 'abc', commit: 'def', date: '2026-01-01T00:00:00.000Z' });
  assert.ok(out.includes('window.__DS_BUILD_STAMP__'));
  // pretty-printed JSON (readable), keys spaced
  assert.ok(out.includes('"srcHash": "abc"'));
  assert.ok(out.includes('"commit": "def"'));
  assert.ok(out.includes('"date": "2026-01-01T00:00:00.000Z"'));
  // classic-script statement, no module syntax (loads on file://)
  assert.ok(!out.includes('export'));
  assert.ok(out.trim().endsWith(';'));
});
