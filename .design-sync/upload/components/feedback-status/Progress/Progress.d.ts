import * as React from 'react';

/**
 * Progress — the real ProgressComponent, run by Angular behind `<ds-progress>`.
 * Linear progress bar. The host element is the full-width pill track; a single inner bar shows `value` (0–100, clamped). `indeterminate` switches to a looping sweep animation and ignores/unsets `value` and `aria-valuenow`.
 */
export interface ProgressProps {
  /** Progress in units of `max`, so 0–100 by default; clamped, and ignored while `indeterminate`. */
  value?: number;
  /** The full scale `value` and `target` are read against. Left at 100 they are percentages, which is why nothing existing changes. Set it to the real total — `[value]="37" [max]="80"` — and the accessible name carries "37 of 80" rather than the 46% a caller would otherwise have to compute and a screen reader would read instead. Zero or less falls back to 100, because a scale with no width has no fraction to draw. */
  max?: number;
  /** Colour variant — drives the success/warning/error styling. */
  variant?: unknown;
  /** Indeterminate (unknown-duration) animation instead of a fixed `value`. */
  indeterminate?: boolean;
  /** Accessible name for the progress bar (e.g. "Upload progress"). With a `target` set, name the comparison here — the mark is drawn, and `role="progressbar"` has no second value to announce, so "Resolved 62% against a 75% target" is what reaches a screen reader. */
  ariaLabel?: string | null;
  /** A second point on the same scale as `value`, drawn as a hairline across the track — a goal or a baseline to read `value` against. Clamped like `value`, ignored while `indeterminate`, and unset draws nothing. */
  target?: number | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Progress: React.ComponentType<ProgressProps>;
