#!/usr/bin/env node
// A manifest sentence that states a compile outcome - "fails with TS2416", "TS2353 inline, silent
// through a prebuilt object" - is a claim about two trees, and only a compiler can vouch for it.
// This check compiles the consumer code behind each such claim at both ends of the boundary.
//
// Reads `migrations/fixtures/<version>/<id>.ts`, named by an item or `deleteList` id, or
// `informational-<n>` for the n-th `informational` line: consumer-side TypeScript importing from
// `@ids-group-ltd/ids-design-system` and its secondary entry points. A line expected to fail carries
// a directive on the line above, naming the side of the boundary and the exact codes:
//
//   // @ts-expect-error after TS2353           v<version> reports TS2353 here; v<prev> is clean
//   // @ts-expect-error before TS2339          the other way round
//   // @ts-expect-error both TS4114 TS2416     both tags report exactly these two
//
// `<id>.component.ts` is an Angular component whose inline `template:` is the consumer's
// template. It goes through the Angular compiler with `strictTemplates`, and a template line
// expected to fail carries the same directive as an HTML comment, codes TS or NG:
//
//   <!-- expect: after NG8002 -->             v<version> reports NG8002 on the next line
//
// Each fixture is type-checked at v<prev> and v<version> (`unreleased`: the last tag and the
// working tree) against that tag's `src/`, mapped through that tag's own tsconfig `paths`. The
// directives are stripped before compiling, because TypeScript's `@ts-expect-error` swallows ANY
// error: the codes reported on each line must equal the codes the directive names, and every line
// without one must be clean.
//
// Fails on: a code mismatch on any line at either tag, a fixture whose id is not in its
// manifest, a fixture that is not `.ts`, and an entry of `migrations/unreleased.json` naming a TS
// or compile-time NG code that its fixture does not assert.
//
//   node tools/check-manifest-compile.mjs            # every fixture, plus the unreleased draft
//   node tools/check-manifest-compile.mjs --audit    # the same, then every published entry whose
//                                                    # TS/NG-code claim no fixture asserts; exits 0
import { NgtscProgram } from '@angular/compiler-cli';
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { previousBoundary, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = resolve(
  process.env.DS_MIGRATIONS_DIR || join(ROOT, 'migrations'),
);
const FIXTURES = join(MIGRATIONS, 'fixtures');
const AUDIT = process.argv.includes('--audit');
const PACKAGE = '@ids-group-ltd/ids-design-system';
const WORKING_TREE = 'the working tree';
const VERSION_FOLDER = /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?|unreleased)$/;

const DIRECTIVE =
  /^\s*(?:\/\/\s*@ts-expect-error\b(.*)|<!--\s*expect:(.*?)-->\s*)$/;
const DIRECTIVE_BODY = /^\s+(before|after|both)((?:\s+(?:TS|NG)\d{4})+)\s*$/;
const SUPPRESSION = /@ts-(ignore|nocheck)\b/;
// NG0xxx are runtime errors; compile-time Angular codes start at NG1000.
const CLAIMED_CODE = /\b(?:TS\d{4}|NG[1-9]\d{3})\b/g;
const TEMPLATE_FIXTURE = '.component.ts';

// The options a consumer's Angular app compiles with, minus emit. `noImplicitOverride` is in
// because the Angular CLI scaffolds it, and it is what turns a new base member into TS4114.
const COMPILER_OPTIONS = {
  strict: true,
  noImplicitOverride: true,
  skipLibCheck: true,
  experimentalDecorators: true,
  noEmit: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.Preserve,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
};

const tags = releaseTags(ROOT);
const problems = [];
const results = [];

