import * as React from 'react';

/**
 * Bar — the real BarComponent, run by Angular behind `<ds-bar>`.
 * One horizontal track with one fill: a task's completion, or a measurement on a known scale. The host element IS the track; a single inner bar shows `value` against `max` (clamped). No circular variant.
 */
export interface BarProps {
  /** The reading, in units of `max`; clamped, and ignored while `indeterminate`. */
  value?: number;
  /** The full scale `value` and `target` are read against; the accessible name reads "value of max". Zero or less falls back to 100. */
  max?: number;
  /** What the bar is, and so how it is announced. See `BarSemantics`. */
  semantics?: ('progress' | 'meter' | 'none');
  /** Colour role: drives the success/warning/error styling. */
  variant?: ('default' | 'success' | 'warning' | 'error');
  /** Indeterminate animation instead of a fixed `value`; ignored unless `semantics` is `'progress'`. */
  indeterminate?: boolean;
  /** Overrides the fill for this one bar. */
  color?: string | null;
  /** Accessible name. With a `target`, name the comparison here: the role has no second value to announce. Unused under `semantics="none"`. */
  ariaLabel?: string | null;
  /** A second point on the scale, drawn as a hairline across the track. Clamped like `value`, ignored while `indeterminate`. */
  target?: number | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Bar: React.ComponentType<BarProps>;
