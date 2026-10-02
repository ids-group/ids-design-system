import * as React from 'react';

/**
 * ButtonGroup — the real ButtonGroupComponent, run by Angular behind `<ds-button-group>`.
 * Fuses adjacent `Button` children into one bordered unit (`role="group"`): inner corners flatten, outer corners keep the radius, adjacent borders overlap into a single divider. Purely presentational — each child Button keeps its own props and `onPressed`.
 */
export interface ButtonGroupProps {
  /** `aria-label` of the `role="group"` host. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ButtonGroup: React.ComponentType<ButtonGroupProps>;
