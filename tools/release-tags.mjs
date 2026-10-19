// Release tags in release order, and the boundary each manifest or CHANGELOG block describes.
//
// A prerelease sorts BEFORE its own release (v0.14.6-beta.1 < v0.14.6); plain `v:refname` puts it
// after. A stable version's boundary starts at the previous STABLE tag, because the release folds
// every prerelease since then into its own block and manifest (tools/changelog-release.mjs).
import { execFileSync } from 'node:child_process';

export const isPrerelease = (version) => version.includes('-');

export function compareVersions(a, b) {
  const [coreA, preA] = a.split(/-(.*)/s);
  const [coreB, preB] = b.split(/-(.*)/s);
  const core = coreA.localeCompare(coreB, undefined, { numeric: true });
  if (core) return core;
  if (!preA || !preB) return preA ? -1 : preB ? 1 : 0;
  return preA.localeCompare(preB, undefined, { numeric: true });
}

// Betas are numbered from 1: 0.14.5 -> 0.14.6-beta.1, and a beta moves only its counter,
// 0.14.6-beta.1 -> 0.14.6-beta.2. `npm version prerelease` would start at 0.
export function nextBeta(current) {
  const [core, prerelease] = current.split('-');
  if (prerelease) {
    const parts = prerelease.split('.');
    const counter = Number(parts.at(-1));
    if (parts[0] !== 'beta' || parts.length !== 2 || !Number.isInteger(counter))
      throw new Error(`cannot continue the prerelease "${current}"`);
    return `${core}-beta.${counter + 1}`;
  }
  const [major, minor, patch] = core.split('.').map(Number);
  return `${major}.${minor}.${patch + 1}-beta.1`;
}

// A dev build sorts above the version it was built past and below the release it leads to: a
// stable 0.15.2 gives 0.15.3-dev.g<sha>, a 0.15.3-beta.1 gives 0.15.3-dev.g<sha>, since `dev`
// sorts after `beta`. The `g` keeps an all-digit sha from reading as a numeric identifier,
// which semver forbids to start with 0.
export function devVersion(current, sha, dirty) {
  const build = sha ? `g${sha}${dirty ? '.dirty' : ''}` : 'local';
  return `${nextBeta(current).split('-')[0]}-dev.${build}`;
}

export function releaseTags(root) {
  try {
    return execFileSync('git', ['-C', root, 'tag', '--list', 'v*'], {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .sort((a, b) => compareVersions(a.slice(1), b.slice(1)));
  } catch {
    return [];
  }
}

export function previousBoundary(tags, version) {
  const index = tags.indexOf(`v${version}`);
  if (index <= 0) return null;
  const earlier = tags.slice(0, index);
  if (isPrerelease(version)) return earlier.at(-1);
  return earlier.findLast((tag) => !isPrerelease(tag.slice(1))) ?? null;
}
