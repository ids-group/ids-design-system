#!/usr/bin/env node
// A release that moves the default a consumer renders must say so. Every other manifest gate reads
// names; this one reads the boundary's token diff (tools/token-diff.mjs) and asks that each
// default that moved be NAMED somewhere in that boundary's manifest: any item field, an
// `informational` line or a `deleteList` row, backticked or not, or a family covering it.
//
// What has to be named:
//   * `updated`: the property, or for a level-1 move the property it reads, whose own value moved
//     (naming `--accent` answers for every hook that defaults to it);
//   * `deleted`: the property;
//   * `renamed`: the OLD name. A consumer who set it is setting nothing now, which is a deletion
//     to them; and where the default moved too, it is the 0.13.3 meter -> bar case.
// A global also counts as named through a named `--ds-` hook whose default is `var(<global>)`.
// A `cosmetic` update needs nothing: equal once notation is set aside, or once up to two levels
// of `var()` are resolved.
//
//   node tools/check-token-defaults.mjs             # migrations/unreleased.json vs the working tree
//   node tools/check-token-defaults.mjs --audit     # every published boundary, reports only
//   node tools/check-token-defaults.mjs 0.13.3      # one published boundary, fails like strict
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { patternsIn } from './check-manifest-coverage.mjs';
import { previousBoundary, releaseTags } from './release-tags.mjs';
import { defaultsAt, describe, tokenDiff } from './token-diff.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = process.env.DS_MIGRATIONS_DIR || join(ROOT, 'migrations');

// Two shorthands spell several names at once: alternative last segments `--secondary-h/s/l`
// (`--secondary-h`, `--secondary-s`, `--secondary-l`) and an optional suffix
// `--ds-dropdown-focus-shadow(-error)` (the name with and without it).
function spelledOut(text) {
  const names = [];
  for (const [, stem, first, rest] of text.matchAll(
    /(--[a-z0-9-]*-)([a-z0-9]+)((?:\/[a-z0-9]+)+)/g,
  ))
    for (const last of [first, ...rest.split('/').slice(1)])
      names.push(stem + last);
  for (const [, name, suffix] of text.matchAll(
    /(--[a-z0-9-]*[a-z0-9])\((-[a-z0-9-]*[a-z0-9])\)/g,
  ))
    names.push(name, name + suffix);
  return names;
}

