// AST-parses src/lib/components/*.component.ts (TS syntax tree, no type-checker),
// resolves literal union aliases across src/lib (incl. Exclude/Extract over core
// vocab like DsStatus), merges the editorial JSON, and emits a typed
// component-api.generated.ts. Sibling of tools/extract-tokens.mjs — same
// source→generated→docs pattern.
import ts from 'typescript';
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs';
import { entryPoints } from './lib-entry-points.mjs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'src/lib');
const COMPONENTS = join(ROOT, 'src/lib/components');
const OUT = join(ROOT, 'ds-docs/src/app/shared/component-api.generated.ts');
const EDITORIAL = join(
  ROOT,
  'ds-docs/src/app/shared/component-api-descriptions.json',
);

const CALL_KINDS = { input: 'input', model: 'model', output: 'output' };

// Both carry inputs and outputs, and a consumer binds them the same way.
const DECLARABLE = new Set(['Component', 'Directive']);

function walkFiles(dir, suffix, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkFiles(full, suffix, out);
    else if (full.endsWith(suffix)) out.push(full);
  }
  return out;
}

// CRLF is stripped at the read, not at write time: a multi-line input type or default
// carries its line breaks INSIDE the emitted string, where `.gitattributes` cannot
// reach them. Left alone, the generated file differs between a CRLF and an LF checkout
// of the same commit. Same fix as `extract-tokens.mjs`.
function parse(file) {
  const source = readFileSync(file, 'utf8').replaceAll('\r\n', '\n');

  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
}

// alias name -> its declared TypeNode, across all of src/lib (aliases reference
// other aliases and core vocab like DsStatus, so index the whole lib).
function collectAliasNodes() {
  const aliases = new Map();
  for (const file of walkFiles(LIB, '.ts')) {
    const sf = parse(file);
    sf.forEachChild((node) => {
      if (ts.isTypeAliasDeclaration(node))
        aliases.set(node.name.text, node.type);
    });
  }
  return aliases;
}

// Enumerate a TypeNode to its exhaustive list of literal chip values, or null if
// ANY member isn't a literal we can enumerate (object type, generic, keyof, bare
// string) — callers then show the raw type text instead of a misleading partial
// chip list. null/undefined are dropped (absence, not a value).
function resolveTypeNode(node, aliases, seen = new Set()) {
  if (!node) return null;
  if (ts.isParenthesizedTypeNode(node))
    return resolveTypeNode(node.type, aliases, seen);
  if (ts.isUnionTypeNode(node)) {
    const out = [];
    for (const member of node.types) {
      const part = resolveTypeNode(member, aliases, seen);
      if (part === null) return null;
      out.push(...part);
    }
    return out;
  }
  if (ts.isLiteralTypeNode(node)) {
    const lit = node.literal;
    if (ts.isStringLiteral(lit)) return [lit.text];
    if (lit.kind === ts.SyntaxKind.TrueKeyword) return ['true'];
    if (lit.kind === ts.SyntaxKind.FalseKeyword) return ['false'];
    if (lit.kind === ts.SyntaxKind.NullKeyword) return [];
    return null;
  }
  if (node.kind === ts.SyntaxKind.UndefinedKeyword) return [];
  if (ts.isTypeReferenceNode(node)) {
    const name = node.typeName.getText();
    if (
      (name === 'Exclude' || name === 'Extract') &&
      node.typeArguments?.length === 2
    ) {
      const base = resolveTypeNode(node.typeArguments[0], aliases, seen);
      const filter = resolveTypeNode(node.typeArguments[1], aliases, seen);
      if (base === null || filter === null) return null;
      const set = new Set(filter);
      return name === 'Exclude'
        ? base.filter((v) => !set.has(v))
        : base.filter((v) => set.has(v));
    }
    if (node.typeArguments?.length) return null; // other generics — can't enumerate
    if (seen.has(name)) return null; // recursive alias guard
    const alias = aliases.get(name);
    if (!alias) return null;
    seen.add(name);
    const resolved = resolveTypeNode(alias, aliases, seen);
    seen.delete(name);
    return resolved;
  }
  return null; // keyword string/number/boolean, object, tuple, fn, keyof, etc.
}

// Chip list for an input's declared type node, or null to render the raw type.
function resolveUnion(typeNode, aliases) {
  const chips = resolveTypeNode(typeNode, aliases);
  return chips && chips.length ? chips : null;
}

