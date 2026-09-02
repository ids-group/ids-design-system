import * as React from 'react';

/**
 * Stat — the real StatComponent, run by Angular behind `<ds-stat>`.
 * KPI metric block: `label` above a headline `value`, then either a signed delta line or a plain caption. Both `label` and `value` are required.
 */
export interface StatProps {
  /** Metric name shown above the value. */
  label?: string;
  /** Headline metric; `unit` is appended directly after it. Optional because the value can be PROJECTED instead — `[dsStatValue]` takes a badge, a status dot, anything a tile needs where a number would go. The input is the fallback, the same shape `[delta]` already has. Namespaced, unlike `[delta]`: twenty components in this library have a `value` input, so a bare `value` attribute used to slot one of them in would also set that input to the empty string. Takes `null` so `[value]="count | number"` typechecks: Angular's own `number`/`date`/`percent` pipes are typed `string | null`, and without the null the idiomatic form fails `strictTemplates` and pushes consumers to `toLocaleString()` in the template — which hardcodes a locale instead of reading LOCALE_ID. Renders as nothing, like the empty default. */
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