// A name, a placeholder family (`--ds-*-bg`, `--status-<x>-bg`), or a prefix family written with
// its trailing hyphen (`--ds-datepicker-`), the form manifest-truth also reads as a family. The
// bare namespace `--ds-` is a prefix of everything and names nothing.
export function namesIn(manifestText) {
  const text = [manifestText, ...spelledOut(manifestText)].join('\n');
  const patterns = patternsIn(text);
  const prefixes = [...text.matchAll(/--[a-z0-9-]*[a-z0-9]-(?![\w*<-])/g)]
    .map((match) => match[0])
    .filter((prefix) => prefix !== '--ds-');
  return (name) =>
    new RegExp(
      String.raw`(?<![\w-])` +
        name.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`) +
        String.raw`(?![\w-])`,
    ).test(text) ||
    patterns.some((pattern) => pattern.test(name)) ||
    prefixes.some((prefix) => name.startsWith(prefix));
}

export function namesToCite(change) {
  if (change.cosmetic || change.change === 'added') return [];
  if (change.change === 'renamed') return [change.from];
  if (change.change === 'updated' && change.level === 1)
    return [change.name, ...change.via];
  return [change.name];
}

// Global -> the `--ds-` hooks declared at the root as exactly `var(<global>)`, on any side given:
// the global's public face, through which a consumer restores it, so naming the hook names it. A
// component fallback such as `var(--ds-avatar-bg-color, var(--primary-muted))` only reads the
// global and answers for nothing else that reads it.
export function hooksDefaultingTo(...sides) {
  const hooks = new Map();
  for (const side of sides)
    for (const entry of side.entries.values()) {
      if (
        !entry.name.startsWith('--ds-') ||
        entry.kind !== 'token' ||
        entry.group !== 'root'
      )
        continue;
      for (const value of entry.values.keys()) {
        const global = /^var\((--(?!ds-)[a-z0-9-]+)\)$/.exec(value)?.[1];
        if (!global) continue;
        if (!hooks.has(global)) hooks.set(global, new Set());
        hooks.get(global).add(entry.name);
      }
    }
  return hooks;
}

// Every change but an addition, with whether the manifest text answers it: `null` for a cosmetic
// one, which has nothing to answer.
export function verdicts(changes, manifestText, hooksOfGlobal = new Map()) {
  const names = manifestText === null ? () => false : namesIn(manifestText);
  const answered = (name) =>
    names(name) || [...(hooksOfGlobal.get(name) ?? [])].some(names);
  return changes
    .filter((change) => change.change !== 'added')
    .map((change) => ({
      change,
      named: change.cosmetic ? null : namesToCite(change).some(answered),
    }));
}

function boundaries(tags) {
  return readdirSync(MIGRATIONS)
    .filter((file) => /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?\.json$/.test(file))
    .map((file) => file.replace(/\.json$/, ''))
    .map((version) => ({
      version,
      before: previousBoundary(tags, version),
      after: `v${version}`,
    }))
    .filter((boundary) => tags.includes(boundary.after))
    .sort((a, b) => tags.indexOf(a.after) - tags.indexOf(b.after));
}

function block(boundary, results) {
  const owed = results.filter((result) => result.named !== null);
  const missing = owed.filter((result) => !result.named).length;
  const lines = [
    `== ${boundary.version} (${boundary.before}..${boundary.after ?? 'working tree'}), ${boundary.file}`,
    `   ${owed.length} to name, ${missing} not named, ${results.length - owed.length} cosmetic`,
  ];
  for (const kind of ['updated', 'deleted', 'renamed']) {
    const listed = results.filter((result) => result.change.change === kind);
    if (!listed.length) continue;
    lines.push(`  ${kind}:`);
    for (const { change, named } of listed)
      lines.push(
        `    [${named === null ? 'cosmetic' : named ? 'named' : 'NOT NAMED'}] ${describe(change)}`,
      );
  }
  return lines.join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const audit = argv.includes('--audit');
  const only = argv.find((argument) =>
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?$/.test(argument),
  );
  const unknown = argv.find(
    (argument) => argument !== '--audit' && argument !== only,
  );
  if (unknown) {
    console.error(
      `check-token-defaults: "${unknown}" is neither \`--audit\` nor an <x.y.z> version.`,
    );
    return 1;
  }
  const tags = releaseTags(ROOT);
  if (!tags.length) {
    console.error(
      'check-token-defaults: no release tags in this checkout, so there is no boundary to read.',
    );
    return 1;
  }

  if (audit || only) {
    const chosen = boundaries(tags).filter(
      (boundary) => !only || boundary.version === only,
    );
    if (only && !chosen.length) {
      console.error(
        `check-token-defaults: no published migrations/${only}.json with a tag v${only}.`,
      );
      return 1;
    }
    const blocks = [];
    let owed = 0;
    let missing = 0;
    let cosmetic = 0;
    for (const boundary of chosen) {
      if (!boundary.before) continue;
      const file = join(MIGRATIONS, `${boundary.version}.json`);
      const results = verdicts(
        tokenDiff(boundary.before, boundary.after),
        readFileSync(file, 'utf8'),
        hooksDefaultingTo(
          defaultsAt(boundary.before),
          defaultsAt(boundary.after),
        ),
      );
      owed += results.filter((result) => result.named !== null).length;
      missing += results.filter((result) => result.named === false).length;
      cosmetic += results.filter((result) => result.named === null).length;
      blocks.push(
        block(
          { ...boundary, file: `migrations/${boundary.version}.json` },
          results,
        ),
      );
    }
    console.log(blocks.join('\n\n'));
    console.log(
      `\ncheck-token-defaults: ${blocks.length} boundar(ies), ${owed} moved default(s) to name, ` +
        `${missing} not named, ${cosmetic} cosmetic.`,
    );
    return audit || missing === 0 ? 0 : 1;
  }

  const file = join(MIGRATIONS, 'unreleased.json');
  const manifest = existsSync(file) ? readFileSync(file, 'utf8') : null;
  const results = verdicts(
    tokenDiff(tags.at(-1), null),
    manifest,
    hooksDefaultingTo(defaultsAt(tags.at(-1)), defaultsAt(null)),
  );
  const missing = results.filter((result) => result.named === false);
  if (missing.length) {
    console.error(
      block(
        {
          version: 'unreleased',
          before: tags.at(-1),
          after: null,
          file: 'migrations/unreleased.json',
        },
        missing,
      ),
    );
    console.error(
      `\ncheck-token-defaults: ${missing.length} moved default(s) are not named in migrations/unreleased.json` +
        `${manifest === null ? ', which does not exist' : ''}. Name each one in the item or informational ` +
        'line that describes it: what it was, what it is now, and how to restore it.',
    );
    return 1;
  }
  console.log(
    `check-token-defaults: ${results.filter((result) => result.named).length} moved default(s) since ` +
      `${tags.at(-1)}, each named in migrations/unreleased.json.`,
  );
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