function jsDocText(node) {
  const docs = node.jsDoc;
  if (!docs || !docs.length) return '';
  const comment = docs[docs.length - 1].comment;
  const text =
    typeof comment === 'string'
      ? comment
      : (comment ?? []).map((c) => c.text).join('');
  return text.replace(/\s+/g, ' ').trim();
}

// input(...) | input.required(...) | model(...) | output(...) → descriptor, else null
function callKind(init) {
  if (!init || !ts.isCallExpression(init)) return null;
  const callee = init.expression;
  if (ts.isIdentifier(callee) && CALL_KINDS[callee.text]) {
    return { kind: CALL_KINDS[callee.text], required: false };
  }
  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === 'input' &&
    callee.name.text === 'required'
  ) {
    return { kind: 'input', required: true };
  }
  return null;
}

function hasTransform(init, name) {
  const opts = init.arguments[init.arguments.length - 1];
  return (
    opts &&
    ts.isObjectLiteralExpression(opts) &&
    opts.properties.some(
      (p) =>
        ts.isPropertyAssignment(p) &&
        p.name.getText() === 'transform' &&
        p.initializer.getText().includes(name),
    )
  );
}

function hasBooleanAttribute(init) {
  return hasTransform(init, 'booleanAttribute');
}

function hasNumberAttribute(init) {
  return hasTransform(init, 'numberAttribute');
}

function propFromMember(member, sf, aliases) {
  if (!ts.isPropertyDeclaration(member) || !member.initializer) return null;
  const info = callKind(member.initializer);
  if (!info) return null;
  const init = member.initializer;
  const name = member.name.getText(sf);
  const typeNode = init.typeArguments?.[0];
  const typeArg = typeNode?.getText(sf) ?? '';
  const boolAttr = hasBooleanAttribute(init);
  const numAttr = hasNumberAttribute(init);
  const firstArg = init.arguments[0]?.getText(sf) ?? null;

  let type = typeArg || (boolAttr ? 'boolean' : numAttr ? 'number' : '');
  if (!type && firstArg != null) {
    if (firstArg === 'true' || firstArg === 'false') type = 'boolean';
    else if (/^['"`]/.test(firstArg)) type = 'string';
    else if (/^-?[\d.]+$/.test(firstArg)) type = 'number';
    else type = 'unknown';
  }

  const isOutput = info.kind === 'output';
  const isModel = info.kind === 'model';
  const kind = info.required
    ? 'input-required'
    : isModel
      ? 'model'
      : isOutput
        ? 'output'
        : 'input';

  return {
    name,
    kind,
    type: type || 'unknown',
    union: boolAttr ? null : resolveUnion(typeNode, aliases),
    default: isOutput || info.required ? null : firstArg,
    required: info.required,
    _jsdoc: jsDocText(member),
  };
}

function decoratorSelector(node, sf) {
  const decorators = ts.canHaveDecorators(node)
    ? (ts.getDecorators(node) ?? [])
    : [];
  for (const dec of decorators) {
    const call = dec.expression;
    if (
      !ts.isCallExpression(call) ||
      !DECLARABLE.has(call.expression.getText(sf))
    )
      continue;
    const arg = call.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) {
      for (const p of arg.properties) {
        if (
          ts.isPropertyAssignment(p) &&
          p.name.getText(sf) === 'selector' &&
          ts.isStringLiteral(p.initializer)
        ) {
          return p.initializer.text;
        }
      }
    }
  }
  return null;
}

// class name -> ClassDeclaration, across all component files (for extends resolution)
function indexClasses(files) {
  const map = new Map();
  const sources = new Map();
  for (const file of files) {
    const sf = parse(file);
    sources.set(file, sf);
    sf.forEachChild((node) => {
      if (ts.isClassDeclaration(node) && node.name)
        map.set(node.name.text, { node, sf });
    });
  }
  return { map, sources };
}

function collectProps(classInfo, classIndex, aliases, seen = new Map()) {
  const { node, sf } = classInfo;
  // base classes first, so subclass members override by name
  const heritage = node.heritageClauses ?? [];
  for (const clause of heritage) {
    if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
    for (const t of clause.types) {
      const baseName = t.expression.getText(sf);
      const base = classIndex.get(baseName);
      if (base) collectProps(base, classIndex, aliases, seen);
    }
  }
  for (const member of node.members) {
    const prop = propFromMember(member, sf, aliases);
    if (prop) seen.set(prop.name, prop);
  }
  return seen;
}

// Class names the package actually exports. Every entry point's index is a barrel of
// exactly what that entry point publishes, so the set of them is the public surface.
// Without it every @Component under src/lib/components lands in the reference,
// including internal ones a consumer cannot import.
function exportedClassNames() {
  const barrels = entryPoints()
    .map(({ index }) => index)
    .filter((candidate) => existsSync(candidate));
  const names = new Set();
  for (const barrel of barrels) {
    const source = readFileSync(barrel, 'utf8');
    for (const [, group] of source.matchAll(
      /export\s*(?:type\s*)?\{([^}]*)\}/g,
    )) {
      for (const piece of group.split(',')) {
        const name = piece
          .trim()
          .split(/\s+as\s+/)
          .pop()
          ?.trim();
        if (name) names.add(name);
      }
    }
    // A `export * from './lib/overlay/body-scroll-lock.service'` names the FILE, so its
    // own `export class` never appears inside braces and the class read as unexported.
    for (const [, name] of source.matchAll(
      /export\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g,
    )) {
      names.add(name);
    }
  }

  return names;
}

