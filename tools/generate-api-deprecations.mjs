#!/usr/bin/env node
// Builds `eslint/deprecated-api.json`, the list the shipped ESLint plugin reads to flag, in a
// consumer's TypeScript and Angular templates, an API this library removed or renamed. The source
// is every published `migrations/<V>.json`:
//
//   inputs / outputs  `input-rename`, `output-rename` and `removed-api` items whose `old` is
//                     `element[name]` (a bare `[name]` is an attribute directive, element `*`)
//   values            `value-remap` map keys whose replacement no longer carries `attr="key"`
//   selectors         `selector-rename` items whose `old` is a bare `ds-*` element
//   symbols           `type-rename` identifiers, `|` lists paired by position, and `removed-api`
//                     identifiers
//   members           `Class.member` names from `type-rename` and `removed-api`, plus every
//                     renamed or removed input and output under the class its element maps to at
//                     HEAD, which is what a subclass declares
//
// Tokens are not repeated here: the plugin reads `stylelint/deprecated-tokens.json`, which the
// release regenerates beside this file.
//
// Every name is checked against the working tree and dropped when it is live there, because a
// rule that reports a live binding is wrong for every consumer on the current release. A value is
// not checked that way: a literal type can sit in another file under another name, and a remap
// keeps a still-valid value out of the dead list through its own identity entry. A symbol renamed
// twice points at the current name, so the autofix never writes a dead one.
//
//   node tools/generate-api-deprecations.mjs           # write the JSON
//   node tools/generate-api-deprecations.mjs --check   # fail when the committed JSON is stale
//   node tools/generate-api-deprecations.mjs --report  # also list what the manifests named and the
//                                                      # tree refused or the reader could not place
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compareVersions } from './release-tags.mjs';
import {
  surfaceOfWorkingTree,
  workingTreeFiles,
} from './check-manifest-truth.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'eslint/deprecated-api.json');

const SCOPED = /^([a-z][a-z0-9-]*)?\[([A-Za-z][\w-]*)\]$/;
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const MEMBER = /^([A-Z][\w$]*)\.([A-Za-z_$][\w$]*)$/;
const ELEMENT = /^ds-[a-z0-9]+(?:-[a-z0-9]+)*$/;

