import * as React from 'react';

/**
 * FieldMessage — the real FieldMessageComponent, run by Angular behind `<ds-x-field-message>`.
 * The one line under a form control — hint, error, success or warning. Every DS field renders one internally; use it directly only for a control the DS does not provide.
 */
export interface FieldMessageProps {
  /** The one line under a field. Empty renders nothing (or reserved space, if the field asks). */
  text?: string;
  /** Which role the line is playing — hint, error, warning or success. Decides the colour. */
  state?: ('default' | 'error' | 'warning' | 'success');
  /** Id the field points `aria-describedby` at, so the message is announced with the control. */
  messageId?: string | null;
  /** Leading glyph. Unset resolves from the state through `DS_CONFIG.field.stateIcons` — error, warning and success carry one by default and the hint line does not. A name here overrides that for this message; `false` removes it. */
  icon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Reserve one line of height even when there's no `text`, so a field that gains/loses a message doesn't shift the layout below it. */
  reserve?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FieldMessage: React.ComponentType<FieldMessageProps>;
