// ESLint plugin for consumers of @ids-group-ltd/ids-design-system. Its rules report, in a consumer's
// TypeScript and Angular templates, what this library removed or renamed: the API list in
// `deprecated-api.json` and the token list in `../stylelint/deprecated-tokens.json`, both generated
// from the published migration manifests. Template rules run on whatever
// `@angular-eslint/template-parser` produces, which the consumer's own config provides; nothing
// here imports it.
import { readFileSync } from 'node:fs';
import { VERSION, inRange } from '../stylelint/since-version.mjs';

const read = (path) =>
  JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const api = read('./deprecated-api.json');
const tokens = new Map(
  read('../stylelint/deprecated-tokens.json').map((entry) => [
    entry.name,
    entry,
  ]),
);

const PACKAGE = /^@ids-group-ltd\/ids-design-system(?:\/|$)/;
// The whole dashed name, so `--x-warn` is never found inside `--x-warning`.
const CUSTOM_PROPERTY = /(?<![\w-])--[\w-]+/g;
const URL_BASE =
  'https://www.npmjs.com/package/@ids-group-ltd/ids-design-system';

const byKey = (list, key) => new Map(list.map((entry) => [key(entry), entry]));
const inputs = byKey(api.inputs, (entry) => `${entry.element}[${entry.name}]`);
const outputs = byKey(
  api.outputs,
  (entry) => `${entry.element}[${entry.name}]`,
);
const values = byKey(
  api.values,
  (entry) => `${entry.element}[${entry.attribute}]=${entry.value}`,
);
const selectors = byKey(api.selectors, (entry) => entry.name);
const symbols = byKey(api.symbols, (entry) => entry.name);
const membersByOwner = new Map();
for (const entry of api.members)
  membersByOwner.set(
    entry.owner,
    (membersByOwner.get(entry.owner) ?? new Map()).set(entry.name, entry),
  );

const describe = (what, entry) =>
  entry.replacement
    ? `${what} was renamed or replaced in ${entry.since}: use ${entry.replacement} (${entry.itemId})`
    : `${what} was removed in ${entry.since} (${entry.itemId})`;

const SCHEMA = [
  {
    type: 'object',
    properties: {
      from: { type: 'string', pattern: VERSION.source },
      to: { type: 'string', pattern: VERSION.source },
    },
    additionalProperties: false,
  },
];

const rule = (description, create, fixable) => ({
  meta: {
    type: 'problem',
    docs: { description, url: `${URL_BASE}#4-removed-and-renamed-api-eslint` },
    ...(fixable ? { fixable: 'code' } : {}),
    schema: SCHEMA,
  },
  create(context) {
    const range = context.options[0];
    const seen = (entry) =>
      entry && inRange(entry.since, range) ? entry : undefined;

    return create(context, seen);
  },
});

// A template node carries offsets into the file the parser read, which with an inline template is
// the virtual file the processor extracted, so the same offsets serve `loc` and `fix`.
const spanLoc = (context, span) => ({
  start: context.sourceCode.getLocFromIndex(span.start.offset),
  end: context.sourceCode.getLocFromIndex(span.end.offset),
});
const spanText = (context, span) =>
  context.sourceCode.text.slice(span.start.offset, span.end.offset);

// `[x]`, `[(x)]`, `bind-x` and a static `x="..."` all bind the input x; `[attr.x]`, `[class.x]` and
// `[style.x]` keep the prefix in their key and bind nothing of ours.
const boundInputs = (context, element) => [
  ...element.inputs.filter(
    (input) => input.keySpan && spanText(context, input.keySpan) === input.name,
  ),
  ...element.attributes,
];

const noRemovedInputs = rule(
  'Report a template binding to an input this library removed or renamed.',
  (context, seen) => ({
    Element(element) {
      for (const input of boundInputs(context, element)) {
        const entry =
          seen(inputs.get(`${element.name}[${input.name}]`)) ??
          seen(inputs.get(`*[${input.name}]`));
        if (entry)
          context.report({
            loc: spanLoc(context, input.keySpan ?? input.sourceSpan),
            message: describe(`"${element.name}[${input.name}]"`, entry),
          });
      }
    },
  }),
);

const noRemovedOutputs = rule(
  'Report a template listener on an output this library removed or renamed. Without strictTemplates it compiles and never fires.',
  (context, seen) => ({
    Element(element) {
      for (const output of element.outputs) {
        const entry = seen(outputs.get(`${element.name}[${output.name}]`));
        if (entry)
          context.report({
            loc: spanLoc(context, output.keySpan ?? output.sourceSpan),
            message: describe(`"${element.name}(${output.name})"`, entry),
          });
      }
    },
  }),
);

