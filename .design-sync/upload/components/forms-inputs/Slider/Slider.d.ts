import * as React from 'react';

/**
 * Slider — the real SliderComponent, run by Angular behind `<ds-slider>`.
 * Horizontal value slider with a filled track segment. Single thumb by default; `range` switches to two thumbs and a `[low, high]` tuple value.
 */
export interface SliderProps {
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
  /** Validation errors, shown once the user has interacted. Bound by signal forms; reactive and template-driven forms are read through `NgControl`. */
  errors?: unknown;
  /** Paints the error state and sets `aria-invalid` WITHOUT a message; use `error` to show text. */
  invalid?: boolean;
  /** Whether the user has interacted with the field. Bound by signal forms; gates `errors`. */
  touched?: boolean;
  /** Whether an async validator is running. Bound by signal forms; shows a trailing spinner. */
  pending?: boolean;
  /** Whether the user has changed the value. Bound by signal forms; drawn only under `showDirty`. */
  dirty?: boolean;
  /** Marks a changed value with a dot and a "Changed" line. Unset falls back to `DS_CONFIG.field.showDirty`, then `false`. */
  showDirty?: boolean | null;
  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  hidden?: boolean;
  /** Current value, or `[low, high]` when `range`. */
  value?: (number | readonly [number, number]);
  onValueChange?: (value: (number | readonly [number, number])) => void;
  /** Minimum selectable value. */
  min?: number;
  /** Maximum selectable value. */
  max?: number;
  /** Snap increment for dragging and arrow keys. */
  step?: number;
  /** Two-thumb mode: `value` becomes a `[low, high]` tuple. */
  range?: boolean;
  /** Disables the slider and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name of the thumb(s); suffixed "minimum"/"maximum" in `range` mode. */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Slider: React.ComponentType<SliderProps>;
