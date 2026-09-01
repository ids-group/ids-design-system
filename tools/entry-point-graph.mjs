#!/usr/bin/env node
// Reports the import graph `src/lib` would be partitioned along: group count, cross-group
// statements split by runtime/type-only, and every strongly-connected component.
//
// These numbers back the entry-point plan in docs/todo.md and both packaging audits. They were
// recomputed by hand three times and came out different twice, so they live here now.
//
//   node tools/entry-point-graph.mjs           summary
//   node tools/entry-point-graph.mjs --json    machine-readable
//   node tools/entry-point-graph.mjs --cut components/card/card.types.ts=core[,...]
//                                             what a proposed move does to the SCCs

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = resolve(fileURLToPath(new URL('../src/lib', import.meta.url)));

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.ts') && !name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

function groupOf(absolutePath) {
  const parts = relative(LIB, absolutePath).split(sep);
  if (parts[0] === 'components')
    return parts.length > 2 ? `components/${parts[1]}` : 'components-root';
  return parts.length > 1 ? parts[0] : 'lib-root';
}

function resolveSpecifier(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [
    `${base}.ts`,
    join(base, 'index.ts'),
    `${base}.d.ts`,
  ]) {
    try {
      if (statSync(candidate).isFile()) return candidate;
    } catch {
      /* not this one */
    }
  }
  return null;
}

// `[^;]*?` rather than `[^;\n]*?`: a multi-line `import {\n  A,\n} from '...'` is the common shape,
// and excluding newlines silently drops whole cycles from the graph.
const SPECIFIER = /(?:^|\n)\s*(?:import|export)\b([^;]*?)from\s+'(\.[^']+)'/g;

const files = walk(LIB);
const statements = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(SPECIFIER)) {
    const target = resolveSpecifier(file, match[2]);
    if (!target) continue;
    statements.push({
      file,
      line:
        source.slice(0, match.index).split('\n').length +
        (match[0].startsWith('\n') ? 1 : 0),
      specifier: match[2],
      target,
      typeOnly:
        /^\s*type\s/.test(match[1]) ||
        !/[^\s{},]/.test(match[1].replace(/\btype\s+\w+/g, '')),
    });
  }
}

const groups = [...new Set(files.map(groupOf))].sort();

function edgesFor(moved = new Map()) {
  const edges = new Map();
  for (const statement of statements) {
    const from = moved.get(statement.file) ?? groupOf(statement.file);
    const to = moved.get(statement.target) ?? groupOf(statement.target);
    if (from === to) continue;
    if (!edges.has(from)) edges.set(from, new Set());
    edges.get(from).add(to);
  }
  return edges;
}

function stronglyConnected(edges) {
  const index = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  const found = [];
  let counter = 0;

  const visit = (node) => {
    index.set(node, counter);
    low.set(node, counter);
    counter += 1;
    stack.push(node);
    onStack.add(node);
    for (const next of edges.get(node) ?? []) {
      if (!index.has(next)) {
        visit(next);
        low.set(node, Math.min(low.get(node), low.get(next)));
      } else if (onStack.has(next)) {
        low.set(node, Math.min(low.get(node), index.get(next)));
      }
    }
    if (low.get(node) === index.get(node)) {
      const component = [];
      for (;;) {
        const popped = stack.pop();
        onStack.delete(popped);
        component.push(popped);
        if (popped === node) break;
      }
      if (component.length > 1) found.push(component.sort());
    }
  };

  for (const group of groups) if (!index.has(group)) visit(group);
  return found.sort((a, b) => a[0].localeCompare(b[0]));
}

const crossGroup = statements.filter(
  (s) => groupOf(s.file) !== groupOf(s.target),
);
const report = {
  files: files.length,
  groups: groups.length,
  crossGroupStatements: crossGroup.length,
  runtime: crossGroup.filter((s) => !s.typeOnly).length,
  typeOnly: crossGroup.filter((s) => s.typeOnly).length,
  cycles: stronglyConnected(edgesFor()),
};

const cutArgument =
  process.argv.find((a) => a.startsWith('--cut='))?.slice('--cut='.length) ??
  (process.argv.includes('--cut')
    ? process.argv[process.argv.indexOf('--cut') + 1]
    : null);

if (cutArgument) {
  const moved = new Map();
  for (const pair of cutArgument.split(',')) {
    const [path, group] = pair.split('=');
    moved.set(join(LIB, path.replaceAll('/', sep)), group);
  }
  report.cut = {
    moves: [...moved].map(
      ([file, group]) =>
        `${relative(LIB, file).replaceAll(sep, '/')} -> ${group}`,
    ),
    statementsTouched: statements
      .filter((s) => moved.has(s.file) || moved.has(s.target))
      .map(
        (s) =>
          `${relative(LIB, s.file).replaceAll(sep, '/')}:${s.line}  ${s.specifier}`,
      ),
    cyclesAfter: stronglyConnected(edgesFor(moved)),
  };
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `entry-point-graph: ${report.files} files, ${report.groups} groups`,
  );
  console.log(
    `  cross-group statements: ${report.crossGroupStatements}` +
      ` (${report.runtime} runtime, ${report.typeOnly} type-only)`,
  );
  console.log(`  strongly-connected components (${report.cycles.length}):`);
  for (const cycle of report.cycles) console.log(`    ${cycle.join(' <-> ')}`);
  if (report.cut) {
    console.log(`\n  cut: ${report.cut.moves.join(', ')}`);
    console.log(`  statements touched: ${report.cut.statementsTouched.length}`);
    for (const statement of report.cut.statementsTouched)
      console.log(`    ${statement}`);
    console.log(
      `  SCCs after: ${report.cut.cyclesAfter.map((c) => c.join('+')).join(', ') || 'none'}`,
    );
  }
}
