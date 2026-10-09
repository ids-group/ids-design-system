#!/usr/bin/env node
// Proves the parts of `run-upgrade-canary.mjs` that decide its verdict without building anything:
// the build-error parser, the built-in rename step, and which item an error is attributed to.
// Each rule is shown firing on a bad input and quiet on a good one.
import assert from 'node:assert';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  applyBuiltIn,
  attribute,
  parseBuildErrors,
} from './run-upgrade-canary.mjs';

{
  const output = [
    "\x1b[31mX [ERROR] TS2322: Type '\"\"' is not assignable to type 'boolean | null'. [plugin angular-compiler]",
    '',
    '    src/app/app.component.html:2:55:',
    '      2 │   <ds-input clearable />',
    '  Error occurs in the template of component AppComponent.',
    '    src/app/app.component.ts:47:15:',
    'Application bundle generation complete.',
  ].join('\n');
  assert.deepStrictEqual(parseBuildErrors(output), [
    {
      message:
        "TS2322: Type '\"\"' is not assignable to type 'boolean | null'.",
      file: 'src/app/app.component.html',
      line: 2,
    },
  ]);
  assert.deepStrictEqual(
    parseBuildErrors('Application bundle generation complete.'),
    [],
  );
  console.log(
    'ok     parseBuildErrors: one error with its first location, none from a clean build',
  );
}

const root = mkdtempSync(join(tmpdir(), 'upgrade-canary-selftest-'));
try {
  mkdirSync(join(root, 'app'));
  writeFileSync(
    join(root, 'app', 'a.scss'),
    ':host { --ds-old-pad: 1px; --ds-old-pad-x: 2px; }\nds-old-card { color: red; }\n',
  );
  writeFileSync(
    join(root, 'app', 'a.html'),
    '<ds-old-card>\n  <ds-field [size]="s" label="x"></ds-field>\n  <ds-other [size]="s" />\n</ds-old-card>\n',
  );
  const manifests = [
    {
      version: '9.9.9',
      manifest: {
        items: [
          {
            id: 'pad',
            kind: 'token-rename',
            old: '--ds-old-pad',
            new: '--ds-new-padding',
          },
          {
            id: 'card',
            kind: 'selector-rename',
            old: 'ds-old-card',
            new: 'ds-card',
          },
          {
            id: 'size',
            kind: 'input-rename',
            old: 'ds-field[size]',
            new: 'ds-field[scale]',
          },
          { id: 'look', kind: 'behavior', old: 'FieldComponent', new: null },
        ],
      },
    },
  ];
  const results = applyBuiltIn(root, manifests);
  const scss = readFileSync(join(root, 'app', 'a.scss'), 'utf8');
  const html = readFileSync(join(root, 'app', 'a.html'), 'utf8');
  assert.ok(
    scss.includes('--ds-new-padding: 1px') &&
      scss.includes('--ds-old-pad-x: 2px'),
  );
  assert.ok(scss.includes('ds-card {'));
  assert.ok(html.startsWith('<ds-card>') && html.endsWith('</ds-card>\n'));
  assert.ok(
    html.includes('<ds-field [scale]="s"') &&
      html.includes('<ds-other [size]="s"'),
  );
  assert.deepStrictEqual(
    results.map((result) => [result.id, result.status]),
    [
      ['pad', 'applied'],
      ['card', 'applied'],
      ['size', 'applied'],
      ['look', 'not applied'],
    ],
  );
  console.log(
    'ok     applyBuiltIn: renames on a word boundary and on the scoped element only, other kinds not applied',
  );

  const items = manifests[0].manifest.items.map((item) => ({
    version: '9.9.9',
    item,
  }));
  const edited = { message: 'TS2322: nope', file: 'app/a.html', line: 2 };
  assert.deepStrictEqual(attribute(edited, '', results, items), [
    '9.9.9#size edited this line',
  ]);
  const named = {
    message: "TS2339: Property 'x' does not exist on type 'FieldComponent'.",
    file: 'x.ts',
    line: 1,
  };
  assert.deepStrictEqual(attribute(named, '', results, items), [
    '9.9.9#look names it',
  ]);
  const stray = {
    message: 'TS2307: Cannot find module',
    file: 'x.ts',
    line: 1,
  };
  assert.deepStrictEqual(attribute(stray, 'import {}', results, items), [
    'no manifest item covers this',
  ]);
  console.log(
    'ok     attribute: an edited line names its item, a mentioned name its item, anything else no item',
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