const noRemovedValues = rule(
  'Report a static attribute value this library remapped. A bound expression is not read.',
  (context, seen) => ({
    Element(element) {
      const statics = [
        ...element.attributes.map((attribute) => [attribute, attribute.value]),
        ...boundInputs(context, element)
          .filter((input) => input.value?.ast?.type === 'LiteralPrimitive')
          .map((input) => [input, input.value.ast.value])
          .filter(([, value]) => typeof value === 'string'),
      ];
      for (const [node, value] of statics) {
        const entry = seen(
          values.get(`${element.name}[${node.name}]=${value}`),
        );
        if (!entry) continue;
        context.report({
          loc: spanLoc(context, node.sourceSpan),
          message: entry.replacement
            ? `${node.name}="${value}" on ${element.name} was remapped in ${entry.since}: write ${entry.replacement} (${entry.itemId})`
            : `${node.name}="${value}" on ${element.name} is the default since ${entry.since}: delete the attribute (${entry.itemId})`,
        });
      }
    },
  }),
);

const selectorPattern = new RegExp(
  `(?<![\\w-])(${[...selectors.keys()].join('|') || '(?!)'})(?![\\w-])`,
  'g',
);
const SELECTOR_CALLS = new Set([
  'querySelector',
  'querySelectorAll',
  'closest',
  'matches',
  'css',
]);

const noRenamedSelectors = rule(
  'Report an element this library renamed, in a template and in a TypeScript selector string.',
  (context, seen) => {
    const reportString = (node, text, offset) => {
      for (const match of text.matchAll(selectorPattern)) {
        const entry = seen(selectors.get(match[0]));
        if (!entry) continue;
        const start = node.range[0] + offset + match.index;
        context.report({
          loc: {
            start: context.sourceCode.getLocFromIndex(start),
            end: context.sourceCode.getLocFromIndex(start + match[0].length),
          },
          message: describe(`"${match[0]}"`, entry),
        });
      }
    };
    const checkSelectorString = (node) => {
      if (node?.type === 'Literal' && typeof node.value === 'string')
        reportString(node, node.raw.slice(1, -1), 1);
      else if (
        node?.type === 'TemplateLiteral' &&
        node.expressions.length === 0
      )
        reportString(node, node.quasis[0].value.raw, 1);
    };
    return {
      Element(element) {
        const entry = seen(selectors.get(element.name));
        if (entry)
          context.report({
            loc: spanLoc(context, element.startSourceSpan),
            message: describe(`<${element.name}>`, entry),
          });
      },
      CallExpression(call) {
        const callee =
          call.callee.type === 'MemberExpression'
            ? call.callee.property
            : call.callee;
        if (SELECTOR_CALLS.has(callee?.name))
          checkSelectorString(call.arguments[0]);
      },
      Property(property) {
        if (
          property.key?.name === 'selector' ||
          property.key?.value === 'selector'
        )
          checkSelectorString(property.value);
      },
    };
  },
);

const noRenamedImports = rule(
  'Report an import from this library of a symbol it removed or renamed, and rename a pure rename.',
  (context, seen) => ({
    ImportDeclaration(declaration) {
      if (!PACKAGE.test(declaration.source.value)) return;
      for (const specifier of declaration.specifiers) {
        if (specifier.type !== 'ImportSpecifier') continue;
        const name = specifier.imported.name ?? specifier.imported.value;
        const entry = seen(symbols.get(name));
        if (!entry) continue;
        const aliased = specifier.local.name !== name;
        context.report({
          node: specifier.imported,
          message: describe(`"${name}"`, entry),
          fix: entry.renamed
            ? (fixer) => {
                // The local binding is renamed with it unless the import already aliases it, so
                // every reference in the file keeps resolving.
                if (aliased)
                  return fixer.replaceText(
                    specifier.imported,
                    entry.replacement,
                  );
                const [variable] =
                  context.sourceCode.getDeclaredVariables(specifier);
                // `imported` and `local` are two nodes over one range when nothing aliases them.
                const ranges = new Map(
                  [
                    specifier.local,
                    ...(variable?.references ?? []).map(
                      (reference) => reference.identifier,
                    ),
                  ].map((identifier) => [
                    identifier.range.join(),
                    identifier.range,
                  ]),
                );
                return [...ranges.values()].map((range) =>
                  fixer.replaceTextRange(range, entry.replacement),
                );
              }
            : undefined,
        });
      }
    },
  }),
  true,
);

