import test from 'node:test';
import assert from 'node:assert/strict';
import { renderVersionFile } from './version.mjs';

test('renderVersionFile emits a classic-script global assignment', () => {
  const out = renderVersionFile({ hash: 'abc', commit: 'def', date: '2026-01-01T00:00:00.000Z' });
  assert.ok(out.includes('window.__DS_CURRENT__'));
  assert.ok(out.includes('"hash":"abc"'));
  assert.ok(out.includes('"commit":"def"'));
  assert.ok(out.includes('"date":"2026-01-01T00:00:00.000Z"'));
  // must be a single statement, no module syntax (loads on file:// as classic script)
  assert.ok(!out.includes('export'));
  assert.ok(out.trim().endsWith(';'));
});
