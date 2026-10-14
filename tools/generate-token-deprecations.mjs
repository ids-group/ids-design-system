#!/usr/bin/env node
// Builds `stylelint/deprecated-tokens.json`, the list the shipped stylelint plugin reads to flag a
// custom property this library removed or renamed in a consumer's own stylesheet. The source is
// every published `migrations/<V>.json`: `token-rename` items, `removed-api` items naming a token,
// and `deleteList` rows whose `find` is a bare token. Each name is checked against the trees of the
// boundary the manifest describes (present at v<prev>, gone at v<V>), and dropped when the working
// tree has it again, because a consumer override of a live token is not stale.
//
// A family (`--ds-*-bg`, `--<role>-subtle`, `--ds-progress-*`) is expanded against the v<prev> tree:
// every member that is gone at v<V> becomes an entry, its replacement the new pattern filled in
// when that name exists at v<V>. A bare prefix (`--ds-combobox-`) is the family `--ds-combobox-*`.
//
// Only a `token-rename` with one replacement name is `renamed`, which the rule autofixes. A
// `removed-api` keeps its replacement as advice: `--ds-button-focus-shadow` -> `--focus-ring-color`
// is a different property, and renaming a declaration of one into the other would be wrong.
//
// The newest manifest may be untagged: `tools/prepare-release-commit.mjs` runs this after promoting
// the draft and before `npm version` tags it, so the release's own renames ship in its tarball.
//
//   node tools/generate-token-deprecations.mjs           # write the JSON
//   node tools/generate-token-deprecations.mjs --check   # fail when the committed JSON is stale
//   node tools/generate-token-deprecations.mjs --report  # also list the names the trees refused
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  compareVersions,
  previousBoundary,
  releaseTags,
} from './release-tags.mjs';
import { surfaceAt, surfaceOfWorkingTree } from './check-manifest-truth.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'stylelint/deprecated-tokens.json');
const TOKEN = /^--[a-z0-9][a-z0-9-]*$/;

const splitList = (text) =>
  String(text ?? '')
    .split(/\s*[,|]\s*|\s+\/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (/^--[a-z0-9-]+-$/.test(part) ? `${part}*` : part));

const isFamily = (part) => /^--[a-z0-9<>*-]+$/.test(part) && /[*<]/.test(part);

function familyPattern(part) {
  const source = part
    .replace(/<[a-z-]+>|\*/g, '\u0000')
    .replace(/-/g, '\\-')
    .replace(/\u0000/g, '([a-z0-9-]+?)');
  return new RegExp(`^${source}$`);
}

const fillFamily = (part, captures) => {
  let index = 0;
  return part.replace(/<[a-z-]+>|\*/g, () => captures[index++] ?? '');
};

// One candidate per old name: `{ name, replacement, renamed }`, before the trees are asked.
export function candidatesOf(
  oldText,
  newText,
  kind,
  beforeTokens,
  afterTokens,
) {
  const olds = splitList(oldText).filter(
    (part) => TOKEN.test(part) || isFamily(part),
  );
  const news = splitList(newText);
  const paired = olds.length === news.length;
  const candidates = [];
  olds.forEach((oldPart, position) => {
    const newPart = paired ? news[position] : null;
    if (isFamily(oldPart)) {
      const pattern = familyPattern(oldPart);
      for (const name of beforeTokens) {
        const match = pattern.exec(name);
        if (!match) continue;
        const filled =
          newPart && isFamily(newPart)
            ? fillFamily(newPart, match.slice(1))
            : null;
        const replacement = filled && afterTokens.has(filled) ? filled : null;
        candidates.push({
          name,
          replacement,
          renamed: kind === 'token-rename' && replacement !== null,
        });
      }
      return;
    }
    const replacement = newPart ?? (news.length ? news.join(', ') : null);
    candidates.push({
      name: oldPart,
      replacement,
      renamed:
        kind === 'token-rename' &&
        replacement !== null &&
        TOKEN.test(replacement),
    });
  });
  return candidates;
}

// A gone name takes its advice from the newest manifest naming it as a plain `old`, the draft
// newest of all, and keeps the `since` of the release that removed it.
export function applyNewestAdvice(entries, mentions, headTokens) {
  for (const { label, manifest } of mentions)
    for (const item of manifest.items ?? []) {
      if (item.kind !== 'token-rename' && item.kind !== 'removed-api') continue;
      for (const { name, replacement, renamed } of candidatesOf(
        item.old,
        item.new,
        item.kind,
        new Set(),
        new Set(),
      )) {
        const entry = entries.get(name);
        if (!entry) continue;
        if (label !== 'unreleased' && compareVersions(label, entry.since) <= 0)
          continue;
        entry.replacement = replacement;
        entry.renamed = renamed && headTokens.has(replacement);
        entry.itemId = `${label}#${item.id}`;
      }
    }
}

