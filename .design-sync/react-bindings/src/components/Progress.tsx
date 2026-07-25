import * as React from 'react';
import { cx, host } from '../lib/util';

/** `'default'` plus the DS status hues minus `info`. */
export type ProgressVariant = 'default' | 'success' | 'warning' | 'error';

export interface ProgressProps {
  /** Progress 0–100; clamped, and ignored while `indeterminate`. */
  value?: number;
  /** Colour variant — drives the success/warning/error styling. */
  variant?: ProgressVariant;
  /** Indeterminate (unknown-duration) animation instead of a fixed `value`. */
  indeterminate?: boolean;
  /** Accessible name for the progress bar (e.g. "Upload progress"). */
  ariaLabel?: string | null;
}

/** Linear progress bar — port of `ds-progress`. The host element IS the
 *  track (full-width, pill radius); a single inner span is the bar. */
export function Progress({
  value = 0,
  variant = 'default',
  indeterminate = false,
  ariaLabel = null,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return host(
    'ds-progress',
    {
      role: 'progressbar',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-valuenow': indeterminate ? undefined : clamped,
      'aria-label': ariaLabel ?? undefined,
      class:
        cx(
          variant === 'success' && 'success',
          variant === 'warning' && 'warning',
          variant === 'error' && 'error',
          indeterminate && 'indeterminate',
        ) || undefined,
    },
    indeterminate ? <span /> : <span style={{ width: `${clamped}%` }} />,
  );
}
