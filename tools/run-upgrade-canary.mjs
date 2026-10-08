#!/usr/bin/env node
// Upgrades a small consumer app with the release's own manifests and builds it, so a break that no
// manifest item covers, or an item that migrates the app into a broken build, fails here before a
// consumer finds it.
//
// Reads `canary/`, an Angular app written against the PREVIOUS release the way a consumer writes
// one: package-root and entry-point imports, `[formControl]` fields, `ds-button` variants, a
// `ds-table` with a typed `dsCellTemplate`, a slotted `ds-modal`, a chart tooltip template, a
// subclass of `TooltipDirective`, and stylesheets setting `--ds-*` hooks. In order:
//
//   1. builds the library (`build:lib`, that tree's own tools) at <from> and at <to>;
//   2. builds the canary against the <from> package, which must pass: it proves the canary is
//      valid for that version, so every later error belongs to the upgrade;
//   3. applies every manifest after <from> up to <to> in release order, `unreleased.json` last
//      when <to> is the working tree, read from the <to> tree;
//   4. builds the canary against the <to> package under strictTemplates, and checks its styles with
//      that package's `check-overrides` scan (a `--ds-*` it sets and the package no longer reads).
//
// Fails on: a build error or override hit at <from> (the canary is stale) or at <to> (the upgrade
// breaks it). Each <to> error is printed with the manifest item whose edit it sits on or whose
// names it mentions, or as covered by no item.
//
// The applier is `plugins/design-system/scripts/apply-mechanical.mjs` when the checkout has it.
// Without it, a built-in step rewrites only plain token renames, `ds-*` selector renames and
// `element[input]` renames, and lists every other item as not applied.
//
//   node tools/run-upgrade-canary.mjs                          # last tag -> working tree
//   node tools/run-upgrade-canary.mjs --from v0.14.7 --to v0.14.8
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compareVersions, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = '@ids-group-ltd/ids-design-system';
const WORKING_TREE = 'working-tree';
const NG = join(ROOT, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const APPLIER = join(
  ROOT,
  'plugins',
  'design-system',
  'scripts',
  'apply-mechanical.mjs',
);
const SOURCE_EXTENSIONS = new Set(['.ts', '.html', '.scss', '.css']);
const STYLE_EXTENSIONS = new Set(['.scss', '.css']);
// CI=true keeps the Angular CLI from stopping on its analytics prompt.
const BUILD_ENV = {
  ...process.env,
  CI: 'true',
  NG_CLI_ANALYTICS: 'false',
  NO_COLOR: '1',
  FORCE_COLOR: '0',
};

const stripAnsi = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Angular's esbuild output: `X [ERROR] TS2322: message [plugin angular-compiler]`, then the first
// `path:line:column:` location under it.
export function parseBuildErrors(output) {
  const errors = [];
  let current = null;
  for (const line of stripAnsi(output).split(/\r?\n/)) {
    const header =
      /^\s*(?:X|✘)\s+\[ERROR\]\s+(.*?)(?:\s+\[plugin [^\]]+\])?\s*$/.exec(line);
    if (header) {
      current = { message: header[1], file: null, line: null };
      errors.push(current);
      continue;
    }
    const location = /^\s+([^\s│╵][^:]*?):(\d+):(\d+):\s*$/.exec(line);
    if (current && !current.file && location) {
      current.file = location[1].replace(/\\/g, '/');
      current.line = Number(location[2]);
    }
  }
  return errors;
}

const elementMember = (value) =>
  /^([a-z][\w-]*)\[([\w.]+)\]$/.exec(value ?? '');

function replaceCounted(text, pattern, replacement, onLine) {
  return text.replace(pattern, (match, ...rest) => {
    const offset = rest.at(-2);
    onLine(text.slice(0, offset).split('\n').length);
    return typeof replacement === 'function' ? replacement(match) : replacement;
  });
}

