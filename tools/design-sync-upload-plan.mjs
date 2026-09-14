#!/usr/bin/env node
// What actually needs uploading to Claude Design, and the ready-to-send write_files batches for it.
//
//   node tools/design-sync-upload-plan.mjs                       # since the recorded upload
//   node tools/design-sync-upload-plan.mjs --all                 # the whole tree
//   node tools/design-sync-upload-plan.mjs --remote <list.json>  # + reconcile against the project
//   node tools/design-sync-upload-plan.mjs --record              # stamp after a successful upload
//
// The comparison is LOCAL and must stay local: `list_files` returns paths and nothing else — no
// size, no hash, no mtime — so comparing content means `get_file` per path, 6.2 MB through the
// session against 170 KB of path JSON for sending the whole tree blind. See COMMANDS.md.
//
// The pointer is the commit that last TOUCHED `upload/`, not HEAD, so unrelated commits leave the
// plan empty instead of re-sending 1091 unchanged files.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TREE = join(ROOT, '.design-sync', 'upload');
const TREE_REL = '.design-sync/upload';
const POINTER = join(ROOT, '.design-sync', 'last-upload.json');
const OBSOLETE = join(ROOT, '.design-sync', 'obsolete.txt');
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
    // Swallowed so the deliberate `--is-ancestor` probe reports through this script's own message
    // rather than leaking git's fatal first.
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();

const treeCommit = () => git('log', '-1', '--format=%H', '--', TREE_REL);

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

// An uncommitted tree makes a commit-to-commit diff describe something that is not on disk.
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
  // Not an ancestor means history moved under the pointer, and a guess here is a card silently
  // never uploaded.
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

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let remoteFiles = null;
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
  remoteFiles = files;
}

// The owner is the only account that can delete, so the deliverable is text they paste. Built from
// obsolete.txt intersected with what list_files still shows: a path already cleared must not be
// asked for twice, and an orphan nobody declared is a gap in the list rather than a delete request.
const declared = existsSync(OBSOLETE)
  ? readFileSync(OBSOLETE, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
  : [];
const stillThere = remoteFiles ? declared.filter((path) => remoteFiles.has(path)) : declared;
const undeclared = remoteFiles
  ? [...remoteFiles].filter((path) => !local.includes(path) && !declared.includes(path)).sort()
  : [];

if (undeclared.length) {
  console.log(`\n${undeclared.length} orphan(s) obsolete.txt does not declare — add them to it:`);
  for (const path of undeclared) console.log(`  ${path}`);
}

if (stillThere.length) {
  const request = join(OUT, 'owner-delete-request.txt');
  writeFileSync(
    request,
    `In the Claude Design project "IDS Design System", please delete these ${stillThere.length} ` +
      `files. They are cards the design system no longer produces — renamed or withdrawn — and ` +
      `only the project owner can remove them.\n\n${stillThere.map((path) => `  ${path}`).join('\n')}\n`,
  );
  console.log(
    `\n${stillThere.length} path(s) only the owner can delete — request written to\n  ` +
      request.replace(ROOT, '.'),
  );
}

const batches = [];
for (let at = 0; at < changed.length; at += BATCH) {
  const slice = changed.slice(at, at + BATCH);
  const file = join(OUT, `batch-${batches.length + 1}.json`);
  writeFileSync(file, JSON.stringify(slice.map((p) => ({ path: p, localPath: p }))));
  batches.push({ file, count: slice.length, bytes: statSync(file).size });
}

// The constraint made checkable rather than asserted: the enumeration IS the cost of an upload, so
// a plan that enumerates nearly the whole tree has bought nothing and should be replaced by --all,
// which needs no pointer to be right and cannot miss a file.
const planBytes = batches.reduce((sum, b) => sum + b.bytes, 0);
const fullBytes = JSON.stringify(local.map((path) => ({ path, localPath: path }))).length;
const share = fullBytes ? Math.round((planBytes / fullBytes) * 100) : 0;

console.log(`\ndesign-sync-upload-plan: ${changed.length} of ${local.length} file(s) to send — basis ${basis}.`);
console.log(
  `  this plan ${planBytes} B against ${fullBytes} B for the whole tree — ${share}%` +
    `, ${batches.length} write_files call(s) against ${Math.ceil(local.length / BATCH)}.`,
);
// 75%, not 85%: a real release needs 5-9% of the tree, and the widest range this repo has
// (v0.11.4 onward) sits at 83% — where the diff saves a sixth of the bytes and still costs the
// pointer being right. Anything in that region is a full send.
if (changed.length && share >= 75) {
  console.log('  SAVES NOTHING — send --all: it needs no pointer to be right and cannot miss a file.');
}
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
