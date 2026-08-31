//
// Every text artefact that SHIPS, checked for things an external reader cannot use.
//
// It exists because a deck path sat in the published changelog for weeks. The
// changelog is public twice over — `build-schematics.mjs` copies it into
// `dist/ds/`, `publishConfig.access` is `public`, and the docs site renders it —
// so a client's name in it is read by every other client, and a `tools/` path is
// an instruction nobody outside this repo can follow.
//
// Prose review never caught it, for a structural reason: the changelog-writing
// agent is told to study the previous release for voice, so last release's leak
// becomes next release's template. That is a loop a human reviewer cannot break
// by being careful, which is why it is a gate.
//
// Rules are about REACHABILITY, not spelling: can the reader open the thing we
// named, and is it about them rather than about us.
//
// Usage:
//   node tools/changelog-lint.mjs                 every published artefact
//   node tools/changelog-lint.mjs CHANGELOG.md …  specific files
//   node tools/changelog-lint.mjs --list          what counts as published
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Kept in step with tools/build-schematics.mjs, which copies the changelog, the two
// digests and `migrations/` into dist/ds; `README.md` and `LICENSE` arrive via ng-packagr
// instead, because the `ds` project's root is the repo root. `AUTHORING.md` is excluded
// from the tarball and from here. `unreleased.json` is excluded from the tarball but
// linted anyway, because it BECOMES a published manifest at the next release and finding
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
      if (entry.name === 'AUTHORING.md') continue;
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
// copied VERBATIM as assets, so every comment in them is published text; and a `.ts`
// comment survives into the FESM bundle and its JSDoc into the single `.d.ts`. A
// component's own `.scss` is the exception — its comments are compiled away, which is
// why `*.component.scss` is not swept here.
//
// Only the rules that cannot misfire on code run over these: a file that declares
// `DsFieldBase` mentions it on every other line, so the private-symbol and
// script-name rules stay off.
// C006 is left OFF here on purpose: an SVG path (`M21 13a9 9 0 0 1-12-12 …`) reads as
// an ambiguous date, and a date in code was never the risk the rule was for.
const SOURCE_RULES = new Set(['C001', 'C002', 'C003', 'C004', 'C008', 'C009']);

function shippedSources() {
  const found = [];
  const crawl = (dir, keep) => {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full, keep);
      else if (keep(item.name))
        found.push(relative(ROOT, full).split('\\').join('/'));
    }
  };
  // The asset inputs come from ng-package.json rather than a hardcoded list, because the
  // two drifted: its glob is `**/*`, so `src/lib/themes/README.md` — 115 lines of real
  // prose — ships on every publish and no rule had ever opened it.
  const ngPackage = join(ROOT, 'ng-package.json');
  const assets = existsSync(ngPackage)
    ? (JSON.parse(readFileSync(ngPackage, 'utf8')).assets ?? [])
    : [];
  const TEXT = /\.(scss|css|md|json|txt)$/;
  for (const asset of assets) {
    if (asset.input) crawl(join(ROOT, asset.input), (n) => TEXT.test(n));
  }
  crawl(
    join(ROOT, 'src/lib'),
    (n) => n.endsWith('.ts') && !n.endsWith('.spec.ts'),
  );

  return found;
}

// Consumer projects and clients. A published artefact is read by ALL of them, so
// naming one to the others is a confidentiality problem, not a style one.
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
  // The brand this sweep removed from `themes/README.md` by hand. `loose()` reaches
  // manage-my, manage_my and "manage my"; `brand-mm` needs its own entry because C002
  // wants digits after MM.
  'manage my',
  'brand-mm',
  // Descriptive stand-ins are the same disclosure with the name filed off, and they
  // are what survived the first sweep: "the field app", "the ports".
  'the field app',
  'the ports',
  'admin port',
  'the portals',
];

