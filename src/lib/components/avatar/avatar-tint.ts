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

/** Uppercased initials from the first two words. Accepts `(first, last)` parts
 *  or a single full name (`initialsFrom('Ada Lovelace')` → `AL`); a lone name
 *  gives one letter, `?` when empty. More than two words is rare — only the
 *  first two are used. */
export function initialsFrom(first?: string, last?: string): string {
  const words =
    last === undefined
      ? (first ?? '').trim().split(/\s+/).filter(Boolean)
      : [first ?? '', last ?? ''];
  const firstInitial = (words[0] ?? '').trim()[0] ?? '';
  const lastInitial = (words[1] ?? '').trim()[0] ?? '';

  return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
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