export function buildDeprecations({ report = [] } = {}) {
  const tags = releaseTags(ROOT);
  const head = surfaceOfWorkingTree()?.tokens;
  if (!head) throw new Error('cannot read src/lib in the working tree');
  const versions = readdirSync(join(ROOT, 'migrations'))
    .map((file) => /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)\.json$/.exec(file)?.[1])
    .filter(Boolean)
    .sort(compareVersions);
  const entries = new Map();
  for (const version of versions) {
    const tagged = tags.includes(`v${version}`);
    // The manifest the release commit is promoting has no tag yet: its after-side is the tree
    // about to be tagged. Any other untagged manifest is skipped.
    if (
      !tagged &&
      compareVersions(version, tags.at(-1)?.slice(1) ?? '0') <= 0
    ) {
      report.push(`${version}: no tag v${version}, manifest skipped`);
      continue;
    }
    const tag = tagged ? `v${version}` : 'the working tree';
    const prev = previousBoundary(
      tagged ? tags : [...tags, `v${version}`],
      version,
    );
    if (!prev) continue;
    const before = surfaceAt(prev)?.tokens;
    const after = tagged ? surfaceAt(tag)?.tokens : head;
    if (!before || !after) {
      report.push(
        `${version}: cannot read ${prev} or ${tag}, manifest skipped`,
      );
      continue;
    }
    const manifest = JSON.parse(
      readFileSync(join(ROOT, 'migrations', `${version}.json`), 'utf8'),
    );
    const sources = [];
    for (const item of manifest.items ?? []) {
      if (item.kind !== 'token-rename' && item.kind !== 'removed-api') continue;
      sources.push({
        itemId: `${version}#${item.id}`,
        deleteRow: false,
        candidates: candidatesOf(item.old, item.new, item.kind, before, after),
      });
    }
    for (const row of manifest.deleteList ?? []) {
      const tokens = [row.find]
        .flat()
        .filter((find) => TOKEN.test(find.trim()));
      sources.push({
        itemId: `${version}#${row.id}`,
        deleteRow: true,
        candidates: tokens.map((name) => ({
          name: name.trim(),
          replacement: null,
          renamed: false,
        })),
      });
    }
    for (const { itemId, deleteRow, candidates } of sources)
      for (const { name, replacement, renamed } of candidates) {
        if (name.startsWith('--_')) continue;
        if (!before.has(name)) {
          report.push(`${itemId}: ${name} is not in ${prev}`);
          continue;
        }
        if (after.has(name)) {
          // A deleteList row names a redundant override of a LIVE token; that is not a removal.
          if (!deleteRow) report.push(`${itemId}: ${name} is still in ${tag}`);
          continue;
        }
        const existing = entries.get(name);
        // The rename's item wins over a deleteList row naming the same token in the same release.
        if (existing?.since === version && existing.renamed && !renamed)
          continue;
        entries.set(name, {
          name,
          replacement,
          renamed,
          since: version,
          itemId,
        });
      }
  }

  const draftPath = join(ROOT, 'migrations', 'unreleased.json');
  const mentions = versions.map((version) => ({
    label: version,
    manifest: JSON.parse(
      readFileSync(join(ROOT, 'migrations', `${version}.json`), 'utf8'),
    ),
  }));
  if (existsSync(draftPath))
    mentions.push({
      label: 'unreleased',
      manifest: JSON.parse(readFileSync(draftPath, 'utf8')),
    });
  applyNewestAdvice(entries, mentions, head);

  for (const entry of entries.values()) {
    if (head.has(entry.name)) {
      report.push(`${entry.itemId}: ${entry.name} is back in the working tree`);
      entries.delete(entry.name);
    }
  }
  // A token renamed twice points at the current name, so the autofix never writes a dead one.
  for (const entry of entries.values()) {
    const seen = new Set([entry.name]);
    while (entry.renamed && entries.has(entry.replacement)) {
      const next = entries.get(entry.replacement);
      if (seen.has(next.name)) break;
      seen.add(next.name);
      entry.replacement = next.replacement;
      entry.renamed = next.renamed;
    }
    if (entry.renamed && !head.has(entry.replacement))
      report.push(
        `${entry.itemId}: ${entry.name} -> ${entry.replacement}, which the working tree does not have`,
      );
  }

  return [...entries.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, replacement, renamed, since, itemId }) => ({
      name,
      replacement,
      kind: renamed ? 'renamed' : 'removed',
      since,
      itemId,
    }));
}

const main = () => {
  const report = [];
  const entries = buildDeprecations({ report });
  const serialised = `${JSON.stringify(entries, null, 2)}\n`;
  if (process.argv.includes('--report'))
    for (const line of report) console.log(line);
  if (process.argv.includes('--check')) {
    let current = '';
    try {
      current = readFileSync(OUT, 'utf8');
    } catch {}
    if (current !== serialised) {
      for (const line of report.filter((line) =>
        line.includes('manifest skipped'),
      ))
        console.error(`  ${line}`);
      console.error(
        'token-deprecations: stylelint/deprecated-tokens.json is stale against migrations/.\n' +
          '  Run `node tools/generate-token-deprecations.mjs` and commit the result.',
      );
      return 1;
    }
    console.log(
      `token-deprecations: OK - ${entries.length} removed or renamed token(s), ${report.length} manifest name(s) the trees refused.`,
    );
    return 0;
  }
  writeFileSync(OUT, serialised);
  console.log(
    `token-deprecations: wrote ${entries.length} entr(ies) to stylelint/deprecated-tokens.json.`,
  );
  return 0;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
