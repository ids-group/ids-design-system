// Every PAIR of slots, not only the adjacent ones: a categorical palette is handed an arbitrary
// subset of its slots, so any two can end up side by side.
//
// Vendored rather than shelled out to, because the validator it came from lives in a bundled skill
// directory whose path carries a version, and a gate that breaks on somebody else's upgrade is not
// a gate.
//
// Colour-vision deficiency is REPORTED, never enforced - it is not a requirement of this system
// (Stas, 2026-09-21). The numbers still print so a future repaint can be judged against them.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Machado, Oliveira and Fernandes (2009), severity 1.0, applied in LINEAR rgb. */
const CVD = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

/** The band the palette was designed against is 6-8, so 6 is the floor a pair may not go under.
 *  Two slots closer than this are the same colour to a reader glancing at a legend. */
const SEPARATION_FLOOR = 6;
/** Under simulated CVD the bar is lower, because the whole gamut has collapsed - but not to zero. */
const CVD_FLOOR = 4;
/** A categorical slot must not be so pale it reads as a disabled mark, nor so dark it reads as ink. */
const LIGHTNESS_BAND = [0.3, 0.85];
/** A slot with no chroma is a neutral, and one neutral in a categorical set is a role, not a hue. */
const CHROMA_FLOOR = 0.02;
const SURFACE_CONTRAST_FLOOR = 1.4;

const toLinear = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const toSrgb = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

function hslToLinear(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const chroma = (1 - Math.abs(2 * light - 1)) * sat;
  const second = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const match = light - chroma / 2;
  const [r, g, b] = (
    h < 60
      ? [chroma, second, 0]
      : h < 120
        ? [second, chroma, 0]
        : h < 180
          ? [0, chroma, second]
          : h < 240
            ? [0, second, chroma]
            : h < 300
              ? [second, 0, chroma]
              : [chroma, 0, second]
  ).map((channel) => channel + match);

  return [toLinear(r), toLinear(g), toLinear(b)];
}

const hex = (linear) =>
  '#' +
  linear
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, toSrgb(c))) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

function oklab([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const deltaE = (a, b) =>
  Math.hypot(...oklab(a).map((value, index) => value - oklab(b)[index])) * 100;

const simulate = (linear, matrix) =>
  matrix.map((row) =>
    row.reduce((sum, weight, i) => sum + weight * linear[i], 0),
  );

const relLuminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const contrast = (a, b) => {
  const [light, dark] = [relLuminance(a), relLuminance(b)].sort(
    (x, y) => y - x,
  );

  return (light + 0.05) / (dark + 0.05);
};

// --------------------------------------------------------------- the palette
// `--hexes '#aabbcc,#ddeeff'` checks a CANDIDATE instead of the shipped palette, so a repaint can
// be measured before it is written into the tokens.
const asked = process.argv.indexOf('--hexes');
const hexToLinear = (value) =>
  [1, 3, 5].map((at) => toLinear(parseInt(value.slice(at, at + 2), 16) / 255));

const slots =
  asked === -1
    ? [
        ...readFileSync(
          join(repo, 'src/lib/styles/_tokens-charts.scss'),
          'utf8',
        ).matchAll(
          /--chart-categorical-(\d+):\s*hsl\(\s*([\d.]+)deg\s+([\d.]+)%\s+([\d.]+)%\s*\)/g,
        ),
      ].map((match) => ({
        name: `--chart-categorical-${match[1]}`,
        linear: hslToLinear(
          Number(match[2]),
          Number(match[3]),
          Number(match[4]),
        ),
      }))
    : (process.argv[asked + 1] ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value, index) => ({
          name: `candidate-${index + 1}`,
          linear: hexToLinear(value),
        }));

if (slots.length === 0) {
  console.error(
    'check-chart-palette-separation: found no categorical slots to check.',
  );
  process.exit(1);
}

const surfaces = {
  '--surface-default': hslToLinear(0, 0, 100),
  '--surface-canvas': hslToLinear(220, 20, 97),
};

const problems = [];
const advisories = [];

for (const slot of slots) {
  const [lightness, a, b] = oklab(slot.linear);
  const chroma = Math.hypot(a, b);
  if (lightness < LIGHTNESS_BAND[0] || lightness > LIGHTNESS_BAND[1]) {
    problems.push(
      `${slot.name} ${hex(slot.linear)} lightness ${lightness.toFixed(2)} is outside ${LIGHTNESS_BAND.join('-')}`,
    );
  }
  if (chroma < CHROMA_FLOOR) {
    problems.push(
      `${slot.name} ${hex(slot.linear)} chroma ${chroma.toFixed(3)} is under the ${CHROMA_FLOOR} floor — a neutral is a role, not a categorical hue`,
    );
  }
  for (const [surfaceName, surface] of Object.entries(surfaces)) {
    const ratio = contrast(slot.linear, surface);
    if (ratio < SURFACE_CONTRAST_FLOOR) {
      problems.push(
        `${slot.name} ${hex(slot.linear)} is ${ratio.toFixed(2)}:1 against ${surfaceName}, under ${SURFACE_CONTRAST_FLOOR}:1`,
      );
    }
  }
}

for (let i = 0; i < slots.length; i++) {
  for (let j = i + 1; j < slots.length; j++) {
    const [left, right] = [slots[i], slots[j]];
    const plain = deltaE(left.linear, right.linear);
    if (plain < SEPARATION_FLOOR) {
      problems.push(
        `${hex(left.linear)}↔${hex(right.linear)} ΔE ${plain.toFixed(1)} (normal vision), under the ${SEPARATION_FLOOR} floor — ${left.name} and ${right.name}`,
      );
    }
    for (const [kind, matrix] of Object.entries(CVD)) {
      const seen = deltaE(
        simulate(left.linear, matrix),
        simulate(right.linear, matrix),
      );
      if (seen < CVD_FLOOR) {
        advisories.push(
          `${hex(left.linear)}↔${hex(right.linear)} ΔE ${seen.toFixed(1)} (${kind}), under the ${CVD_FLOOR} advisory floor — ${left.name} and ${right.name}`,
        );
      }
    }
  }
}

const pairs = (slots.length * (slots.length - 1)) / 2;

for (const advisory of advisories) {
  console.log(`check-chart-palette-separation: note   ${advisory}`);
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`check-chart-palette-separation: ERROR  ${problem}`);
  }
  console.error(
    `check-chart-palette-separation: FAILED — ${problems.length} problem(s) over ${slots.length} slots and ${pairs} pairs`,
  );
  process.exit(1);
}

console.log(
  `check-chart-palette-separation: OK — ${slots.length} slots, ${pairs} pairs separable to ${SEPARATION_FLOOR}` +
    (advisories.length > 0
      ? `; ${advisories.length} pair(s) noted under simulated colour blindness, which this gate does not enforce.`
      : '.'),
);
