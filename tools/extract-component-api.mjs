// tools/extract-component-api.mjs
// AST-parses src/lib/components/*.component.ts (TS syntax tree, no type-checker),
// resolves string-literal union aliases from sibling *.types.ts, merges the
// editorial JSON, and emits a typed component-api.generated.ts. Sibling of
// tools/extract-tokens.mjs — same source→generated→docs pattern.
import ts from 'typescript';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS = join(ROOT, 'src/lib/components');
const OUT = join(ROOT, 'ds-docs/src/app/shared/component-api.generated.ts');
const EDITORIAL = join(ROOT, 'ds-docs/src/app/shared/component-api-descriptions.json');

const CALL_KINDS = { input: 'input', model: 'model', output: 'output' };

function walkFiles(dir, suffix, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkFiles(full, suffix, out);
    else if (full.endsWith(suffix)) out.push(full);
  }
  return out;
}

function parse(file) {
  return ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
}

// alias name -> array of string-literal members (from every *.types.ts)
function buildUnionIndex() {
  const index = new Map();
  for (const file of walkFiles(COMPONENTS, '.types.ts')) {
    const sf = parse(file);
    sf.forEachChild((node) => {
      if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type)) {
        const members = node.type.types
          .filter((t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal))
          .map((t) => t.literal.text);
        if (members.length) index.set(node.name.text, members);
      }
    });
  }
  return index;
}

// Resolve chips for a type-arg text like "ButtonColor" or "'a' | 'b' | null".
function resolveUnion(typeText, unionIndex) {
  if (!typeText) return null;
  const quoted = [...typeText.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  if (quoted.length) return quoted; // inline literal union
  const bare = typeText.trim();
  return unionIndex.get(bare) ?? null; // named alias
}

function jsDocText(node) {
  const docs = node.jsDoc;
  if (!docs || !docs.length) return '';
  const comment = docs[docs.length - 1].comment;
  const text = typeof comment === 'string' ? comment : (comment ?? []).map((c) => c.text).join('');
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

function hasBooleanAttribute(init) {
  const opts = init.arguments[init.arguments.length - 1];
  return opts && ts.isObjectLiteralExpression(opts) &&
    opts.properties.some(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'transform' &&
        p.initializer.getText().includes('booleanAttribute'),
    );
}

function propFromMember(member, sf, unionIndex) {
  if (!ts.isPropertyDeclaration(member) || !member.initializer) return null;
  const info = callKind(member.initializer);
  if (!info) return null;
  const init = member.initializer;
  const name = member.name.getText(sf);
  const typeArg = init.typeArguments?.[0]?.getText(sf) ?? '';
  const boolAttr = hasBooleanAttribute(init);
  const firstArg = init.arguments[0]?.getText(sf) ?? null;

  let type = typeArg || (boolAttr ? 'boolean' : '');
  if (!type && firstArg != null) {
    if (firstArg === 'true' || firstArg === 'false') type = 'boolean';
    else if (/^['"`]/.test(firstArg)) type = 'string';
    else type = 'unknown';
  }

  const isOutput = info.kind === 'output';
  const isModel = info.kind === 'model';
  const kind = info.required ? 'input-required' : isModel ? 'model' : isOutput ? 'output' : 'input';

  return {
    name,
    kind,
    type: type || 'unknown',
    union: boolAttr ? null : resolveUnion(typeArg, unionIndex),
    default: isOutput || info.required ? null : firstArg,
    required: info.required,
    _jsdoc: jsDocText(member),
  };
}

function decoratorSelector(node, sf) {
  const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) ?? [] : [];
  for (const dec of decorators) {
    const call = dec.expression;
    if (!ts.isCallExpression(call) || call.expression.getText(sf) !== 'Component') continue;
    const arg = call.arguments[0];
    if (arg && ts.isObjectLiteralExpression(arg)) {
      for (const p of arg.properties) {
        if (ts.isPropertyAssignment(p) && p.name.getText(sf) === 'selector' && ts.isStringLiteral(p.initializer)) {
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
      if (ts.isClassDeclaration(node) && node.name) map.set(node.name.text, { node, sf });
    });
  }
  return { map, sources };
}

function collectProps(classInfo, classIndex, unionIndex, seen = new Map()) {
  const { node, sf } = classInfo;
  // base classes first, so subclass members override by name
  const heritage = node.heritageClauses ?? [];
  for (const clause of heritage) {
    if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
    for (const t of clause.types) {
      const baseName = t.expression.getText(sf);
      const base = classIndex.get(baseName);
      if (base) collectProps(base, classIndex, unionIndex, seen);
    }
  }
  for (const member of node.members) {
    const prop = propFromMember(member, sf, unionIndex);
    if (prop) seen.set(prop.name, prop);
  }
  return seen;
}

// ---- run --------------------------------------------------------------------
const files = walkFiles(COMPONENTS, '.component.ts');
// Base classes (e.g. control-value-accessor.ts's DsBooleanControlValueAccessor)
// live outside the *.component.ts glob — index every *.ts so `extends` resolves.
const allTsFiles = walkFiles(COMPONENTS, '.ts');
const unionIndex = buildUnionIndex();
const { map: classIndex } = indexClasses(allTsFiles);
const editorial = JSON.parse(readFileSync(EDITORIAL, 'utf8'));
const importPathDefault = editorial.$importPathDefault;

const components = [];
for (const file of files) {
  const sf = parse(file);
  sf.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const selector = decoratorSelector(node, sf);
    if (!selector) return; // not an Angular component
    const key = basename(dirname(file));
    const props = [...collectProps({ node, sf }, classIndex, unionIndex).values()];
    const ed = editorial[key] ?? {};
    const finalize = (p) => ({
      name: p.name, kind: p.kind, type: p.type, union: p.union,
      default: p.default, required: p.required,
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

components.sort((a, b) => a.key.localeCompare(b.key) || a.className.localeCompare(b.className));

const undescribed = [];
for (const c of components)
  for (const p of [...c.inputs, ...c.outputs])
    if (!p.description) undescribed.push(`${c.key}.${p.name}`);

const map = {};
for (const c of components) map[c.key in map ? `${c.key}:${c.className}` : c.key] = c;

const banner =
  '// AUTO-GENERATED by tools/extract-component-api.mjs — do not edit.\n' +
  '// Run `npm run extract-component-api`. Editorial text is baked in from\n' +
  '// component-api-descriptions.json at extract time.\n\n';
const body =
  "import type { ComponentApi } from './component-api.types';\n\n" +
  'export const COMPONENT_API: Record<string, ComponentApi> = ' +
  JSON.stringify(map, null, 2) + ';\n';

writeFileSync(OUT, banner + body);
console.log(`wrote component-api.generated.ts — ${components.length} components, ${undescribed.length} undescribed props`);
if (undescribed.length) console.warn('undescribed:\n  ' + undescribed.join('\n  '));
