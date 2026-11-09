// `ids-design-system/use-tokens`: reports a raw style value where the design system has a token for
// it, and names the token: the exact one when the value is on the scale, otherwise the nearest step,
// said as nearest.
import { createRequire } from 'node:module';
import { relative } from 'node:path';
import stylelint from 'stylelint';
import { normalizeColor, normalizeEase, tokens } from './tokens.mjs';

// Both ship with stylelint, so they resolve from it under any package manager.
const fromStylelint = createRequire(import.meta.resolve('stylelint'));
const valueParser = fromStylelint('postcss-value-parser');
const micromatch = fromStylelint('micromatch');

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

export const ruleName = 'ids-design-system/use-tokens';

const messages = ruleMessages(ruleName, {
  exact: (category, prop, raw, suggestion) =>
    `${category}: raw "${raw}" in ${prop}, use ${suggestion}`,
  nearest: (category, prop, raw, suggestion, tokenValue) =>
    `${category}: raw "${raw}" in ${prop} has no exact token, nearest ${suggestion} (${tokenValue})`,
  none: (category, prop, raw) =>
    `${category}: raw "${raw}" in ${prop} matches no design-system colour`,
});

export const CATEGORIES = [
  [
    'radius',
    /^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/,
  ],
  [
    'space',
    /^(margin|padding|inset|scroll-margin|scroll-padding)(-.+)?$|^(grid-)?(row-|column-)?gap$/,
  ],
  ['font-size', /^font-size$/],
  ['line-height', /^line-height$/],
  ['font-weight', /^font-weight$/],
  ['shadow', /^box-shadow$/],
  ['z-index', /^z-index$/],
  ['motion', /^(transition|animation)(-(duration|delay|timing-function))?$/],
];
const CATEGORY_NAMES = ['color', ...CATEGORIES.map(([name]) => name)];

const ALWAYS_ALLOWED = new Set([
  '0',
  'auto',
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
  'currentcolor',
  'transparent',
  'none',
  'normal',
  '100%',
]);
const MATH = new Set(['calc', 'min', 'max', 'clamp']);
const COLOR_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla']);
const NAMED_COLORS = new Set([
  'white',
  'black',
  'red',
  'green',
  'blue',
  'gray',
  'grey',
  'silver',
  'orange',
  'yellow',
  'purple',
  'pink',
]);
const EASE_KEYWORDS = {
  ease: '--ease-standard',
  'ease-in-out': '--ease-standard',
  'ease-out': '--ease-decelerate',
  'ease-in': '--ease-accelerate',
};
const ROLE_PREFIX = [
  [/^(color|caret-color|-webkit-text-fill-color)$/, ['--text-', '--icon-']],
  [/^(fill|stroke)$/, ['--icon-', '--text-']],
  [/^(border|outline|column-rule)/, ['--border-']],
  [/^background/, ['--surface-', '--primary', '--secondary']],
];

const variable = (name) => `var(${name})`;

// Exact when a token holds the number, otherwise the nearest non-zero step: a value that is not
// zero is never pointed at a zero token, and a tie goes to the smaller step.
const onScale = (list, number, format = (token) => token.value) => {
  const hit = list.find((token) => token.number === number);
  if (hit) return { kind: 'exact', token: hit.name };
  const near = list
    .filter((token) => token.number !== 0)
    .sort((a, b) => a.number - b.number)
    .reduce((best, token) =>
      Math.abs(token.number - number) < Math.abs(best.number - number)
        ? token
        : best,
    );
  return { kind: 'nearest', token: near.name, tokenValue: format(near) };
};

const lengthInPx = ({ number, unit }) => {
  const value = Math.abs(parseFloat(number));
  if (unit === 'px') return value;
  if (unit === 'rem') return value * 16;
  return null;
};

