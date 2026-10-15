#!/usr/bin/env node
// Generates the agent-facing catalogue: agent/INDEX.md plus one leaf per entry,
// split out of components.md.
//
//   node tools/split-agent-catalogue.mjs          # regenerate
//   node tools/split-agent-catalogue.mjs --check   # fail if the tree is out of date
//
// Why: components.md is one 60 KB file behind six headings, so an agent answering
// "how do I use ds-input" loads the whole catalogue. The leaves let it load the index
// (a few KB) and one entry (a few hundred bytes). components.md stays the single place
// a human edits — everything here is derived, so the two cannot drift.
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(repo, 'components.md');
const OUT = join(repo, 'agent');
const check = process.argv.includes('--check');

const source = readFileSync(SOURCE, 'utf8').replace(/\r\n/g, '\n');

/** Entries in order, each carrying the `###` group that preceded it. */
function parseBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let section = null;
  let group = null;
  let current = null;

  for (const line of lines) {
    const h2 = /^## (.+)$/.exec(line);
    const h3 = /^### (.+)$/.exec(line);
    const h4 = /^#### (.+)$/.exec(line);
    if (h2) {
      if (current) blocks.push(current);
      current = null;
      section = h2[1].trim();
      group = null;
      continue;
    }
    if (h3) {
      if (current) blocks.push(current);
      current = null;
      group = h3[1].trim();
      continue;
    }
    if (h4) {
      if (current) blocks.push(current);
      current = { section, group, heading: h4[1].trim(), body: [] };
      continue;
    }
    if (current) current.body.push(line);
  }
  if (current) blocks.push(current);
  return blocks;
}

/** The leaf's file name. The tag is used only when the heading STARTS with it: an
 *  overview heading names several tags ('The picker family - <ds-select>, ...') and
 *  would otherwise collide with the entry for the first one. */
function slugOf(heading) {
  const tag = /^`?<(ds-[a-z0-9-]+)>/.exec(heading);
  if (tag) return tag[1];
  const directive = /^`?\[(ds[A-Za-z]+)\]/.exec(heading);
  if (directive)
    return directive[1].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
  const token = /`([A-Za-z_][\w]*)`/.exec(heading);
  if (token) {
    const name = token[1];
    // SCREAMING_SNAKE first: a per-character camel split turns DS_CONFIG into
    // `d-s_-c-o-n-f-i-g`, which is what it did until this was noticed.
    return /^[A-Z0-9_]+$/.test(name)
      ? name.toLowerCase().replace(/_/g, '-')
      : name.replace(
          /[A-Z]/g,
          (c, index) => (index ? '-' : '') + c.toLowerCase(),
        );
  }
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const GROUP_DIR = {
  'Form & input': 'forms',
  'Display & feedback': 'feedback',
  'Layout & navigation': 'navigation',
  Surfaces: 'surfaces',
  Overlay: 'overlays',
  Tables: 'tables',
  Charts: 'charts',
  Domain: 'domain',
};

const blocks = parseBlocks(source).filter((block) => block.heading);
const leaves = blocks.map((block) => {
  const slug = slugOf(block.heading);
  const dir =
    GROUP_DIR[block.group] ??
    (block.section === 'Components' ? 'other' : 'platform');
  return {
    ...block,
    slug,
    path: `${dir}/${slug}.md`,
    body: block.body.join('\n').trim(),
  };
});

// A catalogue entry for a component that no longer exists is worse than a missing one: it
// teaches an API that is not there. `<ds-dropdown>` sat here for months after
// `refactor(select)!: absorb ds-dropdown into ds-select` deleted the component.
const sourceFiles = (dir, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(path, out);
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts'))
      out.push(path);
  }
  return out;
};
const liveTags = new Set();
for (const file of sourceFiles(join(repo, 'src', 'lib'))) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/selector:\s*'(ds-[a-z0-9-]+)'/g))
    liveTags.add(match[1]);
  for (const match of text.matchAll(/selector:\s*'\[(ds[A-Za-z]+)\]'/g))
    liveTags.add('[' + match[1] + ']');
}
const stale = [];
for (const leaf of leaves) {
  const named = [...leaf.heading.matchAll(/<(ds-[a-z0-9-]+)>/g)].map(
    (m) => m[1],
  );
  for (const tag of named) {
    if (!liveTags.has(tag)) stale.push(`${tag} (${leaf.path})`);
  }
}
if (stale.length) {
  console.error(
    `✗ components.md documents ${stale.length} component(s) that no longer exist:`,
  );
  for (const entry of stale) console.error(`    ${entry}`);
  console.error(
    '  delete the entry — a doc for a removed component teaches an API that is not there',
  );
  process.exit(1);
}

const duplicates = leaves
  .map((leaf) => leaf.path)
  .filter((path, index, all) => all.indexOf(path) !== index);
if (duplicates.length) {
  console.error(
    `✗ two entries map to the same leaf: ${[...new Set(duplicates)].join(', ')}`,
  );
  process.exit(1);
}

const files = new Map();

