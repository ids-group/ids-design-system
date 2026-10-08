#!/usr/bin/env node
// A sentence that asserts an outcome nobody measured cannot ship. Three kinds of outcome are read
// as claims, sentence by sentence, in every prose field of a manifest item (`action`,
// `appliesWhen`, `pitfall`, `note`, `verify`, `restore`) and in every `informational` text:
//
//   * sameness    - "renders identically", "no visual change", "looks the same", and "unchanged"
//                   unless the sentence is about a name, a type or a signature
//   * compile     - "compiles", "a compile error", "fails the build", "source-compatible",
//                   "type-checks", a TS/NG code. Not in `verify`, which IS the build check to run.
//   * count       - a numeral or a spelled number (three..twenty) counting names of things:
//                   "41 public tokens", "all three pickers". A CSS value, a version, a TS code and
//                   a number inside backticks are not counts. A count followed in its own sentence
//                   by exactly that many code spans is exempt: the list beside it is the check.
//                   Two is exempt: in published prose it was the anaphoric pair ("the two
//                   pickers") far more often than a tally.
//
// A claim passes when its item or object-form informational entry carries `evidence`, an array
// of `commit:<sha>` (inside the boundary the manifest describes), `fixture:<path>` (a file under
// migrations/fixtures/), `pixels:<docs block id>`, `tokens:<token name>` or `command:<shell
// command>`. Each entry's shape is checked, and the referent of `commit:` and `fixture:`.
//
// CHANGELOG prose cannot carry evidence. A `## Unreleased` entry whose sentence fires a rule
// passes only when an evidence-carrying entry of `migrations/unreleased.json` fires the same rule
// and names one of the CHANGELOG entry's code spans (a whole token, three characters or more);
// otherwise the author is told to back it there.
//
// A published sentence verified by hand against its tags is recorded in
// tools/manifest-claims-verified.json, which does not ship: version, file, location (`<item id>
// <field>`, `informational[<n>] text`, or the lead of the CHANGELOG entry) and a hash of the
// sentence with whitespace collapsed. `--audit` lists only the hits no entry matches, so an edited
// sentence is listed again, and reports every entry that matches no published hit, so the ledger
// cannot keep a sentence that is gone.
//
//   node tools/check-manifest-claims.mjs           # unreleased.json and ## Unreleased, fails on a hit
//   node tools/check-manifest-claims.mjs --audit   # every published manifest and block, reports only
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { previousBoundary, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest reads private copies and never writes a tracked file.
const MIGRATIONS = process.env.DS_MIGRATIONS_DIR || join(ROOT, 'migrations');
const CHANGELOG = process.env.DS_CHANGELOG_PATH || join(ROOT, 'CHANGELOG.md');
const FIXTURES = join(MIGRATIONS, 'fixtures');
const LEDGER =
  process.env.DS_CLAIMS_LEDGER_PATH ||
  join(ROOT, 'tools', 'manifest-claims-verified.json');
const AUDIT = process.argv.includes('--audit');

const unknownArgument = process.argv.slice(2).find((arg) => arg !== '--audit');
if (unknownArgument) {
  console.error(
    `check-manifest-claims: "${unknownArgument}" is not \`--audit\`.`,
  );
  process.exit(1);
}

const ITEM_PROSE = [
  'action',
  'appliesWhen',
  'pitfall',
  'note',
  'verify',
  'restore',
];

const SPELLED =
  'two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty';
// Names of things a reader could count in the library. Measured against published history: an
// open "number + any plural" matched "three ways", "two traps", "500 ms", "two lines" and "two
// stops" as often as it matched a count of API names.
const COUNTED_NOUNS =
  'tokens|components|pickers|controls|charts|fields|inputs|outputs|hooks|classes|members|names|symbols|keyframes|selectors|properties|types|interfaces|directives|helpers|methods|exports|identifiers|families|variants|presets|items|entries|elements|files|stylesheets|partials|modes|roles|tones|bindings|resolvers|primitives|declarations|subpaths|suffixes|spellings|services|events|attributes|values|states|options|rules|icons|signals|overlays|aliases';
const COUNT = new RegExp(
  `(?<![\\w.\\-~])(\\d+|${SPELLED})\\s+(?:[a-z-]+\\s+){0,2}?(?:${COUNTED_NOUNS})\\b`,
  'gi',
);
const SPELLED_VALUE = Object.fromEntries(
  SPELLED.split('|').map((word, index) => [word, index + 2]),
);
const ABOUT_NAMES =
  /\b(signatures?|types?|typed|names?|spelled|spelling|exported|exports?|imports?|selectors?|interfaces?|declared|class names)\b/i;

const RULES = {
  sameness: {
    why: 'asserts that rendering or behaviour did not change',
    test: (sentence) =>
      /\b(?<!(?:near|character)-|\ban? )(identical(ly)?|no visual change|zero visual change|looks? the same|nothing changes visually)\b/i.test(
        sentence,
      ) ||
      (/(?<!\ban? )\bunchanged\b/i.test(sentence) &&
        !ABOUT_NAMES.test(sentence)),
  },
  compile: {
    why: 'asserts a compile outcome',
    skipFields: new Set(['verify']),
    test: (sentence) =>
      /\b(compiles|compile errors?|does not compile|fails the build|build errors?|source-compatible|type-checks)\b|\b(TS|NG)\d{4}\b/i.test(
        sentence,
      ),
  },
  count: {
    why: 'asserts a count of things',
    test: (sentence) => {
      const masked = sentence.replace(/`[^`]*`/g, '`x`');
      for (const match of masked.matchAll(COUNT)) {
        const counted = /^\d+$/.test(match[1])
          ? Number(match[1])
          : SPELLED_VALUE[match[1].toLowerCase()];
        const spansAfter = (masked.slice(match.index).match(/`x`/g) ?? [])
          .length;
        if (counted >= 3 && spansAfter !== counted) return true;
      }
      return false;
    },
  },
};

export const sentenceHash = (sentence) =>
  createHash('sha256')
    .update(sentence.replace(/\s+/g, ' ').trim())
    .digest('hex')
    .slice(0, 16);
const ledgerKey = ({ version, file, location, hash }) =>
  [version, file, location, hash].join('\n');

const sentencesOf = (text) =>
  String(text ?? '')
    .split(/(?<=[.!?;]\**)\s+|\n+/)
    .filter((sentence) => sentence.trim());

function claimsIn(text, field) {
  const found = [];
  for (const sentence of sentencesOf(text))
    for (const [rule, { test, skipFields }] of Object.entries(RULES))
      if (!skipFields?.has(field) && test(sentence))
        found.push({ rule, sentence: sentence.trim() });
  return found;
}

const git = (args) =>
  execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
const isAncestor = (commit, tag) => {
  try {
    git(['merge-base', '--is-ancestor', commit, tag]);
    return true;
  } catch {
    return false;
  }
};

const TAGS = releaseTags(ROOT);

// `[from, to]`: the tag before the boundary and the ref at its end. `from` is null for the first
// release, which has no earlier tag to exclude.
function boundaryOf(name) {
  if (name === 'unreleased') return [TAGS.at(-1) ?? null, 'HEAD'];
  if (!TAGS.includes(`v${name}`)) return null;
  return [previousBoundary(TAGS, name), `v${name}`];
}

function evidenceProblems(evidence, boundary) {
  if (evidence === undefined) return [];
  if (!Array.isArray(evidence) || !evidence.length)
    return ['`evidence` must be a non-empty array of strings'];
  const problems = [];
  for (const entry of evidence) {
    const shape = /^(commit|fixture|pixels|tokens|command):(.+)$/s.exec(
      typeof entry === 'string' ? entry.trim() : '',
    );
    if (!shape) {
      problems.push(
        `evidence ${JSON.stringify(entry)} is not commit:, fixture:, pixels:, tokens: or command:`,
      );
      continue;
    }
    const [, kind, value] = shape;
    if (kind === 'commit') {
      let commit;
      try {
        commit = git(['rev-parse', '--verify', '--quiet', `${value}^{commit}`]);
      } catch {
        problems.push(`evidence ${entry}: no such commit`);
        continue;
      }
      if (!boundary) {
        problems.push(
          `evidence ${entry}: this manifest has no tag to bound the commit`,
        );
        continue;
      }
      const [from, to] = boundary;
      if (!isAncestor(commit, to) || (from && isAncestor(commit, from)))
        problems.push(
          `evidence ${entry}: not inside ${from ?? '<root>'}..${to}, the boundary this manifest describes`,
        );
    } else if (kind === 'fixture') {
      // A leading `migrations/fixtures/` is accepted, so the path can be copied from the repository root.
      const path = resolve(
        FIXTURES,
        value.replace(/^migrations\/fixtures\//, ''),
      );
      if (
        !path.startsWith(FIXTURES + sep) ||
        !existsSync(path) ||
        !statSync(path).isFile()
      )
        problems.push(
          `evidence ${entry}: no such file under migrations/fixtures/`,
        );
    }
  }
  return problems;
}

// One record per thing that can carry evidence: an item, or an informational entry.
function entriesOf(manifest) {
  const records = [];
  for (const item of manifest.items ?? [])
    records.push({
      label: item.id ?? '<no id>',
      evidence: item.evidence,
      fields: ITEM_PROSE.filter((field) => typeof item[field] === 'string').map(
        (field) => [field, item[field]],
      ),
      names: [
        item.old,
        item.new,
        ...(item.searchHints ?? []),
        ...(item.detect ?? []),
      ]
        .filter((name) => typeof name === 'string')
        .join('\n'),
    });
  (manifest.informational ?? []).forEach((entry, index) => {
    const isObject = entry && typeof entry === 'object';
    records.push({
      label: `informational[${index}]`,
      evidence: isObject ? entry.evidence : undefined,
      fields: [['text', isObject ? entry.text : entry]],
      names: '',
    });
  });
  return records;
}

function checkManifest(name) {
  const path = join(MIGRATIONS, `${name}.json`);
  // Named as in the repository even when DS_MIGRATIONS_DIR points elsewhere, so a ledger entry matches.
  const where = `migrations/${name}.json`;
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  const boundary = boundaryOf(name);
  const hits = [];
  const backed = [];
  for (const record of entriesOf(manifest)) {
    for (const problem of evidenceProblems(record.evidence, boundary))
      hits.push({
        where,
        version: name,
        location: `${record.label} evidence`,
        label: record.label,
        field: 'evidence',
        rule: 'evidence',
        text: problem,
      });
    const hasEvidence =
      Array.isArray(record.evidence) && record.evidence.length > 0;
    for (const [field, text] of record.fields) {
      for (const claim of claimsIn(text, field)) {
        if (hasEvidence)
          backed.push({ rule: claim.rule, text: `${text}\n${record.names}` });
        else
          hits.push({
            where,
            version: name,
            location: `${record.label} ${field}`,
            label: record.label,
            field,
            rule: claim.rule,
            text: claim.sentence,
          });
      }
    }
  }
  return { hits, backed };
}

// `## <version>` blocks, each a list of entries: a bullet with its continuation lines, a loose
// paragraph, or a table row. Fenced code is skipped.
function changelogBlocks() {
  const lines = readFileSync(CHANGELOG, 'utf8')
    .replace(/\r\n/g, '\n')
    .split('\n');
  const blocks = [];
  let block = null;
  let entry = null;
  let fenced = false;
  const close = () => {
    if (entry && block) block.entries.push(entry);
    entry = null;
  };
  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      fenced = !fenced;
      close();
      return;
    }
    if (fenced) return;
    const heading = /^## (Unreleased|\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)\b/.exec(
      line,
    );
    if (heading) {
      close();
      block = {
        version: heading[1] === 'Unreleased' ? 'unreleased' : heading[1],
        entries: [],
      };
      blocks.push(block);
      return;
    }
    if (!line.trim() || /^#/.test(line)) return close();
    if (/^- |^\s*\|/.test(line) || !entry) {
      close();
      entry = { line: index + 1, text: line.trim() };
      if (/^\s*\|/.test(line)) close();
      return;
    }
    entry.text += ` ${line.trim()}`;
  });
  close();
  return blocks;
}

// A span names the backing entry only as a whole token of at least three characters: `x` or
// `rob` sits inside nearly any evidence-carrying text.
const namesSpan = (text, span) =>
  span.length >= 3 &&
  new RegExp(
    String.raw`(?<![\w-])` +
      span.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) +
      String.raw`(?![\w-])`,
  ).test(text);

