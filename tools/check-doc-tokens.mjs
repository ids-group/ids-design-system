// `components.md` is the agent-facing catalogue, and it is copied into the published tarball. A
// token named there that the library does not declare is worse than a missing one: an override of
// a name nothing reads still parses and cascades, so it changes nothing and reports nothing.
//
// Three such names lived through four releases. 0.12.1 removed thirteen
// `--ds-<component>-focus-shadow` tokens and documented the removal properly — a `removed-api`
// manifest item and a CHANGELOG paragraph — but the catalogue kept listing button's, icon-button's
// and card's, so an agent writing consumer code against the docs set a hook with no rule behind it.
//
// Two rules earn their keep, measured against this repo on 2026-09-15: without the second the
// sweep reports 9 hits for 3 defects.
//   1. A public hook is CONSULTED, never declared: the sources read `var(--ds-button-radius, …)`
//      inside a private `--_button-radius:`. So a name is real when it appears anywhere in the
//      library, not when something declares it — scanning declarations alone reports 150 hits,
//      every public token in the catalogue.
//   2. Prose writes prefixes, not names: `--ds-card-...`, `--ds-xxx-…`, `--ds-table-head-*`. A
//      match ending in `-` is a placeholder and is not a claim that the token exists.
//
// Known limit: only names spelled in full are checked. `--ds-table-head-*` covers real tokens and
// could also cover removed ones, and this gate cannot tell.
//
//   node tools/check-doc-tokens.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can point at its own fixture tree instead of the real one.
const SOURCE_DIR = join(ROOT, process.env.DS_DOC_TOKEN_SOURCE_DIR || 'src');
const DOC_FILES = (process.env.DS_DOC_TOKEN_DOCS || 'components.md')
  .split(',')
  .map((file) => join(ROOT, file.trim()))
  .filter(existsSync);

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

const known = new Set();
for (const file of filesUnder(SOURCE_DIR).filter((f) =>
  /\.(scss|css|ts|html)$/.test(f),
)) {
  for (const [, token] of readFileSync(file, 'utf8').matchAll(
    /(--ds-[\w-]+)/g,
  )) {
    known.add(token);
  }
}

const problems = [];
for (const doc of DOC_FILES) {
  readFileSync(doc, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const [, token] of line.matchAll(/(--ds-[\w-]+)/g)) {
        // Rule 2: a trailing hyphen means the doc wrote a prefix, not a name.
        if (token.endsWith('-')) continue;
        if (known.has(token)) continue;
        problems.push(
          `${relative(ROOT, doc)}:${index + 1}  ${token} is documented and named nowhere in the library — an override of it parses, cascades and changes nothing.`,
        );
      }
    });
}

if (problems.length > 0) {
  console.error(
    `check-doc-tokens: ${problems.length} documented token(s) the library does not name.\n\n${[...new Set(problems)].join('\n')}\n`,
  );
  process.exit(1);
}

console.log(
  `check-doc-tokens: OK — every --ds-* named in ${DOC_FILES.length} doc(s) resolves against ${known.size} names the library uses.`,
);
