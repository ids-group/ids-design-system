import type { TooltipPlacement } from '@ids-group-ltd/ids-design-system/core';

/** Options for one `dsTooltip`, bound as `[dsTooltipConfig]`. An unset field falls back to
 *  `DsConfig.tooltip`, then the built-in default. */
export interface DsTooltipConfig {
  /** Which side the tip opens on. With no room there it opens on the opposite side. Default `'top'`. */
  placement?: TooltipPlacement;
  /** Milliseconds before the tip appears. Hiding is immediate. Default `120`. */
  delay?: number;
  /** Draws the arrow that points at the host. Default `true`. */
  arrow?: boolean;
  /** Opens with no delay, and a click keeps the tip open, as `dsTooltipPinOnClick`. Default `false`. */
  pinOnClick?: boolean;
  /** Shows the tip only while the host's text is clipped, as `dsTooltipWhenClipped`, which wins when set. */
  whenClipped?: boolean | string;
}