const splitList = (text) =>
  String(text ?? '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean);

// The new side of `element[name]` names the binding a consumer writes, which is the bare name
// when the element stays and the whole `element[name]` when it moves.
const bindingReplacement = (oldElement, newText) => {
  if (newText == null) return null;
  const scoped = SCOPED.exec(newText);
  if (scoped && (scoped[1] ?? '') === oldElement) return scoped[2];
  return newText;
};

function elementClassesOfWorkingTree() {
  const classes = new Map();
  for (const { path, text } of workingTreeFiles() ?? []) {
    if (!path.endsWith('.ts')) continue;
    const owner = /export\s+(?:abstract\s+)?class\s+([A-Za-z_]\w*)/.exec(text);
    if (!owner) continue;
    for (const block of text.matchAll(/selector:\s*'([^']+)'/g))
      for (const part of block[1].split(','))
        if (/^\s*[a-z][a-z0-9-]*\s*$/.test(part))
          classes.set(part.trim(), owner[1]);
  }
  return classes;
}

export function buildApiDeprecations({ report = [] } = {}) {
  const head = surfaceOfWorkingTree();
  if (!head) throw new Error('cannot read src/lib in the working tree');
  const elementClasses = elementClassesOfWorkingTree();
  const versions = readdirSync(join(ROOT, 'migrations'))
    .map((file) => /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?)\.json$/.exec(file)?.[1])
    .filter(Boolean)
    .sort(compareVersions);
  // The release step runs this after promoting the draft, when unreleased.json is gone.
  if (existsSync(join(ROOT, 'migrations', 'unreleased.json')))
    versions.push('unreleased');

  const lists = {
    inputs: new Map(),
    outputs: new Map(),
    values: new Map(),
    selectors: new Map(),
    symbols: new Map(),
    members: new Map(),
  };
  // A later manifest naming the same thing wins: it is the one written against the newer tree.
  const add = (list, key, entry) => lists[list].set(key, entry);

  for (const version of versions) {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, 'migrations', `${version}.json`), 'utf8'),
    );
    for (const item of manifest.items ?? []) {
      const itemId = `${version}#${item.id}`;
      const since = version === 'unreleased' ? 'the next release' : version;
      const old = typeof item.old === 'string' ? item.old.trim() : '';
      const skip = (why) => report.push(`${itemId}: ${why}: ${old}`);
      // A token is the stylelint list's, which this plugin reads as it is.
      if (old.startsWith('--')) continue;

      if (
        item.kind === 'input-rename' ||
        item.kind === 'output-rename' ||
        ((item.kind === 'removed-api' || item.kind === 'behavior') &&
          SCOPED.test(old))
      ) {
        const [, element = '*', name] = SCOPED.exec(old) ?? [];
        if (!name) {
          skip('not element[name]');
          continue;
        }
        const list = item.kind === 'output-rename' ? 'outputs' : 'inputs';
        // A behavior item that names a binding a rename already covers adds nothing: the rename's
        // replacement is the more useful message.
        if (item.kind === 'behavior' && lists[list].has(`${element}[${name}]`))
          continue;
        add(list, `${element}[${name}]`, {
          element,
          name,
          replacement: bindingReplacement(
            element === '*' ? '' : element,
            item.new,
          ),
          since,
          itemId,
        });
        continue;
      }

      if (item.kind === 'value-remap') {
        const [, element, attribute] = SCOPED.exec(old) ?? [];
        if (!element) {
          skip('not element[attr]');
          continue;
        }
        for (const [value, replacement] of Object.entries(item.map ?? {})) {
          if (replacement?.includes(`${attribute}="${value}"`)) continue;
          add('values', `${element}[${attribute}]=${value}`, {
            element,
            attribute,
            value,
            replacement,
            since,
            itemId,
          });
        }
        continue;
      }

      if (item.kind === 'selector-rename') {
        if (!ELEMENT.test(old)) {
          skip('not a bare element');
          continue;
        }
        add('selectors', old, {
          name: old,
          replacement: item.new,
          since,
          itemId,
        });
        continue;
      }

      if (item.kind === 'type-rename' || item.kind === 'removed-api') {
        const olds = splitList(old);
        const news = splitList(item.new);
        if (
          !olds.length ||
          !olds.every((part) => IDENTIFIER.test(part) || MEMBER.test(part))
        ) {
          skip('not an identifier list');
          continue;
        }
        olds.forEach((part, position) => {
          const newPart =
            news.length === olds.length
              ? news[position]
              : news.length === 1
                ? news[0]
                : null;
          const member = MEMBER.exec(part);
          if (member) {
            const replacement = MEMBER.exec(newPart ?? '')?.[2] ?? newPart;
            add('members', part, {
              owner: member[1],
              name: member[2],
              replacement,
              since,
              itemId,
            });
            return;
          }
          add('symbols', part, {
            name: part,
            replacement: newPart,
            renamed:
              item.kind === 'type-rename' &&
              newPart !== null &&
              IDENTIFIER.test(newPart),
            since,
            itemId,
          });
        });
      }
    }
  }

  // `a` -> `b` -> `c`: a binding renamed twice points at the live name. The chain stops at a name
  // whose own change is not a rename (no replacement), so the message names the last real rename.
  for (const list of ['inputs', 'outputs'])
    for (const entry of lists[list].values())
      for (
        let next = lists[list].get(`${entry.element}[${entry.replacement}]`),
          guard = 0;
        next && next !== entry && next.replacement && guard < 10;
        next = lists[list].get(`${entry.element}[${entry.replacement}]`),
          guard++
      )
        entry.replacement = next.replacement;

  // A renamed binding on a component is a member its subclass may still declare.
  for (const list of ['inputs', 'outputs'])
    for (const entry of lists[list].values()) {
      const owner = elementClasses.get(entry.element);
      if (!owner) continue;
      const key = `${owner}.${entry.name}`;
      if (lists.members.has(key)) continue;
      lists.members.set(key, {
        owner,
        name: entry.name,
        replacement: SCOPED.test(entry.replacement ?? '')
          ? null
          : entry.replacement,
        since: entry.since,
        itemId: entry.itemId,
      });
    }

  const live = (why) => (entry) => {
    report.push(`${entry.itemId}: ${why}`);
    return false;
  };
  const keep = {
    inputs: (entry) =>
      entry.element === '*'
        ? !head.directives.has(entry.name) ||
          live(`[${entry.name}] is a directive in the working tree`)(entry)
        : !head.elements.get(entry.element)?.has(entry.name) ||
          live(
            `${entry.element}[${entry.name}] is bindable in the working tree`,
          )(entry),
    outputs: (entry) =>
      !head.elements.get(entry.element)?.has(entry.name) ||
      live(`${entry.element}(${entry.name}) is bindable in the working tree`)(
        entry,
      ),
    values: () => true,
    selectors: (entry) =>
      !head.elements.has(entry.name) ||
      live(`${entry.name} is an element in the working tree`)(entry),
    symbols: (entry) =>
      !head.symbols.has(entry.name) ||
      live(`${entry.name} is exported from the working tree`)(entry),
    // Members are read across every class, so a name any class still declares is dropped:
    // a missed report costs less than a subclass told its live override is dead.
    members: (entry) =>
      !head.members.has(entry.name) ||
      live(
        `${entry.owner}.${entry.name}: a class in the working tree declares ${entry.name}`,
      )(entry),
  };

  const symbols = lists.symbols;
  for (const entry of symbols.values()) {
    const seen = new Set([entry.name]);
    while (entry.renamed && symbols.has(entry.replacement)) {
      const next = symbols.get(entry.replacement);
      if (seen.has(next.name)) break;
      seen.add(next.name);
      entry.replacement = next.replacement;
      entry.renamed = next.renamed;
    }
    if (entry.renamed && !head.symbols.has(entry.replacement)) {
      report.push(
        `${entry.itemId}: ${entry.name} -> ${entry.replacement}, which the working tree does not export`,
      );
      entry.renamed = false;
    }
  }

  const output = {};
  for (const [list, entries] of Object.entries(lists))
    output[list] = [...entries.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, entry]) => entry)
      .filter(keep[list]);
  return output;
}

const main = () => {
  const report = [];
  const data = buildApiDeprecations({ report });
  const serialised = `${JSON.stringify(data, null, 2)}\n`;
  const count = Object.values(data).reduce((sum, list) => sum + list.length, 0);
  if (process.argv.includes('--report'))
    for (const line of report) console.log(line);
  if (process.argv.includes('--check')) {
    let current = '';
    try {
      current = readFileSync(OUT, 'utf8');
    } catch {}
    if (current !== serialised) {
      console.error(
        'api-deprecations: eslint/deprecated-api.json is stale against migrations/ or src/lib.\n' +
          '  Run `node tools/generate-api-deprecations.mjs` and commit the result.',
      );
      return 1;
    }
    console.log(
      `api-deprecations: OK - ${count} removed or renamed name(s), ${report.length} manifest name(s) refused or unplaced.`,
    );
    return 0;
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, serialised);
  console.log(
    `api-deprecations: wrote ${count} entr(ies) to eslint/deprecated-api.json.`,
  );
  return 0;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  process.exitCode = main();
