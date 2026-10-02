import * as React from 'react';

/**
 * Skeleton — the real SkeletonComponent, run by Angular behind `<ds-x-skeleton>`.
 * Shimmering loading placeholder. The host element itself is the block — no children. Hidden from assistive tech (`aria-hidden`).
 */
export interface SkeletonProps {
  /** CSS width, e.g. `'120px'` or `'50%'`. */
  width?: string | undefined;
  /** CSS height. */
  height?: string | undefined;
  /** Pill radius, for avatar/dot-shaped placeholders. */
  circle?: boolean;
  /** `display: inline-block` instead of `block`, to sit inline with text. */
  inline?: boolean;
  /** Whether the wave passes over the placeholder; off, it is a flat block of the same shape. */
  shimmer?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Skeleton: React.ComponentType<SkeletonProps>;
