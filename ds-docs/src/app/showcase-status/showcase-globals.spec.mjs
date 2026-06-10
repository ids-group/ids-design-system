import test from 'node:test';
import assert from 'node:assert/strict';

// Mirror of computeStatus() from showcase-globals.ts (kept identical).
function computeStatus(buildStamp, sourceStamp) {
  if (!buildStamp) return 'unknown';
  if (!sourceStamp) return 'unverifiable';
  if (buildStamp.hash === sourceStamp.hash) {
    if (buildStamp.commit && sourceStamp.commit && buildStamp.commit !== sourceStamp.commit) {
      return 'current-diff-commit';
    }
    return 'current';
  }
  return 'stale';
}

test('no build provenance -> unknown (dev serve)', () => {
  assert.equal(computeStatus(undefined, undefined), 'unknown');
});
test('no sibling -> unverifiable (file copied alone)', () => {
  assert.equal(computeStatus({ hash: 'a', commit: 'c1' }, undefined), 'unverifiable');
});
test('matching hash -> current', () => {
  assert.equal(computeStatus({ hash: 'a', commit: 'c1' }, { hash: 'a', commit: 'c1' }), 'current');
});
test('matching hash, different commit -> current-diff-commit', () => {
  assert.equal(computeStatus({ hash: 'a', commit: 'c1' }, { hash: 'a', commit: 'c2' }), 'current-diff-commit');
});
test('different hash -> stale', () => {
  assert.equal(computeStatus({ hash: 'a', commit: 'c1' }, { hash: 'b', commit: 'c1' }), 'stale');
});
