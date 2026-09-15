import * as React from 'react';

/**
 * Segmented — the real SegmentedComponent, run by Angular behind `<ds-segmented>`.
 * Radio-like segmented control (`role="radiogroup"`) for switching between mutually exclusive views or modes — e.g. List / Map / Timeline. One segment is always the selection; for a standalone on/off control use ToggleButton instead.
 */
export interface SegmentedProps {
  /** Helper text shown below the control. */
  hint?: string;
  /** Error text. Shown immediately — binding it says the consumer has already decided this is in error. Takes precedence over `errors`. */
  error?: string;
  /** Advisory text, shown when there is no error. */
  warning?: string;
  /** Reserve the message-row height even when empty, so the control doesn't shift the layout below it when a hint/error appears. What an unset value falls back to is the subclass's call, in `reserveMessageResolved`: a field takes `DS_CONFIG.field.reserveMessage`, a button does not. */
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
  /** Segments to render — each needs a `label` and `value`, optional `icon`/`disabled`. */
  options?: unknown;
  /** Selected segment's `value`, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name for the segmented control (radiogroup role). */
  ariaLabel?: string | null;
  /** Visible label above the track; omit to supply your own. */
  label?: string;
  /** Disables every segment. */
  disabled?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Segmented: React.ComponentType<SegmentedProps>;
