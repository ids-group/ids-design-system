import * as React from 'react';
import { cx, host } from '../lib/util';

export interface SkeletonProps {
  /** CSS width of the placeholder (e.g. `'120px'`, `'50%'`). */
  width?: string;
  /** CSS height of the placeholder. */
  height?: string;
  /** Pill radius, for avatar/dot-shaped placeholders. */
  circle?: boolean;
  /** `display: inline-block` instead of `block`, to sit inline with text. */
  inline?: boolean;
}

/** Loading placeholder block — port of `ds-skeleton`. The host itself is the
 *  shimmering rectangle; size it with `width`/`height` to mirror the content
 *  it stands in for. Hidden from assistive tech. */
export function Skeleton({ width, height, circle = false, inline = false }: SkeletonProps) {
  return host('ds-skeleton', {
    'aria-hidden': 'true',
    class: cx(circle && 'circle', inline && 'inline') || undefined,
    style: width || height ? { width, height } : undefined,
  });
}
