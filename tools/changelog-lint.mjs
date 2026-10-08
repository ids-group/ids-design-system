//
// Every text artefact that SHIPS, checked for things an external reader cannot use.
//
// Careful review cannot replace this: the changelog-writing agent is told to study the
// previous release for voice, so one release's leak becomes the next release's template.
//
// Every rule asks about REACHABILITY, not spelling: can the reader open the thing we
// named, and is it about them rather than about us.
//
// Usage:
//   node tools/changelog-lint.mjs                 every published artefact
//   node tools/changelog-lint.mjs CHANGELOG.md …  specific files
//   node tools/changelog-lint.mjs --list          what counts as published
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FACADE,
  PRIMARY_NG_PACKAGE,
  resolveLibSpecifier,
} from './lib-entry-points.mjs';
import { SECTION_ORDER, sectionSlot } from './changelog-sections.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Kept in step with tools/build-schematics.mjs. `AUTHORING.md` and `fixtures/` are excluded
// from the tarball and from here; `unreleased.json` is excluded from the tarball but linted anyway,
// because it BECOMES a published manifest at the next release.
function publishedFiles() {
  const files = [
    'CHANGELOG.md',
    'README.md',
    'design-system.md',
    'components.md',
  ];
  const migrations = join(ROOT, 'migrations');
  if (existsSync(migrations)) {
    for (const entry of readdirSync(migrations, { withFileTypes: true })) {
      if (entry.name === 'AUTHORING.md' || entry.name === 'fixtures') continue;
      if (entry.isDirectory()) {
        for (const nested of readdirSync(join(migrations, entry.name))) {
          files.push(`migrations/${entry.name}/${nested}`);
        }
      } else {
        files.push(`migrations/${entry.name}`);
      }
    }
  }

  return files.filter((file) => existsSync(join(ROOT, file)));
}

// Comments ship too, and that is not obvious. `src/lib/styles` and `src/lib/themes` are
// copied VERBATIM as assets, so every comment in them is published text, and a `.ts`
// comment survives into the FESM bundle with its JSDoc reaching the `.d.ts`. A
// component's own `.scss` is the exception — its comments are compiled away.
//
// Only rules that cannot misfire on CODE are listed: a file declaring `DsFieldBase`
// names it on every other line, and an SVG path (`M21 13a9 9 0 0 1-12-12 …`) reads as
// an ambiguous date.
const SOURCE_RULES = new Set([
  'C001',
  'C002',
  'C003',
  'C004',
  'C008',
  'C009',
  'C011',
]);

// Returns the files AND the per-source breakdown, because a collapse is per-source: the total
// stays high while one input resolves to nothing.
function shippedSources() {
  const found = [];
  const groups = [];
  const crawl = (dir, keep) => {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full, keep);
      else if (keep(item.name))
        found.push(relative(ROOT, full).split('\\').join('/'));
    }
  };
  // Read the asset inputs from ng-package.json rather than hardcoding them: its glob is
  // `**/*`, so a hardcoded `.scss` filter silently skips every `.md` beside them.
  const ngPackage = PRIMARY_NG_PACKAGE;
  const assets = existsSync(ngPackage)
    ? (JSON.parse(readFileSync(ngPackage, 'utf8')).assets ?? [])
    : [];
  const TEXT = /\.(scss|css|md|json|txt)$/;
  for (const asset of assets) {
    if (!asset.input) continue;
    const before = found.length;
    crawl(join(dirname(ngPackage), asset.input), (n) => TEXT.test(n));
    groups.push({
      name: `assets:${asset.input}`,
      count: found.length - before,
    });
  }
  const beforeSource = found.length;
  crawl(
    join(ROOT, 'src/lib'),
    (n) => n.endsWith('.ts') && !n.endsWith('.spec.ts'),
  );
  groups.push({ name: 'src/lib/**/*.ts', count: found.length - beforeSource });

  return { files: found, groups, assetsDeclared: assets.length };
}

