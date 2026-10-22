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
import { fileURLToPath, pathToFileURL } from 'node:url';
import { surfaceAt } from './check-manifest-truth.mjs';
import { cachedAtTag } from './tag-cache.mjs';
import { previousBoundary, releaseTags } from './release-tags.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT = process.argv.includes('--audit');
const ONLY = process.argv
  .slice(2)
  .find((arg) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/.test(arg));

// An argument nobody recognises used to be dropped, so `v0.11.4`, `0.11` and a mistyped
// `--audti` each reported on Unreleased and exited 0 — an answer to a question that was not asked.
const unknownArgument = process.argv
  .slice(2)
  .find(
    (arg) =>
      arg !== '--audit' && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/.test(arg),
  );
if (unknownArgument) {
  console.error(
    `check-manifest-coverage: "${unknownArgument}" is neither \`--audit\` nor an <x.y.z> version.`,
  );
  process.exit(1);
}

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
  // Nothing resolvable means `src/lib` was not read, and every entry then holds "no public
  // hook" and is skipped — a green that says "every one is covered" having looked at nothing.
  // The sibling tool has had this guard from the start; this one exited 0.
  // Each half separately, not all three together. A library always has all three, so an empty one
  // means that reader stopped working — and the surface the boundary tag supplies would hide it:
  // only what this cycle INTRODUCED comes from the working tree, so a gutted scan goes unnoticed
  // until the release that adds a tag or a symbol.
  const empty = [
    ['token', tokens],
    ['tag', tags],
    ['symbol', symbols],
  ]
    .filter(([, set]) => !set.size)
    .map(([what]) => what);
  if (empty.length) {
    console.error(
      `check-manifest-coverage: not one ${empty.join(' or ')} could be read from ` +
        `${join(ROOT, 'src/lib')}. An entry naming that kind of surface would be skipped, which ` +
        'is not the same as its being covered.',
    );
    process.exit(1);
  }
  return { tokens, tags, symbols };
}

// A published block describes its own boundary, so its hooks resolve against the tree AT that
// tag — the rule `migrations/AUTHORING.md` states for every claim about a past release. Reading
// the working tree instead made `0.3.0` answer for `--ds-modal-title-text-color`, a name that
// arrived in the same release the block was renaming things INTO. `## Unreleased` is the one
// block HEAD really describes, so it alone reads the working tree.
const hookCache = new Map();
const substituted = [];

const asHooks = (surface) => ({
  tokens: surface.tokens,
  tags: new Set(surface.elements.keys()),
  symbols: surface.symbols,
});

const union = (a, b) => ({
  tokens: new Set([...a.tokens, ...b.tokens]),
  tags: new Set([...a.tags, ...b.tags]),
  symbols: new Set([...a.symbols, ...b.symbols]),
});

function hooksAt(version) {
  if (hookCache.has(version)) return hookCache.get(version);
  // BOTH sides of the boundary. A release describes a two-sided event and the surface was
  // one-sided, so anything the cycle REMOVED resolved to nothing, the entry was skipped, and no
  // manifest line was ever asked for — the one category a consumer most needs one for. Twenty
  // published entries name a hook that vanished in their own release; the authors spelled it in
  // the manifest by hand every time, and the gate never enforced it.
  const after =
    version === 'unreleased'
      ? realHooks()
      : (surfaceAt(`v${version}`) ?? null) && asHooks(surfaceAt(`v${version}`));
  const previous = boundaryTag(version);
  const beforeSurface = previous ? surfaceAt(previous) : null;
  // Falling back to the working tree for a PUBLISHED block is the anachronism this function
  // exists to remove, so it cannot happen quietly: without the tag the verdict is about today's
  // tree, not that release's.
  if (!after && version !== 'unreleased')
    substituted.push(`${version} (no readable tree at v${version})`);
  const hooks = after
    ? beforeSurface
      ? union(after, asHooks(beforeSurface))
      : after
    : realHooks();
  hookCache.set(version, hooks);
  return hooks;
}

