import * as React from 'react';

/**
 * Badge — the real BadgeComponent, run by Angular behind `<ds-x-badge>`.
 * Status/count chip. Colour comes from the consumer's status wiring — the DS predefines NO statuses; an unset `status` renders the neutral surface. `data-status` is set on the host so app CSS can wire `--ds-badge-bg-color` / `--ds-badge-label-color` per key.
 */
export interface BadgeProps {
  /** Consumer-defined status key; colours are wired via styles/status. Unset → neutral. */
  status?: unknown;
  /** Leading status dot, rendered only while `count` is unset — a count replaces the badge's whole content. Unset falls back to `DS_CONFIG.badge.withDot`, then `false`. */
  withDot?: boolean | null;
  /** Solid accent fill instead of the default subtle background. */
  solid?: boolean;
  /** Numeric count to display; overrides projected content when set. */
  count?: number | null;
  /** Count is capped at this value, shown as `"max+"` beyond it. */
  max?: number;
  /** Noun used in the count's accessible label — set for non-notification counts (cart, results, …). */
  countLabel?: string;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Badge: React.ComponentType<BadgeProps>;
