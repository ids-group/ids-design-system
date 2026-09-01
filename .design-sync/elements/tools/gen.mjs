// Generates the whole binding layer from the Angular sources — nothing here is
// hand-maintained. Two outputs, both from one AST pass over src/lib:
//
//   gen/elements.ts   registers every ds-* component as a custom element
//   gen/wrappers.tsx  one React component per custom element (props -> element
//                     properties, outputs -> CustomEvent listeners)
//
//   node .design-sync/elements/tools/gen.mjs
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..', '..');
const ts = createRequire(join(repo, 'package.json'))('typescript');
const OUT = resolve(here, '..', 'gen');

function walk(dir, suffix, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, suffix, out);
    else if (entry.name.endsWith(suffix)) out.push(path);
  }
  return out;
}

const parse = (file) =>
  ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

const pascalOf = (tag) =>
  tag.replace(/^ds-/, '').replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase());
const capitalize = (name) => `${name[0].toUpperCase()}${name.slice(1)}`;

const SIGNAL_KINDS = new Set(['input', 'output', 'model']);

function signalKind(initializer) {
  if (!initializer || !ts.isCallExpression(initializer)) return null;
  const callee = initializer.expression;
  const root = ts.isPropertyAccessExpression(callee) ? callee.expression : callee;
  const name = ts.isIdentifier(root) ? root.text : null;
  return SIGNAL_KINDS.has(name) ? name : null;
}

/**
 * The prop's TS type. `input<ButtonColor>()` states it; `input(false, {transform:
 * booleanAttribute})` and `input('')` only imply it, and those are the majority.
 */
function propType(initializer, kind) {
  const declared = initializer.typeArguments?.[0]?.getText();
  if (declared) return declared;
  if (kind === 'output') return 'void';
  const [first, options] = initializer.arguments;
  const optionsText = options?.getText() ?? '';
  if (/booleanAttribute/.test(optionsText)) return 'boolean';
  if (/numberAttribute/.test(optionsText)) return 'number';
  if (!first) return 'unknown';
  if (first.kind === ts.SyntaxKind.TrueKeyword || first.kind === ts.SyntaxKind.FalseKeyword) return 'boolean';
  if (ts.isStringLiteralLike(first)) return 'string';
  if (ts.isNumericLiteral(first)) return 'number';
  if (ts.isArrayLiteralExpression(first)) return 'unknown[]';

  return 'unknown';
}

// Type names the emitted props reference but that need no import.
const AMBIENT_TYPES = new Set([
  'string', 'number', 'boolean', 'void', 'unknown', 'any', 'never', 'null', 'undefined',
  'object', 'symbol', 'bigint', 'readonly', 'Array', 'ReadonlyArray', 'Record', 'Partial',
  'Set', 'ReadonlySet', 'Map', 'ReadonlyMap', 'Date', 'RegExp', 'Promise', 'Function',
  'Event', 'MouseEvent', 'KeyboardEvent', 'PointerEvent', 'FocusEvent', 'InputEvent',
  'DragEvent', 'File', 'FileList', 'Blob', 'Element', 'HTMLElement', 'HTMLInputElement',
  'Node', 'true', 'false', 'this',
]);

/** Identifiers a type expression depends on, minus the ambient ones. */
function typeDependencies(typeText) {
  return [...new Set(typeText.match(/[A-Za-z_$][\w$]*/g) ?? [])]
    .filter((name) => !AMBIENT_TYPES.has(name));
}

function decoratorMeta(classNode, decoratorName) {
  for (const decorator of ts.getDecorators?.(classNode) ?? []) {
    const call = decorator.expression;
    if (!ts.isCallExpression(call) || call.expression.getText() !== decoratorName) continue;
    const meta = call.arguments[0];
    // `@Directive()` with no metadata still counts as a match — hence null, not undefined.
    return meta && ts.isObjectLiteralExpression(meta) ? meta : null;
  }
  return undefined;
}

function metaProperty(meta, name) {
  return meta?.properties.find(
    (property) => ts.isPropertyAssignment(property) && property.name.getText() === name,
  )?.initializer;
}

