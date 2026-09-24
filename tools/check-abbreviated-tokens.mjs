// The 0.13.4 spell-out wave matched `--ds-*-weight` -> `--ds-*-font-weight` and similar
// property-suffix rules, so a token spelled as the abbreviation itself (`--ds-tag-fw`) never
// matched any rule and survived. This gate closes that gap directly: no `--ds-*` name may carry
// a known abbreviation as its last segment or as any middle segment, whatever rule renamed the
// rest of the family.
//
// Two rules, not one list: a short LAST segment (<= 2 letters, other than the x/y axis suffixes)
// catches an abbreviation this file has never seen named, and the ANY_SEGMENT blacklist catches
// a longer abbreviation (bw, maxw, pad, btn) wherever it sits. bg/fg/size words/heading levels
// stay legal mid-name (`bg-color`, `-xs`, `-h3-`) because the short-segment rule is last-segment
// only.
//
//   node tools/check-abbreviated-tokens.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can point at its own fixture tree instead of the real one.
const DIR = join(ROOT, process.env.DS_ABBREV_TOKEN_DIR || 'src/lib');

// Token names spell out the CSS property they set (CHANGELOG 0.13.4, "118 --ds-* tokens take
// their CSS property's name"). A name fails when its LAST segment is one or two letters other
// than the axis suffixes x/y (fw, lh, bw, bg, fg, w, h, r and any future two-letter shape), or a
// truncated dimension, or when ANY segment is one of the abbreviations that wave replaced.
// bg stays legal mid-name: `bg-color` is the convention, and sizes (xs, s, m, l) and heading
// levels (h1..h5) are real middle segments, so the short-segment rule is last-segment only.
const AXIS = new Set(['x', 'y']);
const LAST_ONLY = new Set(['max', 'min', 'maxw', 'maxh', 'minw', 'pad', 'btn']);
const ANY_SEGMENT = new Set([
  'fw',
  'lh',
  'fs',
  'ff',
  'ls',
  'bw',
  'maxw',
  'maxh',
  'minw',
  'pad',
  'btn',
  'w',
  'h',
  'r',
]);

const abbreviationIn = (name) => {
  const segments = name.toLowerCase().split('-').filter(Boolean).slice(1); // drop the "ds" prefix
  const last = segments.at(-1) ?? '';
  if ((last.length <= 2 && !AXIS.has(last)) || LAST_ONLY.has(last)) return last;
  return segments.slice(0, -1).find((segment) => ANY_SEGMENT.has(segment)) ?? null;
};

const filesUnder = (dir) => {
  const found = [];
  const walk = (at) => {
    for (const entry of readdirSync(at)) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      const path = join(at, entry);
      if (statSync(path).isDirectory()) walk(path);
      else found.push(path);
    }
  };
  if (existsSync(dir)) walk(dir);
  return found;
};

const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/[^\n]*/g, '$1');

const sources = filesUnder(DIR).filter((f) => /\.(scss|css|ts|html)$/.test(f));

const problems = [];
for (const file of sources) {
  const text = stripComments(readFileSync(file, 'utf8'));
  const seen = new Set();
  for (const [, name] of text.matchAll(/(--ds-[a-z0-9-]+)/gi)) {
    if (seen.has(name)) continue;
    seen.add(name);
    const hit = abbreviationIn(name);
    if (hit) {
      problems.push(
        `${relative(ROOT, file)}  ${name} carries the abbreviation "-${hit}" - spell out the property it names.`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(
    `check-abbreviated-tokens: ${problems.length} abbreviated --ds-* name(s).\n\n${[...new Set(problems)].join('\n')}\n`,
  );
  process.exit(1);
}

console.log(
  `check-abbreviated-tokens: OK - no --ds-* name under ${relative(ROOT, DIR)} carries a known abbreviation.`,
);
