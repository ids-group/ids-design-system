import * as React from 'react';

/**
 * AvatarGroup — the real AvatarGroupComponent, run by Angular behind `<ds-avatar-group>`.
 * Stacked row of `Avatar`s with overlapping ring borders. The group's CSS reaches into the child `ds-avatar` hosts, so plain `<Avatar />` children compose directly — no wrapper needed.
 */
export interface AvatarGroupProps {
  /** Avatars shown before the rest collapse into the `+N` chip. */
  max?: number;
  /** Total avatar count driving the `+N` overflow; null counts the projected children. */
  total?: number | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const AvatarGroup: React.ComponentType<AvatarGroupProps>;
