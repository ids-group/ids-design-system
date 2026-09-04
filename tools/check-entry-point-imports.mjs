#!/usr/bin/env node
// A cross-entry-point import inside src/lib has to spell the full package name and the
// entry point's real directory. ng-packagr recognises an entry-point dependency only by
// that exact prefix, so a short name resolves fine in the editor (tsconfig `ds/*` allows
// it) and then ships as an unresolvable external import in the FESM - a break that no
// type error and no library build reports.
//
// This also catches the reverse: a relative specifier that reaches out of its own entry
// point, which ng-packagr copies into two bundles and duplicates the class.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { LIB_ROOT, PACKAGE_NAME, entryPoints } from './lib-entry-points.mjs';

const known = new Set(entryPoints().map((e) => e.moduleId));
const SPECIFIER = /(?:^|\n)\s*(?:import|export)\b([^;]*?)from\s+'([^']+)'/g;

const groupOf = (path) => {
  const parts = relative(LIB_ROOT, path).split(/[\\/]/);
  if (parts[0] === 'components') return parts.length > 2 ? `components/${parts[1]}` : 'components';

  return parts[0];
};

const problems = [];
const visit = (dir) => {
  for (const item of readdirSync(dir)) {
    const full = join(dir, item);
    if (statSync(full).isDirectory()) {
      visit(full);
      continue;
    }
    if (!item.endsWith('.ts') || item.endsWith('.spec.ts') || item.endsWith('.d.ts')) continue;
    const source = readFileSync(full, 'utf8');
    const where = relative(LIB_ROOT, full).split('\\').join('/');
    for (const [, , specifier] of source.matchAll(SPECIFIER)) {
      if (specifier.startsWith('ds/') || specifier === 'ds') {
        problems.push(`${where}: '${specifier}' — the in-repo alias is for ds-docs, not the library.`);
        continue;
      }
      if (specifier.startsWith(`${PACKAGE_NAME}/`)) {
        if (!known.has(specifier)) {
          problems.push(`${where}: '${specifier}' names no entry point.`);
        }
        continue;
      }
      if (!specifier.startsWith('.')) continue;
      const target = join(dir, specifier);
      if (relative(LIB_ROOT, target).startsWith('..')) continue;
      if (groupOf(target) !== groupOf(full)) {
        problems.push(`${where}: '${specifier}' leaves its entry point — use ${PACKAGE_NAME}/${groupOf(target)}.`);
      }
    }
  }
};
visit(LIB_ROOT);

if (problems.length) {
  console.error(`check-entry-point-imports: ${problems.length} bad specifier(s)`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`check-entry-point-imports: OK — ${known.size} entry points, every cross-entry import names one.`);
