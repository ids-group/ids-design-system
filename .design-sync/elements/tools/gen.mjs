// Generates the whole binding layer from the Angular sources — nothing here is
// hand-maintained. Two outputs, both from one AST pass over src/lib:
//
//   gen/elements.ts   registers every ds-* component as a custom element
//   gen/wrappers.tsx  one React component per custom element (props -> element
//                     properties, outputs -> CustomEvent listeners)
//
// elements.ts also registers every ds-docs section as `ds-docs-*`, which is what a Claude Design
// card renders. The showcase then has ONE source: the docs site. A hand-written preview per
// component was the alternative, and it drifted — twenty props that no longer existed shipped in
// them, because nothing type-checks a specimen nobody looks at.
//
//   node .design-sync/elements/tools/gen.mjs
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { docsSections } from './docs-sections.mjs';

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

/**
 * Named projection slots, read from the template. Measured in a real browser against the built
 * bundle: an externally created node carrying the slot attribute IS projected, and the attribute's
 * case does not matter — `[dsStatValue]` matches a node built with `setAttribute('dsStatValue')` —
 * so the only thing standing between a caller and these slots was that nothing declared them.
 *
 * A slot behind an `@if` whose gate is unsatisfied is dropped rather than left unprojected, which is
 * why `conditional` is carried: `ds-sidenav`'s `[dsBrandName]` renders nothing until `brandName` is
 * also set, and silence is the worst way to learn that.
 */
function templateSlots(componentFile, meta) {
  const urlNode = metaProperty(meta, 'templateUrl');
  if (!urlNode || !ts.isStringLiteralLike(urlNode)) return [];
  const template = readFileSync(resolve(dirname(componentFile), urlNode.text), 'utf8');
  const slots = [];
  // Brace depth carries the enclosing `@if` conditions, so a slot reports the gates that actually
  // still apply to it rather than every one that appears earlier in the file.
  const gates = [];
  let depth = 0;
  const token = /@(if|else if)\s*\(([\s\S]*?)\)\s*\{|\{|\}|<ng-content\s+select="([^"]+)"/g;
  for (const match of template.matchAll(token)) {
    if (match[1]) {
      depth += 1;
      gates.push({ depth, condition: match[2] });
      continue;
    }
    if (match[0] === '{') {
      depth += 1;
      continue;
    }
    if (match[0] === '}') {
      depth -= 1;
      while (gates.length && gates[gates.length - 1].depth > depth) gates.pop();
      continue;
    }
    for (const selector of match[3].split(',')) {
      const attribute = selector.trim().replace(/^\[|\]$/g, '');
      // Element and class selectors project by shape, not by a marker the caller can set.
      if (!attribute || /[.#=\s]/.test(attribute)) continue;
      slots.push({ attribute, gates: gates.map((gate) => gate.condition) });
    }
  }

  return slots;
}

/**
 * `[dsInputPrefix]` reads as `prefix` on `<Input>`, `[bulk-actions]` as `bulkActions`. The
 * `ds<Component>` prefix goes because it exists to keep the attribute unique in a global DOM, which
 * a property on one interface already is.
 */
function slotPropName(attribute, componentName) {
  const stripped = attribute.startsWith(`ds${componentName}`)
    ? attribute.slice(2 + componentName.length)
    : attribute.replace(/^ds(?=[A-Z])/, '');
  const camel = (stripped || attribute).replace(/-([a-z])/g, (_, char) => char.toUpperCase());

  return camel[0].toLowerCase() + camel.slice(1);
}

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

/** The member's own doc comment, flattened to one line — the type says what a prop accepts, this is
 *  the only place that says what it MEANS, and dropping it left the agent reading bare unions. */
function docOf(member) {
  const comment = ts.getJSDocCommentsAndTags(member)?.[0];
  const text = typeof comment?.comment === 'string'
    ? comment.comment
    : (comment?.comment ?? []).map((part) => part.text ?? '').join('');

  return text.replace(/\s*\n\s*\*?\s*/g, ' ').replace(/\s+/g, ' ').trim() || null;
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
    api.push({
      name: member.name.getText(),
      kind,
      type: propType(member.initializer, kind),
      doc: docOf(member),
    });
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
      api.push({
        name: alias || name,
        kind: 'input',
        type: source?.type ?? 'boolean',
        doc: source?.doc ?? null,
      });
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
const aliasText = new Map();
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
    // The alias TEXT as well as its module: the upload declarations cannot import from the library,
    // so `color?: ButtonColor` has to go out as the union it stands for or as nothing useful at all.
    if (exported && ts.isTypeAliasDeclaration(node) && node.name && !aliasText.has(node.name.text)) {
      aliasText.set(node.name.text, node.type.getText());
    }
    if (!exported && ts.isTypeAliasDeclaration(node) && node.name
        && !localTypeText.has(node.name.text)) {
      localTypeText.set(node.name.text, node.type.getText());
    }
  });
}

