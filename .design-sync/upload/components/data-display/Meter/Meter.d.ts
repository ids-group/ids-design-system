import * as React from 'react';

/**
 * Meter — the real MeterComponent, run by Angular behind `<ds-meter>`.
 * One track and one fill, for a measurement inside a table cell. The host element IS the track; a single inner bar shows `value` against `max`. No caption, no legend, no annex table — a chart is a block with all three, and in a 60px cell that chrome is the whole cell.
 */
export interface MeterProps {
  /** The measurement, in units of `max`. Clamped to the track. */
  value?: number;
  /** The ceiling `value` is read against — the column's own largest, or the scale the number means something on. Left at 100, `value` is a percentage. Zero or less falls back to 100, because a scale with no width has no fraction to draw. */
  max?: number;
  /** The fill's colour. Unset takes `--ds-meter-fill-color`, so a column is coloured once in a stylesheet rather than per row; set it per row where the colour carries meaning. */
  color?: string | null;
  /** Names the measurement, and is what decides whether it is announced at all. Unset, the mark is `aria-hidden` — right where the cell prints the figure beside it, and wrong where the bar is the only place the number appears. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Meter: React.ComponentType<MeterProps>;