// The docs site and the agent docs reach readers outside the team too, but they are full of code
// and of prose about how the library is built, so only the consumer-name rule applies to them.
const DOCS_SITE_RULES = new Set(['C001']);

function docsSiteSources() {
  const found = [];
  const groups = [];
  const crawl = (dir, keep) => {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full, keep);
      else if (keep(item.name))
        found.push(relative(ROOT, full).split('\\').join('/'));
    }
  };
  for (const [name, keep] of [
    ['ds-docs/src', (n) => /\.(html|ts|scss|json|md)$/.test(n)],
    ['docs/agent', (n) => n.endsWith('.md')],
  ]) {
    const before = found.length;
    crawl(join(ROOT, name), keep);
    groups.push({ name, count: found.length - before });
  }

  return { files: found, groups };
}

// A published artefact is read by ALL of these, so naming one to the others is a
// confidentiality problem, not a style one.
const CLIENTS = [
  'mm-broker',
  'mm-broker-platform',
  'mm-ecm',
  'pinkmoon',
  'broker-portal',
  'platform-admin',
  'employee-portal',
  'ai-sdlc',
  'Kit Movement',
  'Festicket',
  // `loose()` reaches the separator variants of the entry above it; `brand-mm` needs its
  // own, because C002 only matches MM followed by digits.
  'manage my',
  'brand-mm',
  // A descriptive stand-in is the same disclosure with the name filed off.
  'the field app',
  'the ports',
  'admin port',
  'the portals',
];

// The published tree holds `styles/`, `themes/`, `migrations/`, `schematics/` and the
// root documents, so none of those belong here.
const INTERNAL_PATHS = [
  'src/lib/',
  'tools/',
  'presentations/',
  'ds-docs/',
  'infrastructure/',
  '.claude/',
  'docs/',
  'migrations/AUTHORING.md',
];

const INSIDER_PROSE = [
  'dogfooding',
  'the deck',
  'the decks',
  'priority board',
  'release gate',
  'our backlog',
  'the backlog',
];

// Whole-entry shapes, not stray words: each of these can only be the start of a sentence
// about us repairing our own files.
const OUR_RECORD = [
  'manifests were corrected',
  'manifest was corrected',
  'manifests are corrected',
  'published manifests corrected',
  'corrected in migrations',
  're-run these items',
  'an earlier note of ours',
  'this item\u2019s earlier text',
];

const PEOPLE = ['Stas', 'Misha'];

// Symbols a module exports but the package root never surfaces: naming one tells a reader
// to import something the package cannot give them. Resolved from the export graph, not a
// list, so promoting or withdrawing a symbol needs no edit here.
//
// Subtracting the public set from OUR OWN exports is what keeps it quiet: a name Angular
// or PrimeNG owns is defined nowhere in `src/`, so it can never be flagged.
function privateSymbols() {
  const moduleFile = (fromFile, spec) => resolveLibSpecifier(fromFile, spec);

  // DECL_RE is line-anchored, so an `export` line inside a JSDoc example would read as a
  // live export — which in the public walk marks a private symbol public and lets a
  // mention of it through.
  const code = (file) =>
    readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  const NAMED_RE = /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'/g;
  // `export * as ns` publishes the module under a name the reader CAN import, so its
  // declarations are reachable.
  const STAR_RE =
    /export\s+\*\s+(?:as\s+([A-Za-z_][A-Za-z0-9_]*)\s+)?from\s*'([^']+)'/g;
  const DECL_RE =
    /^export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

  const publicNames = new Set();
  const seen = new Set();

  const walk = (file) => {
    if (!file || seen.has(file) || !existsSync(file)) return;
    seen.add(file);
    const source = code(file);

    for (const match of source.matchAll(NAMED_RE)) {
      for (const part of match[1].split(',')) {
        // `A as B` surfaces B. The per-entry `type` prefix has to come off too: a barrel
        // writes `export { C, type T }`, and keeping it records "type T" as the public
        // name, so T reads as private.
        const name = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)
          .pop()
          ?.trim();
        if (name) publicNames.add(name);
      }
    }
    for (const match of source.matchAll(STAR_RE)) {
      if (match[1]) publicNames.add(match[1]);
      const target = moduleFile(file, match[2]);
      walk(target);
      if (target) {
        for (const decl of code(target).matchAll(DECL_RE))
          publicNames.add(decl[1]);
      }
    }
  };

  // Unreachable — lib-entry-points refuses to load without the facade. Kept as a throw because an
  // empty set here disarms C010 and C013 and still reports OK.
  if (!existsSync(FACADE))
    throw new Error(`changelog-lint: ${FACADE} is missing.`);
  walk(FACADE);

  const ours = new Map();
  const crawl = (dir) => {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full);
      else if (item.name.endsWith('.ts') && !item.name.endsWith('.spec.ts')) {
        for (const decl of code(full).matchAll(DECL_RE)) {
          ours.set(decl[1], relative(ROOT, full).split('\\').join('/'));
        }
      }
    }
  };
  crawl(join(ROOT, 'src/lib'));

  const hidden = new Map();
  for (const [name, where] of ours) {
    // Short names are ordinary words far too often to accuse on sight.
    if (name.length >= 5 && !publicNames.has(name)) hidden.set(name, where);
  }

  return {
    private: hidden,
    publicCount: publicNames.size,
    known: new Set([...ours.keys(), ...publicNames]),
  };
}

