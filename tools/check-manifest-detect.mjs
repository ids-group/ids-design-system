#!/usr/bin/env node
// A manifest item is only as good as its locators: one that is correct and complete and matches
// nothing in the consumer's code is recorded "not applicable" by the upgrade loop, and a clean
// re-check grep agrees. This check runs each item's locators over consumer snippets that MUST be
// located and over look-alikes that must NOT count, the way the plugin's usage finder does.
//
// Reads `migrations/fixtures/<version>/<id>.found.<html|ts|scss>` and `<id>.ignored.<ext>`
// (`unreleased/` for the draft), named by an item id of `migrations/<version>.json`.
//
// Locating mirrors plugins/design-system/agents/ds-usage-finder.md: a literal, case-sensitive
// grep for `old` (the attribute of an `element[attr]`, nothing for a comma-joined list), every
// `searchHints` entry and every `detect` shape. When `old` names an element - `ds-button[variant]`,
// `ds-modal .danger` - a hit from `old` or a hint counts only inside that element: an open tag of
// it in markup (inline templates in `.ts` included), a rule nested under a selector naming it in a
// stylesheet. A `detect` hit is scoped the same way only on a template-only item; on a
// `typescript`, `style` or `config` surface there is no element to scope to.
//
// Fails on: a `.found` snippet no locator hits, an `.ignored` snippet a locator hit survives the
// element scope in, a fixture whose id is not in its manifest or whose name or extension is not
// one of the above, and an item of `migrations/unreleased.json` with no `.found` fixture.
//
//   node tools/check-manifest-detect.mjs            # every fixture, plus the draft's coverage
//   node tools/check-manifest-detect.mjs --audit    # the same, then every published item with no
//                                                   # `.found` fixture; exits 0
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = process.env.DS_MIGRATIONS_DIR || join(ROOT, 'migrations');
const FIXTURES = join(MIGRATIONS, 'fixtures');
const AUDIT = process.argv.includes('--audit');
const FIXTURE_NAME = /^(.+)\.(found|ignored)\.(html|ts|scss)$/;
const MANIFEST_NAME = /^(\d+\.\d+\.\d+(?:-[0-9A-Za-z.]+)?|unreleased)\.json$/;
const ELEMENT_OF_OLD = /^(ds-[a-z0-9-]+)(?:\[([^\]]+)\]$|[\s.])/;

const problems = [];
const results = [];

const manifestItems = (version) => {
  const path = join(MIGRATIONS, `${version}.json`);
  return existsSync(path)
    ? (JSON.parse(readFileSync(path, 'utf8')).items ?? [])
    : null;
};

function locatorsOf(item) {
  const scopedElement = ELEMENT_OF_OLD.exec(item.old ?? '');
  const element = scopedElement?.[1] ?? null;
  const surfaces = [item.surface ?? []].flat();
  const templateOnly = surfaces.length === 1 && surfaces[0] === 'template';
  const oldLocator =
    scopedElement?.[2] ?? (item.old?.includes(',') ? null : item.old);
  const locators = [
    ...(oldLocator ? [{ text: oldLocator, field: 'old', scoped: true }] : []),
    ...(item.searchHints ?? []).map((text) => ({
      text,
      field: 'searchHints',
      scoped: true,
    })),
    ...(item.detect ?? []).map((text) => ({
      text,
      field: 'detect',
      scoped: templateOnly,
    })),
  ];
  return { element, locators };
}

// Open-tag spans of a markup text: [start, end, tag name]. Quotes are tracked so an attribute
// value holding `>` (`[disabled]="count > 0"`) does not end the tag.
function tagSpans(text) {
  const spans = [];
  const opening = /<([a-zA-Z][\w-]*)/g;
  let match;
  while ((match = opening.exec(text))) {
    let index = opening.lastIndex;
    let quote = null;
    for (; index < text.length; index++) {
      const character = text[index];
      if (quote) {
        if (character === quote) quote = null;
      } else if (character === '"' || character === "'") quote = character;
      else if (character === '>') break;
    }
    spans.push([match.index, index, match[1]]);
    opening.lastIndex = match.index + 1;
  }
  return spans;
}

// The selectors a stylesheet offset sits under, outermost first, plus its own line.
function selectorContext(text, offset) {
  const stack = [];
  let selectorStart = 0;
  for (let index = 0; index < offset; index++) {
    const character = text[index];
    if (character === '{') {
      stack.push(text.slice(selectorStart, index));
      selectorStart = index + 1;
    } else if (character === '}') {
      stack.pop();
      selectorStart = index + 1;
    } else if (character === ';') selectorStart = index + 1;
  }
  const lineEnd = text.indexOf('\n', offset);
  return `${stack.join(' ')} ${text.slice(selectorStart, lineEnd === -1 ? undefined : lineEnd)}`;
}

