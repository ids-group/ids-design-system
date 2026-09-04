#!/usr/bin/env node
// A release block that documents a change to existing public surface, and a manifest that never
// names that surface. The reader takes the manifest's silence for "safe", so a dropped entry is
// not a gap in bookkeeping — it is a wrong answer to "does this release touch me". Six entries
// shipped that way across 0.11.3 and 0.11.4 and every other gate passed them.
//
// The rule is narrow because a gate that can be satisfied by filler gets filler, and the only way
// to pass is to NAME the hook — which is the part worth having, since that is what a consumer
// greps for. Prose does not satisfy it. What is exempt:
//
//   * `### Added` is EXEMPT. A component or token that did not exist cannot break an existing
//     consumer, so a manifest that stays silent about it says the true thing. Left in, this alone
//     flagged 35 historical announcements — the whole of the noise.
//   * A hook counts only if it is REAL — a token, tag or symbol resolved from the library tree,
//     never from the prose. That is what keeps `Enter`, `ACTION`, `README`, `Router` and a `ds-x`
//     written as a placeholder out, with no stopword list to maintain.
//   * An entry naming no public hook at all — purely visual or internal work needs no line.
//   * A token the cycle INTRODUCED must be named by itself, because that is the one a consumer
//     greps for and finds nothing; one mention of an unrelated tag no longer answers for it. A
//     token that already existed at the boundary is exempt — the row ring reads `--space-1-5`,
//     and a line about it is filler pointing at a knob that is not the supported one.
//   * An entry that SAYS FOR ITSELF that nothing changed for the consumer is exempt. What is being
//     caught is DISAGREEMENT between the two records, and a block saying "nothing to do on your
//     side" agrees with a silent manifest. Measured at about 2% of published non-Added entries, so
//     it is not a habitual escape hatch; a wrong one is a defect in the changelog.
//
//   node tools/check-manifest-coverage.mjs              # the version being cut
//   node tools/check-manifest-coverage.mjs --audit      # every published block, reports only
//   node tools/check-manifest-coverage.mjs 0.11.4       # one published block
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT = process.argv.includes('--audit');
const ONLY = process.argv.slice(2).find((arg) => /^\d+\.\d+\.\d+$/.test(arg));

function libraryFiles() {
  const found = [];
  const crawl = (dir) => {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, item.name);
      if (item.isDirectory()) crawl(full);
      else if (
        /\.(ts|scss)$/.test(item.name) &&
        !item.name.endsWith('.spec.ts')
      )
        found.push(full);
    }
  };
  crawl(join(ROOT, 'src/lib'));
  return found;
}

function realHooks() {
  const tokens = new Set();
  const tags = new Set();
  const symbols = new Set();
  const DECL_RE =
    /^export\s+(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function|enum)\s+([A-Za-z_][A-Za-z0-9_]*)/gm;

  for (const file of libraryFiles()) {
    const source = readFileSync(file, 'utf8');
    // A trailing hyphen means the name was cut off an interpolation (`--accent-#{$family}`), so
    // it is a prefix and not a token anyone can declare or read.
    for (const match of source.matchAll(/--[a-z][a-z0-9-]*/g))
      if (!match[0].endsWith('-')) tokens.add(match[0]);
    for (const match of source.matchAll(/selector:\s*'([^']+)'/g)) {
      for (const part of match[1].split(',')) {
        const tag = /^\s*(ds-[a-z][a-z0-9-]*)\s*$/.exec(part);
        if (tag) tags.add(tag[1]);
      }
    }
    if (file.endsWith('.ts')) {
      for (const decl of source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .matchAll(DECL_RE))
        symbols.add(decl[1]);
    }
  }
  return { tokens, tags, symbols };
}

const HOOKS = realHooks();

