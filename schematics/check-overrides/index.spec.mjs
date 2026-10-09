// Run by tools/run-schematic-tests.mjs, against a fixture surface.json instead of the one
// tools/build-override-surface.mjs derives from a built dist/ds.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SURFACE = {
  version: '0.0.0-test',
  tokens: ['--ds-button-bg-color'],
  classes: { 'ds-button': ['button', 'color-secondary'] },
};

function treeWith(context, files) {
  writeFileSync(
    join(context.collectionDir, 'check-overrides/surface.json'),
    JSON.stringify(SURFACE),
  );
  const tree = new context.HostTree();
  for (const [path, content] of Object.entries(files))
    tree.create(path, content);

  return tree;
}

function collectMessages(runner) {
  const messages = [];
  runner.logger.subscribe((entry) =>
    messages.push(`${entry.level} ${entry.message}`),
  );

  return messages;
}

const STALE = {
  '/src/styles.scss':
    'ds-button {\n  --ds-button-bg: red;\n}\nds-button .button.secondary {}\n',
  '/src/app/app.html':
    '<ds-button [style.--ds-button-gap]="gap"></ds-button>\n',
  '/node_modules/x/styles.scss': 'a { --ds-unread: red; }\n',
};
const CLEAN = {
  '/src/styles.scss':
    'ds-button {\n  --ds-button-bg-color: red;\n}\nds-button .button.color-secondary {}\n',
};

export const tests = [
  {
    name: 'stale override: reports each write-only token and dead class, changes nothing',
    async run(context) {
      const messages = collectMessages(context.runner);
      const tree = await context.runSchematic(
        'check-overrides',
        {},
        treeWith(context, STALE),
      );
      assert.deepEqual(
        messages.filter((message) => message.startsWith('warn ')).sort(),
        [
          'warn /src/app/app.html:1 --ds-button-gap is not read by @ids-group-ltd/ids-design-system 0.0.0-test',
          'warn /src/styles.scss:2 --ds-button-bg is not read by @ids-group-ltd/ids-design-system 0.0.0-test',
          'warn /src/styles.scss:4 ds-button .secondary: ds-button renders no such class in 0.0.0-test',
        ],
      );
      assert.ok(
        messages.includes(
          'info check-overrides: 2 write-only token(s), 1 dead class(es)',
        ),
        messages.join('\n'),
      );
      for (const [path, content] of Object.entries(STALE))
        assert.equal(tree.readContent(path), content);
    },
  },
  {
    name: 'stale override with strict: rejects',
    async run(context) {
      await assert.rejects(
        () =>
          context.runSchematic(
            'check-overrides',
            { strict: true },
            treeWith(context, STALE),
          ),
        /2 write-only token\(s\), 1 dead class\(es\)/,
      );
    },
  },
  {
    name: 'clean override: no warning, strict passes',
    async run(context) {
      const messages = collectMessages(context.runner);
      await context.runSchematic(
        'check-overrides',
        { strict: true },
        treeWith(context, CLEAN),
      );
      assert.deepEqual(
        messages.filter((message) => message.startsWith('warn ')),
        [],
      );
      assert.ok(
        messages.includes(
          'info check-overrides: 0 write-only token(s), 0 dead class(es)',
        ),
        messages.join('\n'),
      );
    },
  },
];
