import * as React from 'react';

/**
 * Sparkline — the real SparklineComponent, run by Angular behind `<ds-sparkline>`.
 * A word-sized trend line for a table cell or a stat: one line with no axes, gridlines, legend or frame, and a dot on the last reading.
 */
export interface SparklineProps {
  /** Fills the band under the line down to the baseline. The colour is `--ds-sparkline-area-color`, the line's own by default, at `--ds-sparkline-area-opacity`. */
  area?: boolean;
  /** One reading per step, oldest first. `null` breaks the line. */
  data?: readonly (number | null)[];
  /** What each reading is, for the tooltip. Left out, the tooltip prints the value alone. */
  categories?: readonly string[];
  /** Accessible name, and the series name in the tooltip. Left out, the sparkline is decorative and hidden from assistive technology. */
  label?: string | null;
  scale?: ('data' | 'zero');
  /** Shows the reading under the pointer, and under the keyboard where `label` makes the sparkline focusable: focus opens the last reading; arrows, Home and End move. */
  tooltip?: boolean;
  /** Formats the value the tooltip prints. Unset, the locale's plain number format. */
  valueFormat?: unknown;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Sparkline: React.ComponentType<SparklineProps>;
