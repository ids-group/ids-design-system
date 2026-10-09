// Run by tools/run-schematic-tests.mjs.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SchematicTestRunner } = require('@angular-devkit/schematics/testing');

const DS_IMPORT = "@use '@ids-group-ltd/ids-design-system/styles/ds';";
const STYLES = '/projects/app/src/styles.scss';

const angularRunner = new SchematicTestRunner(
  'angular',
  require
    .resolve('@schematics/angular/package.json')
    .replace('package.json', 'collection.json'),
);

async function freshApp() {
  const workspace = await angularRunner.runSchematic('workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '21.0.0',
  });

  return angularRunner.runSchematic(
    'application',
    { name: 'app', style: 'scss' },
    workspace,
  );
}

function snapshot(tree) {
  return new Map(tree.files.map((path) => [path, tree.readContent(path)]));
}

function changedFiles(before, tree) {
  const after = snapshot(tree);
  const paths = new Set([...before.keys(), ...after.keys()]);

  return [...paths]
    .filter((path) => before.get(path) !== after.get(path))
    .sort();
}

function collectMessages(runner) {
  const messages = [];
  runner.logger.subscribe((entry) => messages.push(entry.message));

  return messages;
}

function occurrences(text, needle) {
  return text.split(needle).length - 1;
}

export const tests = [
  {
    name: 'fresh app: prepends the styles entry and changes no other file',
    async run({ runSchematic }) {
      const app = await freshApp();
      const originalStyles = app.readContent(STYLES);
      const before = snapshot(app);
      const tree = await runSchematic('ng-add', {}, app);
      assert.equal(tree.readContent(STYLES), `${DS_IMPORT}\n${originalStyles}`);
      assert.deepEqual(changedFiles(before, tree), [STYLES]);
    },
  },
  {
    name: 'run twice: the second run changes nothing',
    async run({ runSchematic }) {
      const once = await runSchematic('ng-add', {}, await freshApp());
      const afterFirst = snapshot(once);
      const twice = await runSchematic('ng-add', {}, once);
      assert.deepEqual(changedFiles(afterFirst, twice), []);
      assert.equal(
        occurrences(
          twice.readContent(STYLES),
          '@ids-group-ltd/ids-design-system/styles/ds',
        ),
        1,
      );
    },
  },
  {
    // A second `@use` of the same module is a Sass compile error ("There's already a module with
    // namespace"), so a hand-written line in another quote style or with `as` must count as present.
    name: 'hand-written entry in another spelling: nothing added',
    async run({ runSchematic }) {
      for (const handWritten of [
        '@use "@ids-group-ltd/ids-design-system/styles/ds";',
        "@use '@ids-group-ltd/ids-design-system/styles/ds' as ds;",
      ]) {
        const app = await freshApp();
        app.overwrite(STYLES, `${handWritten}\n`);
        const tree = await runSchematic('ng-add', {}, app);
        assert.equal(tree.readContent(STYLES), `${handWritten}\n`, handWritten);
      }
    },
  },
  {
    name: 'project option: wires the named project',
    async run({ runSchematic }) {
      const app = await angularRunner.runSchematic(
        'application',
        { name: 'admin', style: 'scss' },
        await freshApp(),
      );
      const tree = await runSchematic('ng-add', { project: 'admin' }, app);
      assert.ok(
        tree
          .readContent('/projects/admin/src/styles.scss')
          .startsWith(DS_IMPORT),
      );
      assert.ok(!tree.readContent(STYLES).includes(DS_IMPORT));
    },
  },
  {
    name: 'project option naming no project: rejects naming it, writes nothing',
    async run({ runSchematic }) {
      const app = await freshApp();
      const before = snapshot(app);
      await assert.rejects(
        () => runSchematic('ng-add', { project: 'missing' }, app),
        /"missing"/,
      );
      assert.deepEqual(changedFiles(before, app), []);
    },
  },
  {
    name: 'no angular.json: warns, writes nothing',
    async run({ runner, runSchematic, HostTree }) {
      const messages = collectMessages(runner);
      const empty = new HostTree();
      empty.create('/src/styles.scss', 'body {}\n');
      const tree = await runSchematic('ng-add', {}, empty);
      assert.deepEqual(tree.files, ['/src/styles.scss']);
      assert.equal(tree.readContent('/src/styles.scss'), 'body {}\n');
      assert.ok(
        messages.some((message) => message.includes('angular.json not found')),
        messages.join('\n'),
      );
    },
  },
  {
    name: 'styles entry file missing: says what to add, creates nothing',
    async run({ runner, runSchematic }) {
      const app = await freshApp();
      app.delete(STYLES);
      const before = snapshot(app);
      const messages = collectMessages(runner);
      const tree = await runSchematic('ng-add', {}, app);
      assert.deepEqual(changedFiles(before, tree), []);
      assert.ok(
        messages.some((message) => message.includes(DS_IMPORT)),
        messages.join('\n'),
      );
    },
  },
];
