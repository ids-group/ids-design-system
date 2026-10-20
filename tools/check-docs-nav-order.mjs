#!/usr/bin/env node
// The ds-docs sidebar lists each group's anchors in `core/nav.config.ts`; the group's page renders
// them in the order of its `sections` in `group-pages.ts` and of `data-anchor` / `anchor="…"` inside
// each section's template. The scroll-spy walks the page, so when the two orders differ the URL and
// the highlighted item jump back and forth while the reader scrolls one way.
//
//   node tools/check-docs-nav-order.mjs [repo root]
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT =
  process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'ds-docs', 'src', 'app');

const NAV = [
  ...readFileSync(join(APP, 'core', 'nav.config.ts'), 'utf8').matchAll(
    /path: '([^']*)',[^[]*?items: \[([^\]]*)\]/g,
  ),
].map(([, path, items]) => ({
  path,
  items: [...items.matchAll(/anchor: '([^']+)'/g)].map(([, anchor]) => ({
    anchor,
  })),
}));
const registry = readFileSync(join(APP, 'group-pages.ts'), 'utf8');

const fileOfClass = new Map();
for (const [, names, from] of registry.matchAll(
  /import \{([^}]+)\} from '\.\/(sections\/[^']+)'/g,
)) {
  for (const name of names.split(',')) {
    const [, local] = name.trim().match(/(?:\w+ as )?(\w+)/) ?? [];
    if (local) fileOfClass.set(local, join(APP, `${from}.ts`));
  }
}

function anchorsOfSection(className) {
  const file = fileOfClass.get(className);
  if (!file) return null;
  const source = readFileSync(file, 'utf8');
  const templateUrl = source.match(/templateUrl:\s*'\.\/([^']+)'/)?.[1];
  const templatePath = templateUrl && join(dirname(file), templateUrl);
  const template =
    templatePath && existsSync(templatePath)
      ? readFileSync(templatePath, 'utf8')
      : source;

  return [...template.matchAll(/(?<![\w[.-])(?:data-)?anchor="([^"]+)"/g)].map(
    ([, anchor]) => anchor,
  );
}

const problems = [];
let groups = 0;
for (const group of NAV) {
  const start = registry.indexOf(`path: '${group.path}'`);
  // A one-item group is a one-section page, which the scroll-spy never syncs into the URL.
  if (start < 0 || group.items.length < 2) continue;
  groups++;
  const list = registry.slice(
    registry.indexOf('sections: [', start),
    registry.indexOf(']', registry.indexOf('sections: [', start)),
  );
  const pageAnchors = [];
  for (const [className] of list.matchAll(/\b\w+Section\b/g)) {
    const anchors = anchorsOfSection(className);
    if (anchors === null) {
      problems.push(
        `${group.path}: no import found for ${className} in group-pages.ts`,
      );
      continue;
    }
    pageAnchors.push(...anchors);
  }
  const navAnchors = group.items.map((item) => item.anchor);
  for (const anchor of navAnchors) {
    if (!pageAnchors.includes(anchor)) {
      problems.push(
        `${group.path}: sidebar item "${anchor}" has no anchor on the page`,
      );
    }
  }
  for (const anchor of pageAnchors) {
    if (!navAnchors.includes(anchor)) {
      problems.push(
        `${group.path}: page anchor "${anchor}" is not a sidebar item`,
      );
    }
  }
  const shared = pageAnchors.filter((anchor) => navAnchors.includes(anchor));
  const expected = navAnchors.filter((anchor) => shared.includes(anchor));
  if (shared.join() !== expected.join()) {
    problems.push(
      `${group.path}: page order differs from the sidebar\n    sidebar: ${expected.join(' ')}\n    page:    ${shared.join(' ')}`,
    );
  }
}

for (const problem of problems)
  console.error(`check-docs-nav-order: ERROR  ${problem}`);
if (problems.length) {
  console.error(
    'check-docs-nav-order: FAILED - reorder the sections in ds-docs/src/app/group-pages.ts (or the blocks inside a section) to the sidebar order in core/nav.config.ts.',
  );
  process.exit(1);
}
console.log(
  `check-docs-nav-order: ${groups} group(s), every page in sidebar order.`,
);
