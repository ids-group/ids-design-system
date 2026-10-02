import * as React from 'react';

/**
 * Stat — the real StatComponent, run by Angular behind `<ds-stat>`.
 * KPI metric block: `label` above a headline `value`, then either a signed delta line or a plain caption. Both `label` and `value` are required.
 */
export interface StatProps {
  /** Metric name shown above the value. */
  label?: string;
  /** Headline metric; `unit` is appended directly after it. Optional: `[dsStatValue]` projects any content in its place. Accepts `null` so pipes returning `string | null` typecheck; renders as nothing. */
  value?: string | number | null;
  /** Change amount; sign drives the up/down arrow and color. */
  delta?: number | null;
  /** Suffix appended after the delta's magnitude, e.g. "vs last month". */
  deltaLabel?: string;
  /** Overrides the automatic up/down coloring of the delta. */
  deltaTone?: 'neutral' | 'secondary' | null;
  /** Secondary text shown below the value when there's no `delta`. */
  caption?: string;
  /** Suffix appended directly after `value`, e.g. "%". */
  unit?: string;
  /** `error` applies the error color treatment. */
  variant?: 'default' | 'error';
  /** Controls the stat's overall type scale. */
  size?: 'sm' | 'md' | 'lg';
  /** Content for the `[dsStatValue]` slot. */
  valueContent?: React.ReactNode;
  /** Content for the `[delta]` slot. */
  deltaContent?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Stat: React.ComponentType<StatProps>;
