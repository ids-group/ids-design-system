import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import { avatarTint } from '../generated/avatar-tint';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

const STATUS_ARIA_LABELS: Record<AvatarStatus, string> = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
};

export interface AvatarProps {
  /** Diameter — xs/sm/lg apply a size class; md is the default. */
  size?: AvatarSize;
  /** Fallback text shown when there's no `imageUrl`. */
  initials?: string;
  /** Image source; shown before `initials` or `fallbackIcon` when set. */
  imageUrl?: string | null;
  /** Accessible name. When omitted, the avatar is treated as decorative
   *  (hidden from AT) — correct when a visible name sits beside it. */
  ariaLabel?: string | null;
  /** Off-token color tint. Accepts a `{ bg, fg }` pair for arbitrary palettes,
   *  the literal `'neutral'` for the neutral overflow-chip treatment, or null
   *  for the default brand-subtle tones from avatar.scss. */
  tint?: { bg: string; fg: string } | 'neutral' | null;
  /** Presence indicator shown as a colored dot in the bottom-right corner. */
  status?: AvatarStatus | null;
  /** Icon rendered when there is no imageUrl and no initials. */
  fallbackIcon?: IconName | null;
  /** Seed for a deterministic tint (e.g. an email or name) used when no explicit
   *  `tint` is set — the same seed always yields the same colour. */
  seed?: string | null;
  /** Hue arcs `[start, end]` (0–360°) the seeded tint must avoid, e.g. a brand
   *  hue: `[[310, 360], [0, 20]]`. Only applies when `seed` drives the tint. */
  avoidHues?: readonly (readonly [number, number])[];
}

/** User avatar — port of `ds-avatar`. Shows an image, initials, or a fallback
 *  icon (in that priority), with an optional presence dot. Stack inside
 *  AvatarGroup for the overlapped-ring treatment. */
export function Avatar({
  size = 'md',
  initials = '',
  imageUrl = null,
  ariaLabel = null,
  tint = null,
  status = null,
  fallbackIcon = null,
  seed = null,
  avoidHues = [],
}: AvatarProps) {
  // Precedence has to match the component's `tintStyle` computed, not read well.
  const resolved =
    tint && tint !== 'neutral' ? tint : seed ? avatarTint(seed, { avoidHues }) : null;
  const tintStyle = resolved
    ? {
        ['--ds-avatar-bg-color' as string]: resolved.bg,
        ['--ds-avatar-label-color' as string]: resolved.fg,
      }
    : undefined;

  return host(
    'ds-avatar',
    {
      class:
        cx(
          size === 'xs' && 'xs',
          size === 'sm' && 'sm',
          size === 'lg' && 'lg',
          tint === 'neutral' && 'neutral',
        ) || undefined,
      style: tintStyle,
      role: ariaLabel ? 'img' : undefined,
      'aria-label': ariaLabel ?? undefined,
      'aria-hidden': ariaLabel ? undefined : 'true',
    },
    imageUrl ? (
      <img alt="" src={imageUrl} />
    ) : initials ? (
      initials
    ) : fallbackIcon ? (
      <Icon name={fallbackIcon} size={16} />
    ) : null,
    status && (
      <span
        key="status"
        role="img"
        className={`status-dot status-dot--${status}`}
        aria-label={STATUS_ARIA_LABELS[status]}
      />
    ),
  );
}
