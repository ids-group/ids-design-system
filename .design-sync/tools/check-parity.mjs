// Guards the React bindings against silent drift from the Angular sources they
// port. The binding layer is hand-written, so nothing else in the toolchain can
// tell that a component's template or API moved on: CSS recompiles itself, but
// a stale binding just keeps shipping an API that no longer exists — and the
// damage lands in every design the claude.ai/design agent builds with it.
//
//   node .design-sync/tools/check-parity.mjs            # verify (exit 1 on drift)
//   node .design-sync/tools/check-parity.mjs --bless     # re-record hashes after a re-port
//
// Three checks, all keyed off the DS's own sources:
//   1. source drift  — <name>.component.ts/.html hashes vs .design-sync/parity.json
//   2. API coverage  — every public input/output/model has a matching prop
//   3. vocabulary    — literal unions declared in both places must be equal
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ts = createRequire(join(repo, 'package.json'))('typescript');
const MANIFEST = join(repo, '.design-sync', 'parity.json');
const bless = process.argv.includes('--bless');

const errors = [];
const notes = [];

function walk(dir, suffixes, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, suffixes, out);
    else if (suffixes.some((s) => entry.name.endsWith(s))) out.push(path);
  }
  return out;
}

const parse = (file) => ts.createSourceFile(
  file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true,
  file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
);

const relPath = (path) => relative(repo, path).replace(/\\/g, '/');
const sha = (path) => createHash('sha1')
  .update(readFileSync(path, 'utf8').replace(/\r\n/g, '\n'))
  .digest('hex')
  .slice(0, 12);

/** `ds-sidenav-footer` -> `SidenavFooter`; the bindings' naming convention. */
const pascalOf = (tag) => tag.replace(/^ds-/, '').replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());

// ── literal unions, from anywhere in a source tree ────────────────────────
function literalUnions(files) {
  const unions = new Map();
  for (const file of files) {
    parse(file).forEachChild((node) => {
      if (!ts.isTypeAliasDeclaration(node)) return;
      const members = ts.isUnionTypeNode(node.type) ? node.type.types : [node.type];
      const literals = members
        .filter((t) => ts.isLiteralTypeNode(t) && ts.isStringLiteral(t.literal))
        .map((t) => t.literal.text);
      if (literals.length !== members.length || !literals.length) return;
      unions.set(node.name.text, { members: literals.sort(), file: relPath(file) });
    });
  }
  return unions;
}

// ── Angular side ──────────────────────────────────────────────────────────
const SIGNAL_KINDS = new Set(['input', 'output', 'model']);

function componentDecorator(node) {
  const decorators = ts.getDecorators?.(node) ?? [];
  for (const decorator of decorators) {
    const call = decorator.expression;
    if (ts.isCallExpression(call) && call.expression.getText() === 'Component') {
      return ts.isObjectLiteralExpression(call.arguments[0]) ? call.arguments[0] : null;
    }
  }
  return null;
}

/** `input`, `input.required`, `model`, `output` — anything else is not API. */
function signalKind(initializer) {
  if (!initializer || !ts.isCallExpression(initializer)) return null;
  const callee = initializer.expression;
  const root = ts.isPropertyAccessExpression(callee) ? callee.expression : callee;
  const name = ts.isIdentifier(root) ? root.text : null;
  return SIGNAL_KINDS.has(name) ? name : null;
}

const angularComponents = new Map();
for (const file of walk(join(repo, 'src/lib'), ['.component.ts'])) {
  parse(file).forEachChild((node) => {
    if (!ts.isClassDeclaration(node)) return;
    const meta = componentDecorator(node);
    if (!meta) return;
    const selectorProp = meta.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'selector',
    );
    const selector = selectorProp && ts.isStringLiteralLike(selectorProp.initializer)
      ? selectorProp.initializer.text
      : null;
    if (!selector?.startsWith('ds-')) return;

    const api = [];
    for (const member of node.members) {
      if (!ts.isPropertyDeclaration(member)) continue;
      const hidden = member.modifiers?.some((m) => m.kind === ts.SyntaxKind.PrivateKeyword
        || m.kind === ts.SyntaxKind.ProtectedKeyword);
      if (hidden) continue;
      const kind = signalKind(member.initializer);
      if (kind) api.push({ name: member.name.getText(), kind });
    }
    const template = file.replace(/\.ts$/, '.html');
    angularComponents.set(selector, {
      name: pascalOf(selector),
      api,
      sources: [file, ...(existsSync(template) ? [template] : [])],
    });
  });
}

const angularUnions = literalUnions(walk(join(repo, 'src/lib'), ['.ts']));

// ── binding side ──────────────────────────────────────────────────────────
const bindingRoot = join(repo, '.design-sync', 'react-bindings', 'src');
const bindingFiles = walk(bindingRoot, ['.ts', '.tsx']);
const bindingComponents = new Map();
const propsByInterface = new Map();

for (const file of bindingFiles) {
  const source = parse(file);
  source.forEachChild((node) => {
    const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) return;
    if (ts.isInterfaceDeclaration(node)) {
      propsByInterface.set(node.name.text, new Set(
        node.members.filter(ts.isPropertySignature).map((m) => m.name.getText()),
      ));
      return;
    }
    if (ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text)) {
      bindingComponents.set(node.name.text, { file: relPath(file) });
    }
  });
}