const judgeWord = (category, word, inMath) => {
  const lower = word.toLowerCase();
  if (
    ALWAYS_ALLOWED.has(lower) ||
    lower.startsWith('$') ||
    lower.startsWith('-$')
  )
    return null;
  const parsed = valueParser.unit(word);

  if (category === 'motion') {
    if (EASE_KEYWORDS[lower])
      return {
        kind: 'nearest',
        token: EASE_KEYWORDS[lower],
        tokenValue: 'keyword',
      };
    if (!parsed || !/^m?s$/.test(parsed.unit)) return null;
    const ms = parseFloat(parsed.number) * (parsed.unit === 's' ? 1000 : 1);
    return ms === 0 ? null : onScale(tokens.duration, ms);
  }
  if (category === 'font-weight') {
    const weight =
      lower === 'bold'
        ? 700
        : parsed && parsed.unit === ''
          ? +parsed.number
          : null;
    return weight === null ? null : onScale(tokens.fontWeight, weight);
  }
  if (!parsed) return null;
  if (category === 'line-height')
    return parsed.unit === ''
      ? onScale(tokens.lineHeight, +parsed.number)
      : null;
  if (category === 'z-index') {
    if (parsed.unit !== '' || inMath) return null;
    const layer = +parsed.number;
    const exact = tokens.layer.find((token) => token.number === layer);
    if (exact) return { kind: 'exact', token: exact.name };
    // A small or negative index orders siblings inside one stacking context; the layer scale is
    // for what stacks across the page.
    if (layer < 100) return null;
    return onScale(tokens.layer, layer);
  }
  if (category === 'radius' && parsed.unit === '%')
    return parsed.number === '50' && !inMath
      ? { kind: 'exact', token: '--radius-pill' }
      : null;
  if (inMath && (parsed.unit === '' || parsed.unit === '%')) return null;
  const px = lengthInPx(parsed);
  if (px === null || px === 0) return null;
  if (category === 'radius' && px >= 100)
    return { kind: 'exact', token: '--radius-pill' };
  const list = {
    radius: tokens.radius,
    space: tokens.space,
    'font-size': tokens.fontSize,
  }[category];
  const finding = onScale(list, px, (token) => `${token.number}px`);
  return { ...finding, negative: parsed.number.startsWith('-') };
};

const judgeColor = (raw, prop) => {
  const hex = normalizeColor(raw);
  const match = hex && tokens.colorsByHex.get(hex);
  if (!match) return { kind: 'none' };
  if (!match.semantic.length)
    return { kind: 'exact', token: match.palette[0], paletteOnly: true };
  const prefixes =
    ROLE_PREFIX.find(([pattern]) => pattern.test(prop))?.[1] ?? [];
  const preferred = prefixes.flatMap((prefix) =>
    match.semantic.filter((name) => name.startsWith(prefix)),
  )[0];
  return { kind: 'exact', token: preferred ?? match.semantic[0] };
};

// A layer drawn inset or with no blur is a ring or a hairline, a border by other means, so only the
// remaining layers are compared with the elevation scale.
const judgeShadow = (value) => {
  const layers = [[]];
  for (const node of valueParser(value).nodes) {
    if (node.type === 'div' && node.value === ',') layers.push([]);
    else if (node.type === 'word') layers.at(-1).push(node.value.toLowerCase());
  }
  const elevation = layers
    .map((words) => ({
      inset: words.includes('inset'),
      lengths: words
        .filter((word) => /^-?[\d.]+(px)?$/.test(word))
        .map(parseFloat),
    }))
    .filter(
      ({ inset, lengths }) => !inset && lengths.length >= 3 && lengths[2] > 0,
    );
  if (!elevation.length) return null;
  const [, y, blur] = elevation[0].lengths;
  const best = tokens.shadow.reduce((a, b) =>
    Math.abs(b.blur - blur) < Math.abs(a.blur - blur) ? b : a,
  );
  return best.y === y && best.blur === blur
    ? { kind: 'exact', token: best.name }
    : { kind: 'nearest', token: best.name, tokenValue: 'nearest elevation' };
};

const suggestionOf = ({ token, negative, paletteOnly }) => {
  if (!token) return undefined;
  if (negative) return `calc(-1 * ${variable(token)})`;
  return paletteOnly
    ? `${variable(token)} (a palette step, no role token holds it)`
    : variable(token);
};

const optionList = (value) =>
  value === undefined || Array.isArray(value)
    ? true
    : typeof value === 'object' && value !== null;

