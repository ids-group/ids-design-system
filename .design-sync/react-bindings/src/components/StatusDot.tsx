import * as React from 'react';
import { host } from '../lib/util';

/** Consumer-defined status key; colours are wired via the theme's status
 *  registry (`styles/status`). Unset → neutral muted dot. */
import type { DsStatusKey } from './Badge';

export interface StatusDotProps {
  /** Consumer-defined status key; colours the dot via the theme's status
   *  wiring (`data-status` on the host). Unset → neutral. */
  status?: DsStatusKey;
  /** Override the colour-only status with a human label for assistive tech. */
  ariaLabel?: string | null;
}

/** Colour-coded status dot atom — port of `ds-status-dot`. The DS predefines
 *  NO statuses: app CSS keys off `[data-status]` to set `--ds-status-dot-color`
 *  per key; without one the dot renders the muted neutral colour. */
export function StatusDot({ status, ariaLabel = null }: StatusDotProps) {
  return host(
    'ds-status-dot',
    {
      role: 'img',
      'data-status': status || undefined,
      'aria-label': ariaLabel || status || undefined,
    },
    <span aria-hidden="true" className="status-dot" />,
  );
}
