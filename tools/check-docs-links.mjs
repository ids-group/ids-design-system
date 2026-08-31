//
// Every internal link in ds-docs, resolved against NAV. It exists because a wrong
// one is INVISIBLE: `:area/:anchor` matches any pair, so a link to a group path or
// a renamed anchor is a route HIT with nothing to render, and `SectionGroupPage`
// then redirects home with `replaceUrl` — no 404, no console error, and the
// address bar keeps no trace. Eight links shipped wrong that way (2026-08-21):
// one bounced home, seven named a `fragment` that an area redirect silently drops.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_SRC = join(ROOT, 'ds-docs/src');
const NAV_CONFIG = join(DOCS_SRC, 'app/core/nav.config.ts');

// NAV is TypeScript, so it is read as text rather than imported: the alternative
// is compiling it, and this script runs before the build it is guarding.
function readNav() {
  const text = readFileSync(NAV_CONFIG, 'utf8');
  const groups = [];
  const groupPattern =
    /\{\s*\n\s*title: '((?:[^']|\\')*)',\s*\n\s*path: '([^']*)',/g;
  let match;
  while ((match = groupPattern.exec(text)) !== null) {
    const [, title, path] = match;
    const itemsStart = text.indexOf('items: [', match.index);
    if (itemsStart === -1) continue;
    const itemsEnd = text.indexOf('],', itemsStart);
    const anchors = [
      ...text.slice(itemsStart, itemsEnd).matchAll(/anchor: '([^']+)'/g),
    ].map(([, anchor]) => anchor);
    groups.push({ title, path, area: path.split('/')[0], anchors });
  }

  return groups;
}

function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...htmlFiles(full));
    else if (entry.endsWith('.html')) out.push(full);
  }

  return out;
}

const groups = readNav();
if (groups.length === 0) {
  console.error(
    'check-docs-links: parsed NAV as empty — the config shape changed.',
  );
  process.exit(1);
}

const areas = new Set(groups.map((group) => group.area));
const anchorsByArea = new Map();
for (const group of groups) {
  const known = anchorsByArea.get(group.area) ?? new Set();
  for (const anchor of group.anchors) known.add(anchor);
  anchorsByArea.set(group.area, known);
}
const groupPaths = new Set(groups.map((group) => group.path));

const problems = [];
for (const file of htmlFiles(DOCS_SRC)) {
  const text = readFileSync(file, 'utf8');
  const where = relative(ROOT, file).replace(/\\/g, '/');

  // A `fragment` beside a routerLink is a silent no-op: the area redirect drops it,
  // so the reader lands on the group's first section instead of the named one.
  // `[^<>]` so the scan cannot cross into the NEXT element and blame the wrong link.
  for (const [, link] of text.matchAll(
    /routerLink="(\/[^"]*)"[^<>]{0,200}?fragment="([^"]+)"/g,
  )) {
    problems.push(
      `${where}: routerLink="${link}" carries a \`fragment\` — an area redirect drops it. Use /<area>/<anchor> instead.`,
    );
  }

  for (const [, link] of text.matchAll(/routerLink="(\/[^"]*)"/g)) {
    const [area, anchor, ...rest] = link.replace(/^\//, '').split('/');
    if (area === '' || area === 'changelog') continue;
    if (rest.length > 0) {
      problems.push(
        `${where}: routerLink="${link}" has more than two segments — routes are flat /<area>/<anchor>.`,
      );
      continue;
    }
    if (!areas.has(area)) {
      problems.push(
        `${where}: routerLink="${link}" — no NAV group lives under area '${area}'.`,
      );
      continue;
    }
    // A bare area is legal: app.routes.ts redirects it to the first group's landing.
    if (anchor === undefined) continue;
    if (anchorsByArea.get(area)?.has(anchor)) continue;
    const hint = groupPaths.has(`${area}/${anchor}`)
      ? ` '${anchor}' is a GROUP path, not an anchor — the route matches and the page redirects home. Use an anchor from that group.`
      : ` '${anchor}' is not an anchor in NAV under '${area}'.`;
    problems.push(`${where}: routerLink="${link}" —${hint}`);
  }
}

if (problems.length > 0) {
  console.error(`check-docs-links: ${problems.length} bad link(s).`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

const anchorCount = [...anchorsByArea.values()].reduce(
  (total, set) => total + set.size,
  0,
);
console.log(
  `check-docs-links: OK — every routerLink resolves (${groups.length} groups, ${anchorCount} anchors).`,
);
