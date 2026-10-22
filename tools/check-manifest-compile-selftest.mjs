#!/usr/bin/env node
// Does the compile check still FIRE on a wrong code, a missing error, an unknown item, an .html
// fixture, a wrong NG code in a component template, a malformed directive, a global declaration
// and an unbacked draft claim - and stay green on fixtures that hold, at a tag pair and at the
// last tag against the working tree, with import-less fixtures sharing a tag?
//
// Nothing tracked is written: each case builds its own migrations directory under
// node_modules/.cache, where a component fixture's `@angular/core` import resolves, and points the
// check at it through DS_MIGRATIONS_DIR.
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
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = join(
  ROOT,
  'node_modules',
  '.cache',
  `selftest-manifest-compile.${process.pid}`,
);

const AVATAR = `import { avatarTint } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2353
export const inline = avatarTint('Ann', { chroma: 0.1 });
`;

const ACCORDION = `import { Component } from '@angular/core';
import { AccordionComponent } from '@ids-group-ltd/ids-design-system';

@Component({
  selector: 'app-accordion',
  imports: [AccordionComponent],
  template: \`
    <!-- expect: after NG8002 -->
    <ds-accordion [multi]="false"></ds-accordion>
  \`,
})
export class AppAccordion {}
`;

const draft = (claim, rest = {}) =>
  JSON.stringify({
    version: 'unreleased',
    items: [
      { id: 'draft-claim', kind: 'behavior', action: 'None.', note: claim },
    ],
    ...rest,
  });

const claimsOutsideItems = {
  informational: [
    'Nothing to do.',
    { text: 'A spread config object fails with TS2353.' },
  ],
  deleteList: [
    {
      id: 'chroma-shim',
      surface: 'typescript',
      find: ['chroma'],
      why: 'Passing it inline fails with TS2353.',
    },
  ],
};

function run(name, files) {
  const migrations = join(BASE, name);
  mkdirSync(migrations, { recursive: true });
  for (const version of ['0.10.0', '0.13.4'])
    cpSync(
      join(ROOT, 'migrations', `${version}.json`),
      join(migrations, `${version}.json`),
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
    'fixtures/0.13.4/accordion-multi-is-multiple.component.ts': ACCORDION,
    // No import or export: still a module of its own, so the two share no global scope.
    'fixtures/0.10.0/control-size-input-becomes-nullable.ts':
      'const shared = 1;\n',
    'fixtures/0.10.0/exported-class-members-grew.ts': 'const shared = 2;\n',
    'unreleased.json': draft(
      'An inline `chroma` fails with TS2353.',
      claimsOutsideItems,
    ),
    'fixtures/unreleased/draft-claim.ts': AVATAR.replace('after', 'both'),
    'fixtures/unreleased/informational-2.ts': AVATAR.replace('after', 'both'),
    'fixtures/unreleased/chroma-shim.ts': AVATAR.replace('after', 'both'),
  });
  console.log(
    'HOLDS on fixtures that match, at v0.9.1..v0.10.0, v0.13.3..v0.13.4 and v<last>..the working tree',
  );
  expect('exits 0', good.status === 0);
  expect(
    'compiles all seven fixtures',
    /7 fixture\(s\) compiled/.test(good.output),
  );
  expect(
    'a component template under strictTemplates',
    good.output.includes(
      'ok    fixtures/0.13.4/accordion-multi-is-multiple.component.ts',
    ),
  );

  const bad = run('bad', {
    'fixtures/0.10.0/avatar-tint-chroma-to-saturation.ts':
      AVATAR.replace('TS2353', 'TS2339') +
      `// @ts-expect-error after TS2353\nexport const clean = avatarTint('Ann');\n`,
    'fixtures/0.10.0/control-size-input-becomes-nullable.ts':
      '// @ts-expect-error TS2353\nexport const value = 1;\n',
    'fixtures/0.10.0/no-such-item.ts': 'export {};\n',
    'fixtures/0.10.0/exported-class-members-grew.ts':
      'declare global {\n  interface Window {\n    leaked: true;\n  }\n}\nexport {};\n',
    'fixtures/0.10.0/table-column-width-type-widened-for-readers.html':
      '<ds-table />\n',
    'fixtures/0.13.4/accordion-multi-is-multiple.component.ts':
      ACCORDION.replace('after', 'before'),
    'unreleased.json': draft(
      'A subclass member fails with TS2416, a binding with NG8002.',
      claimsOutsideItems,
    ),
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
    'a global declaration that reaches the other fixtures of its tag',
    bad.output.includes(
      'line 1: `declare global` reaches every fixture compiled at the same tag',
    ),
  );
  expect(
    'an id the manifest does not have',
    bad.output.includes('has no entry "no-such-item"'),
  );
  expect(
    'an .html fixture',
    bad.output.includes('only .ts fixtures are compiled'),
  );
  expect(
    'an NG code on the wrong side of a template line',
    bad.output.includes('line 9 at v0.13.3: expected NG8002, got clean') &&
      bad.output.includes('line 9 at v0.13.4: expected clean, got NG8002'),
  );
  expect(
    'a draft TS or NG code no fixture asserts',
    bad.output.includes(
      'draft-claim  no fixture for TS2416 (note), NG8002 (note)',
    ),
  );

  expect(
    'a draft informational TS code no fixture asserts',
    bad.output.includes('informational-2  no fixture for TS2353 (text)'),
  );
  expect(
    'a draft deleteList TS code no fixture asserts',
    bad.output.includes('chroma-shim  no fixture for TS2353 (why)'),
  );

  // An empty variable is unset, as in the other manifest checks, not a directory named "".
  const emptyDirectory = spawnSync(
    process.execPath,
    [join(ROOT, 'tools', 'check-manifest-compile.mjs')],
    {
      cwd: ROOT,
      encoding: 'utf8',
      // Since HEAD nothing committed moved, so the repository's fixtures are read and none is
      // compiled: the case proves which folder was read without a full compile of every tag.
      env: { ...process.env, DS_MIGRATIONS_DIR: '', DS_COMPILE_SINCE: 'HEAD' },
    },
  );
  console.log('READS migrations/ when DS_MIGRATIONS_DIR is empty');
  // An uncommitted edit of the checker itself makes the run compile everything instead.
  const read =
    /of (\d+) fixture\(s\) can have moved since HEAD/.exec(
      emptyDirectory.stdout,
    ) ?? /(\d+) fixture\(s\) compiled/.exec(emptyDirectory.stdout);
  expect('reads the repository fixtures', Boolean(read) && Number(read[1]) > 0);

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
