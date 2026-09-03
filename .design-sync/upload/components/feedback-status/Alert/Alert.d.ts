import * as React from 'react';

/**
 * Alert — the real AlertComponent, run by Angular behind `<ds-alert>`.
 * Inline contextual message for a form or content area. `variant` (info | success | warning | error | neutral, default info) drives the tint, the default icon and the ARIA semantics — error/warning render `role="alert"`/assertive, the rest `role="status"`/polite.
 */
export interface AlertProps {
  /** Severity — drives colour, the default icon and the ARIA role/live. */
  variant?: ('info' | 'success' | 'warning' | 'error' | 'neutral');
  /** Optional bold heading above the message. */
  title?: string;
  /** Show a close button that emits `closed`. */
  dismissible?: boolean;
  /** Override the variant's default icon. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Fires when the user dismisses the alert. */
  onClosed?: (value: void) => void;
  /** Announce this alert to a screen reader when it appears. Off by default — see `ds-banner`'s `announce` for why, and prefer `ToastService` for anything transient. */
  announce?: boolean;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Alert: React.ComponentType<AlertProps>;
