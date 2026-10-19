#!/usr/bin/env node
// Lists the `--ds-*` tokens and CSS classes a DS release dropped, and every consumer line that
// still names one. Deterministic input for the auto-update skill's customization-drift step.
//
//   node drift-scan.mjs <old-tree> <new-tree> <consumer-root>
//
// Trees are extracted `src/lib` directories of two release tags. Output (stdout, JSON):
//   { goneTokens: [], goneClasses: [], hits: [{ file, line, name }] }
import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const SKIP = new Set(['node_modules', 'dist', '.angular', '.git']);
const TOKEN = /--ds-[a-z0-9-]+/g;
// A dotted name in an at-rule or before `(` is a Sass module member (`motion.sweeps-in`), not a class.
const SASS_AT_RULE = /@(?:include|mixin|function|use|forward)\b[^;{]*/g;
const STYLE_CLASS = /\.([a-z][a-z0-9-]{2,})(?![a-z0-9(-])/g;
const HTML_CLASS = /class="([^"]*)"/g;
// Comments, quoted strings and url() bodies hold prose and paths (`index.html`), never selectors.
const STYLE_NON_SELECTOR =
  /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|url\([^)]*\)/g;

// Blanked in place so line numbers survive.
const stylesheetCode = (text) =>
  text.replace(STYLE_NON_SELECTOR, (match) => match.replace(/[^\n]/g, ' '));

function* walk(dir, extensions) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path, extensions);
    else if (extensions.has(extname(entry.name))) yield path;
  }
}

function surface(tree) {
  const tokens = new Set();
  const classes = new Set();
  for (const file of walk(tree, new Set(['.scss', '.css', '.html', '.ts']))) {
    const text = readFileSync(file, 'utf8');
    const extension = extname(file);
    for (const match of text.matchAll(TOKEN)) tokens.add(match[0]);
    if (extension === '.scss' || extension === '.css')
      for (const match of stylesheetCode(text)
        .replace(SASS_AT_RULE, '')
        .matchAll(STYLE_CLASS))
        classes.add(match[1]);
    if (extension === '.html')
      for (const match of text.matchAll(HTML_CLASS))
        for (const name of match[1].split(/\s+/))
          if (/^[a-z][a-z0-9-]*$/.test(name)) classes.add(name);
  }
  return { tokens, classes };
}

const [oldTree, newTree, consumerRoot] = process.argv.slice(2);
if (!oldTree || !newTree || !consumerRoot) {
  console.error(
    'usage: node drift-scan.mjs <old-tree> <new-tree> <consumer-root>',
  );
  process.exit(2);
}

const before = surface(oldTree);
const after = surface(newTree);
const goneTokens = [...before.tokens]
  .filter((name) => !after.tokens.has(name))
  .sort();
const goneClasses = [...before.classes]
  .filter((name) => !after.classes.has(name))
  .sort();

// Names hold only [a-z0-9-], so they go into a pattern unescaped. A name is matched whole:
// `--ds-x` must not hit inside `--ds-x-y`.
const tokenPatterns = goneTokens.map((name) => [
  name,
  new RegExp(`${name}(?![a-z0-9-])`),
]);
const classPatterns = goneClasses.map((name) => [
  name,
  new RegExp(`\\.${name}(?![a-z0-9-])`),
]);

const hits = [];
for (const file of walk(
  consumerRoot,
  new Set(['.scss', '.css', '.html', '.ts']),
)) {
  const extension = extname(file);
  const isStylesheet = extension === '.scss' || extension === '.css';
  const patterns = isStylesheet
    ? [...tokenPatterns, ...classPatterns]
    : tokenPatterns;
  if (!patterns.length) continue;
  const source = readFileSync(file, 'utf8');
  const codeLines = (isStylesheet ? stylesheetCode(source) : source).split(
    '\n',
  );
  source.split('\n').forEach((text, index) => {
    for (const [name, pattern] of patterns)
      if (pattern.test(name.startsWith('--ds-') ? text : codeLines[index]))
        hits.push({ file, line: index + 1, name });
  });
}

process.stdout.write(
  `${JSON.stringify({ goneTokens, goneClasses, hits }, null, 2)}\n`,
);
