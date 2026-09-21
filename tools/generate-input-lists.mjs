#!/usr/bin/env node
// Every component's full input list, written into components.md between markers, and a stub
// block for a component the file does not mention at all.
//
// The prose above each marker is authored: it groups the inputs that need explaining and says
// why. It is not a catalogue, and it drifted into one being 525 of 944 inputs short, with 37
// components missing outright - which is how a consumer came to file eleven asks for API that
// already existed. The generated line is the catalogue, so the prose does not have to be one.
//
// Sibling of extract-tokens.mjs and extract-component-api.mjs: source -> generated -> docs.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { internalSymbols } from './lib-entry-points.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'components.md');
const API = join(ROOT, 'ds-docs/src/app/shared/component-api.generated.ts');
const COMPONENTS = join(ROOT, 'src/lib/components');

const START = (selector) => `<!-- inputs:${selector} -->`;
const END = '<!-- /inputs -->';

const LITERAL = /^(-?\d+(\.\d+)?|'[^']*'|"[^"]*"|true|false|null|\[\]|\{\})$/;
const CONSTANT = /^[A-Z][A-Z0-9_]*$/;
const hidden = new Set(internalSymbols());

// Where a component with no block of its own is appended. Authored: this file groups by role and
// the nav config groups differently, so neither derives the other.
const SECTION = {
  'Form & input': [
    'ds-button-group',
    'ds-split-button',
    'ds-toggle-button',
    'ds-color-picker',
    'ds-field-group',
    'ds-otp-input',
    'ds-password-rules',
    'ds-radio-group',
    'ds-segmented',
    'ds-slider',
    'ds-time-picker',
    'ds-filter-bar',
    'ng-template[dsFilterItem]',
  ],
  'Display & feedback': [
    'ds-list',
    'ds-list-item',
    'ds-loading-overlay',
    'ds-timeline-item',
    'ds-toast-region',
    'ds-tree',
    'ds-description-list',
    'ds-description-item',
  ],
  Surfaces: ['ds-accordion-item'],
  'Layout & navigation': [
    'ds-container',
    'ds-inline',
    'ds-stack',
    'ds-sidenav-footer',
    'ds-tab',
  ],
  Overlay: ['ds-tooltip-panel'],
  Tables: [
    '[dsCellTemplate]',
    'ng-template[dsHeaderFilter]',
    '[dsTableColumns]',
    '[dsTableExport]',
  ],
  Charts: [
    'ds-chart',
    'g[dsColumnSeries]',
    'g[dsLineSeries]',
    'g[dsReferenceLabel]',
    'g[dsReferenceLine]',
  ],
};

function readApi() {
  const source = readFileSync(API, 'utf8');
  const open = source.indexOf('{', source.indexOf('COMPONENT_API'));
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    else if (source[index] === '}') {
      depth -= 1;
      if (!depth) return JSON.parse(source.slice(open, index + 1));
    }
  }
  throw new Error('COMPONENT_API object not found');
}

/** The component's own directory, where a constant it defaults to is declared. */
function sourcesNear(entry) {
  const directory = join(COMPONENTS, String(entry.key ?? ''));
  if (!existsSync(directory)) return [];

  return readdirSync(directory)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => join(directory, file));
}

/** A default naming an unexported constant tells a consumer a symbol they cannot import, so it
 *  is resolved to the literal it holds and dropped when it cannot be. `changelog-lint` C010
 *  fails the build on the unresolved form, which is how this was found. */
function readableDefault(value, entry) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (LITERAL.test(text)) return text;
  if (!CONSTANT.test(text)) return null;
  const declaration = new RegExp(`export const ${text}\\s*(?::[^=]+)?=\\s*([^;\\n]+)`);
  for (const file of sourcesNear(entry)) {
    const match = readFileSync(file, 'utf8').match(declaration);
    if (match && LITERAL.test(match[1].trim())) return match[1].trim();
  }

  return null;
}

/** A type the package root does not publish cannot be named in a published document: it sends a
 *  reader after a symbol they cannot import. `changelog-lint` C010 fails the build on one, which
 *  is how `ChartStackOffset` - `@internal`, yet the type of a published input - was found. */
function publishableType(type) {
  if (!type) return null;
  const named = type.match(/[A-Z][A-Za-z0-9]*/g) ?? [];

  return named.some((name) => hidden.has(name)) ? null : type;
}

