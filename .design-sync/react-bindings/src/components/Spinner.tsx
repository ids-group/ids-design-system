import { cx, host } from '../lib/util';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Spinner size — sm/md/lg. Default 'md'. */
  size?: SpinnerSize;
}

/** Indeterminate loading spinner — port of `ds-spinner`. The host element IS
 *  the spinner (no inner markup); size via `sm`/`lg` host classes. */
export function Spinner({ size = 'md' }: SpinnerProps) {
  return host('ds-spinner', {
    role: 'status',
    'aria-label': 'Loading',
    class: cx(size === 'sm' && 'sm', size === 'lg' && 'lg') || undefined,
  });
}
