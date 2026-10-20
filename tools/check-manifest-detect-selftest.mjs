#!/usr/bin/env node
// Does the locator check still FIRE on consumer code no locator finds, on a look-alike that
// survives the element scope, on an unknown id or extension, on a draft item with no fixture, on
// a deleteList workaround its find shapes miss or keep-code they hit, and on a deleteList find
// shape that matches the neutral corpus - and stay green when the same locators find the target
// and drop the look-alike?
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

const manifest = (version, items, deleteList = []) =>
  JSON.stringify({ version, items, deleteList });
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
const reserveMessageRow = {
  id: 'reserve-message-false',
  surface: 'template',
  find: ['[reserveMessage]="false"'],
  why: 'false is the default.',
  replaceWith: 'nothing',
};
const PUBLISHED = manifest(
  '1.0.0',
  [remap, storeBehavior],
  [reserveMessageRow],
);
const BROAD_PUBLISHED = manifest(
  '1.0.0',
  [remap, storeBehavior],
  [{ ...reserveMessageRow, find: ['reserveMessage'] }],
);
const NEUTRAL =
  '<ds-input label="Name" [reserveMessage]="true" formControlName="name" />\n';
const DRAFT = manifest('unreleased', [{ ...storeBehavior, id: 'draft-item' }]);
const STORE =
  'export const sorting = { path: store.sortKey()!, order: store.sortDir() };\n';
const BUTTON =
  '<ds-button\n  [disabled]="count > 0"\n  variant="secondary"\n/>\n';
const BADGE = '<ds-badge variant="secondary">New</ds-badge>\n';
const OPT_OUT = '<ds-input label="Name" [reserveMessage]="false" />\n';
const OPT_IN = '<ds-input label="Name" [reserveMessage]="true" />\n';

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
    'fixtures/1.0.0/reserve-message-false.found.html': OPT_OUT,
    'fixtures/1.0.0/reserve-message-false.multi-line.found.html':
      '<ds-input\n  label="Name"\n  [reserveMessage]="false" />\n',
    'fixtures/1.0.0/reserve-message-false.ignored.html': OPT_IN,
    'fixtures/_neutral/profile.component.html': NEUTRAL,
  });
  console.log(
    'HOLDS when the locators find the target and drop the look-alike',
  );
  expect('exits 0', good.status === 0);
  expect(
    'runs all seven fixtures',
    /7 locator fixture\(s\) run/.test(good.output),
  );
  expect(
    'a deleteList row finds each spelling of its workaround and skips the look-alike',
    good.output.includes('reserve-message-false.found.html: located') &&
      good.output.includes(
        'reserve-message-false.multi-line.found.html: located',
      ) &&
      good.output.includes('reserve-message-false.ignored.html: ignored'),
  );
  expect(
    'a hint inside a multi-line tag with `>` in a binding is located',
    good.output.includes('button-variant-remap.found.html: located'),
  );
  expect(
    'a detect shape on a typescript surface is not element-scoped',
    good.output.includes('sort-key-kept.found.ts: located'),
  );
  expect(
    'a find shape absent from the neutral corpus passes',
    /1 deleteList find shape\(s\) run over 1 neutral file\(s\)/.test(
      good.output,
    ),
  );

  const bad = run('bad', {
    '1.0.0.json': BROAD_PUBLISHED,
    'unreleased.json': DRAFT,
    'fixtures/1.0.0/button-variant-remap.found.html': BADGE,
    'fixtures/1.0.0/button-variant-remap.ignored.html': BUTTON,
    'fixtures/1.0.0/sort-key-kept.found.ts':
      'export const sorting = store.sortKey() ? 1 : 0;\n',
    'fixtures/1.0.0/no-such-item.found.ts': STORE,
    'fixtures/1.0.0/sort-key-kept.ignored.css': STORE,
    'fixtures/1.0.0/reserve-message-false.found.html':
      '<ds-input label="Name" />\n',
    'fixtures/1.0.0/reserve-message-false.ignored.html': OPT_IN,
    'fixtures/_neutral/profile.component.html': NEUTRAL,
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
    bad.output.includes('has no item or deleteList row "no-such-item"'),
  );
  expect(
    'a deleteList workaround no find shape matches',
    bad.output.includes(
      'reserve-message-false.found.html: no find shape of deleteList row 1.0.0#reserve-message-false',
    ),
  );
  expect(
    'a deleteList row whose find hits a look-alike',
    bad.output.includes(
      'reserve-message-false.ignored.html: a look-alike still counts',
    ),
  );
  expect(
    'an extension outside html, ts and scss',
    bad.output.includes('sort-key-kept.ignored.css: a locator fixture is'),
  );
  expect(
    'a draft item with no .found fixture',
    bad.output.includes('unreleased#draft-item  behavior'),
  );
  expect(
    'a find shape that matches ordinary code in the neutral corpus',
    bad.output.includes(
      '1.0.0#reserve-message-false: find "reserveMessage" matches ordinary code at fixtures/_neutral/profile.component.html:1',
    ),
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
