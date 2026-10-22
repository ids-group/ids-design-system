// A disk cache for what a release tag's tree yields. A tag is immutable, and the audits read up
// to 49 of them per run, where the `git cat-file` behind each read is most of the wall time.
//
// An entry is keyed by the tag's TREE sha, never its name, so a re-pointed tag misses on its own,
// and by the caller's `parts`: the source of the code that builds the value, so editing the
// reader invalidates what it wrote. A Set or a Map is stored tagged and revived as one, so a
// parsed surface comes back with the types it was built with. Only a ref under `refs/tags/` is
// cached; HEAD, a branch and the working tree always go to `build`.
//
//   DS_TAG_CACHE=off       bypass the cache entirely
//   DS_TAG_CACHE_DIR=path  keep entries elsewhere (the selftest uses a throwaway directory)
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCHEMA = 1;

let tagTrees = null;
function treeOfTag(tag) {
  if (!tagTrees) {
    tagTrees = new Map();
    try {
      // `%(*tree)` peels an annotated tag, `%(tree)` answers for a lightweight one.
      for (const line of execFileSync(
        'git',
        [
          '-C',
          ROOT,
          'for-each-ref',
          'refs/tags',
          '--format=%(refname:strip=2) %(tree) %(*tree)',
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      ).split('\n')) {
        const [name, tree, peeledTree] = line.trim().split(/\s+/);
        if (name && (peeledTree || tree))
          tagTrees.set(name, peeledTree || tree);
      }
    } catch {
      // No git, no tags: nothing is cached and every read goes to `build`.
    }
  }
  return tagTrees.get(tag) ?? null;
}

const encode = (key, value) =>
  value instanceof Set
    ? { $set: [...value] }
    : value instanceof Map
      ? { $map: [...value] }
      : value;
const decode = (key, value) =>
  value?.$set ? new Set(value.$set) : value?.$map ? new Map(value.$map) : value;

// `build` returning null or undefined is a read that failed, and is not stored.
export function cachedAtTag(tag, parts, build) {
  if (process.env.DS_TAG_CACHE === 'off') return build();
  const tree = treeOfTag(tag);
  if (!tree) return build();
  const key = createHash('sha256')
    .update(JSON.stringify([SCHEMA, tree, ...parts]))
    .digest('hex');
  const directory =
    process.env.DS_TAG_CACHE_DIR ??
    join(ROOT, 'node_modules/.cache/ds-tag-surfaces');
  const file = join(directory, `${key}.json`);
  try {
    const entry = JSON.parse(readFileSync(file, 'utf8'), decode);
    if (entry?.key === key && 'value' in entry) return entry.value;
  } catch {
    // Missing or unreadable: rebuilt below and overwritten, never trusted.
  }
  const value = build();
  if (value == null) return value;
  // Written beside the entry and renamed into place, so a parallel reader sees the whole entry or
  // none of it.
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  try {
    mkdirSync(directory, { recursive: true });
    writeFileSync(temporary, JSON.stringify({ key, value }, encode));
    renameSync(temporary, file);
  } catch {
    // Another process renamed the same entry in first (Windows refuses a rename over an open file).
    rmSync(temporary, { force: true });
  }
  return value;
}