// The rename kinds a swap can apply without judgment. Anything else is reported, never guessed.
function builtInRewrite(item, extension, text, onLine) {
  const token = /^--[\w-]+$/;
  const selector = /^ds-[a-z-]+$/;
  if (
    item.kind === 'token-rename' &&
    token.test(item.old) &&
    token.test(item.new ?? '')
  )
    return replaceCounted(
      text,
      new RegExp(`(?<![\\w-])${escapeRegex(item.old)}(?![\\w-])`, 'g'),
      item.new,
      onLine,
    );
  if (
    item.kind === 'selector-rename' &&
    selector.test(item.old) &&
    selector.test(item.new ?? '')
  ) {
    const pattern =
      extension === '.html'
        ? new RegExp(`(?<=</?)${escapeRegex(item.old)}(?![\\w-])`, 'g')
        : STYLE_EXTENSIONS.has(extension)
          ? new RegExp(`(?<![\\w-])${escapeRegex(item.old)}(?![\\w-])`, 'g')
          : null;
    return pattern ? replaceCounted(text, pattern, item.new, onLine) : text;
  }
  const from = elementMember(item.old);
  const to = elementMember(item.new);
  if (item.kind === 'input-rename' && from && to && from[1] === to[1]) {
    if (extension !== '.html') return text;
    const attribute = new RegExp(
      `(?<=[\\s\\[(])${escapeRegex(from[2])}(?=[\\])=\\s/>])`,
      'g',
    );
    return replaceCounted(
      text,
      new RegExp(`<${escapeRegex(from[1])}(?![\\w-])[^>]*>`, 'g'),
      (tag) => tag.replace(attribute, to[2]),
      onLine,
    );
  }
  return null;
}

export function applyBuiltIn(sourceRoot, manifests) {
  const files = listSources(sourceRoot);
  const results = [];
  for (const { version, manifest } of manifests)
    for (const item of manifest.items ?? []) {
      const edits = [];
      let supported = true;
      for (const file of files) {
        const before = readFileSync(file, 'utf8');
        const lines = new Set();
        const after = builtInRewrite(item, extname(file), before, (line) =>
          lines.add(line),
        );
        if (after === null) {
          supported = false;
          break;
        }
        if (after !== before) {
          writeFileSync(file, after);
          for (const line of lines)
            edits.push({
              file: relative(sourceRoot, file).replace(/\\/g, '/'),
              line,
            });
        }
      }
      results.push({
        version,
        id: item.id,
        kind: item.kind,
        status: !supported
          ? 'not applied'
          : edits.length
            ? 'applied'
            : 'untouched',
        edits,
      });
    }
  return results;
}

function listSources(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.angular'].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...listSources(path));
    else if (SOURCE_EXTENSIONS.has(extname(entry.name))) found.push(path);
  }
  return found;
}

// The external applier reports `loc` as `path:line[:column]` relative to the root it was given.
function applyExternal(sourceRoot, manifestPaths) {
  const report = JSON.parse(
    execFileSync(process.execPath, [APPLIER, sourceRoot, ...manifestPaths], {
      encoding: 'utf8',
      maxBuffer: 1 << 28,
    }),
  );
  return report.items.map((item) => ({
    version: item.version,
    id: item.id,
    kind: item.kind,
    status: item.status === 'skipped' ? 'not applied' : item.status,
    edits: (item.edits ?? []).map(({ loc }) => {
      const [file, line] = String(loc).split(':');
      return { file: file.replace(/\\/g, '/'), line: Number(line) };
    }),
  }));
}

// The names an item gives a reader to find it by: `old`/`new` split into element and member,
// `searchHints` and `detect`. Short fragments (`\n`) would match any error, so they are dropped.
function namesOf(item) {
  const names = new Set();
  for (const value of [
    item.old,
    item.new,
    item.searchHints,
    item.detect,
  ].flat()) {
    if (typeof value !== 'string') continue;
    for (const part of value.split(/,\s*/)) {
      const scoped = elementMember(part);
      for (const name of scoped ? [scoped[1], scoped[2]] : [part])
        if (name.trim().length >= 4) names.add(name.trim());
    }
  }
  return [...names];
}

export function attribute(error, sourceLine, applied, items) {
  const onEdit = applied.filter((result) =>
    result.edits.some(
      (edit) => edit.file === error.file && edit.line === error.line,
    ),
  );
  if (onEdit.length)
    return onEdit.map(
      (result) => `${result.version}#${result.id} edited this line`,
    );
  const haystack = `${error.message}\n${sourceLine ?? ''}`;
  const named = items.filter(({ item }) =>
    namesOf(item).some((name) => haystack.includes(name)),
  );
  if (named.length)
    return named.map(({ version, item }) => `${version}#${item.id} names it`);
  return ['no manifest item covers this'];
}

