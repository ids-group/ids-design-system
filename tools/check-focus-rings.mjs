#!/usr/bin/env node
// A component that paints its own focus ring on `:focus-within` must also silence
// the base indicator on the control it speaks for, or the field paints TWO rings.
//
// A shell rings one of two ways and BOTH have to be recognised here: the field family
// paints a `box-shadow` halo, the control family draws an outline through `focus.ring`.
// Narrow the detection to one of them and this reads green while covering half the
// library, which is the failure mode a checker cannot report about itself.
//
// Only `*.component.scss` is read. A partial like `_field-state.scss` paints its
// shadow into whichever shell includes it, so the obligation is that shell's.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const COMPONENTS = 'src/lib/components';
const SUPPRESSORS = ['owns-the-focus-ring', ':where(:focus-visible)'];
// A shell whose ring covers OTHER components' controls has nothing of its own to
// silence, and says so as `focus-ring-guard: <reason>` — an exemption that has to be
// written down and argued for.
const WAIVER = /focus-ring-guard:\s*(.+)/;

const scssFilesIn = (directory) =>
  readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    if (statSync(full).isDirectory()) return scssFilesIn(full);
    return entry.endsWith('.component.scss') ? [full] : [];
  });

const paintsRingOnFocusWithin = (text) => {
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes(':focus-within')) continue;
    let cursor = index;
    while (cursor < lines.length && !lines[cursor].includes('{')) cursor += 1;
    for (
      let inner = cursor + 1;
      inner < Math.min(cursor + 12, lines.length);
      inner += 1
    ) {
      if (lines[inner].includes('}')) break;
      const declaration = lines[inner].trim();
      const paintsShadow =
        declaration.startsWith('box-shadow:') &&
        !/box-shadow:\s*none/.test(declaration);
      const paintsOutline =
        /@include\s+focus\.ring\b/.test(declaration) ||
        (declaration.startsWith('outline:') &&
          !/outline:\s*(none|0)\b/.test(declaration));
      if (paintsShadow || paintsOutline) {
        return { line: inner + 1, declaration };
      }
    }
  }
  return null;
};

// The suppressor must be CODE: grepping the raw file counts a mention inside a
// comment — the waiver's own reason names the mixin — and passes a shell guarding
// nothing.
const withoutComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '');

// The second failure this file exists for, and the one that shipped to a consumer:
// a focus rule that turns the outline OFF and puts nothing in its place. Killing the
// base indicator to make room for a border tint leaves an indicator one pixel thick,
// under the WCAG 2.4.13 floor of a 2px perimeter — and a tint on a field that already
// draws that border leaves no change at all.
//
// A bare control inside a shell is the legitimate case: it silences itself BECAUSE the
// shell rings for it. That is what `owns-the-focus-ring` is for, so say it with the
// mixin rather than a hand-written `outline: none` the checker cannot tell apart.
const killsTheOutlineAndPaintsNothing = (text) => {
  const lines = text.split(/\r?\n/);
  const found = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!/:focus(-visible|-within)?\b/.test(lines[index])) continue;
    if (!lines[index].includes('{')) continue;
    let depth = 0;
    let killsOutline = false;
    let paints = false;
    let end = index;
    for (let inner = index; inner < lines.length; inner += 1) {
      depth += (lines[inner].match(/\{/g) ?? []).length;
      depth -= (lines[inner].match(/\}/g) ?? []).length;
      const declaration = lines[inner].trim();
      if (/outline:\s*(none|0)\b/.test(declaration)) killsOutline = true;
      if (
        /@include\s+focus\.ring\b/.test(declaration) ||
        (declaration.startsWith('outline:') &&
          !/outline:\s*(none|0)\b/.test(declaration)) ||
        (declaration.startsWith('box-shadow:') &&
          !/box-shadow:\s*none/.test(declaration)) ||
        declaration.startsWith('&::after') ||
        declaration.startsWith('&::before')
      ) {
        paints = true;
      }
      end = inner;
      if (depth <= 0 && inner > index) break;
    }
    if (killsOutline && !paints) found.push({ line: index + 1, declaration: lines[index].trim(), end });
  }
  return found;
};

const failures = [];
const unindicated = [];
const waived = [];
let shells = 0;

for (const file of scssFilesIn(COMPONENTS)) {
  const text = readFileSync(file, 'utf8');
  const name0 = relative(process.cwd(), file).replace(/\\/g, '/');
  const code0 = withoutComments(text);
  if (!code0.includes('owns-the-focus-ring') && !WAIVER.test(text)) {
    for (const site of killsTheOutlineAndPaintsNothing(code0)) {
      unindicated.push({ file: name0, ...site });
    }
  }
  const painter = paintsRingOnFocusWithin(text);
  if (!painter) continue;
  shells += 1;
  const name = relative(process.cwd(), file).replace(/\\/g, '/');
  const code = withoutComments(text);
  if (SUPPRESSORS.some((needle) => code.includes(needle))) continue;
  const waiver = text.match(WAIVER);
  if (waiver) {
    waived.push(
      `${name.split('/').at(-1)} — ${waiver[1].replace(/\s*\*\/\s*$/, '').trim()}`,
    );
    continue;
  }
  failures.push({ file: name, ...painter });
}

if (unindicated.length > 0) {
  for (const site of unindicated) {
    console.error(
      `check-focus-rings: ERROR  ${site.file}:${site.line}  \`${site.declaration}\` turns the outline ` +
        `off and paints no indicator in its place. Either paint one with ` +
        `\`@include focus.ring\`, or — if a shell rings for this control — say so with ` +
        `\`@include focus.owns-the-focus-ring('<the control>')\` so the intent is readable.`,
    );
  }
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
  console.error(
    `check-focus-rings: FAILED — ${failures.length} of ${shells} ringed shell(s) unguarded`,
  );
}

if (failures.length > 0 || unindicated.length > 0) {
  if (unindicated.length > 0) {
    console.error(
      `check-focus-rings: FAILED — ${unindicated.length} focus rule(s) leave the control with no indicator`,
    );
  }
  process.exit(1);
}

for (const entry of waived) {
  console.log(`check-focus-rings: waived  ${entry}`);
}
console.log(
  `check-focus-rings: ${shells} ringed shell(s) OK (${waived.length} waived)`,
);
