import * as React from 'react';

/**
 * EmptyState — the real EmptyStateComponent, run by Angular behind `<ds-empty-state>`.
 * Centred placeholder for regions with nothing (or nothing yet) to show: icon tile + `title` + `body` text + an `actions` CTA slot. `variant` (none | loading | error | locked | success, default none) tints the icon tile and picks the default icon (package / package / warn / lock / success); `variant="loading"` additionally covers the whole block with a LoadingOverlay scrim.
 */
export interface EmptyStateProps {
  /** Drives the default icon; `'loading'` shows a loading overlay. */
  variant?: ('none' | 'loading' | 'error' | 'locked' | 'success');
  /** Override the variant's default icon. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Optional heading below the icon. */
  title?: string;
  /** `'wrap'` breaks a long title over lines; `'clip'` keeps one line, ends it with an ellipsis and shows the full title in a tooltip. */
  titleOverflow?: ('wrap' | 'clip');
  /** Optional supporting text below the title. */
  body?: string;
  /** Content for the `[actions]` slot. */
  actions?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const EmptyState: React.ComponentType<EmptyStateProps>;