const MEMBER_DEFINITIONS = new Set([
  'PropertyDefinition',
  'MethodDefinition',
  'TSAbstractPropertyDefinition',
  'TSAbstractMethodDefinition',
  'AccessorProperty',
]);

const noRemovedMembers = rule(
  'Report a member of a class extending or implementing one of ours that now overrides nothing.',
  (context, seen) => {
    const check = (node) => {
      const parents = [
        node.superClass,
        ...(node.implements ?? []).map((clause) => clause.expression),
      ].filter((parent) => parent?.type === 'Identifier');
      for (const parent of parents) {
        const members = membersByOwner.get(parent.name);
        if (!members) continue;
        for (const member of node.body.body) {
          if (!MEMBER_DEFINITIONS.has(member.type) || member.computed) continue;
          const name = member.key?.name ?? member.key?.value;
          const entry = seen(members.get(name));
          if (entry)
            context.report({
              node: member.key,
              message: describe(`"${parent.name}.${name}"`, entry),
            });
        }
      }
    };
    return { ClassDeclaration: check, ClassExpression: check };
  },
);

const noRemovedTokens = rule(
  'Report a custom property this library removed or renamed, in a TypeScript string and a template attribute, and rename a pure rename.',
  (context, seen) => {
    const reportIn = (text, offset) => {
      for (const match of text.matchAll(CUSTOM_PROPERTY)) {
        const entry = seen(tokens.get(match[0]));
        if (!entry) continue;
        const start = offset + match.index;
        const range = [start, start + match[0].length];
        context.report({
          loc: {
            start: context.sourceCode.getLocFromIndex(range[0]),
            end: context.sourceCode.getLocFromIndex(range[1]),
          },
          message:
            entry.kind === 'renamed'
              ? `"${match[0]}" was renamed to "${entry.replacement}" in ${entry.since} (${entry.itemId})`
              : `"${match[0]}" was removed in ${entry.since}${entry.replacement ? `, use ${entry.replacement}` : ''} (${entry.itemId})`,
          fix:
            entry.kind === 'renamed'
              ? (fixer) => fixer.replaceTextRange(range, entry.replacement)
              : undefined,
        });
      }
    };
    // An inline `template:` reaches the Element visitor through angular-eslint's processor, so
    // reading its string here as well would report every name twice.
    const isInlineTemplate = (node) => {
      const property =
        node.parent?.type === 'TemplateLiteral'
          ? node.parent.parent
          : node.parent;
      return property?.type === 'Property' && property.key?.name === 'template';
    };
    return {
      Literal(node) {
        if (typeof node.value === 'string' && !isInlineTemplate(node))
          reportIn(node.raw, node.range[0]);
      },
      TemplateElement(node) {
        if (!isInlineTemplate(node))
          reportIn(context.sourceCode.getText(node), node.range[0]);
      },
      Element(element) {
        for (const attribute of [...element.inputs, ...element.attributes])
          reportIn(
            spanText(context, attribute.sourceSpan),
            attribute.sourceSpan.start.offset,
          );
      },
    };
  },
  true,
);

const rules = {
  'no-removed-inputs': noRemovedInputs,
  'no-removed-outputs': noRemovedOutputs,
  'no-removed-values': noRemovedValues,
  'no-renamed-selectors': noRenamedSelectors,
  'no-renamed-imports': noRenamedImports,
  'no-removed-members': noRemovedMembers,
  'no-removed-tokens': noRemovedTokens,
};

const plugin = {
  meta: { name: '@ids-group-ltd/ids-design-system/eslint' },
  rules,
  configs: {},
};
const recommendedFor = (name, level) => ({
  name,
  files: ['**/*.ts', '**/*.html'],
  plugins: { 'ids-design-system': plugin },
  rules: Object.fromEntries(
    Object.keys(rules).map((rule) => [`ids-design-system/${rule}`, level]),
  ),
});
plugin.configs.recommended = recommendedFor(
  'ids-design-system/recommended',
  'error',
);
plugin.configs.recommendedFrom = (from, to) =>
  recommendedFor(
    `ids-design-system/recommended-from-${from}${to ? `-to-${to}` : ''}`,
    ['error', to ? { from, to } : { from }],
  );

export default plugin;
