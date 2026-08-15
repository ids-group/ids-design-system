/** Options for {@link avatarTint}. */
export interface AvatarTintOptions {
  /** Hue arcs (degrees, `[start, end]` with `start < end`, within 0–360) the
   *  derived hue must never land in — e.g. `[[310, 360], [0, 20]]` to skip a
   *  pink brand hue and reds. An arc crossing 0° must be given as two arcs.
   *  Default: none (full 0–360 range). */
  avoidHues?: readonly (readonly [number, number])[];
  /** HSL lightness percentage. Default 62. */
  lightness?: number;
  /** HSL saturation percentage. Default 50. */
  saturation?: number;
  /** Text colour paired with the background. Default `#fff`. */
  foreground?: string;
}

/** Deterministic `{ bg, fg }` tint for a seed string (an email, a name), so the
 *  same person always gets the same colour.
 *
 *  The background is `hsl(H 50% 62%)` and the text is WHITE, always — the recipe
 *  Stas chose on 2026-08-16, ported from pinkmoon's own avatar. It is a
 *  deliberate trade: HSL lightness is not perceptually even, so yellows and
 *  greens come out far lighter than blues and purples, and that unevenness is
 *  what makes the set read as bright rather than uniform. The cost is contrast —
 *  white on the lighter hues measures as little as 1.65:1, under the 4.5:1 WCAG
 *  AA asks of text. Pair it with a name elsewhere on screen wherever the initials
 *  carry meaning, or pass `lightness` down and `foreground` to suit.
 *
 *  Pass to `ds-avatar`'s `tint`, or let the component derive it via `seed`. */
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

/** Uppercased initials from the first two words. Accepts `(first, last)` parts or
 *  a single full name (`initialsFrom('Ada Lovelace')` → `AL`); a lone name gives
 *  one letter, `?` when empty.
 *
 *  A deliberately naive Latin-script guess, and the library's ONLY naming rule.
 *  Reading a name is a cultural convention, not a UI decision — "María José
 *  García López" wants MG from a Spanish reader and "Blue Cross Blue Shield" wants
 *  BC from an insurer — so an app with a real rule passes its own through
 *  `DS_CONFIG.avatar.initials` or `ds-avatar`'s `initialsRule` rather than asking
 *  this to grow modes it cannot get right. */
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
