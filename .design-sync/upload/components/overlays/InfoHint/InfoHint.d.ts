import * as React from 'react';

/**
 * InfoHint — the real InfoHintComponent, run by Angular behind `<ds-info-hint>`.
 * Small icon button that carries supplementary text - `ds-info-hint`, a 14px question mark or "i" placed beside a label or heading. The tip shows on hover and focus, and a click pins it open until a press outside, Escape or blur.
 */
export interface InfoHintProps {
  /** The supplementary text, shown on hover and focus and kept open by a click. */
  text?: string;
  /** Accessible name of the icon button, such as "About conversion rate". */
  ariaLabel?: string;
  /** `'help'` draws a question mark in a circle, `'info'` an "i". */
  icon?: 'help' | 'info';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const InfoHint: React.ComponentType<InfoHintProps>;
