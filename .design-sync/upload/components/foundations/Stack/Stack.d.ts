import * as React from 'react';

/**
 * Stack — the real StackComponent, run by Angular behind `<ds-stack>`.
 * Vertical flex column — port of `ds-stack`. The `ds-stack` host IS the flex container; children render directly with a uniform gap.
 */
export interface StackProps {
  /** Space between children. `null` inherits whatever the enclosing layout set. */
  gap?: ('none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl') | null;
  /** Cross-axis alignment: horizontal, for a column. */
  align?: ('start' | 'center' | 'end' | 'stretch') | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Stack: React.ComponentType<StackProps>;
