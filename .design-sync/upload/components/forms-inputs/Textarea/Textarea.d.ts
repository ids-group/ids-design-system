import * as React from 'react';

/**
 * Textarea — the real TextareaComponent, run by Angular behind `<ds-textarea>`.
 * Multi-line text field with the same anatomy as Input: `label` above, `hint` below, `invalid` for error styling (error text goes in `hint`). Sizes `sm`/`md`/`lg` change padding/typography; height comes from `rows` (default 3). Value: `value` + `onValueChange` (controlled) or just an initial `value`.
 */
export interface TextareaProps {
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
  /** Validation errors, shown once the user has interacted. Bound automatically by signal forms; reactive and template-driven forms are read through `NgControl` and need nothing here. Accepts a string, one error, or an array. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid`, WITHOUT a message of its own — for when the text lives elsewhere, such as a form-level error summary or one message covering a whole field group. Use `error` to show text. */
  invalid?: boolean;
  /** Whether the user has interacted with the field. Bound by signal forms; gates `errors`, so a `required` error does not greet an untouched form. */
  touched?: boolean;
  /** Hides the control. On the base so signal forms reaches every control at once. Inline `display`, not the `hidden` attribute — each control sets its own `:host` display, which the attribute's weaker UA rule would lose to. */
  hidden?: boolean;
  /** Text value, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Field height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Label shown above the field. */
  label?: string;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Disables the field and blocks all interaction. */
  disabled?: boolean;
  /** Prevents editing while still allowing focus and selection. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`, a second input because signal forms binds by NAME — a `readonly()` rule was reaching nothing before this existed. */
  readonlyBinding?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `rows` attribute — visible line count. */
  rows?: number;
  /** Native `name` attribute. */
  name?: string | null;
  /** Grows the field with content instead of scrolling; forces `resize` to none. */
  autosize?: boolean;
  /** Minimum height in lines when `autosize`. */
  minRows?: number | null;
  /** Maximum height in lines when `autosize`, beyond which it scrolls. */
  maxRows?: number | null;
  /** Native CSS `resize` behaviour — ignored when `autosize`. */
  resize?: ('none' | 'vertical' | 'horizontal' | 'both');
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string | null;
  /** Hard character cap — applies the native maxlength attribute and shows a live "{current}/{max}" counter below the field. */
  maxLength?: number | null;
  /** Native `minlength` attribute. */
  minLength?: number | null;
  /** Native `pattern` attribute — signal forms sends the schema's RegExp list. */
  pattern?: readonly RegExp[];
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Textarea: React.ComponentType<TextareaProps>;
