import * as React from 'react';

/**
 * InfoHint — the real InfoHintComponent, run by Angular behind `<ds-info-hint>`.
 * Small icon button that carries supplementary text - `ds-info-hint`, a 14px question mark or "i" placed beside a label or heading. The tip shows on hover and focus, and a click pins it open until a press outside, Escape or blur.
 */
export interface InfoHintProps {
  /** The supplementary text, shown on hover and focus and kept open by a click. `**bold**` runs render bold. */
  text?: string;
  /** A template shown in the panel in place of `text`. Wins over projected content and `text`. */
  content?: unknown;
  /** Accessible name of the icon button, such as "About conversion rate". */
  ariaLabel?: string;
  /** Any DS icon; `'help'` draws a question mark in a circle, `'info'` an "i". */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const InfoHint: React.ComponentType<InfoHintProps>;
