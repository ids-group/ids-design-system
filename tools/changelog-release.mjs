#!/usr/bin/env node
// Run by the npm `version` hook (after the bump, before the commit/tag): stamp the
// Unreleased section with the new version + local date, open a fresh Unreleased,
// and stage CHANGELOG.md so it lands in the release commit and tag. A stable version also
// absorbs the prereleases cut since the last stable one (tools/release-fold.mjs).
import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
  renameSync,
} from 'node:fs';
import { compareVersions, isPrerelease } from './release-tags.mjs';
import {
  foldChangelog,
  foldManifests,
  unreleasedHasEntry,
} from './release-fold.mjs';

const version = process.env.npm_package_version;
if (!version) {
  console.error('changelog: npm_package_version is not set.');
  process.exit(1);
}

const now = new Date();
const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// Normalize CRLF→LF so the regexes work regardless of the contributor's
// core.autocrlf (neither changelog is pinned to LF in .gitattributes).
function stampUnreleased(path) {
  const changelog = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  if (!/^## Unreleased$/m.test(changelog)) {
    console.error(
      `changelog: no '## Unreleased' heading in ${path} — aborting.`,
    );
    process.exit(1);
  }
  let stamped = changelog.replace(
    /^## Unreleased$/m,
    `## Unreleased\n\n## ${version} — ${date}`,
  );
  if (!isPrerelease(version)) {
    const { text, folded } = foldChangelog(stamped, version);
    stamped = text;
    if (folded.length)
      console.log(
        `changelog: moved ${folded.join(', ')} into ${version} in ${path}.`,
      );
  }
  writeFileSync(path, stamped);
  execSync(`git add "${path}"`);
  console.log(`changelog: stamped ${path} ${version} — ${date}.`);
}

function hasUnreleasedEntry(path) {
  return unreleasedHasEntry(readFileSync(path, 'utf8'));
}

function hasPrereleaseBlock(path) {
  const text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  const next = text.split(/^## Unreleased$/m)[1]?.match(/^## (\S+) — /m);
  return Boolean(next && isPrerelease(next[1]));
}

stampUnreleased('CHANGELOG.md');

// Stamped only when the cycle wrote something: an empty version block says nothing.
const designSyncLog = '.design-sync/CHANGELOG.md';
if (
  existsSync(designSyncLog) &&
  (hasUnreleasedEntry(designSyncLog) ||
    (!isPrerelease(version) && hasPrereleaseBlock(designSyncLog)))
) {
  stampUnreleased(designSyncLog);
}

// Promote the draft migration manifest alongside the changelog: the /changelog workflow
// drafts migrations/unreleased.json; at release time it becomes migrations/<version>.json
// (the auto-update plugin's planner prefers these manifests over parsing the prose).
const draft = 'migrations/unreleased.json';
const prereleaseManifests = isPrerelease(version)
  ? []
  : readdirSync('migrations')
      .filter((file) => /^\d+\.\d+\.\d+-.+\.json$/.test(file))
      .map((file) => file.slice(0, -'.json'.length))
      .sort(compareVersions);
for (const prerelease of prereleaseManifests) {
  if (existsSync(`migrations/${prerelease}`)) {
    console.error(
      `changelog: migrations/${prerelease}/ is a prerelease guide, which the fold does not move — merge it into migrations/unreleased/ first.`,
    );
    process.exit(1);
  }
}
// The fixtures move to `migrations/fixtures/<version>/` below, so the evidence naming them follows.
const fixtureSources = [...prereleaseManifests, 'unreleased'];
function manifestText(manifest) {
  let text = JSON.stringify(manifest, null, 2) + '\n';
  for (const source of fixtureSources)
    for (const prefix of ['"fixture:', '"fixture:migrations/fixtures/'])
      text = text.replaceAll(`${prefix}${source}/`, `${prefix}${version}/`);
  return text;
}
if (prereleaseManifests.length) {
  const target = `migrations/${version}.json`;
  if (existsSync(target)) {
    console.error(
      `changelog: ${target} already exists — refusing to overwrite the manifest.`,
    );
    process.exit(1);
  }
  const sources = prereleaseManifests.map(
    (prerelease) => `migrations/${prerelease}.json`,
  );
  if (existsSync(draft)) sources.push(draft);
  let folded;
  try {
    folded = foldManifests(
      version,
      sources.map((path) => JSON.parse(readFileSync(path, 'utf8'))),
    );
  } catch (error) {
    console.error(
      `changelog: cannot fold ${sources.join(', ')} — ${error.message}.`,
    );
    process.exit(1);
  }
  writeFileSync(target, manifestText(folded));
  for (const path of sources) rmSync(path);
  execSync(`git rm --cached --ignore-unmatch --quiet -- ${sources.join(' ')}`);
  execSync(`git add ${target}`);
  console.log(`changelog: moved ${sources.join(', ')} -> ${target}.`);
} else if (existsSync(draft)) {
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
  writeFileSync(target, manifestText(manifest));
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

// Compile fixtures are keyed by the manifest they back, so they follow it: the draft's and every
// folded prerelease's land in `migrations/fixtures/<version>/`.
const fixtureTarget = `migrations/fixtures/${version}`;
for (const source of [...prereleaseManifests, 'unreleased']
  .map((name) => `migrations/fixtures/${name}`)
  .filter((path) => existsSync(path))) {
  mkdirSync(fixtureTarget, { recursive: true });
  for (const file of readdirSync(source)) {
    if (existsSync(`${fixtureTarget}/${file}`)) {
      console.error(
        `changelog: ${fixtureTarget}/${file} already exists - refusing to overwrite the fixture.`,
      );
      process.exit(1);
    }
    renameSync(`${source}/${file}`, `${fixtureTarget}/${file}`);
  }
  rmSync(source, { recursive: true });
  execSync(`git add ${source} ${fixtureTarget}`);
  console.log(`changelog: promoted ${source}/ -> ${fixtureTarget}/.`);
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