function parseFixture(path) {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  const expected = { before: new Map(), after: new Map() };
  const errors = [];
  let pending = [];
  lines.forEach((line, index) => {
    if (SUPPRESSION.test(line))
      errors.push(
        `line ${index + 1}: @ts-${SUPPRESSION.exec(line)[1]} hides the diagnostics this check reads`,
      );
    const directive = DIRECTIVE.exec(line);
    if (directive) {
      const body = DIRECTIVE_BODY.exec(directive[1] ?? ` ${directive[2]}`);
      if (!body)
        errors.push(
          `line ${index + 1}: write \`// @ts-expect-error before|after|both TS<code> ...\` or \`<!-- expect: before|after|both NG<code> ... -->\``,
        );
      else pending.push({ side: body[1], codes: body[2].trim().split(/\s+/) });
      return;
    }
    for (const { side, codes } of pending)
      for (const which of side === 'both' ? ['before', 'after'] : [side]) {
        const set = expected[which].get(index + 1) ?? new Set();
        for (const code of codes) set.add(code);
        expected[which].set(index + 1, set);
      }
    pending = [];
  });
  if (pending.length)
    errors.push('the last directive has no line under it to apply to');
  // Same line count, so diagnostic lines still match the file on disk.
  const stripped = lines
    .map((line) => line.replace('@ts-expect-error', 'ts-expect-error'))
    .join('\n');
  const asserted = new Set(
    [...expected.before.values(), ...expected.after.values()].flatMap((set) => [
      ...set,
    ]),
  );
  return { expected, stripped, errors, asserted };
}

// The tag's own tsconfig decides where the package resolves: before 0.12 the alias was `ds` onto
// `src/public-api.ts`, from 0.12 on `src/lib/public-api.ts` plus one folder per entry point.
function pathsFor(treeRoot) {
  const config = ts.parseConfigFileTextToJson(
    'tsconfig.json',
    readFileSync(join(treeRoot, 'tsconfig.json'), 'utf8'),
  ).config;
  const paths = config?.compilerOptions?.paths ?? {};
  const primary = paths[PACKAGE] ?? paths.ds;
  if (!primary?.some((target) => existsSync(join(treeRoot, target))))
    return null;
  const secondary = [
    ...new Set([...(paths[`${PACKAGE}/*`] ?? []), ...(paths['ds/*'] ?? [])]),
  ];
  return {
    [PACKAGE]: primary,
    ...(secondary.length ? { [`${PACKAGE}/*`]: secondary } : {}),
  };
}

// Angular reports its own diagnostics as negative codes, -99<NNNN> for NG<NNNN>.
const codeName = (code) =>
  code < 0 ? `NG${String(-code).slice(2)}` : `TS${code}`;

