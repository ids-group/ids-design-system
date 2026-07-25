import * as React from 'react';
import { host } from '../lib/util';

export interface AvatarGroupProps {
  /** Maximum avatars shown before the rest collapse into an overflow chip. */
  max?: number;
  /** Total avatar count driving the `+N` overflow; null counts the projected children. */
  total?: number | null;
  /** The stacked `Avatar` elements. Render at most `max` of them — the group
   *  does NOT truncate children itself; it only appends the `+N` chip. */
  children?: React.ReactNode;
}

/** Stacked avatar row — port of `ds-avatar-group`. The group's CSS pierces
 *  into the child `ds-avatar` hosts (ring border + negative-margin overlap),
 *  so plain `<Avatar />` children compose directly. When `total` exceeds
 *  `max`, a neutral `+N` overflow chip is appended. */
export function AvatarGroup({ max = 4, total = null, children }: AvatarGroupProps) {
  const overflow = total !== null && total > max ? total - max : null;

  return host(
    'ds-avatar-group',
    null,
    children,
    overflow !== null && (
      <span key="overflow" className="avatar-overflow" aria-label={`${overflow} more`}>
        +{overflow}
      </span>
    ),
  );
}