function checkChangelogBlock(block, backed) {
  const hits = [];
  for (const entry of block.entries) {
    const spans = [...entry.text.matchAll(/`([^`]+)`/g)].map(
      (match) => match[1],
    );
    for (const claim of claimsIn(entry.text)) {
      const isBacked = backed.some(
        (record) =>
          record.rule === claim.rule &&
          spans.some((span) => namesSpan(record.text, span)),
      );
      if (!isBacked)
        hits.push({
          where: 'CHANGELOG.md',
          version: block.version,
          // Line numbers move with every release, the lead of the entry does not.
          location: sentencesOf(entry.text)[0].trim().slice(0, 80),
          label: `line ${entry.line}`,
          field: block.version === 'unreleased' ? 'Unreleased' : block.version,
          rule: claim.rule,
          text: claim.sentence,
        });
    }
  }
  return hits;
}

const format = (hit) =>
  `    ${hit.where}  ${hit.label}  ${hit.field}: ${hit.text.length > 220 ? `${hit.text.slice(0, 220)}...` : hit.text}`;

export function publishedHits() {
  const manifests = readdirSync(MIGRATIONS)
    .filter((file) => file.endsWith('.json') && file !== 'unreleased.json')
    .map((file) => file.replace(/\.json$/, ''));
  const hits = manifests.flatMap((name) => checkManifest(name).hits);
  // Released blocks are judged as they stand: their manifests carry no evidence to back a sentence.
  for (const block of changelogBlocks())
    if (block.version !== 'unreleased')
      hits.push(...checkChangelogBlock(block, []));
  for (const hit of hits) hit.hash = sentenceHash(hit.text);
  return hits;
}

function audit() {
  const ledger = existsSync(LEDGER)
    ? JSON.parse(readFileSync(LEDGER, 'utf8'))
    : [];
  const verifiedKeys = new Set(ledger.map(ledgerKey));
  const hits = publishedHits();
  const hitKeys = new Set(
    hits.map((hit) => ledgerKey({ ...hit, file: hit.where })),
  );
  const unverified = hits.filter(
    (hit) => !verifiedKeys.has(ledgerKey({ ...hit, file: hit.where })),
  );
  const stale = ledger.filter((entry) => !hitKeys.has(ledgerKey(entry)));

  const byVersion = new Map();
  for (const hit of unverified) {
    if (!byVersion.has(hit.version)) byVersion.set(hit.version, []);
    byVersion.get(hit.version).push(hit);
  }
  const totals = {};
  const versions = [...byVersion.keys()].sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true }),
  );
  for (const version of versions) {
    const ofVersion = byVersion.get(version);
    console.log(`\n${version}  (${ofVersion.length})`);
    for (const rule of [...Object.keys(RULES), 'evidence']) {
      const ofRule = ofVersion.filter((hit) => hit.rule === rule);
      if (!ofRule.length) continue;
      totals[rule] = (totals[rule] ?? 0) + ofRule.length;
      console.log(
        `  ${rule} - ${RULES[rule]?.why ?? 'evidence that does not resolve'} (${ofRule.length})`,
      );
      for (const hit of ofRule) console.log(format(hit));
    }
  }
  if (stale.length) {
    console.log(
      `\nstale - a ledger entry that matches no published hit (${stale.length})`,
    );
    for (const entry of stale)
      console.log(
        `    ${entry.version}  ${entry.file}  ${entry.location}  ${entry.hash}: ${entry.sentence ?? ''}`,
      );
  }
  console.log(
    `\ncheck-manifest-claims --audit: ${unverified.length} unverified claim(s) across ${versions.length} version(s) - ` +
      `${
        Object.entries(totals)
          .map(([rule, count]) => `${rule} ${count}`)
          .join(', ') || 'none'
      }; ${hits.length - unverified.length} verified in ${relative(ROOT, LEDGER).split(sep).join('/')}; ` +
      `${stale.length} stale ledger entr(ies). ` +
      'Advisory only: each hit is verified by hand before a published line changes.',
  );
}

function strict() {
  const hasDraft = existsSync(join(MIGRATIONS, 'unreleased.json'));
  const { hits, backed } = hasDraft
    ? checkManifest('unreleased')
    : { hits: [], backed: [] };
  const unreleased = changelogBlocks().find(
    (block) => block.version === 'unreleased',
  );
  const changelogHits = unreleased
    ? checkChangelogBlock(unreleased, backed)
    : [];

  for (const hit of hits)
    console.error(
      `${hit.where}  ${hit.label}  ${hit.field}  [${hit.rule}] ${RULES[hit.rule]?.why ?? ''}\n    ${hit.text}`,
    );
  for (const hit of changelogHits)
    console.error(
      `CHANGELOG.md  ${hit.label}  [${hit.rule}] ${RULES[hit.rule].why}\n    ${hit.text}`,
    );

  if (hits.length || changelogHits.length) {
    console.error(
      `\ncheck-manifest-claims: ${hits.length + changelogHits.length} unmeasured claim(s). Measure it and ` +
        'add `evidence` to the manifest item or informational entry that makes the claim - commit:, ' +
        'fixture:, pixels:, tokens: or command: (migrations/README.md). A CHANGELOG sentence is backed ' +
        'by an evidence-carrying entry of migrations/unreleased.json that makes the same claim and ' +
        'names one of its code spans. Or drop the claim.',
    );
    process.exit(1);
  }
  console.log(
    `check-manifest-claims: ${hasDraft ? 'migrations/unreleased.json' : 'no unreleased.json'} and ` +
      `${unreleased ? `${unreleased.entries.length} ## Unreleased entr(ies)` : 'no ## Unreleased block'} ` +
      'make no unmeasured claim.',
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  if (AUDIT) audit();
  else strict();
}
