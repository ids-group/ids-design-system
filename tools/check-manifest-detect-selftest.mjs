#!/usr/bin/env node
// Does the locator check still FIRE on consumer code no locator finds, on a look-alike that
// survives the element scope, on an unknown id or extension and on a draft item with no fixture -
// and stay green when the same locators find the target and drop the look-alike?
//
// Nothing tracked is written: each case builds its own migrations directory under the OS temp dir
// and points the check at it through DS_MIGRATIONS_DIR.
//
//   node tools/check-manifest-detect-selftest.mjs
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = join(tmpdir(), `manifest-detect-selftest.${process.pid}`);

const manifest = (version, items) => JSON.stringify({ version, items });
const remap = {
  id: 'button-variant-remap',
  kind: 'value-remap',
  old: 'ds-button[variant]',
  searchHints: ['variant="'],
  surface: 'template',
};
const storeBehavior = {
  id: 'sort-key-kept',
  kind: 'behavior',
  old: 'ds-table[sortKey]',
  searchHints: ['sortKey'],
  detect: ['sortKey()!'],
  surface: 'typescript',
};
const PUBLISHED = manifest('1.0.0', [remap, storeBehavior]);
const DRAFT = manifest('unreleased', [{ ...storeBehavior, id: 'draft-item' }]);
const STORE =
  'export const sorting = { path: store.sortKey()!, order: store.sortDir() };\n';
const BUTTON =
  '<ds-button\n  [disabled]="count > 0"\n  variant="secondary"\n/>\n';
const BADGE = '<ds-badge variant="secondary">New</ds-badge>\n';

function run(name, files) {
  const migrations = join(BASE, name);
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(migrations, path)), { recursive: true });
    writeFileSync(join(migrations, path), text);
  }
  const result = spawnSync(
    process.execPath,
    [join(ROOT, 'tools', 'check-manifest-detect.mjs')],
    {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, DS_MIGRATIONS_DIR: migrations },
    },
  );
  return { status: result.status, output: result.stdout + result.stderr };
}

const failures = [];
const expect = (label, condition) => {
  console.log(`  ${condition ? 'ok  ' : 'FAIL'}  ${label}`);
  if (!condition) failures.push(label);
};

try {
  const good = run('good', {
    '1.0.0.json': PUBLISHED,
    'unreleased.json': DRAFT,
    'fixtures/1.0.0/button-variant-remap.found.html': BUTTON,
    'fixtures/1.0.0/button-variant-remap.ignored.html': BADGE,
    'fixtures/1.0.0/sort-key-kept.found.ts': STORE,
    'fixtures/unreleased/draft-item.found.ts': STORE,
  });
  console.log(
    'HOLDS when the locators find the target and drop the look-alike',
  );
  expect('exits 0', good.status === 0);
  expect(
    'runs all four fixtures',
    /4 locator fixture\(s\) run/.test(good.output),
  );
  expect(
    'a hint inside a multi-line tag with `>` in a binding is located',
    good.output.includes('button-variant-remap.found.html: located'),
  );
  expect(
    'a detect shape on a typescript surface is not element-scoped',
    good.output.includes('sort-key-kept.found.ts: located'),
  );

  const bad = run('bad', {
    '1.0.0.json': PUBLISHED,
    'unreleased.json': DRAFT,
    'fixtures/1.0.0/button-variant-remap.found.html': BADGE,
    'fixtures/1.0.0/button-variant-remap.ignored.html': BUTTON,
    'fixtures/1.0.0/sort-key-kept.found.ts':
      'export const sorting = store.sortKey() ? 1 : 0;\n',
    'fixtures/1.0.0/no-such-item.found.ts': STORE,
    'fixtures/1.0.0/sort-key-kept.ignored.css': STORE,
  });
  console.log('FIRES on each defect');
  expect('exits 1', bad.status === 1);
  expect(
    'a found snippet whose only hit sits on another element',
    bad.output.includes(
      'button-variant-remap.found.html: no locator of 1.0.0#button-variant-remap',
    ),
  );
  expect(
    'a found snippet only a scoped hint names, outside any element',
    bad.output.includes(
      'sort-key-kept.found.ts: no locator of 1.0.0#sort-key-kept',
    ),
  );
  expect(
    'an ignored snippet a hit survives the element scope in',
    bad.output.includes(
      'button-variant-remap.ignored.html: a look-alike still counts',
    ) && bad.output.includes('searchHints "variant="" at line 3'),
  );
  expect(
    'an id the manifest does not have',
    bad.output.includes('has no item "no-such-item"'),
  );
  expect(
    'an extension outside html, ts and scss',
    bad.output.includes('sort-key-kept.ignored.css: a locator fixture is'),
  );
  expect(
    'a draft item with no .found fixture',
    bad.output.includes('unreleased#draft-item  behavior'),
  );
} finally {
  rmSync(BASE, { recursive: true, force: true });
}

if (failures.length) {
  console.error(
    `\ncheck-manifest-detect-selftest: ${failures.length} case(s) failed`,
  );
  process.exit(1);
}
console.log('\ncheck-manifest-detect-selftest: every case held.');