// Directive API is indexed first — components re-expose part of it via hostDirectives.
const directiveApi = new Map();
// Every class, decorated or not, with what it declares and what it extends. Angular publishes an
// INHERITED input on the element exactly like an own one, so a component that reads `classApi`
// alone loses the whole shared field API — `hint`, `error`, `warning`, `errors`, `invalid`,
// `touched` and `reserveMessage` live on an internal base and reach fifteen field components by
// inheritance. The docs used them and the elements did accept them; only the wrappers denied it.
const classes = new Map();
for (const file of walk(join(repo, 'src/lib'), '.ts').sort()) {
  parse(file).forEachChild((node) => {
    if (!ts.isClassDeclaration(node) || !node.name) return;
    const base = node.heritageClauses
      ?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)
      ?.types[0]?.expression.getText();
    classes.set(node.name.text, { api: classApi(node), base });
    if (decoratorMeta(node, 'Directive') === undefined) return;
    directiveApi.set(node.name.text, classApi(node));
  });
}

/** A class's API including everything it inherits. An own member of the same name wins, which is
 *  what the compiler does too. */
function inheritedApi(className, seen = new Set()) {
  if (!className || seen.has(className)) return [];
  seen.add(className);
  const entry = classes.get(className);
  if (!entry) return [];
  const inherited = inheritedApi(entry.base, seen);
  const own = new Set(entry.api.map((member) => member.name));

  return [...inherited.filter((member) => !own.has(member.name)), ...entry.api];
}