const rule =
  (primary, secondary = {}) =>
  (root, result) => {
    if (
      !validateOptions(
        result,
        ruleName,
        { actual: primary },
        {
          actual: secondary,
          possible: {
            allow: [(value) => typeof value === 'string' || optionList(value)],
            categories: [
              (value) =>
                typeof value === 'object' &&
                Object.entries(value).every(
                  ([name, setting]) =>
                    CATEGORY_NAMES.includes(name) &&
                    [true, false, 'warning', 'error'].includes(setting),
                ),
            ],
            ignore: [(value) => typeof value === 'string'],
            ignoreProperties: [(value) => typeof value === 'string'],
          },
          optional: true,
        },
      )
    )
      return;

    const file = root.source?.input?.file;
    if (
      file &&
      secondary.ignore?.length &&
      micromatch.isMatch(
        relative(process.cwd(), file).replaceAll('\\', '/'),
        secondary.ignore,
      )
    )
      return;

    const allow = Array.isArray(secondary.allow)
      ? { '*': secondary.allow }
      : (secondary.allow ?? {});
    const settings = { ...secondary.categories };
    const enabled = (category) => settings[category] !== false;
    const severityOf = (category) =>
      typeof settings[category] === 'string' ? settings[category] : undefined;
    const ignoredProperties = (secondary.ignoreProperties ?? []).map(
      (pattern) => new RegExp(pattern),
    );
    const allowed = (category, prop, raw) =>
      [allow['*'], allow[category], allow[prop]].some((list) =>
        list?.includes(raw),
      );

    root.walkDecls((declaration) => {
      const prop = declaration.prop.toLowerCase();
      if (
        prop.startsWith('$') ||
        prop.startsWith('--') ||
        declaration.value.includes('#{')
      )
        return;
      if (ignoredProperties.some((pattern) => pattern.test(prop))) return;
      const category = CATEGORIES.find(([, pattern]) =>
        pattern.test(prop),
      )?.[0];
      const valueIndex =
        declaration.prop.length + (declaration.raws.between ?? ':').length;

      const emit = (finding, ofCategory, raw, index) => {
        if (!finding || !enabled(ofCategory) || allowed(ofCategory, prop, raw))
          return;
        report({
          ruleName,
          result,
          node: declaration,
          index: valueIndex + index,
          endIndex: valueIndex + index + raw.length,
          severity: severityOf(ofCategory),
          message: messages[finding.kind](
            ofCategory,
            prop,
            raw,
            suggestionOf(finding),
            finding.tokenValue,
          ),
        });
      };

      if (category === 'shadow') {
        if (
          /\d+px/.test(declaration.value) &&
          !/^\s*var\(/.test(declaration.value) &&
          !declaration.value.includes('$')
        )
          emit(judgeShadow(declaration.value), 'shadow', declaration.value, 0);
        return;
      }

      const visit = (nodes, inMath) => {
        for (const node of nodes) {
          if (node.type === 'function') {
            const name = node.value.toLowerCase();
            if (name === 'var' || name === 'env' || name === 'url') continue;
            const raw = valueParser.stringify(node);
            if (COLOR_FUNCTIONS.has(name)) {
              if (!raw.includes('$') && !raw.includes('var('))
                emit(judgeColor(raw, prop), 'color', raw, node.sourceIndex);
              continue;
            }
            if (name === 'cubic-bezier') {
              if (category === 'motion') {
                const hit = tokens.ease.find(
                  (token) => token.normalized === normalizeEase(raw),
                );
                emit(
                  hit
                    ? { kind: 'exact', token: hit.name }
                    : {
                        kind: 'nearest',
                        token: '--ease-standard',
                        tokenValue: 'closest family',
                      },
                  'motion',
                  raw,
                  node.sourceIndex,
                );
              }
              continue;
            }
            visit(node.nodes, inMath || MATH.has(name));
            continue;
          }
          if (node.type !== 'word') continue;
          const word = node.value;
          if (
            /^#[0-9a-f]{3,8}$/i.test(word) ||
            NAMED_COLORS.has(word.toLowerCase())
          ) {
            emit(judgeColor(word, prop), 'color', word, node.sourceIndex);
            continue;
          }
          if (category)
            emit(
              judgeWord(category, word, inMath),
              category,
              word,
              node.sourceIndex,
            );
        }
      };
      visit(valueParser(declaration.value).nodes, false);
    });
  };

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = {
  url: 'https://www.npmjs.com/package/@ids-group-ltd/ids-design-system',
};

export default createPlugin(ruleName, rule);
