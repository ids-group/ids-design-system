import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon } from '../lib/Icon';

export type StatVariant = 'default' | 'error';
export type StatSize = 'sm' | 'md' | 'lg';
export type StatDeltaTone = 'neutral' | 'secondary';

export interface StatProps {
  /** Metric name shown above the value. */
  label: string;
  /** Headline metric; `unit` is appended directly after it. */
  value: string | number;
  /** Change amount; sign drives the up/down arrow and color. */
  delta?: number | null;
  /** Suffix appended after the delta's magnitude, e.g. "vs last month". */
  deltaLabel?: string;
  /** Overrides the automatic up/down coloring of the delta. */
  deltaTone?: StatDeltaTone | null;
  /** Secondary text shown below the value when there's no `delta`. */
  caption?: string;
  /** Suffix appended directly after `value`, e.g. "%". */
  unit?: string;
  /** `error` applies the error color treatment. */
  variant?: StatVariant;
  /** Controls the stat's overall type scale. */
  size?: StatSize;
  /** Custom delta line content (the `[delta]` slot) — replaces the default
   *  "{magnitude} {deltaLabel}" text. Only rendered when `delta` is set. */
  deltaContent?: React.ReactNode;
}

/** KPI metric block — port of `ds-stat`. Label over a headline value, with
 *  either a signed delta line (auto up/down arrow + color) or a plain caption. */
export function Stat({
  label,
  value,
  delta = null,
  deltaLabel = '',
  deltaTone = null,
  caption = '',
  unit = '',
  variant = 'default',
  size = 'md',
  deltaContent,
}: StatProps) {
  const deltaClasses =
    delta === null
      ? ''
      : deltaTone
        ? `delta ${deltaTone}`
        : delta > 0
          ? 'delta up'
          : delta < 0
            ? 'delta down'
            : 'delta';

  const deltaIcon =
    delta === null || delta === 0 ? null : delta > 0 ? 'arrowUp' : 'arrowDown';

  const deltaText =
    delta === null ? '' : `${Math.abs(delta)}${deltaLabel ? ` ${deltaLabel}` : ''}`;

  return host(
    'ds-stat',
    {
      class:
        cx(
          variant === 'error' && 'error',
          size === 'sm' && 'size-sm',
          size === 'lg' && 'size-lg',
        ) || undefined,
    },
    <div className="stat">
      <div className="label">{label}</div>

      <div className="value">
        {value}
        {unit}
      </div>

      {delta !== null ? (
        <div className={deltaClasses}>
          {deltaIcon && <Icon name={deltaIcon} size={12} />}
          {deltaContent ?? deltaText}
        </div>
      ) : caption ? (
        <div className="caption">{caption}</div>
      ) : null}
    </div>,
  );
}
