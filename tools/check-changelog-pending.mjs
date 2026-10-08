#!/usr/bin/env node
// A change to what consumers get is described when it is made, not reconstructed from a diff at the
// cut. Compares src/lib at a base (the last release tag, or `--base <ref>` for a PR) with the working
// tree, and reads four kinds of public change:
//   * class members gained, lost or retyped, as `tools/class-surface-diff.mjs` reports them
//   * exported symbols added or removed
//   * element selectors added or removed
//   * `var(--ds-*)` hooks whose name appeared or vanished, or whose set of fallbacks changed
//
// Fails when anything changed and `## Unreleased` is empty with no `migrations/unreleased.json`,
// and when either exists but leaves a changed class, element, symbol or `--ds-*` name unnamed. A
// class and the selectors declared in its file are one subject: naming either covers it.
//
// A commit whose message carries the trailer `Changelog: none` exempts the files it touched, but
// only files that every commit in the range touching them exempts, and never a file with
// uncommitted changes: a later commit to the same file can change the surface again.
//
//   node tools/check-changelog-pending.mjs                       # last tag..working tree
//   node tools/check-changelog-pending.mjs --base origin/dev     # a PR
//   node tools/check-changelog-pending.mjs --from v0.14.5 --to v0.14.6   # one release, reported
//   node tools/check-changelog-pending.mjs --audit               # every stable release, reported
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readTreeAt, workingTreeFiles } from './check-manifest-truth.mjs';
import {
  isPrerelease,
  previousBoundary,
  releaseTags,
} from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const git = (args, env = process.env) =>
  execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'ignore'],
    env,
  });

const DECL =
  /^export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;
