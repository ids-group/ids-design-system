import * as React from 'react';

/**
 * FieldGroup — the real FieldGroupComponent, run by Angular behind `<ds-x-field-group>`.
 * Joins adjacent form controls into one visual field — a select beside an input, a prefix button before a search. The controls keep their own behaviour; only the box is shared.
 */
export interface FieldGroupProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately — binding it says the consumer has already decided this is in error. Takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so the control doesn't shift the layout below it when a hint/error appears. Falls back to `DS_CONFIG.field.reserveMessage`, then off. */
  reserveMessage?: boolean | null;
  /** Glyph on the message line, overriding what the state resolves to. Unset follows `DS_CONFIG.field.stateIcons`; `false` removes the glyph here alone. */
  messageIcon?: 'search' | 'plus' | 'minus' | 'check' | 'x' | 'chevronDown' | 'chevronRight' | 'chevronLeft' | 'chevronUp' | 'menu' | 'arrowRight' | 'arrowUp' | 'arrowDown' | 'info' | 'warn' | (string & {}) /* +68 more */ | null;
  /** Segment height — the field family's scale, so a group lines up with a plain field beside it. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Paints the error state WITHOUT a message of its own — for when the text lives in a form-level summary. Use `error` to show text; binding either one is enough, exactly as on a field. Segments read `invalidResolved`, not this, so an `error` string announces itself without the flag beside it. */
  invalid?: boolean;
  /** Dims the group. Disable the CONTROLS too — this is the chrome, not their interactivity. */
  disabled?: boolean;
  /** Fills the container instead of hugging its segments. */
  fullWidth?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const FieldGroup: React.ComponentType<FieldGroupProps>;
