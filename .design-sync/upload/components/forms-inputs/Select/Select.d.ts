import * as React from 'react';

/**
 * Select — the real SelectComponent, run by Angular behind `<ds-x-select>`.
 * Single-choice dropdown field. Trigger button + listbox panel; `label` above, helper `hint` below, error via `invalid` (error text goes in `hint`). Sizes `sm`/`md`/`lg` = 32/40/48px, aligned with Input.
 */
export interface SelectProps {
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
  /** Selected option's value, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Flat options or option groups rendered in the dropdown panel. */
  options?: unknown;
  /** Trigger width — `fill` stretches to the container and pins the panel to the trigger's width; `content` hugs the trigger's own content and takes that width as the panel's FLOOR, so the panel can still grow to its options. */
  width?: (('fill' | 'content'));
  /** Shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Trigger height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Label shown above the trigger. */
  label?: string;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Options are still being fetched. The panel shows a spinner instead of the empty row — which would otherwise claim there are no matches — and the list reports `aria-busy`. */
  loading?: boolean;
  /** The panel opened. The moment to fetch options for a picker whose list is loaded on demand. */
  onOpened?: (value: void) => void;
  /** The panel closed, for any reason — a pick, Escape, an outside click, a scroll. */
  onClosed?: (value: void) => void;
  /** Scrolls the keyboard cursor's row into view. On by default: a list longer than the panel otherwise walks the cursor out of sight. Set `false` only if you are driving the scroll position yourself. */
  scrollActiveIntoView?: boolean;
  /** Prevents opening the dropdown while still allowing focus. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonlyBinding?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `name` attribute forwarded to the trigger. */
  name?: string | null;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string | null;
  /** Shows an inline clear (×) button when a value is selected. */
  clearable?: boolean;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Select: React.ComponentType<SelectProps>;