const EXPORTED_CLASS =
  /^export\s+(?:abstract\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

export const withoutComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');

function selectorsIn(text) {
  const selectors = [];
  for (const block of text.matchAll(/selector:\s*'([^']+)'/g))
    for (const part of block[1].split(',')) {
      const tag = /^\s*([a-z][a-z0-9-]*)\s*$/.exec(part);
      if (tag) selectors.push(tag[1]);
    }
  return selectors;
}

// `var(--ds-x, <fallback>)` with the fallback read to its closing paren. A hook read inside another
// hook's fallback is part of that hook's default, not a read of its own, so the scan resumes after
// the outer paren. Whitespace is collapsed so a rewrap is not a change.
export function hookReads(text) {
  const reads = [];
  const hook = /var\(\s*(--ds-[a-z0-9-]*[a-z0-9])\s*(,?)/g;
  for (let match = hook.exec(text); match; match = hook.exec(text)) {
    let fallback = '';
    if (match[2]) {
      let depth = 1;
      let at = hook.lastIndex;
      for (; at < text.length; at++) {
        if (text[at] === '(') depth++;
        else if (text[at] === ')' && --depth === 0) break;
      }
      fallback = text.slice(hook.lastIndex, at).replace(/\s+/g, ' ').trim();
      hook.lastIndex = at;
    }
    reads.push([match[1], fallback]);
  }
  return reads;
}

// The package surface is the facade's export lists, not every `export` in src/lib: an entry point
// exports helpers its siblings import, and the facade withholds them. A tree without a facade of
// named lists falls back to every exported declaration.
function facadeNames(files) {
  const facade = files.find(({ path }) =>
    path.endsWith('src/lib/public-api.ts'),
  );
  if (!facade) return null;
  const names = new Set();
  for (const list of withoutComments(facade.text).matchAll(
    /export\s+(?:type\s+)?\{([^}]*)\}/g,
  ))
    for (const part of list[1].split(','))
      if (part.trim())
        names.add(
          part
            .trim()
            .split(/\s+as\s+/)
            .at(-1)
            .replace(/^type\s+/, ''),
        );
  return names.size ? names : null;
}

function indexFiles(files) {
  const symbols = new Map();
  const elements = new Map();
  const hooks = new Map();
  const classesByFile = new Map();
  const selectorsByFile = new Map();
  const published = facadeNames(files);
  const add = (map, key, file) => {
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(file);
  };
  for (const { path, text } of files) {
    const clean = withoutComments(text);
    for (const [name, fallback] of hookReads(clean))
      add(hooks, `${name}\u0000${fallback}`, path);
    if (!path.endsWith('.ts')) continue;
    for (const decl of clean.matchAll(DECL))
      if (!published || published.has(decl[1])) add(symbols, decl[1], path);
    classesByFile.set(
      path,
      [...clean.matchAll(EXPORTED_CLASS)].map((match) => match[1]),
    );
    const selectors = selectorsIn(clean);
    selectorsByFile.set(path, selectors);
    for (const selector of selectors) add(elements, selector, path);
  }
  return { symbols, elements, hooks, classesByFile, selectorsByFile };
}

// Reads the report `class-surface-diff.mjs` prints: a section heading, a two-space file label, and
// four-space lines under it (member names for GAINED/LOST, `key: old → new` for CHANGED).
export function parseClassSurface(output) {
  const entries = [];
  let section = null;
  let file = null;
  let isNewFile = false;
  for (const line of output.split('\n')) {
    if (/^GAINED/.test(line)) section = 'gained';
    else if (/^LOST/.test(line)) section = 'lost';
    else if (/^CHANGED/.test(line)) section = 'changed';
    else if (section && /^ {2}\S/.test(line)) {
      isNewFile = line.trim().endsWith('(new file)');
      file = `src/lib/${line.trim().replace(/\s+\((new file|file deleted)\)$/, '')}`;
    } else if (section && file && /^ {4}\S/.test(line))
      entries.push({ section, file, isNewFile, text: line.trim() });
  }
  return entries;
}

// Pure: what changed between two file lists, given the class-surface report between the same two
// trees. Exported so the selftest can run it on synthetic trees.
export function pendingChanges(
  beforeFiles,
  afterFiles,
  classSurfaceOutput,
  exemptFiles = new Set(),
) {
  const before = indexFiles(beforeFiles);
  const after = indexFiles(afterFiles);
  const subjects = new Map();
  const note = (key, names, files, detail) => {
    if ([...files].every((file) => exemptFiles.has(file))) return;
    if (!subjects.has(key))
      subjects.set(key, { names: new Set(), details: [] });
    const subject = subjects.get(key);
    for (const name of names) subject.names.add(name);
    subject.details.push(detail);
  };

  for (const entry of parseClassSurface(classSurfaceOutput)) {
    // Nothing pre-existing can subclass a class in a new file; when the facade publishes it, the
    // added symbol below is the change.
    if (entry.isNewFile) continue;
    const classes =
      after.classesByFile.get(entry.file) ??
      before.classesByFile.get(entry.file) ??
      [];
    const selectors =
      after.selectorsByFile.get(entry.file) ??
      before.selectorsByFile.get(entry.file) ??
      [];
    const key = entry.text.split(':')[0];
    const typeName =
      /^type (\w+)$/.exec(key)?.[1] ?? /^([A-Z]\w*)(?:\.\w+)?$/.exec(key)?.[1];
    const names =
      typeName && !classes.includes(typeName)
        ? [typeName]
        : [...classes, ...selectors];
    if (!names.length) names.push(entry.file.replace('src/lib/', ''));
    note(names[0], names, [entry.file], `${entry.section} ${entry.text}`);
  }

  for (const [kind, map] of [
    ['symbol', 'symbols'],
    ['element', 'elements'],
  ])
    for (const [name, files] of before[map])
      if (!after[map].has(name))
        note(name, [name], files, `${kind} removed (${[...files].join(', ')})`);
  for (const [kind, map] of [
    ['symbol', 'symbols'],
    ['element', 'elements'],
  ])
    for (const [name, files] of after[map])
      if (!before[map].has(name))
        note(name, [name], files, `${kind} added (${[...files].join(', ')})`);

  const fallbacks = (index) => {
    const byName = new Map();
    for (const [key, files] of index.hooks) {
      const [name, fallback] = key.split('\u0000');
      if (!byName.has(name)) byName.set(name, new Map());
      byName.get(name).set(fallback, files);
    }
    return byName;
  };
  const hooksBefore = fallbacks(before);
  const hooksAfter = fallbacks(after);
  for (const name of new Set([...hooksBefore.keys(), ...hooksAfter.keys()])) {
    const was = hooksBefore.get(name) ?? new Map();
    const is = hooksAfter.get(name) ?? new Map();
    const gone = [...was.keys()].filter((fallback) => !is.has(fallback));
    const came = [...is.keys()].filter((fallback) => !was.has(fallback));
    if (!gone.length && !came.length) continue;
    const files = new Set([
      ...gone.flatMap((f) => [...was.get(f)]),
      ...came.flatMap((f) => [...is.get(f)]),
    ]);
    const show = (list) =>
      list
        .map((fallback) => (fallback ? `'${fallback}'` : '(none)'))
        .join(', ');
    const detail = !was.size
      ? `hook added, fallback ${show(came)}`
      : !is.size
        ? `hook removed, fallback was ${show(gone)}`
        : `hook fallback ${show(gone) || 'unchanged'} -> ${show(came) || 'no longer read'}${
            gone.length && came.length
              ? ''
              : came.length
                ? ' (new read)'
                : ' (read dropped)'
          }`;
    note(name, [name], files, detail);
  }
  return [...subjects.entries()].map(([key, subject]) => ({
    key,
    names: [...subject.names],
    details: subject.details,
  }));
}

export function unreleasedBlock(changelog, heading = 'Unreleased') {
  const lines = changelog.split('\n');
  const start = lines.findIndex((line) =>
    new RegExp(`^## ${heading.replace(/\./g, '\\.')}(\\s|$)`).test(line),
  );
  if (start === -1) return '';
  const end = lines.findIndex(
    (line, index) => index > start && /^## /.test(line),
  );
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

const hasEntries = (block) =>
  block.split('\n').some((line) => line.trim() && !/^#{3,}\s/.test(line));

const mentions = (text, name) =>
  new RegExp(
    `(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`,
  ).test(text);

// Pure: the verdict on a list of changes against the description of them.
export function judge(changes, block, manifestText) {
  if (!changes.length)
    return { verdict: 'nothing public changed', failed: false, listed: [] };
  if (!hasEntries(block) && manifestText === null)
    return {
      verdict: 'public surface changed and nothing describes it',
      failed: true,
      listed: changes,
    };
  const description = `${block}\n${manifestText ?? ''}`;
  const unmentioned = changes.filter(
    (change) => !change.names.some((name) => mentions(description, name)),
  );
  return unmentioned.length
    ? {
        verdict: `${unmentioned.length} changed name(s) the description never mentions`,
        failed: true,
        listed: unmentioned,
      }
    : {
        verdict: `all ${changes.length} changed name(s) are mentioned`,
        failed: false,
        listed: [],
      };
}

// Files that only `Changelog: none` commits in base..head touched.
const exemptFilesIn = (base, head) =>
  exemptFromLog(
    git([
      'log',
      '--format=%x01%(trailers:key=Changelog,valueonly,separator=%x2C)',
      '--name-only',
      `${base}..${head}`,
      '--',
      'src/lib',
    ]),
  );

// One record per commit: a \u0001, its `Changelog` trailer values joined by commas, then the files.
export function exemptFromLog(log) {
  const exempt = new Set();
  const covered = new Set();
  for (const record of log.split('\u0001').filter((chunk) => chunk.trim())) {
    const [trailers, ...rest] = record.split('\n');
    const isNone = trailers
      .split(',')
      .some((value) => /^none$/i.test(value.trim()));
    for (const file of rest.map((line) => line.trim()).filter(Boolean)) {
      if (isNone) exempt.add(file);
      else covered.add(file);
    }
  }
  for (const file of covered) exempt.delete(file);
  return exempt;
}

// class-surface-diff reads two refs, so the working tree is handed to it as a commit object built in
// a scratch index. Nothing is written to a ref or to the real index.
function workingTreeCommit() {
  if (!git(['status', '--porcelain', '--', 'src/lib']).trim()) return 'HEAD';
  const index = join(tmpdir(), `changelog-pending-${process.pid}.index`);
  const env = {
    ...process.env,
    GIT_INDEX_FILE: index,
    GIT_AUTHOR_NAME: 'changelog-pending',
    GIT_AUTHOR_EMAIL: 'changelog-pending@localhost',
    GIT_COMMITTER_NAME: 'changelog-pending',
    GIT_COMMITTER_EMAIL: 'changelog-pending@localhost',
  };
  try {
    git(['read-tree', 'HEAD'], env);
    git(['add', '-A', '--', 'src/lib'], env);
    const tree = git(['write-tree'], env).trim();
    return git(
      ['commit-tree', tree, '-p', 'HEAD', '-m', 'working tree'],
      env,
    ).trim();
  } finally {
    rmSync(index, { force: true });
  }
}

const classSurface = (base, head) =>
  execFileSync(
    process.execPath,
    [join(ROOT, 'tools/class-surface-diff.mjs'), base, head],
    {
      cwd: ROOT,
      encoding: 'utf8',
      maxBuffer: 1 << 26,
    },
  );

const showAt = (ref, path) => {
  try {
    return git(['show', `${ref}:${path}`]);
  } catch {
    return null;
  }
};

function print(label, result) {
  console.log(`${label}: ${result.verdict}.`);
  for (const change of result.listed) {
    console.log(`  ${change.names.join(' / ')}`);
    for (const detail of change.details) console.log(`      ${detail}`);
  }
}

function boundary(from, to) {
  const version = to.replace(/^v/, '');
  const beforeFiles = readTreeAt(from);
  const afterFiles = readTreeAt(to);
  if (!beforeFiles || !afterFiles)
    return { label: `${from}..${to}`, unreadable: true };
  const changes = pendingChanges(
    beforeFiles,
    afterFiles,
    classSurface(from, to),
    exemptFilesIn(from, to),
  );
  const block = unreleasedBlock(showAt(to, 'CHANGELOG.md') ?? '', version);
  return {
    label: `${from}..${to}`,
    result: judge(changes, block, showAt(to, `migrations/${version}.json`)),
  };
}

// A misspelt option or one missing its value must stop the run: falling back to the last tag would
// check a different range from the one asked for and pass.
export function parseArguments(argv) {
  const options = {};
  let audit = false;
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === '--audit') audit = true;
    else if (['--base', '--from', '--to'].includes(argument)) {
      const value = argv[++index];
      if (value === undefined || value.startsWith('--'))
        return { error: `${argument} needs a ref after it.` };
      options[argument] = value;
    } else
      return {
        error: `"${argument}" is not --audit, --base <ref>, --from <ref> or --to <ref>.`,
      };
  }
  return { options, audit };
}

function main() {
  const parsed = parseArguments(process.argv.slice(2));
  if (parsed.error) {
    console.error(`changelog-pending: ${parsed.error}`);
    return 1;
  }
  const option = (name) => parsed.options[name] ?? null;
  const tags = releaseTags(ROOT);

  if (parsed.audit || option('--from')) {
    const pairs = option('--from')
      ? [[option('--from'), option('--to') ?? 'HEAD']]
      : tags
          .filter((tag) => !isPrerelease(tag.slice(1)))
          .map((tag) => [previousBoundary(tags, tag.slice(1)), tag])
          .filter(([from]) => from);
    let failing = 0;
    for (const [from, to] of pairs) {
      const outcome = boundary(from, to);
      if (outcome.unreadable) {
        console.log(
          `${outcome.label}: src/lib unreadable at one end, not checked.`,
        );
        continue;
      }
      if (outcome.result.failed) failing++;
      print(
        `${outcome.label} ${outcome.result.failed ? 'WOULD FAIL' : 'would pass'}`,
        outcome.result,
      );
    }
    console.log(
      `\nchangelog-pending audit: ${failing} of ${pairs.length} release(s) would fail. Report only.`,
    );
    return 0;
  }

  const base = option('--base') ?? tags.at(-1);
  if (!base) {
    console.error(
      'changelog-pending: no release tag and no --base, so there is nothing to compare with.',
    );
    return 1;
  }
  const beforeFiles = readTreeAt(base);
  const afterFiles = workingTreeFiles()?.map(({ path, text }) => ({
    path: relative(ROOT, path).replace(/\\/g, '/'),
    text,
  }));
  if (!beforeFiles || !afterFiles) {
    console.error(
      `changelog-pending: could not read src/lib at ${!beforeFiles ? base : 'the working tree'}.`,
    );
    return 1;
  }
  const dirty = new Set(
    git(['status', '--porcelain', '--', 'src/lib'])
      .split('\n')
      .filter(Boolean)
      .map((line) => line.slice(3).split(' -> ').at(-1)),
  );
  const exempt = new Set(
    [...exemptFilesIn(base, 'HEAD')].filter((file) => !dirty.has(file)),
  );
  const changes = pendingChanges(
    beforeFiles,
    afterFiles,
    classSurface(base, workingTreeCommit()),
    exempt,
  );
  const manifestPath = join(ROOT, 'migrations/unreleased.json');
  const result = judge(
    changes,
    unreleasedBlock(readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8')),
    existsSync(manifestPath) ? readFileSync(manifestPath, 'utf8') : null,
  );
  print(`changelog-pending ${base}..working tree`, result);
  if (result.failed)
    console.error(
      '\nDescribe each change under `## Unreleased` (and in migrations/unreleased.json where a consumer must act), ' +
        'or mark a commit that changes no public behaviour with the trailer `Changelog: none`.',
    );
  return result.failed ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)
  process.exitCode = main();