const files = [
  ...walkFiles(COMPONENTS, '.component.ts'),
  ...walkFiles(COMPONENTS, '.directive.ts'),
];
// Base classes (e.g. control-value-accessor.ts's DsBooleanControlValueAccessor)
// live outside the *.component.ts glob — index every *.ts so `extends` resolves.
const allTsFiles = walkFiles(COMPONENTS, '.ts');
const aliases = collectAliasNodes();
const { map: classIndex } = indexClasses(allTsFiles);
const editorial = JSON.parse(readFileSync(EDITORIAL, 'utf8'));
const importPathDefault = editorial.$importPathDefault;

const exported = exportedClassNames();
// A guard, not politeness: if the barrels ever stop parsing, dropping every
// component would look like a clean run. 40 is far below the real count (~90).
if (exported.size < 40) {
  console.error(
    `extract-component-api: only ${exported.size} exported names parsed from public-api.ts — refusing to filter.`,
  );
  process.exit(1);
}

const internal = [];
const components = [];
for (const file of files) {
  const sf = parse(file);
  sf.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const selector = decoratorSelector(node, sf);
    if (!selector) return; // not an Angular component
    if (!exported.has(node.name.text)) {
      internal.push(`${node.name.text} (${selector})`);

      return;
    }
    // A directive in its component's folder keys on that folder; a LOOSE one sits
    // directly in components/, where every file would key on `components`.
    const key =
      dirname(file) === COMPONENTS
        ? basename(file).replace(/\.directive\.ts$/, '')
        : basename(dirname(file));
    const props = [...collectProps({ node, sf }, classIndex, aliases).values()];
    const ed = editorial[key] ?? {};
    const finalize = (p) => ({
      name: p.name,
      kind: p.kind,
      type: p.type,
      union: p.union,
      default: p.default,
      required: p.required,
      description: p._jsdoc || ed.props?.[p.name] || '',
    });
    components.push({
      key,
      selector,
      isElement: !selector.startsWith('['),
      className: node.name.text,
      status: ed.status ?? 'stable',
      importName: ed.importName ?? node.name.text,
      importPath: ed.importPath ?? importPathDefault,
      summary: ed.summary ?? null,
      inputs: props.filter((p) => p.kind !== 'output').map(finalize),
      outputs: props.filter((p) => p.kind === 'output').map(finalize),
    });
  });
}

components.sort(
  (a, b) =>
    a.key.localeCompare(b.key) || a.className.localeCompare(b.className),
);

const undescribed = [];
for (const c of components)
  for (const p of [...c.inputs, ...c.outputs])
    if (!p.description) undescribed.push(`${c.key}.${p.name}`);

// ── services ────────────────────────────────────────────────────────────────
// A service has no selector, so the component walk above drops it — which left
// ToastService and ModalService, the two APIs a consumer calls by hand, with no
// table anywhere in the docs.
function isInjectable(node, sf) {
  const decorators = ts.canHaveDecorators(node)
    ? (ts.getDecorators(node) ?? [])
    : [];

  return decorators.some(
    (dec) =>
      ts.isCallExpression(dec.expression) &&
      dec.expression.expression.getText(sf) === 'Injectable',
  );
}

const LIFECYCLE = new Set([
  'ngOnInit',
  'ngOnDestroy',
  'ngOnChanges',
  'ngAfterViewInit',
  'ngDoCheck',
]);

