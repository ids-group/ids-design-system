import * as React from 'react';

/**
 * Skeleton — the real SkeletonComponent, run by Angular behind `<ds-x-skeleton>`.
 * Shimmering loading placeholder. The host element itself is the block — no children. Hidden from assistive tech (`aria-hidden`).
 */
export interface SkeletonProps {
  /** CSS width of the placeholder (e.g. `'120px'`, `'50%'`). */
  width?: string | undefined;
  /** CSS height of the placeholder. */
  height?: string | undefined;
  /** Pill radius, for avatar/dot-shaped placeholders. */
  circle?: boolean;
  /** `display: inline-block` instead of `block`, to sit inline with text. */
  inline?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Skeleton: React.ComponentType<SkeletonProps>;