// The house style backticks every identifier, so the backtick is the extraction boundary.
const hooksIn = (body, HOOKS) => {
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

// The selftest points this at a temporary copy so it never edits the tracked file. It used to
// write its fixtures into CHANGELOG.md and restore afterwards, which two sessions sharing the
// checkout corrupt: one backs up what the other has already mutated, and the fixture is what gets
// restored. That leaves a stretch of red with no bad commit behind it.
const changelog = readFileSync(
  process.env.DS_CHANGELOG_PATH || join(ROOT, 'CHANGELOG.md'),
  'utf8',
).replace(/\r\n/g, '\n');
const lines = changelog.split('\n');

function blocks() {
  const found = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    // A fenced sample containing a version-shaped heading used to open a phantom block, which
    // truncated the real one at that line and left every entry below it unchecked.
    if (/^\s*```/.test(lines[i])) fenced = !fenced;
    if (fenced) continue;
    const released = /^## (\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)(?: — |$)/.exec(
      lines[i],
    );
    const unreleased = /^## Unreleased\s*$/.exec(lines[i]);
    if (released) found.push({ version: released[1], start: i });
    else if (unreleased) found.push({ version: 'unreleased', start: i });
    // `##0.13.0` and an indented `  ## 0.13.0` are invisible to a `^## ` test, so they merged
    // their entries into the block above and were judged against the wrong manifest.
    else if (/^\s*##(?!#)\s*\S/.test(lines[i])) {
      // Not a skip: an unrecognised heading merges its entries into the block ABOVE it, so they
      // are checked against the previous version's manifest and pass for the wrong reason.
      console.error(
        `check-manifest-coverage: CHANGELOG.md line ${i + 1} is a \`## \` heading this check ` +
          `cannot read: ${JSON.stringify(lines[i])}. Expected \`## Unreleased\` or ` +
          '`## <x.y.z> — <date>` (or `<x.y.z-beta.n>`) with an em dash.',
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
export function patternsIn(text) {
  const patterns = [];
  for (const match of text.matchAll(
    /--[a-z0-9-]*(?:\*|<[a-z]+>)[a-z0-9*<>-]*/gi,
  )) {
    // A bare `--ds-*` names nothing — it covers all 836 tokens in the namespace, and naming the
    // surface is the whole requirement. It reaches this function from PROSE: eight published
    // manifests say "not a `--ds-*` component hook" in a note, and each one was answering for
    // every token in the library. A real placeholder keeps a literal segment of its own.
    // Judged by BREADTH, not by segment count. `--status-*` and `--bp-*` name a family and are
    // legitimate placeholders; `--ds-*` names the library's whole namespace — 836 tokens — which
    // is not naming anything. Dropping the first segment unconditionally refused seven honest
    // family forms alongside it, `--status-<lifecycle>-*` among them.
    const literal = match[0]
      .replace(/^--/, '')
      .split('-')
      .filter((part) => part && !/[*<>]/.test(part));
    if (!literal.length || (literal.length === 1 && literal[0] === 'ds'))
      continue;
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
const TAGS = releaseTags(ROOT);

function boundaryTag(version) {
  if (!TAGS.length) return null;
  if (version === 'unreleased') return TAGS.at(-1);
  return previousBoundary(TAGS, version);
}

const tokenCache = new Map();

function tokensAt(tag) {
  // No tag to read means nothing is known to pre-exist, so every token reads as introduced. That
  // is the noisy direction rather than the silent one, which is the right way round for a gate.
  if (!tag) return new Set();
  if (tokenCache.has(tag)) return tokenCache.get(tag);
  const found =
    cachedAtTag(tag, [grepTokens.toString()], () => grepTokens(tag)) ??
    new Set();
  tokenCache.set(tag, found);
  return found;
}

function grepTokens(tag) {
  try {
    const out = execFileSync(
      'git',
      [
        '-C',
        ROOT,
        'grep',
        '-oh',
        '-e',
        '--[a-z][a-z0-9-]*',
        tag,
        '--',
        'src/lib',
      ],
      { encoding: 'utf8', maxBuffer: 1 << 28 },
    );
    const found = new Set();
    for (const match of out.matchAll(/--[a-z][a-z0-9-]*/g))
      if (!match[0].endsWith('-')) found.add(match[0]);
    return found;
  } catch {
    // `git grep` exits 1 when it matches nothing, which for a real tag means the tree is not
    // there to read; an empty set then makes every token read as introduced, as above. Returning
    // null keeps that answer out of the disk cache.
    return null;
  }
}

function manifestFor(version) {
  // Overridable for the same reason as the changelog: a selftest that owns both inputs can assert
  // the word boundary itself, instead of hoping the current cycle happens to document a name that
  // contains a shorter one.
  const migrations = process.env.DS_MIGRATIONS_DIR || join(ROOT, 'migrations');
  const path =
    version === 'unreleased'
      ? join(migrations, 'unreleased.json')
      : join(migrations, `${version}.json`);
  if (!existsSync(path)) return null;
  const text = readFileSync(path, 'utf8');
  const patterns = patternsIn(text);
  return {
    path,
    // Boundaried, never a substring: `ds-accordion-item` in the manifest would otherwise answer
    // for an entry about `ds-accordion`, and `--ds-toast-border-color` for `--ds-toast-border`.
    // String.raw, never a plain template: there `\w` is not an escape and degrades to the letter
    // `w`, leaving a boundary class of `w` and `-`. The hyphen alone still separated
    // `ds-accordion` from `ds-accordion-item`, so the case this was written for passed while
    // `ds-tab` went on matching inside `ds-table`, and `SelectOption` inside `MultiSelectOption`.
    names: (hook) =>
      new RegExp(
        String.raw`(?<![\w-])` +
          hook.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) +
          String.raw`(?![\w-])`,
      ).test(text) || patterns.some((pattern) => pattern.test(hook)),
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
    const hooks = hooksIn(entry.body, hooksAt(block.version));
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

// Guarded so importing `patternsIn` does not run the whole check: module top-level code runs
// on import, and the selftest needs the placeholder rule without a sweep.
function main() {
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

  if (substituted.length) {
    console.error(
      `check-manifest-coverage: ${substituted.length} published block(s) were judged against the ` +
        `WORKING TREE because their own tag could not be read — the verdict is about today, not ` +
        `about that release:\n  ${substituted.join('\n  ')}`,
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
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
