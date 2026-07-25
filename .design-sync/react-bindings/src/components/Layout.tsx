import * as React from 'react';
import { cx, host } from '../lib/util';

export type LayoutGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch';
export type LayoutJustify = 'start' | 'center' | 'end' | 'between';
export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface StackProps {
  /** Vertical gap between children. null → the semantic `--space-stack`
   *  default; named sizes map to the spacing scale (none/xs/sm/md/lg/xl =
   *  0/4/8/16/24/32px equivalents). */
  gap?: LayoutGap | null;
  /** Cross-axis (horizontal) alignment of children. null → flex default (stretch). */
  align?: LayoutAlign | null;
  /** Stacked content. */
  children?: React.ReactNode;
}

/** Vertical flex column — port of `ds-stack`. The host IS the flex container;
 *  children are rendered directly (no wrapper). Styling is attribute-driven
 *  (`data-gap`, `data-align`). */
export function Stack({ gap = null, align = null, children }: StackProps) {
  return host(
    'ds-stack',
    {
      'data-gap': gap ?? undefined,
      'data-align': align ?? undefined,
    },
    children,
  );
}

export interface InlineProps {
  /** Horizontal gap between children. null → the semantic `--space-inline`
   *  default; named sizes map to the spacing scale. */
  gap?: LayoutGap | null;
  /** Cross-axis (vertical) alignment. null → the component default (center). */
  align?: LayoutAlign | null;
  /** Main-axis distribution. null → flex default (start). */
  justify?: LayoutJustify | null;
  /** Whether children wrap onto new lines. Default true; false adds `.nowrap`. */
  wrap?: boolean;
  /** Inline content. */
  children?: React.ReactNode;
}

/** Horizontal flex row — port of `ds-inline`. Wraps by default and centers
 *  children vertically; the host IS the flex container. Styling is
 *  attribute-driven (`data-gap`, `data-align`, `data-justify`). */
export function Inline({
  gap = null,
  align = null,
  justify = null,
  wrap = true,
  children,
}: InlineProps) {
  return host(
    'ds-inline',
    {
      class: cx(!wrap && 'nowrap') || undefined,
      'data-gap': gap ?? undefined,
      'data-align': align ?? undefined,
      'data-justify': justify ?? undefined,
    },
    children,
  );
}

export interface ContainerProps {
  /** Max content width: 'sm'/'md'/'lg' map to the breakpoint tokens, 'xl'
   *  (default) to the global content cap (`--col-cap-content`), 'full' removes
   *  the cap. The container centers itself and adds responsive x-padding. */
  size?: ContainerSize;
  /** Page content. */
  children?: React.ReactNode;
}

/** Centered max-width page container — port of `ds-container`. Caps content
 *  width by `size` (via `data-size`), centers with `margin-inline: auto` and
 *  applies clamped horizontal padding. */
export function Container({ size = 'xl', children }: ContainerProps) {
  return host('ds-container', { 'data-size': size }, children);
}
