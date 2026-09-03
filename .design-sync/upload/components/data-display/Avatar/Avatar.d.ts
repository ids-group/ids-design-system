import * as React from 'react';

/**
 * Avatar — the real AvatarComponent, run by Angular behind `<ds-x-avatar>`.
 * User avatar circle. Content priority: `imageUrl` → `initials` → `fallbackIcon` (DS icon name) → empty tinted circle. Optional presence dot in the bottom-right corner.
 */
export interface AvatarProps {
  /** Diameter — xs/sm/lg apply a size class; md is the default. */
  size?: ('xs' | ('sm' | 'md' | 'lg'));
  /** Fallback text shown when there's no `imageUrl`. Wins over anything derived from `name`, so a caller that already has the letters keeps passing them. */
  initials?: string;
  /** The person or thing this avatar stands for — one binding drives both the initials and the seed the tint hashes. The tint keys on the NAME, never on the initials — two letters collide wholesale, so every Alice Brown and Adam Bell would share one colour. */
  name?: string;
  /** Replaces the built-in rule for turning `name` into initials, for one avatar or one table of them. Falls back to `DS_CONFIG.avatar.initials`, then to `initialsFrom` — first two words, a Latin-script guess the library does not pretend is universal. */
  initialsRule?: unknown;
  /** Image source; shown before `initials` or `fallbackIcon` when set. */
  imageUrl?: string | null;
  /** Accessible name. When omitted, the avatar is treated as decorative (hidden from AT) — correct when a visible name sits beside it. */
  ariaLabel?: string | null;
  /** Off-token color tint. Accepts a `{ bg, fg }` pair for arbitrary palettes, the literal `'neutral'` for the neutral overflow-chip treatment, or null for the default brand-subtle tones from avatar.scss. */
  tint?: unknown;
  /** Presence indicator shown as a colored dot in the bottom-right corner. */
  status?: ('online' | 'offline' | 'away' | 'busy') | null;
  /** Icon rendered when there is no imageUrl and no initials. */
  fallbackIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Seed for a deterministic tint (e.g. an email) used when no explicit `tint` is set — the same seed always yields the same colour. Defaults to `name`; set it explicitly when identity is an id or an email rather than the display name. */
  seed?: string | null;
  /** Hue arcs `[start, end]` (0–360°) the seeded tint must avoid, e.g. a brand hue: `[[310, 360], [0, 20]]`. Only applies when `seed` drives the tint. */
  avoidHues?: readonly (readonly [number, number])[];
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Avatar: React.ComponentType<AvatarProps>;
