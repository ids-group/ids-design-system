import { execFileSync } from 'node:child_process';

// Build provenance — the source state the showcase was built from. Emitted as a
// sibling classic script (not inlined) so the stamp lives in its own file.
// Staleness is checked at runtime in the browser (the banner re-hashes src on
// demand via a folder pick and compares to this), so there's no committed
// "current source" stamp to keep fresh — nothing churns per commit.
export function renderBuildStamp({ srcHash, commit, date }) {
  return `window.__DS_BUILD_STAMP__ = ${JSON.stringify({ srcHash, commit, date }, null, 2)};\n`;
}

export function readGitCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}