const components = [];
const renamedSlots = [];
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
    const api = [...inheritedApi(node.name.text), ...hostApi].map((entry) => {
      let type = entry.type;
      for (const param of typeParams) {
        type = type.replace(new RegExp(`\\b${param}\\b`, 'g'), 'any');
      }

      return { ...entry, type };
    });
    const name = pascalOf(selector);
    const slots = templateSlots(file, meta).map((slot) => ({
      ...slot,
      prop: slotPropName(slot.attribute, name),
    }));
    // A slot and an input can legitimately share a name — `ds-auth-layout` takes `brand` as a
    // string OR `[brand]` as your own markup. The slot yields, because the input is the published
    // name a consumer already binds.
    const taken = new Set(api.map((entry) => entry.name));
    for (const slot of slots) {
      if (taken.has(slot.prop)) {
        renamedSlots.push(`${name}.${slot.prop} → ${slot.prop}Content ([${slot.attribute}])`);
        slot.prop = `${slot.prop}Content`;
      }
      if (taken.has(slot.prop)) {
        throw new Error(`${name}: slot [${slot.attribute}] cannot be named — "${slot.prop}" is taken too.`);
      }
      taken.add(slot.prop);
    }
    components.push({
      selector,
      className: node.name.text,
      name,
      importPath: `../../../${relative(repo, file).replace(/\\/g, '/').replace(/\.ts$/, '')}`,
      api,
      slots,
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

const sections = docsSections();

// ── elements.ts ───────────────────────────────────────────────────────────
// One ApplicationRef hosts every element, so a single Angular instance serves
// the whole page — the same injector, so CDK overlays and DI work as shipped.
writeFileSync(
  join(OUT, 'elements.ts'),
  `${header('custom-element registration')}import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideZonelessChangeDetection, type Injector } from '@angular/core';
import { provideRouter } from '@angular/router';
${components.map((c) => `import { ${c.className} } from '${c.importPath}';`).join('\n')}
${sections
  .map((s) => `import { ${s.exportedName} as ${s.localName} } from '${s.importPath}';`)
  .join('\n')}

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
const COMPONENTS: Array<[string, unknown]> = [
${components.map((c) => `  ['${c.tag}', ${c.className}],`).join('\n')}
];
const SECTIONS: Array<[string, unknown]> = [
${sections.map((s) => `  ['${s.tag}', ${s.localName}],`).join('\n')}
];

let app: Promise<{ injector: Injector }> | null = null;

function application(): Promise<{ injector: Injector }> {
  // A router with no routes, because two docs sections link out with routerLink and RouterLink
  // injects the Router whether or not anything navigates. Without it those two throw at construction
  // and the shared ApplicationRef aborts the tick for every other element on the page.
  app ??= createApplication({
    providers: [provideZonelessChangeDetection(), provideRouter([])],
  });

  return app;
}

function define(registry: Array<[string, unknown]>): Promise<void> {
  return application().then((appRef) => {
    for (const [tag, component] of registry) {
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
}

let components: Promise<void> | null = null;
let sections: Promise<void> | null = null;

/** Registers every ds-* element once; safe to await repeatedly. */
export function defineDsElements(): Promise<void> {
  components ??= define(COMPONENTS);

  return components;
}

/** Registers the ds-docs showcase sections. Deliberately separate: a section renders DS components
 *  as ANGULAR components, and a tag that is simultaneously a registered custom element gets its host
 *  upgraded a second time — two component instances, duplicated DOM, and NG0950 from the copy that
 *  never received inputs. Measured: <ds-checkbox> inside the Checkbox section held two <input>s.
 *  Same bug class as angular/angular#24536, which is why 31 nested tags already ship aliased. */
export function defineDsSections(): Promise<void> {
  sections ??= define(SECTIONS);

  return sections;
}
`,
);

// ── wrappers.tsx ──────────────────────────────────────────────────────────
// Props are assigned as element PROPERTIES (not attributes): attributes would
// stringify objects, and Angular's element strategy reads properties directly.
// Outputs arrive as CustomEvents named after the output, so `on<Output>` props
// become addEventListener calls.
const docLine = (doc) => (doc ? `  /** ${doc} */\n` : '');

function propsInterface(component) {
  const lines = component.api.map(({ name, kind, type, doc }) => {
    if (kind === 'output') {
      return `${docLine(doc)}  ${`on${capitalize(name)}`}?: (value: ${type}) => void;`;
    }
    const own = `${docLine(doc)}  ${name}?: ${type};`;
    return kind === 'model'
      ? `${own}\n  ${`on${capitalize(name)}Change`}?: (value: ${type}) => void;`
      : own;
  });
  const inputNames = new Set(
    component.api.filter((entry) => entry.kind !== 'output').map((entry) => entry.name),
  );
  for (const { prop, attribute, gates } of component.slots) {
    // Only inputs are worth naming: a gate on an internal signal is not something a caller can
    // open, and telling them to set it would send them looking for a prop that does not exist.
    const openers = [
      ...new Set(gates.flatMap((gate) => gate.match(/[A-Za-z_$][\w$]*/g) ?? []).filter((n) => inputNames.has(n))),
    ];
    const gate = openers.length
      ? ` Rendered only while ${openers.map((n) => `\`${n}\``).join(' or ')} is set.`
      : gates.length
        ? ' Rendered behind a condition the component owns, so it can be absent even when passed.'
        : '';
    lines.push(`  /** Content for the \`[${attribute}]\` slot.${gate} */\n  ${prop}?: React.ReactNode;`);
  }

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
  const slots = component.slots.map((slot) => [slot.prop, slot.attribute]);

  return `${propsInterface(component)}

/** \`<${component.tag}>\` — the real ${component.className}, run by Angular. */
export const ${component.name} = React.forwardRef<HTMLElement, ${component.name}Props>(
  function ${component.name}(props, forwarded) {
    return useDsElement('${component.tag}', props, forwarded,
      ${JSON.stringify(inputs)},
      ${JSON.stringify(events)},
      ${JSON.stringify(slots)});
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
// The wrappers' props are typed with the library's own vocabulary — `AutocompleteOption[]`,
// `DatePickerPreset[]`, `SplitButtonItem[]` — so a caller that cannot import those names cannot
// declare the value it is about to pass. Re-exporting them is not decoration: without it a preview
// or a consumer has to widen to `unknown` and loses the check this whole surface exists for.
// Every exported type, not only the ones a prop names directly: `AutocompleteItem` is a union over
// `AutocompleteOptionGroup`, and a caller building that value needs the member type too. Collecting
// only what props mention left three such types unreachable.
const exportsByModule = new Map();
const wrapperNames = new Set(components.flatMap((c) => [c.name, `${c.name}Props`]));
for (const [name, module] of typeIndex) {
  if (wrapperNames.has(name)) continue;
  if (!exportsByModule.has(module)) exportsByModule.set(module, new Set());
  exportsByModule.get(module).add(name);
}
const reexports = [...exportsByModule]
  .sort()
  .map(([module, names]) => `export type { ${[...names].sort().join(', ')} } from '${module}';`)
  .join('\n');

writeFileSync(
  join(OUT, 'index.ts'),
  `${header('public surface — wrappers only, see the note in tools/gen.mjs')}export * from './wrappers';
${reexports}
`,
);

/** A type with every library alias substituted by the text it stands for, so a declaration that
 *  cannot import anything still names the real union. Recursion is bounded because an alias chain
 *  in this library is at most a few links, and a cycle would otherwise expand forever. */
function inlineAliases(type, depth = 0) {
  if (depth > 4) return type;
  let expanded = type;
  for (const name of new Set(typeReferences(type))) {
    const text = aliasText.get(name) ?? localTypeText.get(name);
    if (!text) continue;
    expanded = expanded.replace(new RegExp(`\\b${name}\\b`, 'g'), `(${text})`);
  }
  if (expanded !== type) return inlineAliases(expanded, depth + 1);

  // `keyof typeof ICONS` is the one alias whose text names a VALUE, so substitution cannot reach
  // it. The names come from the registry itself, which is what the icon prop actually accepts.
  return expanded
    .replace(/keyof typeof ICONS/g, iconNameUnion)
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\|\s*/g, '(')
    .trim();
}

// Every key of the icon registry, so an agent reading the declaration can see the real names rather
// than a type it has no way to resolve.
const iconNameUnion = (() => {
  const source = readFileSync(join(repo, 'src/lib/core/icon-names.ts'), 'utf8');
  const body = source.slice(source.indexOf('export const ICONS'));
  const names = [...body.matchAll(/^\s{2}([A-Za-z][\w]*):/gm)].map((match) => match[1]);

  return names.length ? names.map((name) => `'${name}'`).join(' | ') : 'string';
})();

// The same surface as a data file, because the upload artefacts are built from it and re-parsing
// wrappers.tsx to recover what this pass already knows is how the two drift apart.
writeFileSync(
  join(OUT, 'surface.json'),
  `${JSON.stringify(
    {
      generatedBy: '.design-sync/elements/tools/gen.mjs',
      components: components.map((component) => ({
        name: component.name,
        tag: component.tag,
        selector: component.selector,
        className: component.className,
        api: component.api.map((entry) => ({ ...entry, inlined: inlineAliases(entry.type) })),
        slots: component.slots,
      })),
    },
    null,
    2,
  )}\n`,
);

writeFileSync(
  join(OUT, 'sections.json'),
  `${JSON.stringify(
    { generatedBy: '.design-sync/elements/tools/gen.mjs', sections },
    null,
    2,
  )}\n`,
);

if (renamedSlots.length) {
  console.log(`· ${renamedSlots.length} slot(s) renamed — an input already held the name:`);
  for (const note of renamedSlots) console.log(`    ${note}`);
}
const slotTotal = components.reduce((total, c) => total + c.slots.length, 0);
console.error(
  `✓ generated ${components.length} elements + wrappers`
  + ` (${components.reduce((total, c) => total + c.api.length, 0)} inputs/outputs,`
  + ` ${slotTotal} named slots across ${components.filter((c) => c.slots.length).length})`,
);
