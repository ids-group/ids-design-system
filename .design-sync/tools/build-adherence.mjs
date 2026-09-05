// Writes `_adherence.oxlintrc.json` — the lint config that makes the design agent USE the design
// system instead of hand-rolling markup. It forbids the native elements a component replaces,
// blocks imports of component internals, rejects a raw hex/px/font-family where a token exists, and
// per component rejects a prop the component does not declare.
//
// It is generated because every input is already generated: the props and slots come from
// gen.mjs's surface.json, the token names from the compiled stylesheet that actually ships, and the
// native-element mapping from `replaces` in config.json. The live copy carried its own inputs under
// `x-omelette`, which is how the mapping was recovered at all.
//
//   node .design-sync/tools/build-adherence.mjs      # after build-cards.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const syncDir = resolve(here, '..');
const OUT = join(syncDir, 'upload', '_adherence.oxlintrc.json');

if (!existsSync(join(syncDir, 'upload'))) {
  console.error(
    'build-adherence: .design-sync/upload is missing — run build-cards.mjs first.',
  );
  process.exit(1);
}

const config = JSON.parse(readFileSync(join(syncDir, 'config.json'), 'utf8'));
const surface = JSON.parse(
  readFileSync(join(syncDir, 'elements/gen/surface.json'), 'utf8'),
);
const css = readFileSync(join(syncDir, 'elements/dist/ds-bundle.css'), 'utf8');

// The stylesheet that ships is the only honest token list: a name declared in SCSS but compiled
// away is not something a consumer can use, and the colour-families gate reads the same file for
// the same reason.
const tokenKinds = {};
for (const [, name, value] of css.matchAll(
  /(--[a-zA-Z0-9-_]+)\s*:\s*([^;}]+)/g,
)) {
  const raw = value.trim();
  const kind = /^#[0-9a-f]{3,8}$|^(?:rgb|hsl|oklch|color-mix)\(/i.test(raw)
    ? 'color'
    : /^-?[\d.]+(?:px|rem|em|%|vh|vw)$/.test(raw)
      ? 'length'
      : /\b\d+px\b.*\brgba?\(|\binset\b/.test(raw)
        ? 'shadow'
        : /^-?[\d.]+$/.test(raw)
          ? 'number'
          : 'other';
  // First declaration wins: a later theme block redeclares the same name with the same kind, and
  // an `other` from a var() chain must not overwrite a kind already established.
  if (!(name in tokenKinds) || tokenKinds[name] === 'other')
    tokenKinds[name] = kind;
}

// The public `--ds-*` hooks are the knobs a consumer SETS, so in this stylesheet they appear only
// inside the var() that reads them and never as a declaration. Extracting declarations alone
// shipped a token list with the entire public surface missing, which is the opposite of what this
// file is for. Their kind comes from the name, which this library's convention makes reliable.
for (const [, name] of css.matchAll(/var\(\s*(--[a-zA-Z0-9-_]+)/g)) {
  if (name in tokenKinds) continue;
  tokenKinds[name] = /-(?:color|bg|fg)$/.test(name)
    ? 'color'
    : /-(?:radius|size|minw|maxw|minh|maxh|gap|padding|width|height|mt|mb|ml|mr)$/.test(
          name,
        )
      ? 'length'
      : /-shadow$/.test(name)
        ? 'shadow'
        : 'other';
}

const fontFamilies = [
  ...new Set(
    [
      ...css.matchAll(
        /@font-face[^}]*?font-family:\s*(?:'([^']+)'|"([^"]+)"|([^;]+))/g,
      ),
    ].map((match) => (match[1] ?? match[2] ?? match[3]).trim()),
  ),
].sort();

const components = surface.components;
const replaces = Object.fromEntries(
  Object.entries(config.overrides ?? {})
    .filter(([, override]) => override.replaces?.length)
    .map(([name, override]) => [name, override.replaces]),
);

// oxlint's `forbid-elements` keys on the TAG, so `input[type=checkbox]` has to collapse to `input`
// and carry the qualifier in the message — which is what the live copy did, listing `input` four
// times with a different component each.
const forbid = [];
for (const [name, selectors] of Object.entries(replaces)) {
  for (const selector of selectors) {
    const element = selector.replace(/\[.*$/, '');
    const qualifier = selector.slice(element.length);
    forbid.push({
      element,
      message: `Use <${name}> from the design system instead of <${element}${qualifier}>.`,
    });
  }
}

const propRules = components.map((component) => {
  const declared = [
    ...component.api.map((entry) =>
      entry.kind === 'output'
        ? `on${entry.name[0].toUpperCase()}${entry.name.slice(1)}`
        : entry.name,
    ),
    ...component.api
      .filter((entry) => entry.kind === 'model')
      .map(
        (entry) =>
          `on${entry.name[0].toUpperCase()}${entry.name.slice(1)}Change`,
      ),
    ...component.slots.map((slot) => slot.prop),
  ];
  const allowed = [...declared, 'children', 'key', 'ref', 'className', 'style'];

  return {
    selector:
      `JSXOpeningElement[name.name='${component.name}'] > JSXAttribute` +
      ` > JSXIdentifier[name!=/^(?:${allowed.join('|')})$/]`,
    message:
      `<${component.name}> doesn't accept that prop.` +
      ` Declared props: ${[...declared, 'children'].join(', ')}.`,
  };
});

const internals = components
  .map((component) => `components/*/${component.name}/**`)
  .sort();

const oxlint = {
  plugins: ['react', 'import'],
  rules: {
    'react/forbid-elements': ['warn', { forbid }],
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          {
            group: internals,
            message:
              "Import design-system components from 'index.js', not component internals.",
          },
        ],
      },
    ],
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
        message: 'Raw hex color — use a design-system color token via var().',
      },
      {
        selector: 'Literal[value=/\\b\\d+px\\b/]',
        message: 'Raw px value — use a design-system spacing token via var().',
      },
      {
        selector: `Literal[value=/font-family\\s*:\\s*(?!['\\"]?(?:${fontFamilies.join('|')}))/i]`,
        message: `Font not provided by the design system. Available: ${fontFamilies.join(', ')}.`,
      },
      ...propRules,
    ],
  },
  overrides: [
    { files: ['**/index.js'], rules: { 'no-restricted-imports': 'off' } },
  ],
  // Carried the way the live copy carried it: the config is the only artefact in the project that
  // records what the design system offers, and the mapping was recoverable from here alone.
  'x-omelette': {
    components: Object.fromEntries(
      components.map((component) => [
        component.name,
        { replaces: replaces[component.name] ?? [] },
      ]),
    ),
    tokens: Object.keys(tokenKinds).sort(),
    tokenKinds,
    fontFamilies,
  },
};

writeFileSync(OUT, `${JSON.stringify(oxlint, null, 2)}\n`);
console.log(
  `✓ _adherence.oxlintrc.json — ${forbid.length} forbidden element(s),` +
    ` ${propRules.length} prop allowlist(s), ${Object.keys(tokenKinds).length} tokens,` +
    ` fonts: ${fontFamilies.join(', ')}`,
);
