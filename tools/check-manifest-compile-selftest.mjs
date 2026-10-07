#!/usr/bin/env node
// Does the compile check still FIRE on a wrong code, a missing error, an unknown item, a template
// fixture, a malformed directive and an unbacked draft claim - and stay green on fixtures that
// hold, at a tag pair and at the last tag against the working tree?
//
// Nothing tracked is written: each case builds its own migrations directory under the OS temp dir
// and points the check at it through DS_MIGRATIONS_DIR.
//
//   node tools/check-manifest-compile-selftest.mjs
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = join(tmpdir(), `manifest-compile-selftest.${process.pid}`);

const AVATAR = `import { avatarTint } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2353
export const inline = avatarTint('Ann', { chroma: 0.1 });
`;

const draft = (claim) =>
  JSON.stringify({
    version: 'unreleased',
    items: [
      { id: 'draft-claim', kind: 'behavior', action: 'None.', note: claim },
    ],
  });

function run(name, files) {
  const migrations = join(BASE, name);
  mkdirSync(migrations, { recursive: true });
  cpSync(
    join(ROOT, 'migrations', '0.10.0.json'),
    join(migrations, '0.10.0.json'),
  );
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(migrations, path)), { recursive: true });
    writeFileSync(join(migrations, path), text);
  }
  const result = spawnSync(
    process.execPath,
    [join(ROOT, 'tools', 'check-manifest-compile.mjs')],
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
    'fixtures/0.10.0/avatar-tint-chroma-to-saturation.ts': AVATAR,
    'unreleased.json': draft('An inline `chroma` fails with TS2353.'),
    'fixtures/unreleased/draft-claim.ts': AVATAR.replace('after', 'both'),
  });
  console.log(
    'HOLDS on fixtures that match, at v0.9.1..v0.10.0 and v<last>..the working tree',
  );
  expect('exits 0', good.status === 0);
  expect('compiles both fixtures', /2 fixture\(s\) compiled/.test(good.output));

  const bad = run('bad', {
    'fixtures/0.10.0/avatar-tint-chroma-to-saturation.ts':
      AVATAR.replace('TS2353', 'TS2339') +
      `// @ts-expect-error after TS2353\nexport const clean = avatarTint('Ann');\n`,
    'fixtures/0.10.0/control-size-input-becomes-nullable.ts':
      '// @ts-expect-error TS2353\nexport const value = 1;\n',
    'fixtures/0.10.0/no-such-item.ts': 'export {};\n',
    'fixtures/0.10.0/table-column-width-type-widened-for-readers.html':
      '<ds-table />\n',
    'unreleased.json': draft('A subclass member fails with TS2416.'),
  });
  console.log('FIRES on each defect');
  expect('exits 1', bad.status === 1);
  expect(
    'a wrong code: expected TS2339, got TS2353',
    bad.output.includes('line 4 at v0.10.0: expected TS2339, got TS2353'),
  );
  expect(
    'a missing error: expected TS2353, got clean',
    bad.output.includes('line 6 at v0.10.0: expected TS2353, got clean'),
  );
  expect(
    'a directive without a side',
    bad.output.includes('write `// @ts-expect-error before|after|both'),
  );
  expect(
    'an item id the manifest does not have',
    bad.output.includes('has no item "no-such-item"'),
  );
  expect(
    'a template fixture',
    bad.output.includes('only .ts fixtures are compiled'),
  );
  expect(
    'a draft TS code no fixture asserts',
    bad.output.includes('draft-claim  no fixture for TS2416'),
  );

  const cache = join(ROOT, 'node_modules', '.cache');
  expect(
    'leaves no extracted tree behind',
    !existsSync(cache) ||
      !readdirSync(cache).some((entry) =>
        entry.startsWith('manifest-compile-'),
      ),
  );
} finally {
  rmSync(BASE, { recursive: true, force: true });
}

if (failures.length) {
  console.error(
    `\ncheck-manifest-compile-selftest: ${failures.length} case(s) failed`,
  );
  process.exit(1);
}
console.log('\ncheck-manifest-compile-selftest: every case held.');
