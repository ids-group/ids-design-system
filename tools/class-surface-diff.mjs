#!/usr/bin/env node
/**
 * Which exported classes grew or lost members, and which exported types changed,
 * since a ref.
 *
 * Subclassing a DS component is unsupported, but consumers do it, and then a
 * release that only ADDS fails their build: TS4114 wants `override`, TS2415 fires
 * on a redeclared private. Assembling that list by eye missed it twice, both times
 * found in a consumer's build log rather than here.
 *
 * Type CHANGES hide even better than additions: widening an exported type
 * (`width?: number` → `number | 'content'`, an input going nullable) is
 * source-compatible for whoever WRITES the value and breaking for whoever READS
 * or overrides it — which is exactly why 0.10.0 shipped two of them with nothing
 * actionable in the manifest. So same-named members whose type-bearing
 * declaration changed are diffed too: explicitly annotated class fields,
 * input/model/output initializers, exported interface members, type aliases.
 *
 *   node tools/class-surface-diff.mjs [base-ref] [head-ref]   # defaults: last tag → HEAD
 *
 * Reports per class, so the answer can be pasted into the migration entry. Prints
 * nothing but a clean line when no surface moved.
 */
import { execFileSync } from 'node:child_process';

const base =
  process.argv[2] ?? git(['describe', '--tags', '--abbrev=0']).trim();
