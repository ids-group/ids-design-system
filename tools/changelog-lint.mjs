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

// Kept in step with tools/build-schematics.mjs, which is what actually copies
// these into dist/ds. `AUTHORING.md` and `unreleased.json` are excluded there and
// so are excluded here; `unreleased.json` is linted anyway because it BECOMES a
// published manifest at the next release, and finding a leak after publishing is
// finding it too late.
function publishedFiles() {
  const files = ['CHANGELOG.md', 'README.md', 'design-system.md', 'components.md'];
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
      else if (keep(item.name)) found.push(relative(ROOT, full).split('\\').join('/'));
    }
  };
  crawl(join(ROOT, 'src/lib/styles'), (n) => n.endsWith('.scss'));
  crawl(join(ROOT, 'src/lib/themes'), (n) => n.endsWith('.scss'));
  crawl(join(ROOT, 'src/lib'), (n) => n.endsWith('.ts') && !n.endsWith('.spec.ts'));

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
  // Descriptive stand-ins are the same disclosure with the name filed off, and they
  // are what survived the first sweep: "the field app", "the ports".
  'the field app',
  'the ports',
  'admin port',
  'the portals',
];

// Paths that exist only in this repo. The published tree has `styles/`, `themes/`
// and `migrations/` at its root and nothing else, so those three are NOT here.
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
    for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) {
      if (existsSync(candidate)) return candidate;
    }

    return null;
  };

  const NAMED_RE = /export\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'([^']+)'/g;
  const STAR_RE = /export\s+\*\s+from\s*'([^']+)'/g;
  const DECL_RE =
    /^export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

  const publicNames = new Set();
  const seen = new Set();

  const walk = (file) => {
    if (!file || seen.has(file) || !existsSync(file)) return;
    seen.add(file);
    const source = readFileSync(file, 'utf8');

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
      const target = moduleFile(file, match[1]);
      walk(target);
      if (target) {
        for (const decl of readFileSync(target, 'utf8').matchAll(DECL_RE)) {
          publicNames.add(decl[1]);
        }
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
        for (const decl of readFileSync(full, 'utf8').matchAll(DECL_RE)) {
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

const ourScripts = (() => {
  const json = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
  return Object.keys(json.scripts ?? {});
})();

const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
if (process.argv.includes('--list')) {
  for (const file of publishedFiles()) console.log(file);
  process.exit(0);
}
// An absolute argument is honoured so a staged copy of one release block can be
// checked before it is spliced back; `join(ROOT, file)` here silently reported
// "not found" for those.
const sourceSet = new Set(shippedSources());
const targets = (requested.length ? requested : [...publishedFiles(), ...sourceSet]).map(
  (file) => {
    const full = resolve(ROOT, file);
    const label = relative(ROOT, full).split('\\').join('/');
    const shown = label.startsWith('..') ? full.split('\\').join('/') : label;

    return { full, label: shown, isSource: sourceSet.has(shown) };
  },
);

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
  // Split on either ending: these files are committed CRLF, and a trailing \r left on
  // every line defeats any pattern that spans a line break — which is most of the
  // multi-word ones below.
  const lines = readFileSync(full, 'utf8').split(/\r?\n/);

  // These files wrap at ~100 columns, so a two-word phrase splits across lines and a
  // line-by-line scan walks straight past it — `npm run\n  class-surface` sat in the
  // changelog through the first pass of this very check. Flatten the file into one
  // string, keeping a line number for every character, and match the multi-word rules
  // against that instead.
  let flat = '';
  const lineAt = [];
  const flatStart = [];
  lines.forEach((line, index) => {
    if (index) {
      flat += ' ';
      lineAt.push(index + 1);
    }
    flatStart[index] = flat.length;
    const trimmed = index ? line.replace(/^\s+/, '') : line;
    flat += trimmed;
    for (let i = 0; i < trimmed.length; i++) lineAt.push(index + 1);
  });

  const scanFlat = (pattern, code, describe) => {
    for (const match of flat.matchAll(pattern)) {
      report(file, lineAt[match.index] ?? 0, code, describe(match));
    }
  };

  for (const script of ourScripts) {
    scanFlat(
      new RegExp(`npm run ${script.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'),
      'C005',
      () => `tells the reader to run "npm run ${script}", a script only this repo has`,
    );
  }

  for (const phrase of INSIDER_PROSE) {
    scanFlat(
      new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
      'C009',
      () => `uses insider phrasing "${phrase}" — describe the change, not our process`,
    );
  }

  lines.forEach((line, index) => {
    const at = index + 1;

    for (const client of CLIENTS) {
      if (new RegExp(`\\b${client}\\b`, 'i').test(line)) {
        report(file, at, 'C001', `names the consumer project "${client}" — say "a consumer" instead: ${quote(line)}`);
      }
    }

    const ticket = line.match(/\b(MBP|PIN|MM)-\d+\b/);
    if (ticket) {
      report(file, at, 'C002', `cites the internal tracker key ${ticket[0]}, which the reader cannot open: ${quote(line)}`);
    }

    for (const person of PEOPLE) {
      if (new RegExp(`\\b${person}\\b`).test(line)) {
        report(file, at, 'C003', `names a person ("${person}") — the reader does not know them: ${quote(line)}`);
      }
    }

    for (const path of INTERNAL_PATHS) {
      if (line.includes(path)) {
        report(file, at, 'C004', `points at "${path}", which is not in the published tree: ${quote(line)}`);
      }
    }

    // A bare MM-DD reads as a date to us and as nothing to anyone else. An ISO
    // date is already MM-DD preceded by the year, so exclude that.
    const loose = line.match(/(?<!\d{4}-)\b(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/);
    if (loose) {
      report(file, at, 'C006', `uses the ambiguous date "${loose[0]}" — write it as YYYY-MM-DD: ${quote(line)}`);
    }

    const ruleId = line.match(/\bM0\d{2}\b/);
    if (ruleId) {
      report(file, at, 'C007', `cites the internal lint rule ${ruleId[0]}, which is defined in tools/ and does not ship: ${quote(line)}`);
    }

    const sha = line.match(/`[0-9a-f]{7,40}`/);
    if (sha && /^[0-9a-f]+$/.test(sha[0].slice(1, -1))) {
      report(file, at, 'C008', `cites the commit ${sha[0]} — the reader has no repository to look it up in: ${quote(line)}`);
    }

    for (const [name, where] of PRIVATE_SYMBOLS) {
      if (!new RegExp(`\\b${name}\\b`).test(line)) continue;
      // Naming an internal base IS useful where a subclasser meets it in their own
      // compiler error — but only if the text says it is internal, so nobody tries to
      // import it. Look around the mention rather than at the line, since the
      // qualification is usually a sentence away.
      // From THIS line's own offset, not the name's first appearance anywhere: a name
      // used nineteen times would otherwise be judged by whatever sits around its
      // first mention, and two entries that do say "internal" were flagged that way.
      const found = flat.indexOf(name, flatStart[index]);
      const around = found === -1 ? line : flat.slice(Math.max(0, found - 400), found + 400);
      if (/\binternal\b|\bnot exported\b|\bprivate\b/i.test(around)) continue;
      report(
        file,
        at,
        'C010',
        `names \`${name}\`, which ${where} exports but the package root does not — say it is internal, or describe it without the name: ${quote(line)}`,
      );
    }
  });
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
