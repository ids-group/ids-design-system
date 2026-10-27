import * as React from 'react';

/**
 * Avatar — the real AvatarComponent, run by Angular behind `<ds-x-avatar>`.
 * User avatar circle. Content priority: `imageUrl` → `initials` → `fallbackIcon` (DS icon name) → empty tinted circle. Optional presence dot in the bottom-right corner.
 */
export interface AvatarProps {
  /** Diameter. */
  size?: ('xs' | ('sm' | 'md' | 'lg'));
  /** Fallback text shown when there is no `imageUrl`. Wins over initials derived from `name`. */
  initials?: string;
  /** The person or thing this avatar stands for; drives the initials and the tint seed. */
  name?: string;
  /** Replaces the rule turning `name` into initials. Falls back to `DS_CONFIG.avatar.initials`, then to `initialsFrom` (first two words, Latin script). */
  initialsRule?: unknown;
  /** Image source; shown before `initials` or `fallbackIcon` when set. An image that fails to load falls back to them until the URL changes. */
  imageUrl?: string | null;
  /** Accessible name. When omitted, the avatar is decorative (hidden from AT). */
  ariaLabel?: string | null;
  /** Tint: a `{ bg, fg }` pair, the literal `'neutral'` for the overflow-chip look, or null for the default brand-subtle tones. */
  tint?: unknown;
  /** Presence dot in the bottom-right corner. */
  status?: ('online' | 'offline' | 'away' | 'busy') | null;
  /** Icon rendered when there is no imageUrl and no initials. */
  fallbackIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Seed for the deterministic tint when no `tint` is set. Defaults to `name`; set it when identity is an id or an email rather than the display name. */
  seed?: string | null;
  /** Hue arcs `[start, end]` (0-360 degrees) the seeded tint avoids, e.g. `[[310, 360], [0, 20]]`. Only applies when `seed` drives the tint. */
  avoidHues?: readonly (readonly [number, number])[];
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Avatar: React.ComponentType<AvatarProps>;
