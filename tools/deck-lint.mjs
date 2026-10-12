#!/usr/bin/env node
// Are the decks in presentations/ telling the truth about themselves? A deck is a
// snapshot of a question and has no way to update itself when the answer arrives, so
// every claim it makes about its own state rots silently — nothing renders red, and
// the folder quietly stops meaning anything.
//
// Every rule below is a defect that actually shipped. 2026-09-01, one pass:
// banner-toast-icon-alignment carried no status marker and no rank (D001/D006);
// packaging-entry-points recommended an option proved unbuildable, which its evidence
// line did not say (D013 is the closest mechanical guard); and ten decks referenced
// four tokens the DS does not define — --space-7, --border-subtle, --shadow-md,
// --shadow-lg — none with a usable fallback, so each one voided its whole shorthand
// and the h2 margins, two borders and a shadow were never applied at all (D012).
//
//   node tools/deck-lint.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Overridable so the selftest can write its fixtures into a private copy. Writing them into the
// tracked directory turned this very gate red in a concurrent session, and a crash left a
// `selftest-*.html` behind that `git add -A` would stage.
const DECKS = process.env.DS_DECKS_DIR || join(ROOT, 'presentations');
const ARCHIVE = join(DECKS, 'implemented');
const STATUSES = ['open', 'implemented', 'tool'];

const problems = [];
const fail = (code, where, text) => problems.push(`${code} ${where}: ${text}`);

const meta = (html, name) =>
  html.match(
    new RegExp(`name=["']ds-deck-${name}["']\\s+content=["']([^"']*)["']`),
  )?.[1];

const decksIn = (dir) =>
  readdirSync(dir)
    .filter((entry) => entry.endsWith('.html'))
    .map((entry) => join(dir, entry));

