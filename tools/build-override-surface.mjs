#!/usr/bin/env node
// Runs after `ng build ds` (as part of `build:lib`, from `build-schematics.mjs`) to record what
// the just-built package ACTUALLY reads: every `--ds-*` custom property consulted anywhere in its
// compiled output, and every class each `ds-*` component's compiled styles/template render. The
// `check-overrides` schematic ships this as data so it never has to parse a consumer's installed
// package on its own.
//
//   node tools/build-override-surface.mjs
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist/ds');

const filesUnder = (dir, filter) => {
  const found = [];
  const walk = (at) => {
    for (const entry of readdirSync(at)) {
      const path = join(at, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (filter(path)) found.push(path);
    }
  };
  if (existsSync(dir)) walk(dir);
  return found;
};

const fesmFiles = filesUnder(join(DIST, 'fesm2022'), (f) => f.endsWith('.mjs'));

// Every --ds-* mentioned anywhere in the compiled output is a name the library reads somewhere —
// public tokens are consulted as `var(--ds-x, ...)` inside a private `--_x:` declaration, never
// declared bare, so a scan for declarations alone would find nothing.
const tokens = new Set();
for (const file of [
  ...fesmFiles,
  ...filesUnder(join(DIST, 'styles'), () => true),
  ...filesUnder(join(DIST, 'themes'), () => true),
]) {
  for (const [, token] of readFileSync(file, 'utf8').matchAll(/(--ds-[a-z0-9-]+)/g)) {
    // A trailing hyphen is a prefix written in prose, never a real declared name.
    if (!token.endsWith('-')) tokens.add(token);
  }
}

// One JS string is one array element inside `styles: [ ... ]` — matched with the same
// escape-aware pattern used to slice the enclosing declare-call object, so a literal `]` or `}`
// in compiled CSS (`.button[disabled]`, `@media (...){...}`) never truncates the read early.
const JS_STRING = /"(?:[^"\\]|\\.)*"/g;

function sliceBalanced(text, startIndex, open, close) {
  let depth = 0;
  let inString = false;
  let stringDelim = '';
  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    if (inString) {
      if (char === '\\') { i++; continue; }
      if (char === stringDelim) inString = false;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      stringDelim = char;
      continue;
    }
    if (char === open) depth++;
    else if (char === close) {
      depth--;
      if (depth === 0) return text.slice(startIndex, i + 1);
    }
  }
  return null;
}

function classesFromStyles(cssText) {
  const withoutUrls = cssText.replace(/url\([^)]*\)/g, '');
  const classes = new Set();
  for (const [, name] of withoutUrls.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    classes.add(name);
  }
  return classes;
}

function classesFromTemplate(templateText) {
  const classes = new Set();
  for (const [, list] of templateText.matchAll(/\bclass="((?:[^"\\]|\\.)*)"/g)) {
    for (const name of list.split(/\s+/).filter(Boolean)) classes.add(name);
  }
  return classes;
}

const classesBySelector = {};
const CALL_MARKER = 'ɵɵngDeclareComponent(';
for (const file of fesmFiles) {
  const text = readFileSync(file, 'utf8');
  let searchFrom = 0;
  for (;;) {
    const markerIndex = text.indexOf(CALL_MARKER, searchFrom);
    if (markerIndex === -1) break;
    const objectStart = text.indexOf('{', markerIndex + CALL_MARKER.length);
    searchFrom = markerIndex + CALL_MARKER.length;
    if (objectStart === -1) continue;
    const callObject = sliceBalanced(text, objectStart, '{', '}');
    if (!callObject) continue;
    searchFrom = objectStart + callObject.length;

    const selectorMatch = callObject.match(/\bselector:\s*"((?:[^"\\]|\\.)*)"/);
    if (!selectorMatch) continue;
    const selector = selectorMatch[1].split(',')[0].trim();
    if (!selector.startsWith('ds-')) continue;

    const classes = new Set();
    const stylesKeyIndex = callObject.indexOf('styles:');
    if (stylesKeyIndex !== -1) {
      const arrayStart = callObject.indexOf('[', stylesKeyIndex);
      const stylesArray = arrayStart === -1 ? null : sliceBalanced(callObject, arrayStart, '[', ']');
      if (stylesArray) {
        for (const [raw] of stylesArray.matchAll(JS_STRING)) {
          for (const name of classesFromStyles(raw)) classes.add(name);
        }
      }
    }
    const templateMatch = callObject.match(/\btemplate:\s*"((?:[^"\\]|\\.)*)"/);
    if (templateMatch) {
      for (const name of classesFromTemplate(templateMatch[1])) classes.add(name);
    }

    classesBySelector[selector] = [...classes].sort();
  }
}

const version = JSON.parse(readFileSync(join(DIST, 'package.json'), 'utf8')).version;
const outDir = join(DIST, 'schematics/check-overrides');
mkdirSync(outDir, { recursive: true });
const surface = {
  version,
  tokens: [...tokens].sort(),
  classes: classesBySelector,
};
writeFileSync(join(outDir, 'surface.json'), JSON.stringify(surface, null, 2) + '\n');

// A parse that silently found nothing must not ship an empty surface that reports zero problems
// for every consumer forever.
if (surface.tokens.length < 500) {
  console.error(
    `build-override-surface: only ${surface.tokens.length} --ds-* token(s) found — expected 500+, so the fesm2022/styles/themes scan likely broke.`,
  );
  process.exit(1);
}
if (!surface.classes['ds-button']) {
  console.error(
    'build-override-surface: ds-button is missing from the class surface — the ɵɵngDeclareComponent scan likely broke.',
  );
  process.exit(1);
}

console.log(
  `build-override-surface: ${surface.tokens.length} token(s), ${Object.keys(surface.classes).length} component(s) -> ${outDir}/surface.json`,
);
