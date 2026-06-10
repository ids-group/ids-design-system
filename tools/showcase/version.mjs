import { execFileSync } from 'node:child_process';

// Current source state — emitted as a classic script (a JSON file can't be
// loaded from file://, where fetch/XHR are blocked; a <script src> can). Refreshed
// by the pre-commit hook so staleness updates per commit without a rebuild.
export function renderSourceStamp({ srcHash, commit, date }) {
  return `window.__DS_SOURCE_STAMP__ = ${JSON.stringify({ srcHash, commit, date }, null, 2)};\n`;
}

// Build provenance — the source state the showcase was built from. Emitted as a
// sibling classic script (not inlined) so the stamp lives in its own file.
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
