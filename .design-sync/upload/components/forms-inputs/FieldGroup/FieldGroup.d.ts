import * as React from 'react';

/**
 * FieldGroup — the real FieldGroupComponent, run by Angular behind `<ds-x-field-group>`.
 * Joins adjacent form controls into one visual field — a select beside an input, a prefix button before a search. The controls keep their own behaviour; only the box is shared.
 */
export interface FieldGroupProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately; takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so a hint/error does not shift the layout. Unset falls back to `DS_CONFIG.field.reserveMessage` for a field, not for a button. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'slash' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | (string & {}) /* +69 more */ | null;
  /** Segment height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Paints the error state without a message, for when the text lives elsewhere. Use `error` to show text; either one is enough. */
  invalid?: boolean;
  /** Dims the group's chrome; disable the controls too. */
  disabled?: boolean;
  /** Fills the container instead of hugging its segments. */
  fullWidth?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FieldGroup: React.ComponentType<FieldGroupProps>;