/** Signal API declared directly on a class. */
function classApi(classNode) {
  const api = [];
  for (const member of classNode.members) {
    if (!ts.isPropertyDeclaration(member) || !member.initializer) continue;
    const hidden = member.modifiers?.some(
      (modifier) =>
        modifier.kind === ts.SyntaxKind.PrivateKeyword
        || modifier.kind === ts.SyntaxKind.ProtectedKeyword,
    );
    if (hidden) continue;
    const kind = signalKind(member.initializer);
    if (!kind) continue;
    api.push({ name: member.name.getText(), kind, type: propType(member.initializer, kind) });
  }

  return api;
}

/**
 * Inputs a component re-exposes from a host directive — `hostDirectives: [{
 * directive: DsStaticPreview, inputs: ['staticPreview'] }]`. Angular publishes
 * these on the element exactly like its own inputs, and missing them costs the
 * wrapper real API: `staticPreview` is how the DS renders overlays in flow.
 */
function hostDirectiveApi(meta, directiveApi) {
  const hostDirectives = metaProperty(meta, 'hostDirectives');
  if (!hostDirectives || !ts.isArrayLiteralExpression(hostDirectives)) return [];
  const api = [];
  for (const entry of hostDirectives.elements) {
    const directiveName = ts.isObjectLiteralExpression(entry)
      ? metaProperty(entry, 'directive')?.getText()
      : entry.getText();
    const exposed = ts.isObjectLiteralExpression(entry) ? metaProperty(entry, 'inputs') : null;
    if (!directiveName || !exposed || !ts.isArrayLiteralExpression(exposed)) continue;
    const declared = directiveApi.get(directiveName) ?? [];
    for (const element of exposed.elements) {
      if (!ts.isStringLiteralLike(element)) continue;
      // `'name: alias'` publishes under the alias
      const [name, alias] = element.text.split(':').map((part) => part.trim());
      const source = declared.find((entry_) => entry_.name === name);
      api.push({ name: alias || name, kind: 'input', type: source?.type ?? 'boolean' });
    }
  }

  return api;
}

// Where every exported type in the library lives, so the generated props can
// import the DS's real vocabulary instead of restating it as `unknown`.
const typeIndex = new Map();
for (const file of walk(join(repo, 'src/lib'), '.ts').sort()) {
  if (file.endsWith('.spec.ts')) continue;
  const importPath = `../../../${relative(repo, file).replace(/\\/g, '/').replace(/\.ts$/, '')}`;
  parse(file).forEachChild((node) => {
    const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) return;
    const isType = ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)
      || ts.isEnumDeclaration(node);
    if (isType && node.name && !typeIndex.has(node.name.text)) {
      typeIndex.set(node.name.text, importPath);
    }
  });
}

// Directive API is indexed first — components re-expose part of it via hostDirectives.
const directiveApi = new Map();
for (const file of walk(join(repo, 'src/lib'), '.ts').sort()) {
  parse(file).forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    if (decoratorMeta(node, 'Directive') === undefined) return;
    directiveApi.set(node.name.text, classApi(node));
  });
}

const components = [];
for (const file of walk(join(repo, 'src/lib'), '.component.ts').sort()) {
  const source = parse(file);
  source.forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const meta = decoratorMeta(node, 'Component');
    if (!meta) return;
    const selectorNode = metaProperty(meta, 'selector');
    const selector = selectorNode && ts.isStringLiteralLike(selectorNode) ? selectorNode.text : null;
    if (!selector?.startsWith('ds-') || selector.includes(',')) return;

    // A generic component's own type parameters can't cross into a non-generic
    // React wrapper — widen them rather than emit unbound names.
    const typeParams = (node.typeParameters ?? []).map((param) => param.name.text);
    const api = [...classApi(node), ...hostDirectiveApi(meta, directiveApi)].map((entry) => {
      let type = entry.type;
      for (const param of typeParams) {
        type = type.replace(new RegExp(`\\b${param}\\b`, 'g'), 'any');
      }

      return { ...entry, type };
    });
    components.push({
      selector,
      className: node.name.text,
      name: pascalOf(selector),
      importPath: `../../../${relative(repo, file).replace(/\\/g, '/').replace(/\.ts$/, '')}`,
      api,
    });
  });
}
components.sort((a, b) => a.name.localeCompare(b.name));