function isPublicMember(member) {
  const flags = ts.getCombinedModifierFlags(member);
  if (flags & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected)) {
    return false;
  }
  const name = member.name?.getText?.();

  return Boolean(name) && !name.startsWith('_') && !name.startsWith('#');
}

function serviceMembers(node, sf) {
  const members = [];
  for (const member of node.members) {
    if (!isPublicMember(member)) continue;
    const name = member.name.getText(sf);
    if (LIFECYCLE.has(name)) continue;

    if (ts.isMethodDeclaration(member)) {
      const params = member.parameters
        .map((parameter) => parameter.getText(sf).replace(/\s+/g, ' '))
        .join(', ');
      const returns = member.type ? member.type.getText(sf) : null;
      members.push({
        name,
        kind: 'method',
        signature: `${name}(${params})`,
        type: returns,
        description: jsDocText(member),
      });
    } else if (ts.isPropertyDeclaration(member)) {
      members.push({
        name,
        kind: 'property',
        signature: name,
        type: member.type ? member.type.getText(sf).replace(/\s+/g, ' ') : null,
        description: jsDocText(member),
      });
    }
  }

  return members;
}

const services = [];
for (const file of walkFiles(LIB, '.service.ts')) {
  const sf = parse(file);
  sf.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    if (!isInjectable(node, sf)) return;
    if (!exported.has(node.name.text)) return;
    const ed = editorial.$services?.[node.name.text] ?? {};
    services.push({
      key: basename(dirname(file)),
      className: node.name.text,
      importName: node.name.text,
      importPath: ed.importPath ?? importPathDefault,
      summary: ed.summary ?? jsDocText(node) ?? null,
      members: serviceMembers(node, sf).map((m) => ({
        ...m,
        description: m.description || ed.members?.[m.name] || '',
      })),
    });
  });
}
services.sort((a, b) => a.className.localeCompare(b.className));

const serviceMap = {};
for (const service of services) serviceMap[service.className] = service;

// Same "shown and flagged" contract the token reference uses: a member missing its
// description or its return type still appears, and the run says so, rather than the
// gap being silently absent from the docs.
const serviceGaps = [];
for (const service of services)
  for (const member of service.members) {
    if (!member.description)
      serviceGaps.push(`${service.className}.${member.name} — no description`);
    if (member.type === null)
      serviceGaps.push(`${service.className}.${member.name} — no declared type`);
  }

// Bare folder key goes to the component whose selector is `ds-<folder>`
// (strip [ ] for attribute selectors before comparing); every other
// same-folder component keeps the "<folder>:<ClassName>" key. If no
// component matches, fall back to first-wins for the bare key.
const byFolder = new Map();
for (const c of components) {
  if (!byFolder.has(c.key)) byFolder.set(c.key, []);
  byFolder.get(c.key).push(c);
}

const map = {};
for (const [folder, list] of byFolder) {
  if (list.length === 1) {
    map[folder] = list[0];
    continue;
  }
  const normalizedSelector = (c) =>
    c.selector.replace(/^\[/, '').replace(/\]$/, '');
  let primary = list.find((c) => normalizedSelector(c) === `ds-${folder}`);
  if (!primary) primary = list[0]; // fallback: first-wins
  for (const c of list) {
    map[c === primary ? folder : `${folder}:${c.className}`] = c;
  }
}

const banner =
  '// AUTO-GENERATED by tools/extract-component-api.mjs — do not edit.\n' +
  '// Run `npm run extract-component-api`. Editorial text is baked in from\n' +
  '// component-api-descriptions.json at extract time.\n\n';
const body =
  "import type { ComponentApi, ServiceApi } from './component-api.types';\n\n" +
  'export const COMPONENT_API: Record<string, ComponentApi> = ' +
  JSON.stringify(map, null, 2) +
  ';\n\n' +
  'export const SERVICE_API: Record<string, ServiceApi> = ' +
  JSON.stringify(serviceMap, null, 2) +
  ';\n';

writeFileSync(OUT, banner + body);
console.log(
  `wrote component-api.generated.ts — ${components.length} components, ${services.length} services, ${undescribed.length} undescribed props`,
);
if (internal.length)
  console.log(`  left out, not exported: ${internal.join(', ')}`);
if (serviceGaps.length)
  console.warn('service API gaps:\n  ' + serviceGaps.join('\n  '));
if (undescribed.length)
  console.warn('undescribed:\n  ' + undescribed.join('\n  '));
