export interface ShowcaseStamp {
  srcHash: string;
  commit: string;
  date: string;
}

export type ShowcaseStatus =
  | 'unknown'             // dev serve: no build stamp
  | 'unverifiable'        // sibling source-stamp.js absent
  | 'current'             // hash matches
  | 'current-diff-commit' // hash matches, commit differs
  | 'stale';              // hash differs

declare global {
  interface Window {
    /** Source state the showcase was built from (from build-stamp.js). */
    __DS_BUILD_STAMP__?: ShowcaseStamp;
    /** Current source state (from source-stamp.js, refreshed by the hook). */
    __DS_SOURCE_STAMP__?: ShowcaseStamp;
  }
}

export function readBuildStamp(): ShowcaseStamp | undefined {
  return typeof window === 'undefined' ? undefined : window.__DS_BUILD_STAMP__;
}

export function readSourceStamp(): ShowcaseStamp | undefined {
  return typeof window === 'undefined' ? undefined : window.__DS_SOURCE_STAMP__;
}

// Mirrored in showcase-globals.spec.mjs (node:test has no TS loader here) —
// keep the two implementations byte-identical.
export function computeStatus(
  buildStamp: ShowcaseStamp | undefined,
  sourceStamp: ShowcaseStamp | undefined,
): ShowcaseStatus {
  if (!buildStamp) return 'unknown';
  if (!sourceStamp) return 'unverifiable';
  if (buildStamp.srcHash === sourceStamp.srcHash) {
    if (buildStamp.commit && sourceStamp.commit && buildStamp.commit !== sourceStamp.commit) {
      return 'current-diff-commit';
    }
    return 'current';
  }
  return 'stale';
}