// The house style backticks every identifier, so the backtick is the extraction boundary.
const hooksIn = (body) => {
  const found = new Set();
  for (const span of body.matchAll(/`([^`]+)`/g)) {
    for (const piece of span[1].split(/[^A-Za-z0-9_-]+/)) {
      if (
        HOOKS.tokens.has(piece) ||
        HOOKS.tags.has(piece) ||
        HOOKS.symbols.has(piece)
      )
        found.add(piece);
    }
  }
  return found;
};

const SAYS_NOTHING_CHANGED = [
  /\bnothing in the package\b/i,
  /\bno API,? no behaviour\b/i,
  /\bnothing to do on your side\b/i,
  /\bnothing changes for you\b/i,
  /\bnothing to change\b/i,
];

const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8').replace(
  /\r\n/g,
  '\n',
);
const lines = changelog.split('\n');

function blocks() {
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const released = /^## (\d+\.\d+\.\d+)(?: — |$)/.exec(lines[i]);
    const unreleased = /^## Unreleased\s*$/.exec(lines[i]);
    if (released) found.push({ version: released[1], start: i });
    else if (unreleased) found.push({ version: 'unreleased', start: i });
    else if (/^## /.test(lines[i])) {
      // Not a skip: an unrecognised heading merges its entries into the block ABOVE it, so they
      // are checked against the previous version's manifest and pass for the wrong reason.
      console.error(
        `check-manifest-coverage: CHANGELOG.md line ${i + 1} is a \`## \` heading this check ` +
          `cannot read: ${JSON.stringify(lines[i])}. Expected \`## Unreleased\` or ` +
          '`## <x.y.z> — <date>` with an em dash.',
      );
      process.exit(1);
    }
  }
  for (let b = 0; b < found.length; b++)
    found[b].end = b + 1 < found.length ? found[b + 1].start : lines.length;
  return found;
}