// A token reference only has to resolve when nothing else can supply it: a fallback
// keeps the declaration alive (that is the deck-local override-slot idiom), the deck
// may declare it, a generated deck sets its own from script, and a name inside a CSS
// comment is documentation rather than a reference. What is left is a name the browser
// cannot resolve to anything, which kills the whole declaration.
function unresolvableTokens(html, stylesheet) {
  const prose = html
    .replace(/<pre[\s\S]*?<\/pre>/g, '')
    .replace(/<code[\s\S]*?<\/code>/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const scripted = new Set(
    [...html.matchAll(/setProperty\(\s*['"](--[a-z0-9-]+)/g)].map(
      ([, token]) => token,
    ),
  );
  const referenced = new Set(
    [...prose.matchAll(/var\((--[a-z0-9-]+)\s*\)/g)].map(([, token]) => token),
  );

  return [...referenced].filter(
    (token) =>
      !scripted.has(token) &&
      !html.includes(`${token}:`) &&
      !stylesheet.includes(`${token}:`),
  );
}

const stylesheet = existsSync(join(DECKS, 'ds.css'))
  ? readFileSync(join(DECKS, 'ds.css'), 'utf8')
  : '';
if (stylesheet === '') {
  console.error(
    'deck-lint: presentations/ds.css is missing — run build:deck-css.',
  );
  process.exit(1);
}

const ranks = new Map();

for (const dir of [DECKS, ARCHIVE]) {
  const archived = dir === ARCHIVE;
  for (const file of decksIn(dir)) {
    const html = readFileSync(file, 'utf8');
    const name = basename(file);
    const where = relative(ROOT, file).replace(/\\/g, '/');
    const status = meta(html, 'status');
    const evidence = meta(html, 'evidence');
    const rank = name.match(/^(\d+)-/)?.[1];

    // The single-pick snippet decks copy: assigning the clicked card outright leaves no way to
    // clear a stray pick, and the answer line then reports a choice nobody made.
    if (status === 'open' && /picked = card\.dataset\.key;/.test(html)) {
      fail(
        'D016',
        where,
        'a pick that a second click cannot clear; toggle it: `picked = picked === card.dataset.key ? null : card.dataset.key`.',
      );
    }

    if (!/<title>[^<]+<\/title>/.test(html)) {
      fail(
        'D015',
        where,
        'no <title> — the tab and every listing show a filename.',
      );
    }

    if (status === undefined) {
      fail(
        'D001',
        where,
        `no ds-deck-status marker. Add one of ${STATUSES.join('/')}, and an evidence line if it is implemented.`,
      );
      continue;
    }
    if (!STATUSES.includes(status)) {
      fail(
        'D002',
        where,
        `ds-deck-status="${status}" is not one of ${STATUSES.join('/')}.`,
      );
      continue;
    }

    if (!archived && status === 'implemented') {
      fail(
        'D003',
        where,
        'claims implemented but sits at root — move it to presentations/implemented/.',
      );
    }
    if (archived && status !== 'implemented') {
      fail('D004', where, `sits in implemented/ but claims "${status}".`);
    }
    if (status === 'implemented' && !evidence) {
      fail(
        'D005',
        where,
        'implemented with no ds-deck-evidence — the README treats that as open, so the folder stops meaning anything.',
      );
    }

    if (!archived && status === 'open' && rank === undefined) {
      fail(
        'D006',
        where,
        'an open deck is <rank>-<slug>.html — the folder listing is the priority queue.',
      );
    }
    if (archived && rank !== undefined) {
      fail(
        'D009',
        where,
        'an archived deck keeps no rank — the number is a queue position, and this one has left the queue.',
      );
    }
    // A `tool` may carry a rank or not: one read whenever rather than at a moment takes none.
    // Either way a rank that exists joins the one contiguous run, so a gap means a rename somebody
    // left half-done.
    if (!archived && rank !== undefined) {
      const clash = ranks.get(rank);
      if (clash)
        fail('D007', where, `rank ${rank} is already taken by ${clash}.`);
      else ranks.set(rank, name);
    }

    const linksStylesheet = /href=["'][^"']*ds\.css["']/.test(html);
    if (linksStylesheet) {
      const relativePath = /href=["']\.\.\/ds\.css["']/.test(html);
      if (archived && !relativePath) {
        fail(
          'D010',
          where,
          'links ds.css but sits one directory deeper — it needs ../ds.css, or it renders in the sans-serif fallback.',
        );
      }
      if (!archived && relativePath) {
        fail('D011', where, 'links ../ds.css from the root folder.');
      }

      for (const token of unresolvableTokens(html, stylesheet)) {
        fail(
          'D012',
          where,
          `var(${token}) resolves to nothing — no fallback, not declared here, not in ds.css. The whole declaration is dropped.`,
        );
      }
    }

    for (const cited of evidence?.match(
      /[\w./-]+\.(?:md|scss|ts|html|json|mjs)/g,
    ) ?? []) {
      const candidates = [
        join(ROOT, cited),
        join(DECKS, cited),
        join(ARCHIVE, cited),
      ];
      const bare = !cited.includes('/');
      if (candidates.some(existsSync)) continue;
      // A bare filename is a symbol, not a path: "_interaction.scss absent" is the
      // evidence itself on the deck that argues for creating it.
      if (bare) continue;
      fail(
        'D013',
        where,
        `ds-deck-evidence cites ${cited}, which does not exist.`,
      );
    }
  }
}

const sorted = [...ranks.keys()].map(Number).sort((a, b) => a - b);
sorted.forEach((rank, index) => {
  if (rank !== index + 1) {
    fail(
      'D008',
      'presentations/',
      `ranks are not a contiguous 1..N run — found ${sorted.join(', ')}.`,
    );
  }
});

if (problems.length > 0) {
  console.error(`deck-lint: ${problems.length} problem(s).`);
  for (const problem of [...new Set(problems)]) console.error(`  ${problem}`);
  process.exit(1);
}

const total = decksIn(DECKS).length + decksIn(ARCHIVE).length;
console.log(
  `deck-lint: OK — ${total} decks, ${sorted.length} ranked open, every marker, rank, path and token resolves.`,
);
