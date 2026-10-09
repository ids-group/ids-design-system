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
import { pathToFileURL } from 'node:url';

function git(args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function show(ref, path) {
  try {
    // stdio pipe on stderr: a genuinely new file has no path at `ref`, and git says so on stderr
    // rather than exiting quietly. A moved one is resolved before this, through `renamedFrom`.
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
// `readonly` is NOT required: a plain `private hovered = false` collides in a subclass exactly as
// an annotated one does. Widening it is only safe because the scan is bounded to the class BODY —
// see classBody() — so the module-level function bodies that share this indentation are out of
// range before the pattern ever runs.
// The annotation may itself contain `=>` — a function-typed field
// (`onChange: (v: boolean) => void = …`) must not end the annotation at the arrow's `=`,
// only at the standalone initializer `=`.
const FIELD =
  /^ {2}((?:protected |public |private )?)(?:static )?(?:readonly )?(\w+)(\s*:(?:[^=\n]|=>)+)? =\s/gm;
// A field can also be DECLARED and never assigned — `announceTimer: number | undefined;`. It
// collides in a subclass like any other, and FIELD cannot see it because it requires an `=`.
// Only safe inside the bounded class body, where a bare `name: Type;` is a declaration and
// nothing else.
const DECLARED_FIELD =
  /^ {2}((?:protected |public |private )?)(?:static )?(?:readonly )?(\w+)(\s*[?!]?\s*:(?:[^=;\n]|=>)+)?;$/gm;
// `get ` is matched here rather than in FIELD: a getter is a member and collides like one, and
// `get name(` never matched `name(` because of the space.
const METHOD =
  /^ {2}((?:protected |public |private )?)(?:static )?(?:override )?(?:async )?(?:get |set )?(\w+)\(/gm;
const NOT_A_MEMBER = new Set([
  'constructor',
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'return',
]);
// The initializer families that DEFINE a member's public type. Other initializers
// (computed, plain signals, literals) churn with implementation — comparing their
// text would flood the changed-types report, so those members stay name-only.
const TYPE_BEARING_INIT = /^(?:input|model|output)(?:\.required)?[<(]/;

// A comment sits INSIDE the captured statement — `statementText` runs to the closing `;` and an
// `input()` options object routinely carries one — so editing one reads as a type change and sends
// the release gate looking for a migration entry that would describe nothing. Must run before
// whitespace is collapsed: that is what removes the newline ending a `//`.
//
// A `/` is read as a regex only where a value may start. A wrong guess there can hide a difference,
// never invent one, so this errs toward reporting a change.
function stripComments(text) {
  const VALUE_MAY_START = /[([{,;:=!?&|+\-*%~^<>]$/;
  let out = '';
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (char === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    if (char === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i++;
      i += 2;
      out += ' ';
      continue;
    }
    if (char === "'" || char === '"' || char === '`') {
      out += char;
      for (i++; i < text.length; i++) {
        out += text[i];
        if (text[i] === '\\' && i + 1 < text.length) {
          out += text[++i];
          continue;
        }
        if (text[i] === char) {
          i++;
          break;
        }
      }
      continue;
    }
    const preceding = out.trimEnd();
    if (
      char === '/' &&
      (preceding === '' ||
        VALUE_MAY_START.test(preceding) ||
        // A regex may also follow a keyword (`return /x/.test(…)`) — reading it as
        // division there eats the rest of the line as a comment.
        /\b(?:return|typeof|case|instanceof|new|delete|void|throw|do|else|yield|await|in|of)$/.test(
          preceding,
        ))
    ) {
      out += char;
      for (i++; i < text.length; i++) {
        out += text[i];
        if (text[i] === '\\' && i + 1 < text.length) {
          out += text[++i];
          continue;
        }
        if (text[i] === '/' || text[i] === '\n') {
          i++;
          break;
        }
      }
      continue;
    }
    out += char;
    i++;
  }
  return out;
}

// Whitespace inside brackets is collapsed too — a prettier rewrap of an unchanged
// declaration (`input<\n  readonly RegExp[]…`) must not read as a type change, nor must the
// trailing comma prettier adds when it wraps a list.
// …but never inside a string literal: collapsing there reads `'No  data'` and `'No data'`
// as the same default.
const normalize = (text) =>
  stripComments(text)
    .split(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/)
    .map((part, index) =>
      index % 2
        ? part
        : part
            .replace(/\s+/g, ' ')
            .replace(/([<([{]) /g, '$1')
            .replace(/ ([>)\]},;])/g, '$1')
            .replace(/,([>)\]}])/g, '$1'),
    )
    .join('')
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

// A method's signature, from its name to the brace opening its body (or the `;` ending a bodiless
// one), across however many lines prettier wrapped it onto. A `{` right after `:`, `|`, `&`, `,`,
// `<`, `(` or `=>` opens an object type in the return annotation, not the body.
function methodHead(source, from) {
  let depth = 0;
  for (let i = from; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === '{') {
      const before = source.slice(from, i).trimEnd();
      if (depth > 0 || /(?:[:|&,<(]|=>)$/.test(before)) depth++;
      else return source.slice(from, i);
    } else if (ch === ';' && depth === 0) return source.slice(from, i);
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

// Two-space depth means "class member" only inside a class body. Slicing from the class and
// running to end of file left every module-level function AFTER it in range, which is what forced
// FIELD to demand `readonly` as a proxy for "this is a member". The class ends at the first brace
// back at column 0, which prettier guarantees here.
//
// Comments go, and template literals are blanked to spaces of the same length: a commented-out or
// quoted declaration would otherwise read as a member, and a false positive blocks a release cut.
// Same length, because statementText() reads offsets into this string.
// EVERY exported class, not the first one — control-value-accessor.ts exports two consumer
// extension bases, and a first-class-only scan left the second invisible.
function classBody(source) {
  const bodies = [];
  const opens = [...source.matchAll(/^export (?:abstract )?class /gm)];
  if (!opens.length) return null;
  for (const open of opens) {
    const body = source.slice(open.index);
    const end = body.search(/^\}/m);
    bodies.push(end === -1 ? body : body.slice(0, end));
  }
  return stripComments(bodies.join('\n')).replace(
    /`(?:[^`\\]|\\.)*`/g,
    (literal) => literal.replace(/[^\n]/g, ' '),
  );
}

function classSurface(source) {
  if (source === null) return null;
  source = classBody(source);
  if (source === null) return { names: new Set(), heads: new Map() };

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
  for (const match of source.matchAll(DECLARED_FIELD)) {
    const [, , name] = match;
    if (NOT_A_MEMBER.has(name)) continue;
    // Name only: an unassigned field carries no initializer to compare, and its annotation
    // churns with implementation like every other non-input type.
    names.add(name);
  }
  for (const match of source.matchAll(METHOD)) {
    const [, visibility, name] = match;
    if (NOT_A_MEMBER.has(name)) continue;
    names.add(name);
    if (visibility.startsWith('private')) continue;
    heads.set(name, normalize(methodHead(source, match.index)));
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

// Per exported class rather than per file, with the class it extends: a consumer subclasses one
// class and inherits from its whole chain, so a caller that wants that class's real surface has to
// walk `parent` itself. Each slice runs from one `export class` to the next, and classSurface()
// cuts it at the class's own closing brace.
export function classMembers(source) {
  const classes = new Map();
  const opens = [...source.matchAll(/^export (?:abstract )?class (\w+)/gm)];
  opens.forEach((open, index) => {
    const slice = source.slice(open.index, opens[index + 1]?.index);
    // The generic parameter list is skipped by angle depth, so `<T extends object>` is not read
    // as the superclass and a `{` inside a constraint does not end the header.
    let header = '';
    let depth = 0;
    for (const character of slice.slice(open[0].length)) {
      if (character === '<') depth++;
      else if (character === '>') depth = Math.max(0, depth - 1);
      else if (depth === 0) {
        if (character === '{') break;
        header += character;
      }
    }
    const { names, heads } = classSurface(slice);
    classes.set(open[1], {
      names,
      heads,
      parent: /\bextends\s+(\w+)/.exec(header)?.[1] ?? null,
    });
  });
  return classes;
}

function main() {
  const base =
    process.argv[2] ?? git(['describe', '--tags', '--abbrev=0']).trim();
  const head = process.argv[3] ?? 'HEAD';

  const files = git([
    'diff',
    '--name-only',
    `${base}..${head}`,
    '--',
    'src/lib',
  ])
    .split('\n')
    .filter((path) => path.endsWith('.ts') && !path.endsWith('.spec.ts'));

  // A moved class has to be read at its OLD path, or every member it already had counts as gained:
  // the entry-point split moved two components and the report asked for a behavior entry on 48
  // members that had not changed. Git's own rename detection decides it rather than a basename
  // guess, so a class that genuinely did not exist at `base` still arrives as an addition.
  const renamedFrom = new Map();
  for (const row of git([
    'diff',
    '-M',
    '--name-status',
    `${base}..${head}`,
    '--',
    'src/lib',
  ]).split('\n')) {
    const [status, from, to] = row.split('\t');
    if (status?.startsWith('R') && to) renamedFrom.set(to, from);
  }

  const grew = [];
  const shrank = [];
  const changed = [];
  for (const path of files) {
    const beforeSource = show(base, renamedFrom.get(path) ?? path);
    const afterSource = show(head, path);
    const before = classSurface(beforeSource);
    const after = classSurface(afterSource);
    if (after === null) {
      // A deleted file is the loudest LOST there is — skipping it printed
      // "no exported member changed" over a removed consumer-extension base.
      if (before?.names.size) {
        shrank.push([
          `${path.replace('src/lib/', '')}  (file deleted)`,
          [...before.names].sort(),
        ]);
      }
      continue;
    }
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
    for (const name of new Set([
      ...typesBefore.heritage.keys(),
      ...typesAfter.heritage.keys(),
    ])) {
      const oldClause = typesBefore.heritage.get(name);
      const clause = typesAfter.heritage.get(name);
      if (oldClause !== clause)
        changedHere.push(
          `${name}: ${oldClause ?? '(no heritage)'}  →  ${clause ?? '(heritage removed — its inherited members are gone)'}`,
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
      console.log(`  ${label}${isNew ? '  (new file)' : ''}`);
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
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
