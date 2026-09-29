/** Options for {@link avatarTint}. */
export interface AvatarTintOptions {
  /** Hue arcs (degrees, `[start, end]` with `start < end`, within 0-360) the derived hue
   *  never lands in, e.g. `[[310, 360], [0, 20]]`. An arc crossing 0 is given as two arcs.
   *  Default: none. */
  avoidHues?: readonly (readonly [number, number])[];
  /** HSL lightness percentage. Default 62. */
  lightness?: number;
  /** HSL saturation percentage. Default 50. */
  saturation?: number;
  /** Text colour paired with the background. Default `#fff`. */
  foreground?: string;
}

/** Deterministic `{ bg, fg }` tint for a seed string (an email, a name): the same seed always
 *  gives the same colour.
 *
 *  The background is `hsl(H 50% 62%)` and the text is always white. White on the lighter hues
 *  measures as little as 1.65:1, under the 4.5:1 WCAG AA asks of text. Where the initials are
 *  the only identifier, pass `lightness` about 50 and keep white (5.3-6.6:1). */
export function avatarTint(
  seed: string,
  options?: AvatarTintOptions,
): { bg: string; fg: string } {
  const lightness = options?.lightness ?? 62;
  const saturation = options?.saturation ?? 50;
  const hue = pickHue(hashSeed(seed), options?.avoidHues ?? []);

  return {
    bg: `hsl(${hue} ${saturation}% ${lightness}%)`,
    fg: options?.foreground ?? '#fff',
  };
}

/** Uppercased initials from the first two words. Accepts `(first, last)` parts or a single
 *  full name (`initialsFrom('Ada Lovelace')` gives `AL`); a lone name gives one letter, `?`
 *  when empty.
 *
 *  A deliberately naive Latin-script guess. An app with a real naming rule passes its own via
 *  `DS_CONFIG.avatar.initials` or `ds-avatar`'s `initialsRule`. */
export function initialsFrom(first?: string, last?: string): string {
  const words =
    last === undefined
      ? (first ?? '').trim().split(/\s+/).filter(Boolean)
      : [first ?? '', last ?? ''];
  const firstInitial = (words[0] ?? '').trim()[0] ?? '';
  const lastInitial = (words[1] ?? '').trim()[0] ?? '';

  return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
}

// Java String.hashCode shape; the `<< 5` keeps hash in int range.
function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index++) {
    hash = seed.charCodeAt(index) + ((hash << 5) - hash);
  }

  return hash;
}

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
