import { execFileSync } from 'node:child_process';

export function renderVersionFile({ hash, commit, date }) {
  return `window.__DS_CURRENT__=${JSON.stringify({ hash, commit, date })};\n`;
}

export function readGitCommit() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}