// Paths that exist only in this repo. The published tree has `styles/`, `themes/`,
// `migrations/` and `schematics/` at its root, plus the four root documents, so none of
// those are here.
const INTERNAL_PATHS = [
  'src/lib/',
  'src/public-api',
  'tools/',
  'presentations/',
  'ds-docs/',
  'infrastructure/',
  '.claude/',
  'docs/todo.md',
  'docs/done.md',
  'docs/superpowers',
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

const PEOPLE = ['Stas', 'Misha'];

// Symbols we export from a module but never surface at the package root. Naming one
// tells a reader to reach for something `import { … } from '@ids-group-ltd/…'` cannot
// give them. Resolved from the export graph rather than listed, because a list would
// go stale the first time a symbol is promoted or withdrawn.
//
// Subtracting the public set from OUR OWN exports is what keeps this quiet: a name
// Angular or PrimeNG owns (`ControlValueAccessor`, `OutputEmitterRef`) is defined
// nowhere in `src/`, so it can never be flagged.
function privateSymbols() {
  const moduleFile = (fromFile, spec) => {
    const base = resolve(dirname(fromFile), spec);
    for (const candidate of [
      `${base}.ts`,
      `${base}.d.ts`,
      join(base, 'index.ts'),
    ]) {
      if (existsSync(candidate)) return candidate;
    }

    return null;
  };

  // A block comment can hold a line that starts with `export`, and DECL_RE is
  // line-anchored, so an example in a JSDoc would be read as a live export. In the
  // public walk that is the dangerous direction: it would mark a genuinely private
  // symbol public and let a mention of it through.
  const code = (file) =>
    readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

  const NAMED_RE = /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'/g;
  // `export * as ns from '…'` publishes the whole module under a name the reader CAN
  // import, so its declarations are reachable and must not be accused.
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
        // `A as B` surfaces B; a bare `A` surfaces A. The per-entry `type` prefix has
        // to come off too — barrels here write `export { C, type T } from …`, and
        // leaving it on records "type T" as the public name, so T reads as private.
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

  const entry = join(ROOT, 'src/public-api.ts');
  if (!existsSync(entry)) return { private: new Set(), publicCount: 0 };
  walk(entry);

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

  return { private: hidden, publicCount: publicNames.size };
}

const { private: PRIVATE_SYMBOLS, publicCount } = privateSymbols();

// Every consumer has `npm run lint` and `npm run build`; only the repo-specific names are
// unreachable for the reader. Flagging the generic ones taught an author that this gate's
// errors are noise, which is how a real instruction gets deleted next time.
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
  // Both groups: the shipped sources ARE published text, and listing only the documents
  // made `themes/README.md` look unchecked to anyone auditing coverage this way.
  for (const file of publishedFiles()) console.log(`document  ${file}`);
  for (const file of shippedSources()) console.log(`source    ${file}`);
  process.exit(0);
}
// An absolute argument is honoured so a staged copy of one release block can be
// checked before it is spliced back; `join(ROOT, file)` here silently reported
// "not found" for those.
const sourceSet = new Set(shippedSources());
const targets = (
  requested.length ? requested : [...publishedFiles(), ...sourceSet]
).map((file) => {
  const full = resolve(ROOT, file);
  const label = relative(ROOT, full).split('\\').join('/');
  const shown = label.startsWith('..') ? full.split('\\').join('/') : label;

  return { full, label: shown, isSource: sourceSet.has(shown) };
});

// Both resolvers degrade quietly: `publishedFiles()` filters on existsSync and
// `shippedSources()` reads `assets ?? []` from ng-package.json. Rename either and the sweep
// shrinks toward nothing while still reporting OK, so the count is asserted rather than
// trusted. The floor is well under the current 304 — it catches a collapse, not drift.
if (!requested.length) {
  const REQUIRED = [
    'CHANGELOG.md',
    'README.md',
    'design-system.md',
    'components.md',
  ];
  const missing = REQUIRED.filter((file) => !existsSync(join(ROOT, file)));
  if (missing.length || targets.length < 100) {
    console.error(
      `changelog-lint: resolved only ${targets.length} target(s)` +
        (missing.length ? ` and could not find ${missing.join(', ')}` : '') +
        ' — publishedFiles()/shippedSources() has drifted from what actually ships.',
    );
    process.exit(1);
  }
}

