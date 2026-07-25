import * as React from 'react';
import { cx, host } from '../lib/util';

/** Consumer-defined status key; colours are wired via the theme's status
 *  registry (`styles/status`). Unset → neutral. */
export type DsStatusKey = string;

export interface BadgeProps {
  /** Consumer-defined status key; colours the badge via the theme. Unset → neutral. */
  status?: DsStatusKey;
  /** Shows a status dot; only rendered when `count` is unset. */
  withDot?: boolean;
  /** Solid accent fill instead of the default subtle background. */
  solid?: boolean;
  /** Numeric count to display; overrides children when set. */
  count?: number;
  /** Count is capped at this value, shown as `"max+"` beyond it. Default 99. */
  max?: number;
  /** Badge label content (ignored when `count` is set). */
  children?: React.ReactNode;
}

/** Status/count badge — port of `ds-badge`. */
export function Badge({
  status,
  withDot = false,
  solid = false,
  count,
  max = 99,
  children,
}: BadgeProps) {
  const hasCount = count !== undefined && count !== null;
  const countDisplay = hasCount ? (count > max ? `${max}+` : String(count)) : null;
  const countAriaLabel = hasCount
    ? count > max
      ? `More than ${max} notifications`
      : `${count} notifications`
    : undefined;
  return host(
    'ds-badge',
    { 'data-status': status || undefined },
    <span
      className={cx('badge', hasCount && 'count', solid && 'solid')}
      aria-label={countAriaLabel}
    >
      {hasCount ? countDisplay : (
        <>
          {withDot && <span className="dot" />}
          {children}
        </>
      )}
    </span>,
  );
}