const bindingUnions = literalUnions(bindingFiles);

// ── 1. source drift ───────────────────────────────────────────────────────
const manifest = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, 'utf8'))
  : { components: {}, allow: {} };
const recorded = manifest.components ?? {};
const allow = manifest.allow ?? {};
const fresh = {};

for (const [selector, component] of [...angularComponents].sort()) {
  const sources = {};
  for (const source of component.sources) sources[relPath(source)] = sha(source);
  fresh[component.name] = { tag: selector, sources };

  if (!bindingComponents.has(component.name)) {
    notes.push(`${component.name} (${selector}) has no React binding — not synced`);
    continue;
  }
  const previous = recorded[component.name];
  if (!previous) {
    errors.push(`${component.name}: not in parity.json — re-port review never recorded (--bless)`);
    continue;
  }
  for (const [path, hash] of Object.entries(sources)) {
    if (previous.sources?.[path] !== hash) {
      errors.push(`${component.name}: ${path} changed since the binding was last blessed`
        + ` — diff it against ${bindingComponents.get(component.name).file}, then --bless`);
    }
  }
  for (const path of Object.keys(previous.sources ?? {})) {
    if (!(path in sources)) errors.push(`${component.name}: ${path} is gone upstream — re-port`);
  }
}

// The loop above only walks components that still exist, so a binding left
// pointing at a renamed or deleted one slips through it — and that binding
// renders a tag nothing will ever upgrade.
const upstreamNames = new Set([...angularComponents.values()].map((component) => component.name));
for (const [name, binding] of bindingComponents) {
  if (upstreamNames.has(name) || !(name in recorded)) continue;
  errors.push(`${name}: no ds-* component matches it any more (${binding.file})`
    + ' — the upstream component was renamed or removed; re-port and drop the stale entry');
}

// ── 2. API coverage ───────────────────────────────────────────────────────
const capitalize = (name) => `${name[0].toUpperCase()}${name.slice(1)}`;

for (const [selector, component] of angularComponents) {
  if (!bindingComponents.has(component.name)) continue;
  const props = propsByInterface.get(`${component.name}Props`);
  if (!props) {
    if (component.api.length) {
      errors.push(`${component.name}: binding exports no ${component.name}Props interface`);
    }
    continue;
  }
  const expectedProps = new Map();
  for (const { name, kind } of component.api) {
    const props_ = kind === 'output'
      ? [`on${capitalize(name)}`]
      : kind === 'model'
        ? [name, `on${capitalize(name)}Change`]
        : [name];
    for (const prop of props_) expectedProps.set(prop, { name, kind });
  }

  // An allow entry keyed by the missing PROP (not the upstream member) keeps the
  // rest of that member checked — allowing `onXChange` still requires `x`.
  const allowed = allow[component.name] ?? {};
  for (const [prop, reason] of Object.entries(allowed)) {
    if (!reason?.trim()) errors.push(`${component.name}: allow.${prop} needs a reason`);
    if (!expectedProps.has(prop)) {
      errors.push(`${component.name}: allow.${prop} excuses a prop nothing expects any more — drop it`);
    }
  }
  for (const [prop, { name, kind }] of expectedProps) {
    if (props.has(prop) || prop in allowed) continue;
    errors.push(`${component.name}: ${selector} ${kind} \`${name}\` has no \`${prop}\` prop`
      + ' — port it, or list it in parity.json `allow` with a reason');
  }
}

// ── 3. package identity ───────────────────────────────────────────────────
// The binding package restates the DS's name and version so the design agent
// imports and cites the real thing; a release bump that misses it silently
// teaches the agent a version that never existed.
const dsPkg = JSON.parse(readFileSync(join(repo, 'package.json'), 'utf8'));
const bindingPkgPath = join(repo, '.design-sync', 'react-bindings', 'package.json');
const bindingPkg = JSON.parse(readFileSync(bindingPkgPath, 'utf8'));
for (const field of ['name', 'version']) {
  if (bindingPkg[field] !== dsPkg[field]) {
    errors.push(`react-bindings/package.json ${field} is "${bindingPkg[field]}",`
      + ` the DS ships "${dsPkg[field]}" — sync it`);
  }
}

// ── 4. shared vocabulary ──────────────────────────────────────────────────
for (const [name, binding] of bindingUnions) {
  const upstream = angularUnions.get(name);
  if (!upstream) continue;
  if (binding.members.join('|') !== upstream.members.join('|')) {
    errors.push(`type ${name}: binding [${binding.members}] != ${upstream.file} [${upstream.members}]`);
  }
}

// ── report ────────────────────────────────────────────────────────────────
if (bless) {
  manifest.components = fresh;
  manifest.allow = allow;
  writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.error(`✓ blessed ${Object.keys(fresh).length} components into ${basename(MANIFEST)}`);
  process.exit(0);
}

for (const note of notes) console.error(`· ${note}`);
for (const error of errors) console.error(`✗ ${error}`);
console.error(
  `${errors.length ? '✗' : '✓'} parity: ${bindingComponents.size} bindings vs `
  + `${angularComponents.size} ds-* components, ${bindingUnions.size} shared type names, `
  + `${errors.length} problem(s)`,
);
process.exit(errors.length ? 1 : 0);
