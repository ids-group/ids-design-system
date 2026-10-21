import * as React from 'react';

/**
 * Textarea — the real TextareaComponent, run by Angular behind `<ds-textarea>`.
 * Multi-line text field with the same anatomy as Input: `label` above, `hint` below, `invalid` for error styling (error text goes in `hint`). Sizes `sm`/`md`/`lg` change padding/typography; height comes from `rows` (default 3). Value: `value` + `onValueChange` (controlled) or just an initial `value`.
 */
export interface TextareaProps {
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
  /** Validation errors, shown once the form is submitted (`[dsSubmitted]`, or `ngSubmit` of a reactive or template-driven form). Bound by signal forms; reactive and template-driven forms are read through `NgControl`. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid` WITHOUT a message; use `error` to show text. Signal forms binds it alongside `errors`, and then it waits for the submit like them. */
  invalid?: boolean;
  /** Whether an async validator is running. Bound by signal forms; shows a trailing spinner. */
  pending?: boolean;
  /** Whether the user has changed the value. Bound by signal forms; drawn only under `showDirty`. */
  dirty?: boolean;
  /** Marks a changed value with a dot and a "Changed" line. Unset falls back to `DS_CONFIG.field.showDirty`, then `false`. */
  showDirty?: boolean | null;
  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  hidden?: boolean;
  /** Text value, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Field height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Label shown above the field. */
  label?: string;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Disables the field and blocks all interaction. */
  disabled?: boolean;
  /** Prevents editing while still allowing focus and selection. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonlyBinding?: boolean;
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  success?: string;
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `rows` attribute - visible line count. */
  rows?: number;
  /** Native `name` attribute. */
  name?: string | null;
  /** Grows the field with content instead of scrolling; forces `resize` to none. */
  autosize?: boolean;
  /** Minimum height in lines when `autosize`. */
  minRows?: number | null;
  /** Maximum height in lines when `autosize`, beyond which it scrolls. */
  maxRows?: number | null;
  /** Native CSS `resize` behaviour - ignored when `autosize`. */
  resize?: ('none' | 'vertical' | 'horizontal' | 'both');
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string | null;
  /** Character limit with a live "{current}/{max}" counter; `maxLengthMode` decides what happens at the limit. Counts `value.length` (UTF-16 units, as native `maxlength` does) unless `countTrimmed` is set. */
  maxLength?: number | null;
  /** `'hard'` applies the native maxlength attribute. `'soft'` lets the text run past it: the counter turns red, the excess is highlighted and the field reports invalid (`aria-invalid`). */
  maxLengthMode?: ('hard' | 'soft');
  /** Leaves leading and trailing whitespace out of the counter, soft-limit state and highlight. The native `maxlength` of `maxLengthMode="hard"` counts every character regardless. */
  countTrimmed?: boolean;
  /** Native `minlength` attribute. */
  minLength?: number | null;
  /** Native `pattern` attribute - signal forms sends the schema's RegExp list. */
  pattern?: readonly RegExp[];
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Textarea: React.ComponentType<TextareaProps>;
