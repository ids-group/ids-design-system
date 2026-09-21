#!/usr/bin/env node
// Every component's full input list, written into components.md between markers.
//
// The prose above each marker is authored: it groups the inputs that need explaining and says
// why. It is not a catalogue, and it drifted into one being 525 of 944 inputs short - which is
// how a consumer came to file eleven asks for API that already existed. The generated line is
// the catalogue, so the prose does not have to be one.
//
// Sibling of extract-tokens.mjs and extract-component-api.mjs: source -> generated -> docs.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'components.md');
const API = join(ROOT, 'ds-docs/src/app/shared/component-api.generated.ts');
const COMPONENTS = join(ROOT, 'src/lib/components');

const START = (selector) => `<!-- inputs:${selector} -->`;
const END = '<!-- /inputs -->';

const LITERAL = /^(-?\d+(\.\d+)?|'[^']*'|"[^"]*"|true|false|null|\[\]|\{\})$/;
const CONSTANT = /^[A-Z][A-Z0-9_]*$/;

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
  const declaration = new RegExp(
    String.raw`export const ` + text + String.raw`\s*(?::[^=]+)?=\s*([^;\n]+)`,
  );
  for (const file of sourcesNear(entry)) {
    const match = readFileSync(file, 'utf8').match(declaration);
    if (match && LITERAL.test(match[1].trim())) return match[1].trim();
  }

  return null;
}

/** `name: Type = default`, required marked, union spelled where it is short enough to read. */
function signature(input, entry) {
  const union = input.union?.length
    ? input.union.map((value) => `'${value}'`).join(' | ')
    : null;
  const type = union && union.length <= 60 ? union : (input.type ?? 'unknown');
  if (input.required) return `${input.name}: required ${type}`;
  const value = readableDefault(input.default, entry);

  return value === null
    ? `${input.name}: ${type}`
    : `${input.name}: ${type} = ${value}`;
}

const api = readApi();
const bySelector = new Map();
for (const entry of Object.values(api)) {
  if (entry.selector && entry.inputs?.length) bySelector.set(entry.selector, entry);
}

const current = readFileSync(DOCS, 'utf8');
const written = [];

// One block per `#### \`<ds-x>\`` heading, up to the next heading of the same level.
const updated = current.replace(/^#### `<[^>]+>`.*?(?=^#### |\Z)/gms, (block) => {
  const selectors = [...block.matchAll(/<(ds-[a-z0-9-]+)>/g)].map((m) => m[1]);
  const entry = selectors.map((selector) => bySelector.get(selector)).find(Boolean);
  if (!entry) return block;
  written.push(entry.selector);
  const line =
    `${START(entry.selector)}\nAll inputs: ` +
    entry.inputs.map((input) => `\`${signature(input, entry)}\``).join(', ') +
    `\n${END}\n`;
  const marked = new RegExp(
    `${START(entry.selector).replace(/[[\]]/g, String.raw`\$&`)}[\\s\\S]*?${END}\\n`,
  );
  if (marked.test(block)) return block.replace(marked, line);

  return block.replace(/\n*$/, '\n\n') + line + '\n';
});

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
  console.log(`generate-input-lists: wrote ${written.length} input list(s).`);
}

if (missing.length) {
  console.log(
    `generate-input-lists: ${missing.length} component(s) have inputs and no block in ` +
      `components.md - ${missing.join(', ')}`,
  );
}
