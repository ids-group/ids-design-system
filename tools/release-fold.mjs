// A stable release absorbs every prerelease cut since the last stable one: their CHANGELOG blocks
// and migration manifests MOVE into the stable version's own, so a consumer stepping from one stable
// to the next (the auto-update plugin skips prereleases) reads every change in one block and one
// manifest, and nothing is listed twice.
import { sectionSlot } from './changelog-sections.mjs';

const PRERELEASE_HEADING = /^## (\d+\.\d+\.\d+-[0-9A-Za-z.-]+) — /;

function splitSections(lines) {
  const preamble = [];
  const sections = [];
  for (const line of lines) {
    const heading = /^### (.+)$/.exec(line);
    if (heading) sections.push({ name: heading[1].trim(), lines: [] });
    else (sections.at(-1)?.lines ?? preamble).push(line);
  }
  return { preamble, sections };
}

const trimBlank = (lines) => lines.join('\n').replace(/^\n+|\n+$/g, '');

// `bodies` newest first. Sections take the changelog's slot order, an unknown heading after the
// known ones; within a section the newer entries stay on top, as they would have in one Unreleased
// written over the whole cycle.
function mergeBodies(bodies) {
  const preamble = [];
  const order = [];
  const byName = new Map();
  for (const body of bodies) {
    const parsed = splitSections(body);
    const text = trimBlank(parsed.preamble);
    if (text) preamble.push(text);
    for (const section of parsed.sections) {
      if (!byName.has(section.name)) {
        byName.set(section.name, []);
        order.push(section.name);
      }
      const text = trimBlank(section.lines);
      if (text) byName.get(section.name).push(text);
    }
  }
  const rank = (name) => sectionSlot(name) ?? Infinity;
  order.sort((a, b) => rank(a) - rank(b));
  const parts = [...preamble];
  for (const name of order) parts.push(`### ${name}`, ...byName.get(name));
  return parts.join('\n\n');
}

// The release stamp leaves `## Unreleased` empty, so an entry under it marks a tree past its release.
export function unreleasedHasEntry(text) {
  const section =
    text
      .replace(/\r\n/g, '\n')
      .split(/^## Unreleased$/m)[1]
      ?.split(/^## /m)[0] ?? '';
  return /^\s*-\s+\S/m.test(section);
}

// `text` has already been stamped: `## <version> — <date>` directly under `## Unreleased`.
// Returns the text with the prerelease blocks right below that block merged into it.
export function foldChangelog(text, version) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.startsWith(`## ${version} — `));
  if (start < 0) throw new Error(`no stamped '## ${version}' heading`);
  const headingAt = [];
  let fenced = false;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*```/.test(lines[i])) fenced = !fenced;
    if (!fenced && lines[i].startsWith('## ')) headingAt.push(i);
  }
  const folded = [];
  let end = headingAt[0] ?? lines.length;
  const bodies = [lines.slice(start + 1, end)];
  for (let h = 0; h < headingAt.length; h++) {
    const match = PRERELEASE_HEADING.exec(lines[headingAt[h]]);
    if (!match) break;
    folded.push(match[1]);
    end = headingAt[h + 1] ?? lines.length;
    bodies.push(lines.slice(headingAt[h] + 1, end));
  }
  if (!folded.length) return { text, folded };
  const merged = mergeBodies(bodies);
  const rest = lines.slice(end).join('\n');
  const head = lines.slice(0, start + 1).join('\n');
  return { text: `${head}\n\n${merged}\n\n${rest}`, folded };
}

// `manifests` oldest first, the draft (if any) last. Item ids must stay unique across the cycle.
export function foldManifests(version, manifests) {
  const result = { version, items: [], informational: [], deleteList: [] };
  for (const manifest of manifests) {
    for (const key of Object.keys(manifest)) {
      if (key === 'version') continue;
      if (!Array.isArray(manifest[key]) || !(key in result))
        throw new Error(`cannot fold the manifest key "${key}"`);
      result[key].push(...manifest[key]);
    }
  }
  for (const key of ['items', 'deleteList']) {
    const seen = new Set();
    for (const entry of result[key]) {
      if (seen.has(entry.id))
        throw new Error(
          `${key} id "${entry.id}" appears in two manifests of this cycle`,
        );
      seen.add(entry.id);
    }
  }
  // The folded files are deleted, so a reference into one now resolves in this manifest.
  const folded = new Set(manifests.map((manifest) => manifest.version));
  for (const item of result.items) {
    if (!item.supersedes) continue;
    item.supersedes = item.supersedes.map((reference) => {
      const [from, id] = String(reference).split('#');
      return folded.has(from) ? `${version}#${id}` : reference;
    });
  }
  return result;
}