const {
  private: PRIVATE_SYMBOLS,
  publicCount,
  known: KNOWN_SYMBOLS,
} = privateSymbols();

// A consumer has its own `lint` and `test`; only the repo-specific names are unreachable
// for the reader.
const GENERIC_SCRIPTS = new Set([
  'ng',
  'start',
  'dev',
  'watch',
  'build',
  'test',
  'lint',
  'format',
  'serve',
  'clean',
]);
const ourScripts = (() => {
  const json = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  return Object.keys(json.scripts ?? {}).filter(
    (name) => !GENERIC_SCRIPTS.has(name.split(':')[0]),
  );
})();

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
if (process.argv.includes('--list')) {
  for (const file of publishedFiles()) console.log(`document  ${file}`);
  for (const file of shippedSources().files) console.log(`source    ${file}`);
  for (const file of docsSiteSources().files) console.log(`docs-site ${file}`);
  process.exit(0);
}
// `resolve`, not `join`: an absolute argument has to work, so a staged copy of one release
// block can be checked before it is spliced back.
const shipped = shippedSources();
const sourceSet = new Set(shipped.files);
const docsSite = docsSiteSources();
const docsSiteSet = new Set(docsSite.files);
const targets = (
  requested.length
    ? requested
    : [...publishedFiles(), ...sourceSet, ...docsSiteSet]
).map((file) => {
  const full = resolve(ROOT, file);
  const label = relative(ROOT, full).split('\\').join('/');
  const shown = label.startsWith('..') ? full.split('\\').join('/') : label;

  return {
    full,
    label: shown,
    isSource: sourceSet.has(shown),
    isDocsSite: docsSiteSet.has(shown),
  };
});

// Both resolvers degrade quietly — `existsSync` filtering and `assets ?? []` — so a renamed
// path or ng-package key takes out one GROUP while the total stays high. Checked per group for
// that reason: an aggregate floor high enough to notice three files going missing would fail on
// every ordinary addition.
if (!requested.length) {
  const REQUIRED = [
    'CHANGELOG.md',
    'README.md',
    'design-system.md',
    'components.md',
  ];
  const missing = REQUIRED.filter((file) => !existsSync(join(ROOT, file)));
  const manifests = targets.filter((t) =>
    t.label.startsWith('migrations/'),
  ).length;
  const groups = [
    ...shipped.groups,
    ...docsSite.groups,
    { name: 'migrations/*.json', count: manifests },
  ];
  const empty = groups.filter((group) => group.count === 0);
  // "every group is non-empty" says nothing when there are no groups.
  const noGroups = shipped.assetsDeclared === 0 || groups.length < 2;
  if (missing.length || empty.length || noGroups) {
    console.error(
      'changelog-lint: the sweep has drifted from what actually ships —' +
        (missing.length ? ` cannot find ${missing.join(', ')};` : '') +
        (empty.length
          ? ` these resolved nothing: ${empty.map((g) => g.name).join(', ')};`
          : '') +
        (noGroups ? ' ng-package.json declares no asset inputs;' : '') +
        ` ${targets.length} target(s) in total.`,
    );
    process.exit(1);
  }
  process.on('exit', (code) => {
    if (code === 0) {
      console.log(
        `changelog-lint: by group — ${groups
          .map((g) => `${g.name} ${g.count}`)
          .join(', ')}`,
      );
    }
  });
}

