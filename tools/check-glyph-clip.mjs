#!/usr/bin/env node
// Every box in the library that clips the block axis cuts the glyphs of any text that reaches its
// edge, by an amount that depends on the font the consumer sets. So a stylesheet may clip the
// block axis only through `styles/_text-clip.scss` (`inline-axis`, `single-line-ellipsis`,
// `line-clamp`), or with a waiver that says why no text can reach the edge:
//
//   // glyph-clip-guard: <reason>     on the line, or on one of the three lines above it
//
// Flagged: `overflow` whose block-axis value is `hidden` or `clip` (the second value of the
// shorthand, else the only one), `overflow-y` / `overflow-block` set to either, and a hand-written
// `line-clamp`. Read: every `.scss` under src/lib, and every `.ts` there for inline styles,
// `cssText` and `style.overflow*` assignments.
//
//   node tools/check-glyph-clip.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can point at its own fixture tree instead of the real one.
const DIR = join(ROOT, process.env.DS_GLYPH_CLIP_DIR || 'src/lib');
const MIXINS = join(ROOT, 'src/lib/styles/_text-clip.scss');
const WAIVER = /glyph-clip-guard:[ \t]*[^\s*/]/;
const CLIPS = new Set(['hidden', 'clip']);

const files = (path) =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((entry) => files(join(path, entry)))
    : /\.(scss|ts)$/.test(path) && !path.endsWith('.spec.ts')
      ? [path]
      : [];

// Comments are blanked rather than removed so line numbers stay true.
const withoutComments = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:'"])\/\/.*$/gm, '$1');

const offences = (line) => {
  const found = [];
  for (const match of line.matchAll(
    /(?<![-\w])overflow\s*:\s*([a-z-]+)(?:\s+([a-z-]+))?/g,
  )) {
    if (CLIPS.has(match[2] ?? match[1])) found.push(match[0]);
  }
  for (const match of line.matchAll(
    /overflow-(?:y|block)\s*:\s*(hidden|clip)\b/g,
  ))
    found.push(match[0]);
  for (const match of line.matchAll(
    /\.style\.overflow(?:Y|Block)?\s*=\s*['"`](hidden|clip)['"`]/g,
  ))
    found.push(match[0]);
  for (const match of line.matchAll(/(?<![\w-])(?:-webkit-)?line-clamp\s*:/g))
    found.push(match[0]);
  return found;
};

let checked = 0;
let waived = 0;
const problems = [];
for (const file of files(DIR)) {
  if (file === MIXINS) continue;
  const raw = readFileSync(file, 'utf8').split(/\r?\n/);
  const code = withoutComments(raw.join('\n')).split('\n');
  code.forEach((line, index) => {
    for (const declaration of offences(line)) {
      checked += 1;
      const context = raw.slice(Math.max(0, index - 3), index + 1).join('\n');
      if (WAIVER.test(context)) {
        waived += 1;
        continue;
      }
      problems.push(
        `${relative(ROOT, file).replace(/\\/g, '/')}:${index + 1}  ${declaration.trim()}`,
      );
    }
  });
}

if (problems.length) {
  console.error(
    `check-glyph-clip: ${problems.length} declaration(s) clip the block axis outside styles/_text-clip.scss.\n` +
      `A vertical clip cuts the ascenders and descenders of any font taller than the line box. Use\n` +
      `text-clip.inline-axis / single-line-ellipsis / line-clamp, or write why no text reaches the edge\n` +
      `as "glyph-clip-guard: <reason>" on the line or the three above it.\n  ${problems.join('\n  ')}`,
  );
  process.exit(1);
}
console.log(
  `check-glyph-clip: OK - ${checked} block-axis clip(s) outside the mixins, every one waived with a reason (${waived}).`,
);