const head = process.argv[3] ?? 'HEAD';

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function show(ref, path) {
  try {
    // stdio pipe on stderr: a path that did not exist at `ref` is the normal case
    // for a new or renamed file, and git says so on stderr rather than exiting quietly.
    return execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

// A member a subclass can collide with: a signal-based field, or a method at class
// depth. `constructor` is excluded — it does not take `override` and only ever adds
// noise to the report.
// ANY right-hand side, deliberately: narrowing this to factory calls hides every
// `readonly x = this.y.z` and every literal, and those collide in a subclass just the
// same. `readonly` is illegal in an object literal, so class depth plus the keyword
// is enough to be sure this is a member.
const FIELD =
  /^ {2}((?:protected |public |private )?)readonly (\w+)(\s*:[^=\n]+)? = /gm;
const METHOD =
  /^ {2}((?:protected |public |private )?)(?:override )?(?:async )?(\w+)\(/gm;
const NOT_A_MEMBER = new Set([
  'constructor',
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'return',
]);
const FIRST_CLASS = /^export (?:abstract )?class /m;
// The initializer families that DEFINE a member's public type. Other initializers
// (computed, plain signals, literals) churn with implementation — comparing their
// text would flood the changed-types report, so those members stay name-only.
const TYPE_BEARING_INIT = /^(?:input|model|output)(?:\.required)?[<(]/;

// Whitespace inside brackets is collapsed too — a prettier rewrap of an unchanged
// declaration (`input<\n  readonly RegExp[]…`) must not read as a type change.
const normalize = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/([<([{]) /g, '$1')
    .replace(/ ([>)\]},;])/g, '$1')
    .trim();
const clip = (text) => (text.length > 100 ? `${text.slice(0, 97)}…` : text);

// From `from` to the `;` closing the statement at bracket depth 0. Brackets inside
// string/template literals are not tracked — both sides of the diff mis-slice the
// same way, so a false imbalance cannot fabricate a difference on its own.
function statementText(source, from) {
  let depth = 0;
  for (let i = from; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
    else if (ch === ';' && depth <= 0) return source.slice(from, i + 1);
  }
  return source.slice(from);
}

function blockText(source, openBraceIndex) {
  let depth = 0;
  for (let i = openBraceIndex; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0)
      return source.slice(openBraceIndex + 1, i);
  }
  return source.slice(openBraceIndex + 1);
}

function classSurface(source) {
  if (source === null) return null;
  // Two-space depth means "class member" only inside a class — a module-level
  // function body has the same indentation, and its calls are not members.
  const classStart = source.search(FIRST_CLASS);
  if (classStart === -1) return { names: new Set(), heads: new Map() };
  source = source.slice(classStart);

  const names = new Set();
  const heads = new Map();
  for (const match of source.matchAll(FIELD)) {
    const [, visibility, name, annotation] = match;
    names.add(name);
    // A private member's TYPE is invisible to consumers (only its NAME collides
    // in a subclass, and that is the gained/lost report's job).
    if (visibility.startsWith('private')) continue;
    const initializer = statementText(source, match.index + match[0].length);
    if (annotation || TYPE_BEARING_INIT.test(initializer)) {
      heads.set(name, normalize(`${annotation ?? ''} = ${initializer}`));
    }
  }
  for (const match of source.matchAll(METHOD)) {
    const [, visibility, name] = match;
    if (NOT_A_MEMBER.has(name)) continue;
    names.add(name);
    if (visibility.startsWith('private')) continue;
    // First line only: a param type changed on a wrapped continuation line is not
    // seen — partial coverage beats the flood of whole-body diffs.
    const lineEnd = source.indexOf('\n', match.index);
    const line = source.slice(
      match.index,
      lineEnd === -1 ? source.length : lineEnd,
    );
    const bodyStart = line.indexOf('{');
    heads.set(
      name,
      normalize(bodyStart === -1 ? line : line.slice(0, bodyStart)),
    );
  }
  return { names, heads };
}

function typeSurface(source) {
  if (source === null) return null;
  const decls = new Map();
  const heritage = new Map();
  for (const match of source.matchAll(/^export interface (\w+)([^{]*)\{/gm)) {
    const clause = normalize(match[2]);
    if (clause) heritage.set(match[1], clause);
    const body = blockText(source, match.index + match[0].length - 1);
    for (const member of body.matchAll(
      /^ {2}(?:readonly )?(\w+)\??\s*[:(]/gm,
    )) {
      decls.set(
        `${match[1]}.${member[1]}`,
        normalize(statementText(body, member.index)),
      );
    }
  }
  for (const match of source.matchAll(/^export type (\w+)/gm)) {
    decls.set(
      `type ${match[1]}`,
      normalize(statementText(source, match.index)),
    );
  }
  return { decls, heritage };
}

const files = git(['diff', '--name-only', `${base}..${head}`, '--', 'src/lib'])
  .split('\n')
  .filter((path) => path.endsWith('.ts') && !path.endsWith('.spec.ts'));

const grew = [];
const shrank = [];
const changed = [];
for (const path of files) {
  const beforeSource = show(base, path);
  const afterSource = show(head, path);
  const before = classSurface(beforeSource);
  const after = classSurface(afterSource);
  if (after === null) continue;
  const known = before?.names ?? new Set();
  const added = [...after.names].filter((name) => !known.has(name)).sort();
  const removed = [...known].filter((name) => !after.names.has(name)).sort();
  const label = path.replace('src/lib/', '');
  if (added.length) grew.push([label, added, before === null]);
  if (removed.length) shrank.push([label, removed]);

  if (before === null) continue;
  const changedHere = [];
  for (const [name, headDecl] of after.heads) {
    const oldDecl = before.heads.get(name);
    if (oldDecl && oldDecl !== headDecl) {
      changedHere.push(`${name}: ${clip(oldDecl)}  →  ${clip(headDecl)}`);
    }
  }
  const typesBefore = typeSurface(beforeSource);
  const typesAfter = typeSurface(afterSource);
  for (const [key, decl] of typesAfter.decls) {
    const oldDecl = typesBefore.decls.get(key);
    if (oldDecl && oldDecl !== decl) {
      changedHere.push(`${key}: ${clip(oldDecl)}  →  ${clip(decl)}`);
    }
  }
  for (const [name, clause] of typesAfter.heritage) {
    const oldClause = typesBefore.heritage.get(name);
    if (oldClause !== clause)
      changedHere.push(
        `${name}: ${oldClause ?? '(no heritage)'}  →  ${clause}`,
      );
  }
  for (const key of typesBefore.decls.keys()) {
    if (typesAfter.decls.has(key)) continue;
    // A member gone from the body but whose interface (still or newly) extends a
    // base has usually MOVED there, not vanished — say so instead of crying removal.
    const base = typesAfter.heritage.get(key.split('.')[0]);
    changedHere.push(
      base ? `${key}: gone from the body — check ${base}` : `${key}: removed`,
    );
  }
  if (changedHere.length) changed.push([label, changedHere.sort()]);
}

if (!grew.length && !shrank.length && !changed.length) {
  console.log(
    `class-surface: no exported member or type changed since ${base}.`,
  );
  process.exit(0);
}

console.log(`class-surface: comparing ${base}..${head}\n`);
if (grew.length) {
  console.log(
    'GAINED members — a subclass declaring the same name stops building:',
  );
  for (const [label, names, isNew] of grew) {
    console.log(`  ${label}${isNew ? '  (new or renamed file)' : ''}`);
    console.log(`    ${names.join(', ')}`);
  }
  console.log('');
}
if (shrank.length) {
  console.log(
    'LOST members — a subclass that overrode one now overrides nothing:',
  );
  for (const [label, names] of shrank) {
    console.log(`  ${label}\n    ${names.join(', ')}`);
  }
  console.log('');
}
if (changed.length) {
  console.log(
    'CHANGED types — same name, different type; readers and overriders may stop compiling:',
  );
  for (const [label, entries] of changed) {
    console.log(`  ${label}`);
    for (const entry of entries) console.log(`    ${entry}`);
  }
  console.log('');
}
console.log(
  'Mirror GAINED/LOST into ONE `behavior` entry (see 0.8.0 / 0.9.0\n' +
    '`exported-class-members-grew`), and each CHANGED type into its own `behavior` entry naming\n' +
    'who breaks (AUTHORING.md § widening). Still invisible here: a member whose BEHAVIOR changed\n' +
    'under the same signature, and a member that moved to a base class — check the diff by hand.',
);