const errors = [];
let current = { isSource: false, isDocsSite: false };
const report = (file, line, code, message) => {
  if (current.isSource && !SOURCE_RULES.has(code)) return;
  if (current.isDocsSite && !DOCS_SITE_RULES.has(code)) return;
  errors.push(`${file}:${line}  ${code}  ${message}`);
};

const quote = (text) => JSON.stringify(text.trim().slice(0, 90));

for (const { full, label: file, isSource, isDocsSite } of targets) {
  current = { isSource, isDocsSite };
  if (!existsSync(full)) {
    report(file, 0, 'C000', 'not found');
    continue;
  }
  // Either ending: `core.autocrlf` checks these out CRLF and stores them LF, so the
  // ending depends on the clone. A trailing CR defeats every pattern below that spans a
  // line break.
  const lines = readFileSync(full, 'utf8').split(/\r?\n/);

  // A manifest's locators are exempt from the private-symbol rule and from nothing else: a
  // consumer's finder greps their source for every string in `old` / `searchHints` /
  // `detect` / `find`, so being unimportable is beside the point there.
  //
  // Keyed on POSITION, not on the value: keying on the value would exempt the same string
  // in `informational`, which no finder greps. Positions also survive a manifest written
  // compactly by hand, where a whole item sits on one line.
  const locatorSpans = [];
  if (file.endsWith('.json')) {
    const LOCATOR_KEYS = new Set(['old', 'searchHints', 'detect', 'find']);
    const raw = lines.join('\n');
    let at = 0;
    const readString = (from) => {
      let index = from + 1;
      while (index < raw.length) {
        if (raw[index] === '\\') index += 2;
        else if (raw[index] === '"') return index + 1;
        else index += 1;
      }

      return raw.length;
    };
    while (at < raw.length) {
      if (raw[at] !== '"') {
        at += 1;
        continue;
      }
      const stringEnd = readString(at);
      let after = stringEnd;
      while (after < raw.length && /\s/.test(raw[after])) after += 1;
      if (raw[after] !== ':') {
        at = stringEnd;
        continue;
      }
      const key = raw.slice(at + 1, stringEnd - 1);
      let valueAt = after + 1;
      while (valueAt < raw.length && /\s/.test(raw[valueAt])) valueAt += 1;
      let valueEnd = valueAt;
      if (raw[valueAt] === '"') valueEnd = readString(valueAt);
      else if (raw[valueAt] === '[') {
        let depth = 0;
        while (valueEnd < raw.length) {
          if (raw[valueEnd] === '"') {
            valueEnd = readString(valueEnd);
            continue;
          }
          if (raw[valueEnd] === '[') depth += 1;
          if (raw[valueEnd] === ']') {
            depth -= 1;
            valueEnd += 1;
            if (!depth) break;
            continue;
          }
          valueEnd += 1;
        }
      } else {
        while (valueEnd < raw.length && !',}]'.includes(raw[valueEnd]))
          valueEnd += 1;
      }
      if (LOCATOR_KEYS.has(key)) locatorSpans.push([valueAt, valueEnd]);
      // Skip a string value whole, but DESCEND into an array or object: jumping to
      // `valueEnd` on `"items": [ … ]` skips every key nested inside it.
      at = raw[valueAt] === '"' ? valueEnd : valueAt + 1;
    }
  }

  // These files wrap at ~100 columns, so a two-word phrase splits across lines and a
  // line-by-line scan walks straight past `npm run\n  class-surface`.
  let flat = '';
  const lineAt = [];
  // The locator spans are measured on the unflattened text, so a flat match needs its raw
  // offset to be testable against them.
  const rawAt = [];
  let rawOffset = 0;
  lines.forEach((line, index) => {
    if (index) {
      flat += ' ';
      lineAt.push(index + 1);
      rawAt.push(rawOffset);
      rawOffset += 1;
    }
    const lead = index ? line.length - line.replace(/^\s+/, '').length : 0;
    const trimmed = index ? line.slice(lead) : line;
    rawOffset += lead;
    flat += trimmed;
    for (let i = 0; i < trimmed.length; i++) {
      lineAt.push(index + 1);
      rawAt.push(rawOffset + i);
    }
    rawOffset += trimmed.length;
  });

  const insideLocator = (flatIndex) => {
    const offset = rawAt[flatIndex];

    return locatorSpans.some(([from, to]) => offset >= from && offset < to);
  };

  const scanFlat = (pattern, code, describe, accept) => {
    for (const match of flat.matchAll(pattern)) {
      if (accept && !accept(match)) continue;
      const at = lineAt[match.index] ?? 0;
      report(
        file,
        at,
        code,
        `${describe(match)}: ${quote(lines[at - 1] ?? match[0])}`,
      );
    }
  };

  // The same client is written mm-broker, mm_broker and "mm broker", and the wrap can put
  // a break anywhere inside the phrase.
  const loose = (text) =>
    text
      .split(/[-_\s]+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('[-_\\s]+');

  for (const client of CLIENTS) {
    scanFlat(
      new RegExp(`\\b${loose(client)}\\b`, 'gi'),
      'C001',
      () => `names the consumer project "${client}" — say "a consumer" instead`,
    );
  }

  scanFlat(
    // `{0,3}` rather than `?`: a key wrapped as `MBP-\n  245` flattens to two separators.
    /\b(MBP|PIN|MM)[-_\s]{0,3}\d+\b/gi,
    'C002',
    (m) =>
      `cites the internal tracker key ${m[0]}, which the reader cannot open`,
  );

  for (const person of PEOPLE) {
    scanFlat(
      new RegExp(`\\b${loose(person)}\\b`, 'gi'),
      'C003',
      () => `names a person ("${person}") — the reader does not know them`,
    );
  }

  // CONTRIBUTING.md states the rule for any person, and a list only catches the names on
  // it. These two shapes are how a name actually reaches an entry.
  scanFlat(
    /\b(?:Found|Reported|Raised|Spotted|Noticed|Flagged|Requested)\s+by\s+[A-Z][a-z]{2,}\b/g,
    'C003',
    (m) => `credits a person ("${m[0]}") — write it without the name`,
  );
  scanFlat(
    /\bAsk\s+[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g,
    'C003',
    (m) => `names a person ("${m[0]}") the reader cannot find`,
  );

  for (const path of INTERNAL_PATHS) {
    const bare = path.replace(/\/$/, '');
    const pattern = bare
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\//g, '[\\\\/]');
    // Both separators, because a Windows author writes it the other way round. A single
    // directory name is a path only with its separator attached — bare "tools" and
    // "ds-docs" are ordinary words — while a multi-segment one needs none, which is what
    // catches `includePaths: ["src/lib"]`.
    const tail = bare.includes('/') ? '[\\\\/]?' : '[\\\\/]';
    scanFlat(
      new RegExp(`(?<![\\w-])${pattern}${tail}(?![\\w-])`, 'gi'),
      'C004',
      () => `points at "${path}", which is not in the published tree`,
    );
  }

  for (const script of ourScripts) {
    // bun is what CI actually runs here, so "npm run" alone would miss the real phrasing
    scanFlat(
      new RegExp(
        `(?:npm|bun|yarn|pnpm)\\s+run\\s+${script.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
        'gi',
      ),
      'C005',
      (m) => `tells the reader to run "${m[0]}", a script only this repo has`,
    );
  }

  // The lookbehinds keep the two innocent shapes out: an ISO date already carries its
  // year, and a page or version range is not a date at all.
  scanFlat(
    /(?<!\d{4}-)(?<!\b(?:pages?|lines?|rows?|items?|versions?|figures?|steps?)\s)\b(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/gi,
    'C006',
    (m) => `uses the ambiguous date "${m[0]}" — write it as YYYY-MM-DD`,
  );

  scanFlat(
    /\bM\d{3}\b/gi,
    'C007',
    (m) =>
      `cites the internal lint rule ${m[0]}, which is defined in tools/ and does not ship`,
  );

  // `(?<!#)` keeps an eight-digit #RRGGBBAA colour out — the theme partials are swept by
  // this rule and are full of hex — and the predicate demands at least one a-f, or every
  // seven-digit number in the prose reads as a commit.
  scanFlat(
    /(?<!#)\b[0-9a-f]{7,40}\b/gi,
    'C008',
    (m) =>
      `cites the commit ${m[0]} — the reader has no repository to look it up in`,
    (m) => /[a-f]/i.test(m[0]) && /^[0-9a-f]+$/i.test(m[0]),
  );

  scanFlat(
    /\bHEAD(?:~\d+|\^+)?\b/g,
    'C011',
    (m) =>
      `cites "${m[0]}" — the reader has no repository to resolve it against`,
  );

  for (const phrase of INSIDER_PROSE) {
    scanFlat(
      new RegExp(`\\b${loose(phrase)}\\b`, 'gi'),
      'C009',
      () =>
        `uses insider phrasing "${phrase}" — describe the change, not our process`,
    );
  }

  // C013 — a name that resolves to nothing at all. C010 walks the symbols that exist and are
  // not exported, so it cannot see one that was never declared: `DsListCursor` reached
  // `## Unreleased` described as exported, and the module declares `DsListCursorList` and three
  // functions. Only our own `Ds*` prefix is resolved — Angular and TypeScript names are all
  // over this prose and are not ours to account for.
  //
  // A REMOVED symbol resolves to nothing either, and naming it is the whole point of the entry
  // announcing its removal — so the same window C010 uses applies here. Keep it tight: a
  // misspelling that happens to sit near the word takes the exemption with it.
  scanFlat(
    /`(Ds[A-Z][A-Za-z0-9_]+)`/g,
    'C013',
    (m) =>
      `names \`${m[1]}\`, which this library does not declare — check the spelling, or name the symbol that exists`,
    (m) =>
      !KNOWN_SYMBOLS.has(m[1]) &&
      !/\bremoved\b|\bdeleted\b|\bno longer (?:declared|exported|exists)\b/i.test(
        flat.slice(Math.max(0, m.index - 70), m.index + m[0].length + 70),
      ),
  );

  // C014 — an entry whose SUBJECT is our own bookkeeping. The ban on decision archaeology reads
  // as a rule about prose inside an entry, and three releases in a row still shipped a whole
  // entry announcing that we had corrected a manifest. A consumer executes these files; that we
  // repaired one is not a change to their code.
  // The phrase list catches the wordings that actually shipped and nothing else: measured, one
  // of seven natural rewrites of the same forbidden content. So the SUBJECT is tested too — a
  // released version, one of our record words, and a repair verb in one entry. Measured at zero
  // hits across all 547 published entries, so it costs nothing and cannot be walked around by
  // rephrasing.
  // Only a file that carries release blocks: the rule is about a release ENTRY whose subject is
  // our bookkeeping, and `migrations/README.md` documents `deleteList` in those very words on
  // purpose. Testing for the block rather than for the filename keeps the rule reachable from
  // the selftest fixture, which is not called CHANGELOG.md.
  if (lines.some((line) => /^## (Unreleased|\d+\.\d+\.\d+)/.test(line))) {
    const RECORD_WORD =
      /\b(manifests?|changelog|migration notes?|release notes?)\b/i;
    const RELEASED = /\b\d+\.\d+\.\d+\b/;
    const REPAIR =
      /\b(correct(?:ed|s)?|fix(?:ed|es)?|incomplete|missing|rewritten|now lists|filled in|amended)\b/i;
    for (let i = 0; i < lines.length; i++) {
      if (!/^- \*\*/.test(lines[i])) continue;
      let j = i + 1;
      while (j < lines.length && !/^(- |### |## )/.test(lines[j])) j++;
      const body = lines.slice(i, j).join(' ');
      if (RECORD_WORD.test(body) && RELEASED.test(body) && REPAIR.test(body))
        report(
          file,
          i + 1,
          'C014',
          `reports our own record-keeping — correct the file so it reads as though it were always right, and say nothing: ${quote(lines[i])}`,
        );
      i = j - 1;
    }
  }

  for (const phrase of OUR_RECORD) {
    scanFlat(
      new RegExp(loose(phrase), 'gi'),
      'C014',
      () =>
        `reports our own record-keeping ("${phrase}") — correct the file so it reads as though it were always right, and say nothing`,
    );
  }

  for (const [name, where] of PRIVATE_SYMBOLS) {
    scanFlat(
      new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
      'C010',
      () =>
        `names \`${name}\`, which ${where} exports but the package root does not — say it is internal, or describe it without the name`,
      // Naming an internal base is fine where the text says so — a subclasser meets these
      // names in their own compiler errors. Do not widen the window: "internal" appears 27
      // times in the changelog, so a loose one silences a real hit lines away.
      (m) =>
        !insideLocator(m.index) &&
        !/\binternal\b|\bnot exported\b|\bprivate\b|\bunexported\b/i.test(
          flat.slice(Math.max(0, m.index - 60), m.index + name.length + 60),
        ),
    );
  }

  // C012 — section order. Only for a file that actually looks like a changelog, so the rule
  // stays silent on a digest or a manifest that happens to carry `###` headings.
  if (lines.some((line) => /^## (Unreleased|\d+\.\d+\.\d+)/.test(line))) {
    let release = null;
    let seen = [];
    const checkOrder = () => {
      // A repeat ranks EQUAL, so the order test below cannot see it. Keyed on the HEADING and
      // not the slot, because 0.9.0 deliberately splits its breaking half into
      // `(breaking, behaviour)` and `(breaking, visual)` — two names, one slot, both wanted.
      const bySlot = new Map();
      for (const [heading, , line] of seen) {
        if (bySlot.has(heading)) {
          report(
            file,
            line,
            'C012',
            `in ${release}, "### ${heading}" opens a section already opened at line ` +
              `${bySlot.get(heading)} — one list per section, or a reader cannot tell what the split means`,
          );
          break;
        }
        bySlot.set(heading, line);
      }
      for (let i = 1; i < seen.length; i++) {
        if (seen[i][1] < seen[i - 1][1]) {
          report(
            file,
            seen[i][2],
            'C012',
            `in ${release}, "### ${seen[i][0]}" comes after "### ${seen[i - 1][0]}" — the order is ` +
              SECTION_ORDER,
          );
          break;
        }
      }
    };
    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        if (release) checkOrder();
        release = line.slice(3).split(' — ')[0].trim();
        seen = [];

        return;
      }
      if (!release || !line.startsWith('### ')) return;
      const heading = line.slice(4).trim();
      const slot = sectionSlot(heading);
      if (slot === undefined) {
        report(
          file,
          index + 1,
          'C012',
          `unknown section "### ${heading}" in ${release}`,
        );

        return;
      }
      seen.push([heading, slot, index + 1]);
    });
    if (release) checkOrder();
  }
}

for (const line of errors) console.error(`changelog-lint: ERROR  ${line}`);

if (errors.length) {
  console.error(`changelog-lint: FAILED — ${errors.length} error(s)`);
  process.exit(1);
}

console.log(
  `changelog-lint: ${targets.length} published artefact(s) OK ` +
    `(${publicCount} public symbols resolved, ${PRIVATE_SYMBOLS.size} internal ones guarded)`,
);
