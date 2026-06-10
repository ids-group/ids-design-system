import { execFileSync } from 'node:child_process';

export function renderVersionFile({ hash, commit, date }) {
  return `window.__DS_CURRENT__=${JSON.stringify({ hash, commit, date })};\n`;
}

// Build provenance, emitted as a sibling classic script (not inlined) so the
// stamp lives in its own file rather than embedded in index.html.
export function renderBuiltFile({ hash, commit, date }) {
  return `window.__DS_BUILT__=${JSON.stringify({ hash, commit, date })};\n`;
}

export function readGitCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}
