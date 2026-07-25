import * as React from 'react';
import { cx, host } from '../lib/util';
import { Spinner, type SpinnerSize } from './Spinner';

export interface LoadingOverlayProps {
  /** Show the scrim + spinner over the wrapped region. */
  loading?: boolean;
  /** Optional caption beneath the spinner. */
  label?: string;
  /** Backdrop-blur the wrapped content behind the scrim. */
  blur?: boolean;
  /** Size of the spinner shown in the scrim. */
  spinnerSize?: SpinnerSize;
  /** Offset the scrim top edge — useful when a sticky header should stay
   *  uncovered (any CSS length, e.g. `'48px'`). */
  insetTop?: string;
  /** The region content the overlay covers. */
  children?: React.ReactNode;
}

/** Region-scoped loading scrim — port of `ds-loading-overlay`. Wrap the
 *  region; the host is `position: relative` and the scrim renders INLINE
 *  (absolutely positioned, no portal) on top of the children while
 *  `loading` is true. Sets `aria-busy` on the host. */
export function LoadingOverlay({
  loading = false,
  label = '',
  blur = true,
  spinnerSize = 'md',
  insetTop = '0',
  children,
}: LoadingOverlayProps) {
  return host(
    'ds-loading-overlay',
    { 'aria-busy': loading ? 'true' : undefined },
    children,
    loading && (
      <div className={cx('scrim', blur && 'blur')} style={{ top: insetTop }}>
        <Spinner size={spinnerSize} />

        {label && <span className="label">{label}</span>}
      </div>
    ),
  );
}
