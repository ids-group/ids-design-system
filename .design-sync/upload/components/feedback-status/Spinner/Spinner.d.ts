import * as React from 'react';

/**
 * Spinner — the real SpinnerComponent, run by Angular behind `<ds-x-spinner>`.
 * Indeterminate loading ring. Sizes `sm`/`md`/`lg`. The host element carries `role="status"` / `aria-label="Loading"`. For button-internal busy states use Button's `loading` prop instead; for whole-region loading use LoadingOverlay.
 */
export interface SpinnerProps {
  /** Spinner size - sm/md/lg. */
  size?: ('sm' | 'md' | 'lg');
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Spinner: React.ComponentType<SpinnerProps>;