// Foundations is three ### parts and the token ramp alone is most of it — an agent
// asking about the grid should not have to load the whole ramp to find it.
const FOUNDATION_PARTS = [
  'Tokens (Tier 2 — semantic roles)',
  'Grid',
  'Global helper classes',
];
const foundationParts = [
  ...source.matchAll(/\n### (.+)\n([\s\S]*?)(?=\n### |\n## )/g),
]
  .filter(([, title]) => FOUNDATION_PARTS.includes(title.trim()))
  .map(([, title, body]) => ({
    title: title.trim(),
    slug: title
      .trim()
      .toLowerCase()
      .replace(/\(.*\)/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    body: body.trim(),
  }));
for (const part of foundationParts) {
  files.set(
    `foundations/${part.slug}.md`,
    [
      '<!-- GENERATED by tools/split-agent-catalogue.mjs from components.md. Do not edit. -->',
      `# Foundations — ${part.title}`,
      '',
      part.body,
      '',
    ].join('\n'),
  );
}

for (const leaf of leaves) {
  files.set(
    leaf.path,
    [
      '<!-- GENERATED by tools/split-agent-catalogue.mjs from components.md. Do not edit. -->',
      `# ${leaf.heading}`,
      '',
      leaf.group ? `Group: ${leaf.group}` : `Section: ${leaf.section}`,
      '',
      leaf.body,
      '',
    ].join('\n'),
  );
}

const byDir = new Map();
for (const leaf of leaves) {
  const dir = leaf.path.split('/')[0];
  if (!byDir.has(dir)) byDir.set(dir, []);
  byDir.get(dir).push(leaf);
}

const indexLines = [
  '<!-- GENERATED by tools/split-agent-catalogue.mjs from components.md. Do not edit. -->',
  '# DS catalogue — index',
  '',
  'One leaf per entry. Read this index, then the single leaf you need — not the whole',
  'catalogue. Every leaf names the selector, its inputs/outputs/slots, an example and the',
  'public CSS custom properties.',
  '',
  '**This catalogue is the WHAT — the inventory.** The HOW lives in `design-system.md`:',
  'spacing bands, type roles, colour, motion, content, radius roles (§8) and page',
  'composition — which region holds what, the five page patterns, and how to check a',
  'composition instead of eyeballing it (§9).',
  '',
  '**The generated API table on the documentation site is authoritative for exact inputs',
  'and token names.** These leaves are for orientation and usage.',
  '',
  ...foundationParts.map(
    (part) => `- [Foundations — ${part.title}](foundations/${part.slug}.md)`,
  ),
  '',
];
for (const [dir, group] of [...byDir].sort()) {
  indexLines.push(`## ${dir}`, '');
  for (const leaf of group) {
    // Prefer a prose line: many entries open with `Inputs:`, which describes nothing.
    const bodyLines = leaf.body
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'));
    const prose = bodyLines.find(
      (line) =>
        !/^(Inputs?|Outputs?|Tokens?|Content slots|Example|New):/.test(
          line.trim(),
        ),
    );
    const gist = (prose ?? bodyLines[0] ?? '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 110);
    indexLines.push(
      `- [${leaf.heading.replace(/`/g, '')}](${leaf.path}) — ${gist}`,
    );
  }
  indexLines.push('');
}
files.set('INDEX.md', indexLines.join('\n'));

if (check) {
  const stale = [];
  for (const [path, content] of files) {
    const full = join(OUT, path);
    if (
      !existsSync(full) ||
      readFileSync(full, 'utf8').replace(/\r\n/g, '\n') !== content
    ) {
      stale.push(path);
    }
  }
  const expected = new Set(files.keys());
  const walk = (dir, prefix = '') => {
    if (!existsSync(dir)) return [];
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? walk(join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    );
  };
  const orphans = walk(OUT).filter((path) => !expected.has(path));
  if (stale.length || orphans.length) {
    for (const path of stale)
      console.error(`✗ agent/${path} is out of date`);
    for (const path of orphans)
      console.error(`✗ agent/${path} has no entry in components.md`);
    console.error(
      '  run `node tools/split-agent-catalogue.mjs` and commit the result',
    );
    process.exit(1);
  }
  console.log(`✓ agent catalogue: ${files.size} file(s) match components.md`);
  process.exit(0);
}

// Written first, pruned after. Wiping the directory and rebuilding it left ~40 ms in which the
// catalogue was 8 files instead of 70 — long enough for a concurrent `build:schematics` to copy an
// incomplete tree into the tarball with nothing going red, and for a Ctrl-C to delete tracked files
// outright.
for (const [path, content] of files) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}
const wanted = new Set([...files.keys()].map((path) => join(OUT, path)));
for (const entry of readdirSync(OUT, {
  recursive: true,
  withFileTypes: true,
})) {
  const full = join(entry.parentPath ?? entry.path, entry.name);
  if (entry.isFile() && !wanted.has(full)) rmSync(full, { force: true });
}

const bytes = [...files.values()].reduce(
  (total, content) => total + content.length,
  0,
);
const biggest = Math.max(
  ...[...files.values()].map((content) => content.length),
);
console.log(
  `✓ agent catalogue: ${files.size} file(s), ${Math.round(bytes / 1024)} KB total,` +
    ` largest ${Math.round(biggest / 1024)} KB (components.md is` +
    ` ${Math.round(source.length / 1024)} KB)`,
);
