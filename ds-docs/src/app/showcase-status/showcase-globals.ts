export interface ShowcaseStamp {
  srcHash: string;
  commit: string;
  date: string;
}

// 'unknown'  → no build stamp (dev serve / ng serve) → banner hidden.
// 'idle'     → built artifact, freshness not checked yet (default).
// 'checking' → reading + hashing the picked folder.
// 'current'  → live source hash matches the build stamp.
// 'stale'    → live source hash differs → rebuild needed.
// 'no-source'→ picked folder has no src/lib (wrong folder).
export type ShowcaseStatus = 'unknown' | 'idle' | 'checking' | 'current' | 'stale' | 'no-source';

declare global {
  interface Window {
    /** Source state the showcase was built from (from build-stamp.js). */
    __DS_BUILD_STAMP__?: ShowcaseStamp;
  }
}

export function readBuildStamp(): ShowcaseStamp | undefined {
  return typeof window === 'undefined' ? undefined : window.__DS_BUILD_STAMP__;
}
