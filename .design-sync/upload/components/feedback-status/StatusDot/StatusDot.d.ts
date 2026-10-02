import * as React from 'react';

/**
 * StatusDot — the real StatusDotComponent, run by Angular behind `<ds-status-dot>`.
 * Colour-coded dot atom (role="img"). The DS predefines NO statuses — `status` sets `data-status` on the host and app CSS wires `--ds-status-dot-color` per key; without one the dot is the muted neutral grey.
 */
export interface StatusDotProps {
  /** Consumer-defined status key that colours the dot. */
  status?: unknown;
  /** Human label for assistive tech; colour alone carries the status otherwise. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const StatusDot: React.ComponentType<StatusDotProps>;
