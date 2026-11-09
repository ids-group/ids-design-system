// The token tables `use-tokens` matches raw values against and the names `known-tokens` accepts,
// read at load time from the stylesheets and the bundle that sit beside this folder (`styles/`,
// `themes/`, `fesm2022/`).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const lib = existsSync(join(packageRoot, 'styles/_tokens.scss'))
  ? packageRoot
  : join(packageRoot, 'src/lib');

const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

const declarations = (file) =>
  [
    ...stripComments(readFileSync(join(lib, file), 'utf8')).matchAll(
      /(--[\w-]+)\s*:\s*([^;{}]+);/g,
    ),
  ].map((match) => [match[1], match[2].replace(/\s+/g, ' ').trim()]);

const hex2 = (number) =>
  Math.round(number).toString(16).padStart(2, '0').toUpperCase();

const hslToHex = (hue, saturation, lightness) => {
  const s = saturation / 100;
  const l = lightness / 100;
  const k = (n) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const channel = (n) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${hex2(channel(0) * 255)}${hex2(channel(8) * 255)}${hex2(channel(4) * 255)}`;
};

// An opaque colour as `#RRGGBB`, or null for anything translucent or not a literal colour.
export const normalizeColor = (raw) => {
  const value = raw.trim().toLowerCase();
  let match = value.match(/^#([0-9a-f]{3,8})$/);
  if (match) {
    let hex = match[1];
    if (hex.length === 3 || hex.length === 4)
      hex = [...hex].map((digit) => digit + digit).join('');
    if (hex.length === 8 && hex.endsWith('ff')) hex = hex.slice(0, 6);
    return hex.length === 6 ? `#${hex.toUpperCase()}` : null;
  }
  match = value.match(
    /^hsla?\(\s*(-?[\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%\s*(?:[,/]\s*(1|100%))?\s*\)$/,
  );
  if (match) return hslToHex(+match[1], +match[2], +match[3]);
  match = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*(1|100%))?\s*\)$/,
  );
  if (match) return `#${hex2(+match[1])}${hex2(+match[2])}${hex2(+match[3])}`;
  if (value === 'white') return '#FFFFFF';
  if (value === 'black') return '#000000';
  return null;
};

const scale = new Map(declarations('styles/_tokens.scss').reverse());
const colorDeclarations = new Map();
const semantic = new Set();
for (const file of [
  'themes/_base-palette.scss',
  'themes/light/_palette.scss',
  'themes/_semantic.scss',
])
  for (const [name, value] of declarations(file)) {
    if (!colorDeclarations.has(name)) colorDeclarations.set(name, value);
    if (file.includes('_semantic')) semantic.add(name);
  }

const all = new Map([...scale, ...colorDeclarations]);
const resolve = (value, depth = 0) => {
  if (depth > 20) return value;
  const next = value.replace(/var\((--[\w-]+)(?:,[^()]*)?\)/g, (whole, name) =>
    all.has(name) ? resolve(all.get(name), depth + 1) : whole,
  );
  return next.replace(/calc\(\s*(-?[\d.]+)\s*-\s*([\d.]+)\s*\)/g, (_, a, b) =>
    String(a - b),
  );
};

const colorsByHex = new Map();
for (const [name, value] of colorDeclarations) {
  const hex = normalizeColor(resolve(value));
  if (!hex) continue;
  if (!colorsByHex.has(hex))
    colorsByHex.set(hex, { semantic: [], palette: [] });
  colorsByHex.get(hex)[semantic.has(name) ? 'semantic' : 'palette'].push(name);
}

const group = (prefix, exclude = []) =>
  [...scale.keys()]
    .filter(
      (name) =>
        name.startsWith(prefix) && !exclude.some((part) => name.includes(part)),
    )
    .map((name) => ({ name, value: resolve(scale.get(name)) }));

const inPx = (list) =>
  list
    .filter((token) => /^(0|[\d.]+px)$/.test(token.value))
    .map((token) => ({ ...token, number: parseFloat(token.value) }));

const numeric = (list) =>
  list.map((token) => ({ ...token, number: +token.value }));

export const tokens = {
  colorsByHex,
  space: inPx(group('--space-', ['stack', 'inline'])),
  radius: inPx(group('--radius-', ['pill-value', 'flat'])),
  fontSize: inPx(group('--font-size-', ['h5-strong', 'mono'])),
  fontWeight: numeric(group('--font-weight-')),
  lineHeight: numeric(group('--line-height-')),
  layer: numeric(group('--layer-')),
  duration: group('--duration-', ['loop']).map((token) => ({
    ...token,
    number: parseFloat(token.value),
  })),
  ease: group('--ease-').map((token) => ({
    ...token,
    normalized: normalizeEase(token.value),
  })),
  shadow: group('--shadow-')
    .filter((token) => /^--shadow-\d$/.test(token.name))
    .map((token) => {
      const [, y, blur] = token.value.match(/^0 (\d+)px (\d+)px/) ?? [];
      return { ...token, y: +y, blur: +blur };
    }),
};

export function normalizeEase(value) {
  return value.replace(/\s+/g, '').replace(/(^|[(,])0\./g, '$1.');
}

// Every custom property name the library declares or reads: tokens, theme roles and the `--ds-*`
// hooks its components read, which live in the compiled bundle rather than in `styles/`.
const filesUnder = (directory, pattern) =>
  existsSync(directory)
    ? readdirSync(directory, { recursive: true })
        .filter((file) => pattern.test(file))
        .map((file) => join(directory, file))
    : [];

export const libraryNames = new Set(
  [
    ...(lib === packageRoot
      ? [
          ...filesUnder(join(lib, 'styles'), /\.s?css$/),
          ...filesUnder(join(lib, 'themes'), /\.s?css$/),
          ...filesUnder(join(lib, 'fesm2022'), /\.mjs$/),
        ]
      : filesUnder(lib, /\.(scss|ts)$/)),
  ].flatMap((file) =>
    [...readFileSync(file, 'utf8').matchAll(/(?<![\w-])--[a-zA-Z][\w-]*/g)].map(
      (match) => match[0],
    ),
  ),
);