function compile(treeRoot, label, fixtures, angular) {
  const paths = pathsFor(treeRoot);
  if (!paths) {
    for (const fixture of fixtures)
      problems.push(
        `${fixture.name}: ${label} has no source entry point for ${PACKAGE} in its tsconfig paths`,
      );
    return new Map();
  }
  const options = {
    ...COMPILER_OPTIONS,
    baseUrl: treeRoot,
    paths,
    ...(angular ? { strictTemplates: true } : {}),
  };
  const host = ts.createCompilerHost(options);
  const texts = new Map(
    fixtures.map((fixture) => [
      resolve(fixture.path).toLowerCase(),
      fixture.parsed.stripped,
    ]),
  );
  const readFile = host.readFile.bind(host);
  host.readFile = (file) =>
    texts.get(resolve(file).toLowerCase()) ?? readFile(file);
  const rootNames = fixtures.map((fixture) => fixture.path);
  const angularProgram = angular && new NgtscProgram(rootNames, options, host);
  const program = angularProgram
    ? angularProgram.getTsProgram()
    : ts.createProgram(rootNames, options, host);
  for (const diagnostic of angularProgram
    ? [
        ...angularProgram.getTsOptionDiagnostics(),
        ...angularProgram.getNgOptionDiagnostics(),
      ]
    : program.getOptionsDiagnostics())
    problems.push(
      `${label}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
    );
  const reported = new Map();
  for (const fixture of fixtures) {
    const source = program.getSourceFile(fixture.path);
    const byLine = new Map();
    for (const diagnostic of angularProgram
      ? [
          ...angularProgram.getTsSyntacticDiagnostics(source),
          ...angularProgram.getTsSemanticDiagnostics(source),
          ...angularProgram.getNgSemanticDiagnostics(source.fileName),
        ]
      : [
          ...program.getSyntacticDiagnostics(source),
          ...program.getSemanticDiagnostics(source),
        ]) {
      const line =
        source.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1;
      const entry = byLine.get(line) ?? { codes: new Set(), messages: [] };
      entry.codes.add(codeName(diagnostic.code));
      entry.messages.push(
        `${codeName(diagnostic.code)} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`,
      );
      byLine.set(line, entry);
    }
    reported.set(fixture, byLine);
  }
  return reported;
}

const codes = (set) => (set?.size ? [...set].sort().join(' ') : 'clean');

function compare(fixture, side, label, byLine) {
  const expected = fixture.parsed.expected[side];
  const lines = new Set([...expected.keys(), ...byLine.keys()]);
  const mismatches = [];
  for (const line of [...lines].sort((a, b) => a - b)) {
    const want = codes(expected.get(line));
    const got = codes(byLine.get(line)?.codes);
    if (want !== got)
      mismatches.push(
        `line ${line} at ${label}: expected ${want}, got ${got}` +
          (byLine.get(line)
            ? `\n        ${byLine.get(line).messages.join('\n        ')}`
            : ''),
      );
  }
  return mismatches;
}

// Every entry that can carry a compile claim, keyed as its fixture is named: an item or a
// `deleteList` row by its id, an `informational` line, which has none, as `informational-<n>`
// counted from 1.
function manifestEntries(version) {
  const file = join(MIGRATIONS, `${version}.json`);
  if (!existsSync(file)) return null;
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  return [
    ...(manifest.items ?? []),
    ...(manifest.deleteList ?? []),
    ...(manifest.informational ?? []).map((entry, index) => ({
      ...(typeof entry === 'string' ? { text: entry } : entry),
      id: `informational-${index + 1}`,
    })),
  ];
}

function collectFixtures() {
  if (!existsSync(FIXTURES)) return [];
  const fixtures = [];
  for (const folder of readdirSync(FIXTURES, { withFileTypes: true })) {
    if (!folder.isDirectory() || !VERSION_FOLDER.test(folder.name)) {
      problems.push(
        `fixtures/${folder.name}: not a <version> or unreleased folder`,
      );
      continue;
    }
    const version = folder.name;
    const entries = manifestEntries(version);
    for (const file of readdirSync(join(FIXTURES, version))) {
      const name = `fixtures/${version}/${file}`;
      // Locator fixtures, read by tools/check-manifest-detect.mjs.
      if (/\.(found|ignored)\.[a-z]+$/.test(file)) continue;
      if (extname(file) !== '.ts' || file.endsWith('.d.ts')) {
        problems.push(
          `${name}: only .ts fixtures are compiled; a template goes inline in <id>${TEMPLATE_FIXTURE}`,
        );
        continue;
      }
      const template = file.endsWith(TEMPLATE_FIXTURE);
      const id = file.slice(0, -(template ? TEMPLATE_FIXTURE : '.ts').length);
      if (!entries) {
        problems.push(`${name}: there is no migrations/${version}.json`);
        continue;
      }
      if (!entries.some((entry) => entry.id === id)) {
        problems.push(
          `${name}: migrations/${version}.json has no entry "${id}"`,
        );
        continue;
      }
      const path = join(FIXTURES, version, file);
      const parsed = parseFixture(path);
      if (parsed.errors.length) {
        problems.push(...parsed.errors.map((error) => `${name}: ${error}`));
        continue;
      }
      const draft = version === 'unreleased';
      const after = draft ? WORKING_TREE : `v${version}`;
      const before = draft ? tags.at(-1) : previousBoundary(tags, version);
      if (!before || (!draft && !tags.includes(after))) {
        problems.push(
          `${name}: no tagged boundary for ${version} in this checkout`,
        );
        continue;
      }
      fixtures.push({
        name,
        version,
        id,
        path,
        parsed,
        before,
        after,
        template,
      });
    }
  }
  return fixtures;
}

// Every tag's src is extracted under node_modules/.cache, not the OS temp dir: the library sources
// import @angular/* and friends, and resolution walks up from the importing file to find them.
function runFixtures(fixtures) {
  const scratch = join(ROOT, 'node_modules', '.cache');
  mkdirSync(scratch, { recursive: true });
  const trees = mkdtempSync(join(scratch, 'manifest-compile-'));
  const cleanUp = () => rmSync(trees, { recursive: true, force: true });
  process.once('SIGINT', () => {
    cleanUp();
    process.exit(130);
  });
  try {
    const bySide = new Map();
    for (const fixture of fixtures)
      for (const [side, label] of [
        ['before', fixture.before],
        ['after', fixture.after],
      ]) {
        const group = bySide.get(label) ?? [];
        group.push({ fixture, side });
        bySide.set(label, group);
      }
    const mismatches = new Map(fixtures.map((fixture) => [fixture, []]));
    for (const [label, entries] of bySide) {
      let treeRoot = ROOT;
      if (label !== WORKING_TREE) {
        treeRoot = join(trees, label);
        mkdirSync(treeRoot);
        const archive = execFileSync(
          'git',
          [
            '-C',
            ROOT,
            'archive',
            '--format=tar',
            label,
            'src',
            'tsconfig.json',
          ],
          { maxBuffer: 1 << 30 },
        );
        execFileSync('tar', ['-x', '-f', '-'], {
          cwd: treeRoot,
          input: archive,
        });
      }
      const unique = [...new Set(entries.map((entry) => entry.fixture))];
      const plain = unique.filter((fixture) => !fixture.template);
      const templated = unique.filter((fixture) => fixture.template);
      const reported = new Map([
        ...(plain.length ? compile(treeRoot, label, plain, false) : []),
        ...(templated.length ? compile(treeRoot, label, templated, true) : []),
      ]);
      for (const { fixture, side } of entries)
        if (reported.has(fixture))
          mismatches
            .get(fixture)
            .push(...compare(fixture, side, label, reported.get(fixture)));
    }
    for (const fixture of fixtures) {
      const found = mismatches.get(fixture);
      results.push(
        `${found.length ? 'FAIL' : 'ok  '}  ${fixture.name}  (${fixture.before} .. ${fixture.after})` +
          found.map((line) => `\n      ${line}`).join(''),
      );
      problems.push(...found.map((line) => `${fixture.name}: ${line}`));
    }
  } finally {
    cleanUp();
  }
}

function claimsOf(entry) {
  const claims = [];
  for (const [field, value] of Object.entries(entry))
    for (const text of [value].flat())
      if (typeof text === 'string')
        for (const code of text.match(CLAIMED_CODE) ?? [])
          claims.push({ field, code });
  return claims;
}

// Which TS codes an entry names that no fixture of its version asserts.
function uncovered(version, fixtures) {
  const asserted = new Map(
    fixtures
      .filter((fixture) => fixture.version === version)
      .map((fixture) => [fixture.id, fixture.parsed.asserted]),
  );
  const gaps = [];
  for (const entry of manifestEntries(version) ?? []) {
    const missing = new Map();
    for (const { field, code } of claimsOf(entry)) {
      if (asserted.get(entry.id)?.has(code)) continue;
      missing.set(code, [...new Set([...(missing.get(code) ?? []), field])]);
    }
    if (missing.size)
      gaps.push(
        `migrations/${version}.json  ${entry.id}  ${asserted.has(entry.id) ? 'fixture lacks' : 'no fixture for'} ` +
          [...missing]
            .map(([code, fields]) => `${code} (${fields.join(', ')})`)
            .join(', '),
      );
  }
  return gaps;
}

const fixtures = collectFixtures();
runFixtures(fixtures);

const draftGaps = uncovered('unreleased', fixtures);
problems.push(
  ...draftGaps.map(
    (gap) =>
      `${gap}\n      a TS code in the draft is a compile claim: add the line that produces it to migrations/fixtures/unreleased/<id>.ts`,
  ),
);

console.log(
  `check-manifest-compile: ${fixtures.length} fixture(s) compiled at both ends of their boundary`,
);
for (const line of results) console.log(`  ${line}`);

if (AUDIT) {
  const published = readdirSync(MIGRATIONS)
    .filter((file) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?\.json$/.test(file))
    .map((file) => file.slice(0, -'.json'.length))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const gaps = published.flatMap((version) => uncovered(version, fixtures));
  console.log(
    `\ncheck-manifest-compile --audit: ${gaps.length} published entr(ies) name a TS/NG code no fixture asserts`,
  );
  for (const gap of gaps) console.log(`  ${gap}`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s) in the fixtures themselves:`);
    for (const problem of problems) console.log(`  ${problem}`);
  }
  process.exit(0);
}

if (problems.length) {
  console.error(
    `\ncheck-manifest-compile: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`,
  );
  process.exit(1);
}
console.log('check-manifest-compile: every compile claim held.');
