#!/usr/bin/env node
// What actually needs uploading to Claude Design, and the ready-to-send batches for it.
//
//   node tools/design-sync-upload-plan.mjs                      # since the recorded upload
//   node tools/design-sync-upload-plan.mjs --all                # the whole tree
//   node tools/design-sync-upload-plan.mjs --remote <list.json>  # + reconcile against the project
//   node tools/design-sync-upload-plan.mjs --record              # stamp after a successful upload
//
// THE COMPARISON IS LOCAL, AND THAT IS THE WHOLE POINT. `list_files` returns paths and nothing
// else — no size, no hash, no mtime — so the only way to compare content with the project is
// `get_file` per path, which pulls 6.2 MB of card HTML through the session to decide what to send.
// Uploading the entire tree blind costs 170 KB of path JSON. Reading it back to avoid that is 36×
// more expensive than not bothering. What IS cheap is git: `.design-sync/upload` is committed, so
// the diff between the last uploaded commit and HEAD is the answer for one command. Measured per
// release: 824, 433, 51 and 95 files of 1091 — the last two releases needed 5% and 9% of the tree.
//
// The pointer is the commit that last TOUCHED `upload/`, not HEAD: unrelated commits then leave the
// plan empty instead of re-sending 1091 unchanged files.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(ROOT, '.design-sync', 'upload');
const TREE_REL = '.design-sync/upload';
const POINTER = join(ROOT, '.design-sync', 'last-upload.json');
const OUT = join(ROOT, '.claude', 'local', 'design-sync-batches');
const BATCH = 250;

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const value = (name) => {
  const at = argv.indexOf(name);
  return at === -1 ? null : argv[at + 1];
};

const git = (...args) =>
  execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    // Swallowed so a deliberate probe — `merge-base --is-ancestor` on a commit that is not one —
    // reports through this script's own message instead of leaking git's fatal first.
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

const treeCommit = () => git('log', '-1', '--format=%H', '--', TREE_REL);

// ── --record: stamp what is now on the project ──────────────────────────────
if (flag('--record')) {
  const record = {
    treeCommit: treeCommit(),
    head: git('rev-parse', 'HEAD'),
    files: localFiles().length,
    uploadedAt: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
  };
  writeFileSync(POINTER, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`design-sync-upload-plan: recorded ${record.files} file(s) at ${record.treeCommit.slice(0, 8)}.`);
  process.exit(0);
}

function localFiles() {
  const out = [];
  const walk = (dir, prefix) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const rel = prefix ? `${prefix}/${entry}` : entry;
      if (statSync(full).isDirectory()) walk(full, rel);
      else out.push(rel);
    }
  };
  walk(TREE, '');
  return out.sort();
}

const local = localFiles();

// ── the tree must be committed, or the diff describes something that is not on disk ──
const dirty = git('status', '--porcelain', '--', TREE_REL);
if (dirty) {
  console.error(
    'design-sync-upload-plan: `.design-sync/upload` has uncommitted changes, so a commit-to-commit\n' +
      'diff cannot describe what is on disk. Commit the rebuilt tree first, or pass --all.',
  );
  if (!flag('--all')) process.exit(1);
}

let changed;
let basis;
if (flag('--all')) {
  changed = local;
  basis = 'the whole tree (--all)';
} else {
  const since = value('--since') ?? (existsSync(POINTER) ? JSON.parse(readFileSync(POINTER, 'utf8')).treeCommit : null);
  if (!since) {
    console.error(
      'design-sync-upload-plan: no upload has been recorded, so there is no basis for a diff.\n' +
        'Run with --all for the first upload, then --record.',
    );
    process.exit(1);
  }
  // A pointer that is not an ancestor means history moved under it; a diff against it would be a
  // guess, and a guess here means a card silently not uploaded.
  try {
    git('merge-base', '--is-ancestor', since, 'HEAD');
  } catch {
    console.error(
      `design-sync-upload-plan: the recorded commit ${since.slice(0, 8)} is not an ancestor of HEAD.\n` +
        'History moved, so the diff cannot be trusted — re-run with --all.',
    );
    process.exit(1);
  }
  const raw = git('diff', '--name-status', `${since}..HEAD`, '--', TREE_REL);
  const rows = raw ? raw.split('\n').map((line) => line.split('\t')) : [];
  const strip = (p) => p.slice(TREE_REL.length + 1);
  changed = rows.filter(([status]) => status !== 'D').map((row) => strip(row[row.length - 1])).sort();
  const deleted = rows.filter(([status]) => status === 'D').map((row) => strip(row[1]));
  basis = `${since.slice(0, 8)}..HEAD`;
  if (deleted.length) {
    console.log(
      `\n${deleted.length} path(s) the build no longer produces. \`delete_files\` is refused for a\n` +
        'non-owner, so these belong in `.design-sync/obsolete.txt` for the owner to clear:',
    );
    for (const p of deleted) console.log(`  ${p}`);
  }
}

// ── optional reconcile: anything the project is missing goes in whatever the diff said ──
const remoteArg = value('--remote');
if (remoteArg) {
  const remote = JSON.parse(readFileSync(remoteArg, 'utf8')).paths ?? [];
  const files = new Set(remote.filter((p) => p.split('/').pop().includes('.')));
  const missing = local.filter((p) => !files.has(p));
  const orphans = [...files].filter((p) => !local.includes(p)).sort();
  const added = missing.filter((p) => !changed.includes(p));
  if (added.length) {
    console.log(`\n${added.length} local file(s) absent from the project — added to the plan:`);
    for (const p of added) console.log(`  ${p}`);
    changed = [...changed, ...added].sort();
  }
  console.log(`\nreconcile: project holds ${files.size} file(s); ${orphans.length} orphan(s) it keeps and we do not.`);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const batches = [];
for (let at = 0; at < changed.length; at += BATCH) {
  const slice = changed.slice(at, at + BATCH);
  const file = join(OUT, `batch-${batches.length + 1}.json`);
  writeFileSync(file, JSON.stringify(slice.map((p) => ({ path: p, localPath: p }))));
  batches.push({ file, count: slice.length, bytes: statSync(file).size });
}

console.log(`\ndesign-sync-upload-plan: ${changed.length} of ${local.length} file(s) to send — basis ${basis}.`);
for (const b of batches) {
  console.log(`  ${b.count.toString().padStart(4)} file(s), ${b.bytes} B  ${b.file.replace(ROOT, '.')}`);
}
if (!changed.length) {
  console.log('  nothing to send.');
} else {
  console.log(
    `\nlocalDir for finalize_plan: ${TREE}\n` +
      'writes: ["**/*"] — a plan takes globs; only write_files needs one entry per file.\n' +
      'After every batch succeeds: node tools/design-sync-upload-plan.mjs --record',
  );
}