const errors = [];
let current = { isSource: false };
const report = (file, line, code, message) => {
  if (current.isSource && !SOURCE_RULES.has(code)) return;
  errors.push(`${file}:${line}  ${code}  ${message}`);
};

const quote = (text) => JSON.stringify(text.trim().slice(0, 90));

for (const { full, label: file, isSource } of targets) {
  current = { isSource };
  if (!existsSync(full)) {
    report(file, 0, 'C000', 'not found');
    continue;
  }
  // Split on either ending: the tree mixes them, and a trailing CR left on every line
  // defeats any pattern that spans a line break — which is most of the multi-word ones
  // below. The historic miss (`npm run` + a break + `class-surface`) was the LINE-BY-LINE
  // scan, not a stray CR; the flattening below is what fixes it.
  const lines = readFileSync(full, 'utf8').split(/\r?\n/);

  // A manifest's locators are exempt from the private-symbol rule only: a consumer's finder
  // greps their source for every string in `old` / `searchHints` / `detect` / `find`, so being
  // unimportable is beside the point. Every other rule still applies inside them.
  //
  // Keyed on POSITION, not on the string's value: pooling the values exempted the same string
  // wherever else it appeared — `informational` carrying a bare `DsMessageBase` was exempt too,
  // and `informational` has no `find` for a finder to run. Positions also survive a manifest
  // written compactly by hand, where a whole item sits on one line.
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
      // `valueEnd` on `"items": [ … ]` skipped every nested key in the file, which is
      // why this found four keys and no locators at all.
      at = raw[valueAt] === '"' ? valueEnd : valueAt + 1;
    }
  }

  // These files wrap at ~100 columns, so a two-word phrase splits across lines and a
  // line-by-line scan walks straight past it — `npm run\n  class-surface` sat in the
  // changelog through the first pass of this very check. Flatten the file into one
  // string, keeping a line number for every character, and match the multi-word rules
  // against that instead.
  let flat = '';
  const lineAt = [];
  // The raw offset behind every flat character, so a match can be tested against the
  // locator spans, which are measured on the unflattened text.
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

  // A token is matched with `[-_\s]` between its words and case-insensitively: the same
  // client is written mm-broker, mm_broker and "mm broker", and the wrap can put a
  // newline anywhere inside the phrase.
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
    // `{0,3}` rather than `?`: a key wrapped as `MBP-\n  245` flattens to two
    // separators, and one optional separator walks past it.
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

  // A name list only catches the names on it, and CONTRIBUTING.md states the rule for
  // any person. These two shapes are how a name actually reaches an entry.
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
    // Both separators, because a Windows author writes it the other way round. And a
    // single directory name is a path only with its separator attached — bare "tools"
    // and "ds-docs" are ordinary words — while a multi-segment one is unmistakable
    // without it, which is what catches `includePaths: ["src/lib"]`.
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

  // The predicate demands at least one a-f, or every seven-digit number in the prose
  // reads as a commit.
  scanFlat(
    // `(?<!#)` so an eight-digit #RRGGBBAA colour is not reported as a commit — the theme
    // partials are swept by this rule and are full of hex.
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

  for (const [name, where] of PRIVATE_SYMBOLS) {
    scanFlat(
      new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
      'C010',
      () =>
        `names \`${name}\`, which ${where} exports but the package root does not — say it is internal, or describe it without the name`,
      // Naming an internal base is fine where the text says so — a subclasser meets these
      // names in their own compiler errors. The window is TIGHT on purpose: at ±400 one
      // unrelated "internal" eight lines away disarmed the rule, and the changelog has 27
      // of them, so about a tenth of the file had this check silently off.
      (m) =>
        !insideLocator(m.index) &&
        !/\binternal\b|\bnot exported\b|\bprivate\b|\bunexported\b/i.test(
          flat.slice(Math.max(0, m.index - 60), m.index + name.length + 60),
        ),
    );
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
