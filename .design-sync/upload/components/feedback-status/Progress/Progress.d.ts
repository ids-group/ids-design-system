import * as React from 'react';

/**
 * Progress — the real ProgressComponent, run by Angular behind `<ds-progress>`.
 * Linear progress bar. The host element is the full-width pill track; a single inner bar shows `value` (0–100, clamped). `indeterminate` switches to a looping sweep animation and ignores/unsets `value` and `aria-valuenow`.
 */
export interface ProgressProps {
  /** Progress 0–100; clamped, and ignored while `indeterminate`. */
  value?: number;
  /** Colour variant — drives the success/warning/error styling. */
  variant?: unknown;
  /** Indeterminate (unknown-duration) animation instead of a fixed `value`. */
  indeterminate?: boolean;
  /** Accessible name for the progress bar (e.g. "Upload progress"). */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Progress: React.ComponentType<ProgressProps>;
