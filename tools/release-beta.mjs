#!/usr/bin/env node
// `npm version` to the next beta; the numbering rule is nextBeta in tools/release-tags.mjs.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { nextBeta } from './release-tags.mjs';

const current = JSON.parse(readFileSync('package.json', 'utf8')).version;
execFileSync('npm', ['version', nextBeta(current), '-m', 'release: %s'], {
  stdio: 'inherit',
  env: { ...process.env, DS_RELEASE_BETA: '1' },
  shell: process.platform === 'win32',
});
