/** Options for {@link avatarTint}. */
export interface AvatarTintOptions {
  /** Hue arcs (degrees, `[start, end]` with `start < end`, within 0–360) the
   *  derived hue must never land in — e.g. `[[310, 360], [0, 20]]` to skip a
   *  pink brand hue and reds. An arc crossing 0° must be given as two arcs.
   *  Default: none (full 0–360 range). */
  avoidHues?: readonly (readonly [number, number])[];
  /** HSL saturation percentage. Default 50. */
  saturation?: number;
  /** HSL lightness percentage. Default 62. */
  lightness?: number;
  /** Foreground colour paired with the derived background. Default `#fff`. */
  foreground?: string;
}

/** Deterministic `{ bg, fg }` tint for a seed string (an email, a name), so the
 *  same person always gets the same colour. Pass to `ds-avatar`'s `tint`, or let
 *  the component derive it via its `seed` input. */
export function avatarTint(
  seed: string,
  options?: AvatarTintOptions,
): { bg: string; fg: string } {
  const saturation = options?.saturation ?? 50;
  const lightness = options?.lightness ?? 62;
  const foreground = options?.foreground ?? '#fff';
  const hue = pickHue(hashSeed(seed), options?.avoidHues ?? []);

  return { bg: `hsl(${hue} ${saturation}% ${lightness}%)`, fg: foreground };
}

/** Uppercased first + last initial, or `?` when neither is present. */
export function initialsFrom(first?: string, last?: string): string {
  const firstInitial = (first ?? '').trim()[0] ?? '';
  const lastInitial = (last ?? '').trim()[0] ?? '';

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
