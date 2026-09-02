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

/** Names in a type expression that are actually TYPE references. `typeDependencies`
 *  scans bare identifiers, so it also catches parameter names and object-literal keys
 *  (`(row: T) => string`, `{ $implicit: unknown }`). Harmless when collecting imports —
 *  an unknown name is simply skipped — but fatal when deciding to widen, because a
 *  parameter name would condemn the whole type. Binding positions are exactly the ones
 *  followed by a colon, so they are deleted before the scan — and so are string
 *  literals, whose contents (`'sm' | 'md'`) the identifier scan would otherwise read
 *  as type names. */
function typeReferences(typeText) {
  return typeDependencies(
    typeText
      .replace(/'[^']*'|"[^"]*"/g, ' ')
      .replace(/[A-Za-z_$][\w$]*\s*:/g, ' '),
  );
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
// A component can type an input with a file-LOCAL alias that is never exported
// (ds-slider's `SliderValue`). typeIndex only holds exports, so such a name has no
// import and the emitted .d.ts references an undefined type — invisible until
// something type-checks the wrappers, which nothing did until 2026-09-01.
const localTypeText = new Map();
const typeIndex = new Map();
for (const file of walk(join(repo, 'src/lib'), '.ts').sort()) {
  // `.d.ts` also ends with `.ts`, so a declaration left in the tree by a stray tsc run
  // gets indexed as a source and its import path keeps a `.d` suffix. Measured 2026-09-01.
  if (file.endsWith('.spec.ts') || file.endsWith('.d.ts')) continue;
  const importPath = `../../../${relative(repo, file).replace(/\\/g, '/').replace(/\.ts$/, '')}`;
  parse(file).forEachChild((node) => {
    const exported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    const isType = ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)
      || ts.isEnumDeclaration(node);
    if (exported && isType && node.name && !typeIndex.has(node.name.text)) {
      typeIndex.set(node.name.text, importPath);
    }
    if (!exported && ts.isTypeAliasDeclaration(node) && node.name
        && !localTypeText.has(node.name.text)) {
      localTypeText.set(node.name.text, node.type.getText());
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
    const hostApi = hostDirectiveApi(meta, directiveApi);
    const api = [...classApi(node), ...hostApi].map((entry) => {
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
      hostInputs: hostApi.map((entry) => entry.name),
    });
  });
}
components.sort((a, b) => a.name.localeCompare(b.name));

// A custom element nested inside another custom element's template loses both its
// projected content and its inputs - angular/angular#24536, closed unresolved, and
// measured here: with `ds-modal-card` unregistered, `ds-modal` projects and binds
// correctly; registered, it renders an empty card. Upstream advice is not to nest
// them, so a component used inside another component's template registers under an
// alias tag no template mentions. The React wrapper renders the alias, so `<Modal>`
// and `<Button>` are unchanged for a caller and the tag never surfaces.
const nestedTags = new Set();
for (const file of [...walk(join(repo, 'src/lib'), '.component.html'), ...walk(join(repo, 'src/lib'), '.component.ts')]) {
  for (const match of readFileSync(file, 'utf8').matchAll(/<(ds-[a-z0-9-]+)/g)) nestedTags.add(match[1]);
}
for (const component of components) {
  component.tag = nestedTags.has(component.selector)
    ? 'ds-x-' + component.selector.slice(3)
    : component.selector;
}

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

/** Inputs a component re-exposes through hostDirectives. createCustomElement builds
 *  its property list from the component's OWN inputs only, so without this the
 *  accessor never exists and a write lands as a plain expando — which is how
 *  staticPreview silently did nothing on every element. */
const HOST_INPUTS: Record<string, readonly string[]> = {
${components
  .filter((c) => c.hostInputs.length)
  .map((c) => `  '${c.tag}': ${JSON.stringify(c.hostInputs)},`)
  .join('\n')}
};
const REGISTRY: Array<[string, unknown]> = [
${components.map((c) => `  ['${c.tag}', ${c.className}],`).join('\n')}
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
      const ElementClass = createCustomElement(component as never, {
        injector: appRef.injector,
      });
      for (const name of HOST_INPUTS[tag] ?? []) {
        Object.defineProperty(ElementClass.prototype, name, {
          configurable: true,
          get(this: { ngElementStrategy?: { getInputValue(n: string): unknown } }) {
            return this.ngElementStrategy?.getInputValue(name);
          },
          set(this: { ngElementStrategy?: { setInputValue(n: string, v: unknown): void } }, value: unknown) {
            this.ngElementStrategy?.setInputValue(name, value);
          },
        });
      }
      customElements.define(tag, ElementClass);
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

/** \`<${component.tag}>\` — the real ${component.className}, run by Angular. */
export const ${component.name} = React.forwardRef<HTMLElement, ${component.name}Props>(
  function ${component.name}(props, forwarded) {
    return useDsElement('${component.tag}', props, forwarded,
      ${JSON.stringify(inputs)},
      ${JSON.stringify(events)});
  },
);
`;
}

// Angular-only types (TemplateRef) carry nothing a React caller can use, and an
// unresolvable name would emit a broken declaration, so both are widened. Reported
// rather than silent: a widened prop is a real loss of contract for the agent.
const WIDENED_TO_UNKNOWN = new Set(['TemplateRef', 'ElementRef', 'Signal', 'WritableSignal']);
const widened = [];
for (const component of components) {
  for (const entry of component.api) {
    const unresolved = typeReferences(entry.type)
      .filter((name) => !typeIndex.has(name));
    if (!unresolved.length) continue;

    // A file-local alias can be inlined verbatim, which is better than an import:
      // the agent reads the real shape. Only when the alias is not itself generic,
    // since substituting an identifier inside a generic leaves the arguments behind.
    const inlinable = unresolved.filter(
      (name) => localTypeText.has(name) && !WIDENED_TO_UNKNOWN.has(name)
        && !new RegExp(name + '\s*<').test(entry.type),
    );
    for (const name of inlinable) {
      entry.type = entry.type.replace(
        new RegExp('\\b' + name + '\\b', 'g'),
        '(' + localTypeText.get(name) + ')',
      );
    }

    // Anything still unresolvable makes the WHOLE type unknown. Substituting the
    // identifier alone produced `unknown<unknown>` and clobbered same-named
    // properties; these are Angular-only handles a React caller cannot use anyway.
    const stillUnresolved = typeReferences(entry.type)
      .filter((name) => !typeIndex.has(name) && !localTypeText.has(name));
    if (stillUnresolved.length) {
      widened.push(component.name + '.' + entry.name + ' (' + stillUnresolved.join(', ') + ')');
      entry.type = 'unknown';
    }
  }
}
if (widened.length) {
  console.log('· ' + widened.length + ' prop(s) widened to unknown — no importable type:');
  for (const note of widened) console.log('    ' + note);
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
