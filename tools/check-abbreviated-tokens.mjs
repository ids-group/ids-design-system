// The 0.13.4 spell-out wave matched `--ds-*-weight` -> `--ds-*-font-weight` and similar
// property-suffix rules, so a token spelled as the abbreviation itself (`--ds-tag-fw`) never
// matched any rule and survived. This gate closes that gap directly: no `--ds-*` name may END
// its last hyphen segment in a known abbreviation, whatever rule renamed the rest of the family.
//
// Anchored on the WHOLE LAST SEGMENT (split on "-", compare the tail exactly), not a suffix
// regex on the raw string — `--ds-field-label-text-transform` ends in the letters of no
// abbreviation here, but a naive `/w$|r$/` would also spare it only by accident. Segment
// equality is what a spelled-out property name like `-text-transform` or `-border-color`
// survives on purpose: its last segment is "transform" or "color", never "fw" or "r".
//
//   node tools/check-abbreviated-tokens.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can point at its own fixture tree instead of the real one.
const DIR = join(ROOT, process.env.DS_ABBREV_TOKEN_DIR || 'src/lib');

// Derived from AUTHORING.md's spelled-out property list and the suffixes the 0.13.4 wave
// left behind: font-weight, line-height, font-size, font-family, letter-spacing, max-width,
// max-height, min-width, padding, button, width, height, bg-color, text-color/icon-color,
// radius — each abbreviated here to the ending this gate must catch.
const ABBREVIATIONS = new Set([
  'fw',
  'lh',
  'fs',
  'ff',
  'ls',
  'maxw',
  'maxh',
  'minw',
  'pad',
  'btn',
  'w',
  'h',
  'bg',
  'fg',
  'r',
]);

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
    const last = name.split('-').pop();
    if (ABBREVIATIONS.has(last)) {
      problems.push(
        `${relative(ROOT, file)}  ${name} ends in the abbreviation "-${last}" — spell out the property it names.`,
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
  `check-abbreviated-tokens: OK — no --ds-* name under ${relative(ROOT, DIR)} ends in a known abbreviation.`,
);
