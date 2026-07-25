import * as React from 'react';
import { host } from '../lib/util';

export interface ButtonGroupProps {
  /** Accessible name for the group, set as `aria-label` on the `role="group"` host. */
  ariaLabel?: string;
  /** The buttons to fuse — pass `Button` children (the group's CSS targets
   *  their `ds-button` host tags to collapse borders/radii into one unit). */
  children?: React.ReactNode;
}

/** Joins adjacent Button children into one fused, bordered unit — port of
 *  `ds-button-group`. Outer corners keep the radius; inner corners flatten and
 *  adjacent borders overlap into a single divider. */
export function ButtonGroup({ ariaLabel, children }: ButtonGroupProps) {
  return host(
    'ds-button-group',
    { role: 'group', 'aria-label': ariaLabel ?? undefined },
    children,
  );
}
