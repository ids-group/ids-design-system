import * as React from 'react';

/**
 * Container — the real ContainerComponent, run by Angular behind `<ds-container>`.
 * Centered max-width page container — port of `ds-container`. Caps content width, centers with `margin-inline: auto`, and applies clamped responsive x-padding.
 */
export interface ContainerProps {
  /** Max content width before the container centres itself. `full` removes the cap. */
  size?: (('sm' | 'md' | 'lg') | 'xl' | 'full');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Container: React.ComponentType<ContainerProps>;
