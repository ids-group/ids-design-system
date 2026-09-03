import * as React from 'react';

/**
 * Slider — the real SliderComponent, run by Angular behind `<ds-slider>`.
 * Horizontal value slider with a filled track segment. Single thumb by default; `range` switches to two thumbs and a `[low, high]` tuple value.
 */
export interface SliderProps {
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
  /** Current value, or `[low, high]` when `range`. Two-way bound. */
  value?: (number | readonly [number, number]);
  onValueChange?: (value: (number | readonly [number, number])) => void;
  /** Minimum selectable value. */
  min?: number;
  /** Maximum selectable value. */
  max?: number;
  /** Increment applied when dragging (snap) or nudging with arrow keys. */
  step?: number;
  /** Two-thumb range mode — `value` becomes a `[low, high]` tuple. */
  range?: boolean;
  /** Disables the slider and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the thumb(s) — suffixed "minimum"/"maximum" in `range` mode. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Slider: React.ComponentType<SliderProps>;