mkdirSync(OUT, { recursive: true });
const header = (what) =>
  `// GENERATED by .design-sync/elements/tools/gen.mjs — ${what}. Do not edit.\n`;

// ── elements.ts ───────────────────────────────────────────────────────────
// One ApplicationRef hosts every element, so a single Angular instance serves
// the whole page — the same injector, so CDK overlays and DI work as shipped.
writeFileSync(
  join(OUT, 'elements.ts'),
  `${header('custom-element registration')}import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection } from '@angular/core';
${components.map((c) => `import { ${c.className} } from '${c.importPath}';`).join('\n')}

const REGISTRY: Array<[string, unknown]> = [
${components.map((c) => `  ['${c.selector}', ${c.className}],`).join('\n')}
];

let started: Promise<void> | null = null;

/** Registers every ds-* element once; safe to await repeatedly. */
export function defineDsElements(): Promise<void> {
  if (started) return started;
  started = createApplication({
    providers: [provideZonelessChangeDetection()],
  }).then((appRef) => {
    for (const [tag, component] of REGISTRY) {
      if (customElements.get(tag)) continue;
      customElements.define(
        tag,
        createCustomElement(component as never, { injector: appRef.injector }),
      );
    }
  });

  return started;
}
`,
);

// ── wrappers.tsx ──────────────────────────────────────────────────────────
// Props are assigned as element PROPERTIES (not attributes): attributes would
// stringify objects, and Angular's element strategy reads properties directly.
// Outputs arrive as CustomEvents named after the output, so `on<Output>` props
// become addEventListener calls.
function propsInterface(component) {
  const lines = component.api.map(({ name, kind, type }) => {
    if (kind === 'output') return `  ${`on${capitalize(name)}`}?: (value: ${type}) => void;`;
    const own = `  ${name}?: ${type};`;
    return kind === 'model'
      ? `${own}\n  ${`on${capitalize(name)}Change`}?: (value: ${type}) => void;`
      : own;
  });

  return `export interface ${component.name}Props extends DsHostProps {\n${lines.join('\n')}\n}`;
}

function wrapper(component) {
  const inputs = component.api.filter((entry) => entry.kind !== 'output').map((entry) => entry.name);
  const events = component.api.flatMap((entry) =>
    entry.kind === 'output'
      ? [[entry.name, `on${capitalize(entry.name)}`]]
      : entry.kind === 'model'
        ? [[`${entry.name}Change`, `on${capitalize(entry.name)}Change`]]
        : [],
  );

  return `${propsInterface(component)}

/** \`<${component.selector}>\` — the real ${component.className}, run by Angular. */
export const ${component.name} = React.forwardRef<HTMLElement, ${component.name}Props>(
  function ${component.name}(props, forwarded) {
    return useDsElement('${component.selector}', props, forwarded,
      ${JSON.stringify(inputs)},
      ${JSON.stringify(events)});
  },
);
`;
}

const byModule = new Map();
for (const component of components) {
  for (const { type } of component.api) {
    for (const dependency of typeDependencies(type)) {
      const module = typeIndex.get(dependency);
      if (!module) continue;
      if (!byModule.has(module)) byModule.set(module, new Set());
      byModule.get(module).add(dependency);
    }
  }
}
const typeImports = [...byModule]
  .sort()
  .map(([module, names]) => `import type { ${[...names].sort().join(', ')} } from '${module}';`)
  .join('\n');

writeFileSync(
  join(OUT, 'wrappers.tsx'),
  `${header('React wrappers over the custom elements')}import * as React from 'react';
import { useDsElement, type DsHostProps } from '../runtime';
${typeImports}

${components.map(wrapper).join('\n')}`,
);

// Only the wrappers: `elements.ts` reaches the bundle through the Angular CLI
// build (which compiles the templates), so re-exporting it here would make
// esbuild bundle the raw partial-Ivy sources a second time — ~900 KB of dead,
// unlinked Angular that would never run.
writeFileSync(
  join(OUT, 'index.ts'),
  `${header('public surface — wrappers only, see the note in tools/gen.mjs')}export * from './wrappers';
`,
);

console.error(
  `✓ generated ${components.length} elements + wrappers`
  + ` (${components.reduce((total, c) => total + c.api.length, 0)} inputs/outputs)`,
);
