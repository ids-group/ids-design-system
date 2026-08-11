/** Options for {@link avatarTint}. */
export interface AvatarTintOptions {
  /** Hue arcs (degrees, `[start, end]` with `start < end`, within 0–360) the
   *  derived hue must never land in — e.g. `[[310, 360], [0, 20]]` to skip a
   *  pink brand hue and reds. An arc crossing 0° must be given as two arcs.
   *  Default: none (full 0–360 range). */
  avoidHues?: readonly (readonly [number, number])[];
  /** OKLCH lightness percentage. Default 62. */
  lightness?: number;
  /** OKLCH chroma. Default 0.14. */
  chroma?: number;
  /** Text colour paired with the background. Default: auto — black or white,
   *  whichever reads best on the derived background (WCAG luminance). */
  foreground?: string;
}

/** Deterministic `{ bg, fg }` tint for a seed string (an email, a name), so the
 *  same person always gets the same colour. The background is an OKLCH colour
 *  (perceptually even lightness across hues); the text defaults to whichever of
 *  black/white reads best on it. Pass to `ds-avatar`'s `tint`, or let the
 *  component derive it via its `seed` input. */
export function avatarTint(
  seed: string,
  options?: AvatarTintOptions,
): { bg: string; fg: string } {
  const lightness = options?.lightness ?? 62;
  const chroma = options?.chroma ?? 0.14;
  const hue = pickHue(hashSeed(seed), options?.avoidHues ?? []);
  const foreground =
    options?.foreground ??
    (relativeLuminance(lightness / 100, chroma, hue) > 0.179 ? '#000' : '#fff');

  return { bg: `oklch(${lightness}% ${chroma} ${hue})`, fg: foreground };
}

// Relative luminance of an oklch(L C H) colour (L as 0–1) via OKLab → linear
// sRGB, for the WCAG black-vs-white text crossover (~0.179).
function relativeLuminance(
  lightness: number,
  chroma: number,
  hue: number,
): number {
  const hueRadians = (hue * Math.PI) / 180;
  const aAxis = chroma * Math.cos(hueRadians);
  const bAxis = chroma * Math.sin(hueRadians);
  const longCubeRoot = lightness + 0.3963377774 * aAxis + 0.2158037573 * bAxis;
  const mediumCubeRoot =
    lightness - 0.1055613458 * aAxis - 0.0638541728 * bAxis;
  const shortCubeRoot = lightness - 0.0894841775 * aAxis - 1.291485548 * bAxis;
  const long = longCubeRoot ** 3;
  const medium = mediumCubeRoot ** 3;
  const short = shortCubeRoot ** 3;
  const red = clamp01(
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
  );
  const green = clamp01(
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
  );
  const blue = clamp01(
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Which rule to read a full name by. The two are genuinely different and a
 *  consumer that shows both people and organisations needs both: "Mary Jane
 *  Watson" is MW, while "Blue Cross Blue Shield" is BC and emphatically not BS. */
export interface InitialsOptions {
  of: 'person' | 'organisation';
}

/** Uppercased initials. `(first, last)` parts, or a single full name —
 *  `initialsFrom('Ada Lovelace')` → `AL`. `?` when empty.
 *
 *  Pass `{ of }` for a name whose shape you know:
 *  - `'person'` takes the first and LAST word, so a middle name does not steal
 *    the second letter, and a single word gives its first two letters rather
 *    than one lonely one.
 *  - `'organisation'` takes the first two words with punctuation stripped, which
 *    is why "Blue Cross Blue Shield" comes out BC.
 *
 *  Without `of` the rule is unchanged from earlier releases: first two words, one
 *  letter for a lone name. That is the ORG rule, so it is wrong for the people it
 *  is usually pointed at — say `{ of: 'person' }` there. Flipping the default is a
 *  breaking change and is queued with the rest of them. */
export function initialsFrom(first?: string, last?: string): string;
export function initialsFrom(
  fullName: string,
  options: InitialsOptions,
): string;
export function initialsFrom(
  first?: string,
  last?: string | InitialsOptions,
): string {
  const options = typeof last === 'object' && last !== null ? last : null;
  const parts =
    options || last === undefined
      ? (first ?? '').trim().split(/\s+/).filter(Boolean)
      : [first ?? '', (last as string) ?? ''];

  const words =
    options?.of === 'organisation' ? stripPunctuation(parts) : parts;
  const head = words[0] ?? '';
  const tail =
    options?.of === 'person'
      ? (words[words.length - 1] ?? '')
      : (words[1] ?? '');

  // One word, and a mode that asked for two letters: an avatar tile with a single
  // glyph reads as unfinished, and the second letter has to come from somewhere.
  const second =
    options && words.length < 2 ? ([...head][1] ?? '') : ([...tail][0] ?? '');

  return `${[...head][0] ?? ''}${second}`.toUpperCase() || '?';
}

/** Leading/trailing punctuation only — an inner hyphen is part of the word, so
 *  "Blue-Cross Shield" still yields B and S rather than losing a letter. */
function stripPunctuation(words: readonly string[]): string[] {
  return words
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean);
}

// Java String.hashCode shape (hash*31 + charCode); the `<< 5` keeps hash in int range.
function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return hash;
}

// Distribute the hash evenly across 0–360 minus the excluded arcs, so the result
// can never fall inside one.
function pickHue(
  hash: number,
  avoidHues: readonly (readonly [number, number])[],
): number {
  const excluded = normalizeArcs(avoidHues);
  const excludedDegrees = excluded.reduce(
    (sum, [start, end]) => sum + (end - start),
    0,
  );
  const allowedDegrees = Math.max(1, 360 - excludedDegrees);
  let position = ((hash % allowedDegrees) + allowedDegrees) % allowedDegrees;

  let cursor = 0;
  for (const [start, end] of excluded) {
    const gap = start - cursor;
    if (position < gap) {
      return cursor + position;
    }
    position -= gap;
    cursor = end;
  }

  return cursor + position;
}

// Clamp to 0–360, drop empties, sort, merge overlaps → clean non-overlapping arcs.
function normalizeArcs(
  arcs: readonly (readonly [number, number])[],
): [number, number][] {
  const clamped = arcs
    .map(
      ([start, end]) =>
        [
          Math.max(0, Math.min(360, start)),
          Math.max(0, Math.min(360, end)),
        ] as [number, number],
    )
    .filter(([start, end]) => end > start)
    .sort((left, right) => left[0] - right[0]);

  const merged: [number, number][] = [];
  for (const [start, end] of clamped) {
    const previous = merged[merged.length - 1];
    if (previous && start <= previous[1]) {
      previous[1] = Math.max(previous[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}
