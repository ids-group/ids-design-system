#!/usr/bin/env node
// A component that paints its own focus ring on `:focus-within` must also silence
// the base indicator on the control it speaks for. `styles/_focus.scss` gives every
// focusable a box-shadow at zero specificity, and `outline: 0` — the reset an author
// reaches for — cannot cancel a shadow, so leaving it out paints TWO rings.
//
// This existed as a hand-kept list of shells inside _focus.scss and was wrong for
// two releases: ds-input and ds-textarea were missing, and a browser sweep of 9,968
// focusable elements found them. A list nobody checks rots; this reads the code.
//
// Partials are exempt: `_field-state.scss` paints the error shadow into whichever
// shell includes it, so the obligation belongs to that component, not to the mixin.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const COMPONENTS = 'src/lib/components';
const SUPPRESSORS = ['owns-the-focus-ring', ':where(:focus-visible)'];
// A shell whose ring covers OTHER components' controls has nothing of its own to
// silence. It says so in the file — `focus-ring-guard: <reason>` — so the exemption
// is a written claim someone can argue with, not a hole in the check.
const WAIVER = /focus-ring-guard:\s*(.+)/;

const scssFilesIn = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) return scssFilesIn(full);
    return entry.endsWith('.component.scss') ? [full] : [];
  });

// A `:focus-within` selector whose block sets a box-shadow to anything but `none`.
const paintsRingOnFocusWithin = (text) => {
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes(':focus-within')) continue;
    // Walk the selector list to its `{`, then the block to its `}`.
    let cursor = index;
    while (cursor < lines.length && !lines[cursor].includes('{')) cursor += 1;
    for (let inner = cursor + 1; inner < Math.min(cursor + 12, lines.length); inner += 1) {
      if (lines[inner].includes('}')) break;
      const declaration = lines[inner].trim();
      if (declaration.startsWith('box-shadow:') && !/box-shadow:\s*none/.test(declaration)) {
        return { line: inner + 1, declaration };
      }
    }
  }
  return null;
};

// The suppressor must be CODE. Grepping the raw file counts a mention in a comment
// — including the comment that explains a waiver — and passes a shell that guards
// nothing.
const withoutComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '');

const failures = [];
const waived = [];
let shells = 0;

for (const file of scssFilesIn(COMPONENTS)) {
  const text = readFileSync(file, 'utf8');
  const painter = paintsRingOnFocusWithin(text);
  if (!painter) continue;
  shells += 1;
  const name = relative(process.cwd(), file).replace(/\\/g, '/');
  const code = withoutComments(text);
  if (SUPPRESSORS.some((needle) => code.includes(needle))) continue;
  const waiver = text.match(WAIVER);
  if (waiver) {
    waived.push(`${name.split('/').at(-1)} — ${waiver[1].replace(/\s*\*\/\s*$/, '').trim()}`);
    continue;
  }
  failures.push({ file: name, ...painter });
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(
      `check-focus-rings: ERROR  ${failure.file}:${failure.line}  paints a focus ring on :focus-within ` +
        `(${failure.declaration}) but never silences the base rule. Add ` +
        `\`@include focus.owns-the-focus-ring('<the control>')\` — a named control, not a blanket, ` +
        `so tab stops inside the box keep their own ring.`,
    );
  }
  console.error(`check-focus-rings: FAILED — ${failures.length} of ${shells} ringed shell(s) unguarded`);
  process.exit(1);
}

for (const entry of waived) {
  console.log(`check-focus-rings: waived  ${entry}`);
}
console.log(`check-focus-rings: ${shells} ringed shell(s) OK (${waived.length} waived)`);