function survivingHits(text, extension, { element, locators }) {
  const namesElement = element
    ? new RegExp(`(^|[^\\w-])${element}(?![\\w-])`)
    : null;
  const spans = extension === 'scss' ? null : tagSpans(text);
  const insideElement = (offset) =>
    extension === 'scss'
      ? namesElement.test(selectorContext(text, offset))
      : spans.some(
          ([start, end, name]) =>
            start <= offset && offset <= end && name === element,
        );
  const hits = [];
  for (const locator of locators) {
    for (
      let offset = text.indexOf(locator.text);
      offset !== -1;
      offset = text.indexOf(locator.text, offset + 1)
    ) {
      if (element && locator.scoped && !insideElement(offset)) continue;
      const line = text.slice(0, offset).split('\n').length;
      hits.push(`${locator.field} "${locator.text}" at line ${line}`);
    }
  }
  return hits;
}

const fixtures = [];
if (existsSync(FIXTURES)) {
  for (const folder of readdirSync(FIXTURES, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    const version = folder.name;
    const items = manifestItems(version);
    for (const file of readdirSync(join(FIXTURES, version))) {
      if (!/\.(found|ignored)\./.test(file)) continue;
      const name = `fixtures/${version}/${file}`;
      const parts = FIXTURE_NAME.exec(file);
      if (!parts) {
        problems.push(
          `${name}: a locator fixture is <id>.found.<ext> or <id>.ignored.<ext>, ext html, ts or scss`,
        );
        continue;
      }
      const [, id, expectation, extension] = parts;
      const item = items?.find((candidate) => candidate.id === id);
      if (!item) {
        problems.push(
          `${name}: migrations/${version}.json has no item "${id}"`,
        );
        continue;
      }
      fixtures.push({ name, version, id, expectation });
      const hits = survivingHits(
        readFileSync(join(FIXTURES, version, file), 'utf8'),
        extension,
        locatorsOf(item),
      );
      if (expectation === 'found' && hits.length === 0)
        problems.push(
          `${name}: no locator of ${version}#${id} finds this consumer code (old, searchHints and detect all miss, or every hit falls outside ${locatorsOf(item).element ?? 'the file'})`,
        );
      else if (expectation === 'ignored' && hits.length > 0)
        problems.push(
          `${name}: a look-alike still counts for ${version}#${id}: ${hits.join(', ')}`,
        );
      else
        results.push(
          `${name}: ${expectation === 'found' ? `located (${hits.length} hit(s))` : 'ignored'}`,
        );
    }
  }
}

const covered = new Set(
  fixtures
    .filter((fixture) => fixture.expectation === 'found')
    .map((fixture) => `${fixture.version}#${fixture.id}`),
);
const uncovered = (version) =>
  (manifestItems(version) ?? [])
    .filter((item) => !covered.has(`${version}#${item.id}`))
    .map(
      (item) =>
        `${version}#${item.id}  ${item.kind}, surface ${JSON.stringify(item.surface ?? null)}: no .found fixture`,
    );

problems.push(
  ...uncovered('unreleased').map(
    (gap) =>
      `${gap}\n      add the consumer code it targets as migrations/fixtures/unreleased/<id>.found.<html|ts|scss>`,
  ),
);

console.log(`check-manifest-detect: ${fixtures.length} locator fixture(s) run`);
for (const line of results) console.log(`  ${line}`);

if (AUDIT) {
  const published = readdirSync(MIGRATIONS)
    .filter((file) => MANIFEST_NAME.test(file) && file !== 'unreleased.json')
    .map((file) => file.slice(0, -'.json'.length))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const gaps = published.flatMap(uncovered);
  console.log(
    `\ncheck-manifest-detect --audit: ${gaps.length} published item(s) have no .found fixture`,
  );
  for (const gap of gaps) console.log(`  ${gap}`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const problem of problems) console.log(`  ${problem}`);
  }
  process.exit(0);
}

if (problems.length) {
  console.error(
    `\ncheck-manifest-detect: ${problems.length} problem(s)\n  ${problems.join('\n  ')}`,
  );
  process.exit(1);
}
console.log('check-manifest-detect: every locator held.');
