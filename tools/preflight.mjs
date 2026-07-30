#!/usr/bin/env node
// Pre-release gate, run by the npm `preversion` hook before `npm version`.
// Emergency bypass: SKIP_PREFLIGHT=1.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

if (process.env.SKIP_PREFLIGHT === '1') {
  console.warn('preflight: SKIP_PREFLIGHT=1 — skipping all checks.');
  process.exit(0);
}

const fail = (message) => {
  console.error(`preflight: ${message}`);
  process.exit(1);
};

const git = (args) => execSync(`git ${args}`, { encoding: 'utf8' }).trim();

const branch = git('rev-parse --abbrev-ref HEAD');
if (branch !== 'main') fail(`must release from 'main', currently on '${branch}'.`);

if (git('status --porcelain') !== '') {
  fail('working tree is not clean — commit or stash first.');
}

git('fetch origin main --quiet');
// cut-release merges dev into main before bumping, so local main is intentionally
// AHEAD of origin/main here; require only that origin/main is reachable from HEAD
// (ahead-or-equal), which still catches a stale or diverged main.
try {
  execSync('git merge-base --is-ancestor origin/main HEAD', { stdio: 'ignore' });
} catch {
  fail("local 'main' is behind or diverged from 'origin/main' — pull first.");
}

const changelog = readFileSync('CHANGELOG.md', 'utf8').replace(/\r\n/g, '\n');
const unreleased = changelog.match(/^## Unreleased$\n([\s\S]*?)(?=^## )/m);
if (!unreleased) fail("no '## Unreleased' section in CHANGELOG.md.");
const hasEntry = unreleased[1].split('\n').some((line) => line.trim().startsWith('-'));
if (!hasEntry) fail("'## Unreleased' is empty — add release notes before releasing.");

console.log('preflight: all checks passed.');
