export interface ShowcaseStamp {
  hash: string;
  commit: string;
  date: string;
}

export type ShowcaseStatus =
  | 'unknown'             // dev serve: no build provenance
  | 'unverifiable'        // sibling ds-version.js absent
  | 'current'             // hash matches
  | 'current-diff-commit' // hash matches, commit differs
  | 'stale';              // hash differs

declare global {
  interface Window {
    __DS_BUILT__?: ShowcaseStamp;
    __DS_CURRENT__?: ShowcaseStamp;
  }
}

export function readBuilt(): ShowcaseStamp | undefined {
  return typeof window === 'undefined' ? undefined : window.__DS_BUILT__;
}

export function readCurrent(): ShowcaseStamp | undefined {
  return typeof window === 'undefined' ? undefined : window.__DS_CURRENT__;
}

// Mirrored in showcase-globals.spec.mjs (node:test has no TS loader here) —
// keep the two implementations byte-identical.
export function computeStatus(
  built: ShowcaseStamp | undefined,
  current: ShowcaseStamp | undefined,
): ShowcaseStatus {
  if (!built) return 'unknown';
  if (!current) return 'unverifiable';
  if (built.hash === current.hash) {
    if (built.commit && current.commit && built.commit !== current.commit) {
      return 'current-diff-commit';
    }
    return 'current';
  }
  return 'stale';
}
