#!/usr/bin/env node
// Does every exported class that gained a static `ngTemplateContextGuard` since the last tag have a
// `surface: template` item in `migrations/unreleased.json`? Run at the cut.
//
//   node tools/check-template-context-guard.mjs [baseRef]
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const base =
  process.argv[2] ??
  execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();

let draft = null;
try {
  draft = JSON.parse(readFileSync('migrations/unreleased.json', 'utf8'));
} catch {
  draft = null;
}

// A static `ngTemplateContextGuard` is invisible to class-surface-diff, and it turns a context the
// consumer's template read as `any` into a typed one, so every `let-row` read that compiled before
// can stop compiling under strictTemplates. A file that is new in the range has no consumer yet.
const filesWithGuard = (ref) =>
  execSync(`git grep -l "static ngTemplateContextGuard" ${ref} -- src/lib`, {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/^[^:]+:/, ''));
const listGuarded = (ref) => {
  try {
    return filesWithGuard(ref);
  } catch (error) {
    if (error.status === 1) return [];
    throw error;
  }
};
const existsAtBase = (path) => {
  try {
    execSync(`git cat-file -e ${base}:${path}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};
const guardedAtBase = new Set(listGuarded(base));
const templateItems = (draft?.items ?? [])
  .filter((item) => [item.surface].flat().includes('template'))
  .map((item) => JSON.stringify(item));
const unnamedGuards = listGuarded('HEAD')
  .filter((path) => !guardedAtBase.has(path) && existsAtBase(path))
  .map((path) => {
    const source = execSync(`git show HEAD:${path}`, { encoding: 'utf8' });
    const guarded = [
      ...source.matchAll(/export\s+(?:abstract\s+)?class\s+(\w+)/g),
    ].map((m) => m[1]);
    return { path, guarded };
  })
  .filter(
    ({ guarded }) =>
      !guarded.some((name) =>
        templateItems.some((item) => item.includes(name)),
      ),
  );

if (unnamedGuards.length) {
  console.error(
    'check-template-context-guard: a template context guard appeared since ' +
      `${base} on ${unnamedGuards.length} class(es) no \`surface: template\` item in ` +
      'migrations/unreleased.json names:',
  );
  for (const { path, guarded } of unnamedGuards)
    console.error(
      `  ${path.replace(/^src\/lib\//, '')} — ${guarded.join(' / ')}`,
    );
  console.error(
    '  A context typed `any` before the guard is now checked: add a `behavior` item on',
  );
  console.error(
    '  `surface: template` with the consumer build error in `detect` (AUTHORING.md, tightened context).',
  );
  process.exit(1);
}

console.log(
  `check-template-context-guard: no unnamed template context guard since ${base}.`,
);
