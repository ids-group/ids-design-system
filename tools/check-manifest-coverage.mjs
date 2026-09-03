#!/usr/bin/env node
// A release block that documents a change to existing public surface, and a manifest that never
// names that surface. The reader takes the manifest's silence for "safe", so a dropped entry is
// not a gap in bookkeeping — it is a wrong answer to "does this release touch me". Six entries
// shipped that way across 0.11.3 and 0.11.4 and passed all five other gates.
//
// The rule is deliberately narrow, because a gate that can only be satisfied by filler produces
// filler, and `informational` lines written to make a check green dilute the ones that matter:
//
//   * `### Added` is EXEMPT. A component or token that did not exist cannot break an existing
//     consumer, so a manifest that stays silent about it says the true thing. Left in, this alone
//     flagged 35 historical announcements — the whole of the noise.
//   * A hook counts only if it is REAL — a token, tag or symbol resolved from the library tree,
//     never from the prose. That is what keeps `Enter`, `ACTION`, `README`, `Router` and a `ds-x`
//     written as a placeholder out, with no stopword list to maintain.
//   * An entry that names no public hook is never flagged. Purely visual or internal work needs
//     no line, and is not asked for one.
//
// So the minimum way to pass is to NAME the hook, which is the part worth having: a consumer
// grepping the manifest for `--layer-toast` then finds the line and learns there is nothing to do.
// Prose alone does not satisfy it.
//
//   node tools/check-manifest-coverage.mjs              # the version being cut
//   node tools/check-manifest-coverage.mjs --audit      # every published block, reports only
//   node tools/check-manifest-coverage.mjs 0.11.4       # one published block
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
      else if (/\.(ts|scss)$/.test(item.name) && !item.name.endsWith('.spec.ts')) found.push(full);
    }
  };
  crawl(join(ROOT, 'src/lib'));
  return found;
}

// One pass over the library for the three shapes a changelog entry can name.
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
      for (const decl of source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(DECL_RE))
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
      if (HOOKS.tokens.has(piece) || HOOKS.tags.has(piece) || HOOKS.symbols.has(piece))
        found.add(piece);
    }
  }
  return found;
};

const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8').replace(/\r\n/g, '\n');
const lines = changelog.split('\n');

function blocks() {
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const released = /^## (\d+\.\d+\.\d+)(?: — |$)/.exec(lines[i]);
    const unreleased = /^## Unreleased\s*$/.exec(lines[i]);
    if (released) found.push({ version: released[1], start: i });
    else if (unreleased) found.push({ version: 'unreleased', start: i });
  }
  for (let b = 0; b < found.length; b++)
    found[b].end = b + 1 < found.length ? found[b + 1].start : lines.length;
  return found;
}

// A headline entry is a `- **` line plus its continuations, carrying the `###` it sits under.
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

function manifestFor(version) {
  const path =
    version === 'unreleased'
      ? join(ROOT, 'migrations/unreleased.json')
      : join(ROOT, `migrations/${version}.json`);
  return existsSync(path) ? { path, text: readFileSync(path, 'utf8') } : null;
}

function check(block) {
  const manifest = manifestFor(block.version);
  const entries = entriesOf(block).filter((entry) => entry.section !== 'Added');
  const gaps = [];

  for (const entry of entries) {
    const hooks = hooksIn(entry.body);
    if (!hooks.size) continue;
    // A missing manifest is only a gap once something in the block actually needs one; that
    // keeps a cycle with no actionable work from being told to create an empty file.
    const mentioned = manifest ? [...hooks].filter((hook) => manifest.text.includes(hook)) : [];
    if (!mentioned.length) gaps.push({ ...entry, hooks: [...hooks] });
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
  console.error(`check-manifest-coverage: no \`## ${ONLY}\` block in CHANGELOG.md.`);
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
  console.error(`\n${label}: ${gaps.length} documented change(s) ${where} never names.`);
  for (const gap of gaps) {
    console.error(`  CHANGELOG.md:${gap.line}  [${gap.section}] ${gap.headline.slice(0, 88)}`);
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
