import * as React from 'react';

/**
 * Divider — the real DividerComponent, run by Angular behind `<ds-divider>`.
 * Separator rule — the host element IS the rule (role="separator").
 */
export interface DividerProps {
  /** `default` hairline, `strong` heavier rule, `vertical` for a row, `label` carries projected text in the middle of the line. */
  variant?: ('default' | 'strong' | 'vertical' | 'label');
  /** Vertical breathing room around the rule. `none` when the parent layout already owns the gap. */
  spacing?: ('none' | 'sm' | 'md' | 'lg');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Divider: React.ComponentType<DividerProps>;