function run(command, args, cwd, logName) {
  const result = spawnSync(command, args, {
    cwd,
    env: BUILD_ENV,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (logName) writeFileSync(join(cwd, logName), output);
  return { status: result.status ?? 1, output };
}

function extractTree(label, treeRoot) {
  mkdirSync(treeRoot, { recursive: true });
  if (label !== WORKING_TREE) {
    const archive = execFileSync(
      'git',
      ['-C', ROOT, 'archive', '--format=tar', label],
      {
        maxBuffer: 1 << 30,
      },
    );
    execFileSync('tar', ['-x', '-f', '-'], { cwd: treeRoot, input: archive });
    return;
  }
  const listed = execFileSync(
    'git',
    [
      '-C',
      ROOT,
      'ls-files',
      '-z',
      '--cached',
      '--others',
      '--exclude-standard',
    ],
    { encoding: 'utf8', maxBuffer: 1 << 28 },
  ).split('\0');
  for (const file of listed) {
    const source = join(ROOT, file);
    if (!file || !existsSync(source) || !statSync(source).isFile()) continue;
    mkdirSync(dirname(join(treeRoot, file)), { recursive: true });
    copyFileSync(source, join(treeRoot, file));
  }
}

function buildLibrary(label, treeRoot) {
  const started = Date.now();
  extractTree(label, treeRoot);
  const steps = [
    ['tools/sync-lib-package.mjs'],
    [NG, 'build', 'ds'],
    ['tools/add-entry-aliases.mjs'],
    ['tools/build-schematics.mjs'],
  ];
  for (const [script, ...args] of steps) {
    const path = script === NG ? NG : join(treeRoot, script);
    if (script !== NG && !existsSync(path)) continue;
    const { status, output } = run(process.execPath, [path, ...args], treeRoot);
    if (status !== 0) {
      console.error(
        `upgrade-canary: building the library at ${label} failed in ${script}`,
      );
      console.error(stripAnsi(output).split('\n').slice(-30).join('\n'));
      throw new Error('library build failed');
    }
  }
  console.log(`  built ${PACKAGE} at ${label} in ${seconds(started)}`);
  return join(treeRoot, 'dist', 'ds');
}

function installPackage(appRoot, dist) {
  const target = join(appRoot, 'node_modules', ...PACKAGE.split('/'));
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(dist, target, { recursive: true });
}

// The installed package's own `check-overrides` scan, over every stylesheet of the canary.
function overrideHits(appRoot, dist) {
  const scanPath = join(dist, 'schematics', 'check-overrides', 'scan.cjs');
  const surfacePath = join(
    dist,
    'schematics',
    'check-overrides',
    'surface.json',
  );
  if (!existsSync(scanPath) || !existsSync(surfacePath)) return [];
  const { findWriteOnlyTokens, findDeadClasses } = createRequire(
    import.meta.url,
  )(scanPath);
  const surface = JSON.parse(readFileSync(surfacePath, 'utf8'));
  const tokens = new Set(surface.tokens);
  const hits = [];
  for (const file of listSources(join(appRoot, 'src'))) {
    if (!STYLE_EXTENSIONS.has(extname(file))) continue;
    const text = readFileSync(file, 'utf8');
    const name = relative(appRoot, file).replace(/\\/g, '/');
    for (const hit of findWriteOnlyTokens(text, tokens))
      hits.push({
        file: name,
        line: hit.line,
        message: `sets ${hit.token}, which the package does not read`,
      });
    for (const hit of findDeadClasses(text, surface.classes))
      hits.push({
        file: name,
        line: hit.line,
        message: `${hit.selector} names .${hit.className}, which the component does not render`,
      });
  }
  return hits;
}

function buildCanary(appRoot, label) {
  const started = Date.now();
  const { status, output } = run(
    process.execPath,
    [NG, 'build'],
    appRoot,
    `build-${label}.log`,
  );
  const errors = parseBuildErrors(output);
  if (status !== 0 && errors.length === 0)
    errors.push({
      message: stripAnsi(output).trim().split('\n').slice(-5).join(' '),
      file: null,
      line: null,
    });
  console.log(
    `  built the canary against ${label} in ${seconds(started)}: ${errors.length} error(s)`,
  );
  return errors;
}

function manifestsBetween(from, to, toTree) {
  const migrations = join(toTree, 'migrations');
  const fromVersion = from.slice(1);
  const toVersion = to === WORKING_TREE ? null : to.slice(1);
  const versions = readdirSync(migrations)
    .filter((file) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?\.json$/.test(file))
    .map((file) => file.slice(0, -'.json'.length))
    .filter(
      (version) =>
        compareVersions(version, fromVersion) > 0 &&
        (toVersion === null || compareVersions(version, toVersion) <= 0),
    )
    .sort(compareVersions);
  if (to === WORKING_TREE && existsSync(join(migrations, 'unreleased.json')))
    versions.push('unreleased');
  return versions.map((version) => ({
    version,
    path: join(migrations, `${version}.json`),
    manifest: JSON.parse(
      readFileSync(join(migrations, `${version}.json`), 'utf8'),
    ),
  }));
}

const seconds = (started) => `${Math.round((Date.now() - started) / 1000)} s`;

function sourceLineOf(appRoot, error) {
  if (!error.file || !error.line) return null;
  const path = join(appRoot, error.file);
  return existsSync(path)
    ? readFileSync(path, 'utf8').split(/\r?\n/)[error.line - 1]
    : null;
}

function report(title, errors, describe) {
  console.log(`\n${title}: ${errors.length}`);
  for (const error of errors) {
    const where = error.file ? `${error.file}:${error.line}` : '(no location)';
    console.log(`  ${where}  ${error.message}`);
    for (const line of describe?.(error) ?? []) console.log(`      ${line}`);
  }
}

function main() {
  const argv = process.argv.slice(2);
  const option = (name) => {
    const index = argv.indexOf(name);
    return index === -1 ? null : argv[index + 1];
  };
  const tags = releaseTags(ROOT);
  const from = option('--from') ?? tags.at(-1);
  const to = option('--to') ?? WORKING_TREE;
  for (const label of [from, to])
    if (label !== WORKING_TREE && !tags.includes(label)) {
      console.error(`upgrade-canary: no tag ${label} in this checkout`);
      return 1;
    }

  const started = Date.now();
  console.log(`upgrade-canary: ${from} -> ${to}`);
  // Not node_modules/.cache: TypeScript treats a source under node_modules as an external library
  // and emits no declarations for it, so ng-packagr cannot bundle the typings. `tmp/` is ignored.
  const scratchParent = join(ROOT, 'tmp');
  mkdirSync(scratchParent, { recursive: true });
  const scratch = mkdtempSync(join(scratchParent, 'upgrade-canary-'));
  const cleanUp = () => {
    rmSync(scratch, {
      recursive: true,
      force: true,
      maxRetries: 5,
      retryDelay: 500,
    });
    if (readdirSync(scratchParent).length === 0)
      rmSync(scratchParent, { recursive: true });
  };
  process.once('SIGINT', () => {
    cleanUp();
    process.exit(130);
  });
  try {
    const fromDist = buildLibrary(from, join(scratch, 'from'));
    const toTree = join(scratch, 'to');
    const toDist = buildLibrary(to, toTree);

    const appRoot = join(scratch, 'app');
    cpSync(join(ROOT, 'canary'), appRoot, {
      recursive: true,
      filter: (source) => !/[\\/](node_modules|dist|\.angular)$/.test(source),
    });

    installPackage(appRoot, fromDist);
    const before = [
      ...buildCanary(appRoot, from),
      ...overrideHits(appRoot, fromDist),
    ];
    if (before.length) {
      report(`canary is not valid for ${from}`, before);
      console.error(
        `\nupgrade-canary: the canary must build against ${from} before an upgrade can be judged; fix canary/ to that version's API.`,
      );
      return 1;
    }

    const manifests = manifestsBetween(from, to, toTree);
    const external = existsSync(APPLIER);
    const applied = external
      ? applyExternal(
          appRoot,
          manifests.map((entry) => entry.path),
        )
      : applyBuiltIn(join(appRoot, 'src'), manifests).map((result) => ({
          ...result,
          edits: result.edits.map((edit) => ({
            ...edit,
            file: `src/${edit.file}`,
          })),
        }));
    console.log(
      `\napplied ${manifests.map((entry) => entry.version).join(', ') || 'no manifest'} with ${
        external
          ? 'apply-mechanical.mjs'
          : 'the built-in rename step (token, ds-* selector and element[input] renames only)'
      }`,
    );
    for (const result of applied)
      console.log(
        `  ${result.status.padEnd(11)} ${result.version}#${result.id} (${result.kind})${
          result.edits.length ? `, ${result.edits.length} edit(s)` : ''
        }`,
      );

    installPackage(appRoot, toDist);
    const items = manifests.flatMap(({ version, manifest }) =>
      (manifest.items ?? []).map((item) => ({ version, item })),
    );
    const after = [
      ...buildCanary(appRoot, to),
      ...overrideHits(appRoot, toDist),
    ];
    report(`errors after the upgrade to ${to}`, after, (error) =>
      attribute(error, sourceLineOf(appRoot, error), applied, items),
    );
    console.log(`\nupgrade-canary: ${from} -> ${to} in ${seconds(started)}`);
    return after.length ? 1 : 0;
  } catch (error) {
    console.error(`upgrade-canary: ${error.message}`);
    return 1;
  } finally {
    cleanUp();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
