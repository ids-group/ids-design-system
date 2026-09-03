import * as React from 'react';

/**
 * Toast — the real ToastComponent, run by Angular behind `<ds-x-toast>`.
 * Single toast notification pill — port of `ds-toast`. In Angular these are raised at runtime by ToastService; this binding renders the specimen statically wherever you place it (stack several with `ToastRegion`).
 */
export interface ToastProps {
  /** Severity — drives colour and the default icon or spinner. */
  variant?: ('info' | 'success' | 'warning' | 'error' | 'loading');
  /** Optional bold heading above the message. */
  title?: string;
  /** The same field `ToastOptions.body` carries, so a specimen and a raised toast agree. */
  body?: string;
  /** Show a close button that emits `closed`. */
  dismissible?: boolean;
  /** Override the variant's default icon. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Optional action button rendered before the dismiss control. */
  action?: unknown;
  /** Fires when the toast is dismissed or its action is invoked. */
  onClosed?: (value: void) => void;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Toast: React.ComponentType<ToastProps>;
