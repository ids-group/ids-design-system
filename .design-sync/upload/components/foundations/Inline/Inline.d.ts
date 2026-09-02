import * as React from 'react';

/**
 * Inline — the real InlineComponent, run by Angular behind `<ds-inline>`.
 * Horizontal flex row — port of `ds-inline`. The `ds-inline` host IS the flex container; children lay out in a row, vertically centered, wrapping by default.
 */
export interface InlineProps {
  /** Space between children. `null` inherits whatever the enclosing layout set. */
  gap?: ('none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl') | null;
  /** Cross-axis alignment — vertical, for a row. */
  align?: ('start' | 'center' | 'end' | 'stretch') | null;
  /** Main-axis distribution — horizontal, for a row. `between` pushes the ends apart. */
  justify?: ('start' | 'center' | 'end' | 'between') | null;
  /** Let the row wrap onto more lines (default). `false` keeps one line and lets it overflow. */
  wrap?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Inline: React.ComponentType<InlineProps>;