function entriesOf(block) {
  const found = [];
  let section = '';
  for (let i = block.start; i < block.end; i++) {
    const heading = /^### (.+)$/.exec(lines[i]);
    if (heading) section = heading[1].trim();
    if (/^- \*\*/.test(lines[i])) {
      let j = i + 1;
      while (j < block.end && !/^(- |### |## )/.test(lines[j])) j++;
      found.push({
        section,
        line: i + 1,
        headline: lines[i].replace(/^- /, ''),
        body: lines.slice(i, j).join('\n'),
      });
      i = j - 1;
    }
  }
  return found;
}

// A family-wide rename is filed as one item with a placeholder — `--ds-*-bg` → `--ds-*-bg-color`,
// `--<role>-subtle` → `--<role>-subtitle` — which is the right way to file it: enumerating every
// member would be worse. A literal substring test cannot see through it, so placeholders are
// matched as patterns.
function patternsIn(text) {
  const patterns = [];
  for (const match of text.matchAll(
    /--[a-z0-9-]*(?:\*|<[a-z]+>)[a-z0-9*<>-]*/gi,
  )) {
    const source = match[0]
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/<[a-z]+>/gi, '[a-z0-9-]+')
      .replace(/\*/g, '[a-z0-9-]*');
    patterns.push(new RegExp(`^${source}$`));
  }
  return patterns;
}

// The tokens the library already had at the boundary this block describes. A token present there
// is not what this block introduced, whatever the entry says about it.
const TAGS = (() => {
  try {
    return execFileSync('git', ['-C', ROOT, 'tag', '--list', 'v*'], {
      encoding: 'utf8',
    })
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .sort((a, b) =>
        a
          .slice(1)
          .localeCompare(b.slice(1), undefined, { numeric: true }),
      );
  } catch {
    return [];
  }
})();

function boundaryTag(version) {
  if (!TAGS.length) return null;
  if (version === 'unreleased') return TAGS.at(-1);
  const at = TAGS.indexOf(`v${version}`);
  return at > 0 ? TAGS[at - 1] : null;
}

const tokenCache = new Map();

function tokensAt(tag) {
  // No tag to read means nothing is known to pre-exist, so every token reads as introduced. That
  // is the noisy direction rather than the silent one, which is the right way round for a gate.
  if (!tag) return new Set();
  if (tokenCache.has(tag)) return tokenCache.get(tag);
  const found = new Set();
  try {
    const out = execFileSync(
      'git',
      ['-C', ROOT, 'grep', '-oh', '-e', '--[a-z][a-z0-9-]*', tag, '--', 'src/lib'],
      { encoding: 'utf8', maxBuffer: 1 << 28 },
    );
    for (const match of out.matchAll(/--[a-z][a-z0-9-]*/g))
      if (!match[0].endsWith('-')) found.add(match[0]);
  } catch {
    // `git grep` exits 1 when it matches nothing, which for a real tag means the tree is not
    // there to read; an empty set then makes every token read as introduced, as above.
  }
  tokenCache.set(tag, found);
  return found;
}

function manifestFor(version) {
  const path =
    version === 'unreleased'
      ? join(ROOT, 'migrations/unreleased.json')
      : join(ROOT, `migrations/${version}.json`);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  const patterns = patternsIn(text);
  return {
    path,
    names: (hook) =>
      text.includes(hook) || patterns.some((pattern) => pattern.test(hook)),
  };
}

function check(block) {
  const manifest = manifestFor(block.version);
  const tokensBefore = tokensAt(boundaryTag(block.version));
  const entries = entriesOf(block).filter((entry) => entry.section !== 'Added');
  const gaps = [];

  for (const entry of entries) {
    if (SAYS_NOTHING_CHANGED.some((phrase) => phrase.test(entry.body)))
      continue;
    const hooks = hooksIn(entry.body);
    if (!hooks.size) continue;
    // A missing manifest is only a gap once something in the block actually needs one; that
    // keeps a cycle with no actionable work from being told to create an empty file.
    const mentioned = manifest
      ? [...hooks].filter((hook) => manifest.names(hook))
      : [];
    // One mention covering the whole entry lets an UNRELATED item carry it: an entry naming
    // `ds-table` and a new token passed because some other item mentioned `ds-table`. A token
    // the cycle INTRODUCED answers for itself, because that is the one a consumer greps for and
    // finds nothing. A token that already existed does not: the row ring reads `--space-1-5`,
    // and a line about it would be filler pointing at a knob that is not the supported one.
    // Requiring every hook regardless was measured and rejected — 55 flags, nearly all filler.
    const introduced = [...hooks].filter(
      (hook) => hook.startsWith('--') && !tokensBefore.has(hook),
    );
    if (
      !mentioned.length ||
      (introduced.length && !introduced.every((hook) => manifest?.names(hook)))
    )
      gaps.push({ ...entry, hooks: [...hooks] });
  }
  return { manifest, entries, gaps };
}

const all = blocks();
const chosen = ONLY
  ? all.filter((block) => block.version === ONLY)
  : AUDIT
    ? all
    : all.filter((block) => block.version === 'unreleased');

if (ONLY && !chosen.length) {
  console.error(
    `check-manifest-coverage: no \`## ${ONLY}\` block in CHANGELOG.md.`,
  );
  process.exit(1);
}

let failures = 0;
for (const block of chosen) {
  const { manifest, entries, gaps } = check(block);
  const label = block.version === 'unreleased' ? 'Unreleased' : block.version;

  if (!gaps.length) {
    if (!AUDIT)
      console.log(
        `check-manifest-coverage: ${label} — ${entries.length} entr(ies) outside Added, ` +
          `every one that names public surface is covered by ` +
          `${manifest ? relative(ROOT, manifest.path).split('\\').join('/') : 'no manifest (none needed)'}.`,
      );
    continue;
  }

  failures += gaps.length;
  const where = manifest
    ? relative(ROOT, manifest.path).split('\\').join('/')
    : `migrations/${block.version}.json (does not exist)`;
  console.error(
    `\n${label}: ${gaps.length} documented change(s) ${where} never names.`,
  );
  for (const gap of gaps) {
    console.error(
      `  CHANGELOG.md:${gap.line}  [${gap.section}] ${gap.headline.slice(0, 88)}`,
    );
    console.error(`      names: ${gap.hooks.join(', ')}`);
  }
}

if (AUDIT) {
  console.log(
    `\ncheck-manifest-coverage --audit: ${failures} documented change(s) unnamed across ` +
      `${chosen.length} block(s). Advisory only — a published manifest gets corrected in place, ` +
      `and an entry that needs no line should not be given one.`,
  );
  process.exit(0);
}

if (failures) {
  console.error(
    `\ncheck-manifest-coverage: name the surface in the manifest — an item if a consumer must ` +
      `edit code, an \`informational\` line otherwise. Silence reads as "this release does not ` +
      `touch you".`,
  );
  process.exit(1);
}
