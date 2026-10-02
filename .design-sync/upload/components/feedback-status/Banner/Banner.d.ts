import * as React from 'react';

/**
 * Banner — the real BannerComponent, run by Angular behind `<ds-banner>`.
 * Full-width page/section message strip with a coloured accent rail. `variant` (info | success | warning | severe | error | neutral, default info) drives colour, default icon and ARIA — error/warning/severe render `role="alert"`/assertive, the rest `role="status"`/polite. `severe` is a stronger warning tier between warning and error.
 */
export interface BannerProps {
  /** Severity: drives colour, the default icon and the ARIA role/live. */
  variant?: ('info' | 'success' | 'warning' | 'severe' | 'error' | 'neutral');
  /** Optional bold heading above the message. */
  title?: string;
  /** Show a close button that emits `closed`. */
  dismissible?: boolean;
  /** Override the variant's default icon. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Tighter padding, centred items, single-line title. */
  compact?: boolean;
  /** `'stacked'` wraps actions onto their own line; `'row'` keeps them inline. */
  layout?: 'stacked' | 'row';
  /** Coloured accent rail on the leading edge; set false to hide it. */
  accentRail?: boolean;
  /** Fires when the user dismisses the banner. */
  onClosed?: (value: void) => void;
  /** Announces the banner to a screen reader when it appears. Unset follows `DS_CONFIG.banner.announce`, then `false`. Off by default: an `alert` region fires on insertion. Turn it on for a banner raised in response to an event. */
  announce?: boolean | null;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Banner: React.ComponentType<BannerProps>;
