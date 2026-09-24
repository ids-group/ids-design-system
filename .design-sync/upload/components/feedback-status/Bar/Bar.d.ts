import * as React from 'react';

/**
 * Bar — the real BarComponent, run by Angular behind `<ds-bar>`.
 * One horizontal track with one fill: a task's completion, or a measurement on a known scale. The host element IS the track; a single inner bar shows `value` against `max` (clamped). No circular variant.
 */
export interface BarProps {
  /** The reading, in units of `max`; clamped, and ignored while `indeterminate`. */
  value?: number;
  /** The full scale `value` and `target` are read against. Left at 100 they are percentages. Set it to the real total — `[value]="37" [max]="80"` — and the accessible name carries "37 of 80" rather than the 46% a caller would otherwise have to compute. For a column of measurements it is usually the column's own largest value, so the longest bar fills its track and the rest are its share. Zero or less falls back to 100, because a scale with no width has no fraction to draw. */
  max?: number;
  /** What the bar is, and therefore how it is announced. See `BarSemantics`. Defaults to `'progress'`. */
  semantics?: ('progress' | 'meter' | 'none');
  /** Colour role — drives the success/warning/error styling. */
  variant?: ('default' | 'success' | 'warning' | 'error');
  /** Indeterminate (unknown-duration) animation instead of a fixed `value`. Only a task has an unknown duration, so it is ignored unless `semantics` is `'progress'`. */
  indeterminate?: boolean;
  /** Overrides the fill for this one bar. A whole column is coloured once through `--ds-bar-fill-color` instead; use this where the colour carries meaning on one row. */
  color?: string | null;
  /** Accessible name (e.g. "Upload progress"). With a `target` set, name the comparison here — the mark is drawn and the role has no second value to announce, so "Resolved 62% against a 75% target" is what reaches a screen reader. Unused under `semantics="none"`. */
  ariaLabel?: string | null;
  /** A second point on the same scale as `value`, drawn as a hairline across the track — a goal, a baseline or a threshold to read `value` against. Clamped like `value`, ignored while `indeterminate`, and unset draws nothing. */
  target?: number | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Bar: React.ComponentType<BarProps>;
