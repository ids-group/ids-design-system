import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSourceStamp, renderBuildStamp } from './version.mjs';

test('renderSourceStamp emits a classic-script global assignment', () => {
  const out = renderSourceStamp({ hash: 'abc', commit: 'def', date: '2026-01-01T00:00:00.000Z' });
  assert.ok(out.includes('window.__DS_SOURCE_STAMP__'));
  // pretty-printed JSON (readable), keys spaced
  assert.ok(out.includes('"hash": "abc"'));
  assert.ok(out.includes('"commit": "def"'));
  assert.ok(out.includes('"date": "2026-01-01T00:00:00.000Z"'));
  // must be a classic-script statement, no module syntax (loads on file://)
  assert.ok(!out.includes('export'));
  assert.ok(out.trim().endsWith(';'));
});

test('renderBuildStamp emits a classic-script __DS_BUILD_STAMP__ assignment', () => {
  const out = renderBuildStamp({ hash: 'abc', commit: 'def', date: '2026-01-01T00:00:00.000Z' });
  assert.ok(out.includes('window.__DS_BUILD_STAMP__'));
  assert.ok(out.includes('"hash": "abc"'));
  assert.ok(!out.includes('export'));
  assert.ok(out.trim().endsWith(';'));
});
