#!/usr/bin/env node
// Run by the npm `version` hook (after the bump, before the commit/tag): stamp the
// Unreleased section with the new version + local date, open a fresh Unreleased,
// and stage CHANGELOG.md so it lands in the release commit and tag.
import { execSync } from 'node:child_process';
import {
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
  renameSync,
} from 'node:fs';

const version = process.env.npm_package_version;
if (!version) {
  console.error('changelog: npm_package_version is not set.');
  process.exit(1);
}

const path = 'CHANGELOG.md';
// Normalize CRLF→LF so the regexes work regardless of the contributor's
// core.autocrlf (CHANGELOG.md is not pinned to LF in .gitattributes).
const changelog = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

if (!/^## Unreleased$/m.test(changelog)) {
  console.error("changelog: no '## Unreleased' heading found — aborting.");
  process.exit(1);
}

const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const stamped = changelog.replace(
  /^## Unreleased$/m,
  `## Unreleased\n\n## ${version} — ${date}`,
);

writeFileSync(path, stamped);
execSync('git add CHANGELOG.md');
console.log(`changelog: stamped ${version} — ${date}.`);

// Promote the draft migration manifest alongside the changelog: the /changelog workflow
// drafts migrations/unreleased.json; at release time it becomes migrations/<version>.json
// (the auto-update plugin's planner prefers these manifests over parsing the prose).
const draft = 'migrations/unreleased.json';
if (existsSync(draft)) {
  const target = `migrations/${version}.json`;
  if (existsSync(target)) {
    console.error(
      `changelog: ${target} already exists — refusing to overwrite the manifest.`,
    );
    process.exit(1);
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(draft, 'utf8'));
  } catch (error) {
    console.error(
      `changelog: ${draft} is not valid JSON — fix the draft before releasing. ${error.message}`,
    );
    process.exit(1);
  }
  manifest.version = version;
  writeFileSync(target, JSON.stringify(manifest, null, 2) + '\n');
  rmSync(draft);
  execSync(`git add ${draft} ${target}`);
  console.log(`changelog: promoted ${draft} -> ${target}.`);
}

// The prose guide beside the manifest has to move with it. Missed on 0.9.0: the JSON
// was promoted and `migrations/unreleased/` was not, so that release's guide sat where
// the NEXT release would write over it — and the manifest pointed at the same doomed path.
const draftGuide = 'migrations/unreleased';
if (existsSync(draftGuide)) {
  const guideTarget = `migrations/${version}`;
  if (existsSync(guideTarget)) {
    console.error(
      `changelog: ${guideTarget}/ already exists — refusing to overwrite the guide.`,
    );
    process.exit(1);
  }
  renameSync(draftGuide, guideTarget);
  execSync(`git add ${draftGuide} ${guideTarget}`);
  console.log(`changelog: promoted ${draftGuide}/ -> ${guideTarget}/.`);
}

// .design-sync/elements/package.json carries the same version, and nothing but a gate
// notices when it stops matching — `npm version` bumps the root alone, so every release
// used to leave check-manual-surface red on the next merge.
const elementsPackage = '.design-sync/elements/package.json';
if (existsSync(elementsPackage)) {
  const manifest = JSON.parse(readFileSync(elementsPackage, 'utf8'));
  if (manifest.version !== version) {
    manifest.version = version;
    writeFileSync(elementsPackage, JSON.stringify(manifest, null, 2) + '\n');
    execSync(`git add ${elementsPackage}`);
    console.log(`changelog: synced ${elementsPackage} to ${version}.`);
  }
}