/** `name: Type = default`, required marked, union spelled where it is short enough to read. */
function signature(input, entry) {
  const union = input.union?.length
    ? input.union.map((value) => `'${value}'`).join(' | ')
    : null;
  const spelled = union && union.length <= 60 ? union : (input.type ?? 'unknown');
  const type = publishableType(spelled);
  if (input.required) return type ? `${input.name}: required ${type}` : `${input.name}: required`;
  if (!type) return input.name;
  const value = readableDefault(input.default, entry);

  return value === null
    ? `${input.name}: ${type}`
    : `${input.name}: ${type} = ${value}`;
}

function inputLine(entry) {
  return (
    `${START(entry.selector)}\nAll inputs: ` +
    entry.inputs.map((input) => `\`${signature(input, entry)}\``).join(', ') +
    `\n${END}\n`
  );
}

/** A component absent from the file gets a heading, its own summary and the generated list. */
function stubFor(entry) {
  const heading = entry.isElement ? `<${entry.selector}>` : entry.selector;
  const summary = entry.summary ? `${entry.summary}\n\n` : '';

  return `#### \`${heading}\` — \`${entry.className}\`\n\n${summary}${inputLine(entry)}\n`;
}

const api = readApi();
const bySelector = new Map();
for (const entry of Object.values(api)) {
  if (entry.selector && entry.inputs?.length) bySelector.set(entry.selector, entry);
}

const current = readFileSync(DOCS, 'utf8');
const written = [];

/** One part per `###` or `####` heading. Split rather than matched, on BOTH levels: JS has no
 *  `\Z`, so a lookahead for "the next heading or the end" silently means "or a literal Z"; and a
 *  block that ran to the next `####` swallowed the `###` section heading between them, so the
 *  appended line landed under the wrong section. */
function blocksOf(text) {
  const starts = [];
  const heading = /^#{3,4} /gm;
  for (let match; (match = heading.exec(text)); ) starts.push(match.index);
  if (!starts.length) return [text];
  const parts = [text.slice(0, starts[0])];
  for (let index = 0; index < starts.length; index += 1) {
    parts.push(text.slice(starts[index], starts[index + 1] ?? text.length));
  }

  return parts;
}

// A heading names its selector as `<ds-x>`, `[dsX]` or `g[dsX]`, so match every backticked token
// rather than the first form.
let updated = blocksOf(current)
  .map((block) => {
    if (!block.startsWith('#### ')) return block;
    const heading = block.slice(0, block.indexOf('\n'));
    const selectors = [...heading.matchAll(/`([^`]+)`/g)].map((match) =>
      match[1].replace(/^</, '').replace(/>$/, ''),
    );
    const entry = selectors.map((selector) => bySelector.get(selector)).find(Boolean);
    if (!entry) return block;
    written.push(entry.selector);
    const marked = new RegExp(
      `${START(entry.selector).replace(/[[\]]/g, '\\$&')}[\\s\\S]*?${END}\\n`,
    );
    if (marked.test(block)) return block.replace(marked, inputLine(entry));
    // Before the `---` that closes a component, or the line reads as the next one's.
    const rule = block.match(/\n---\s*$/);
    const body = rule ? block.slice(0, block.length - rule[0].length) : block;

    return (
      body.replace(/\n*$/, '\n\n') + inputLine(entry) + (rule ? '\n---\n\n' : '\n')
    );
  })
  .join('');

const absent = [...bySelector.keys()].filter((selector) => !written.includes(selector));
for (const [section, selectors] of Object.entries(SECTION)) {
  const due = selectors.filter((selector) => absent.includes(selector));
  if (!due.length) continue;
  const stubs = due.map((selector) => stubFor(bySelector.get(selector))).join('');
  const start = updated.indexOf(`### ${section}\n`);
  if (start === -1) throw new Error(`no '### ${section}' section in components.md`);
  const next = updated.indexOf('\n### ', start + 1);
  const end = next === -1 ? updated.length : next + 1;
  updated = updated.slice(0, end) + stubs + updated.slice(end);
  written.push(...due);
}

const missing = [...bySelector.keys()].filter((selector) => !written.includes(selector));

if (process.argv.includes('--check')) {
  if (current !== updated) {
    console.error(
      'generate-input-lists: components.md is out of date - run `npm run input-lists`.',
    );
    process.exit(1);
  }
  console.log(`generate-input-lists: OK - ${written.length} component(s) up to date.`);
} else {
  writeFileSync(DOCS, updated);
  console.log(
    `generate-input-lists: wrote ${written.length} input list(s), ` +
      `${absent.length} of them as a new block.`,
  );
}

if (missing.length) {
  console.log(
    `generate-input-lists: ${missing.length} component(s) have inputs, no block and no ` +
      `section assigned - ${missing.join(', ')}`,
  );
}
