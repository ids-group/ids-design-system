import * as React from 'react';

/**
 * ColorPicker — the real ColorPickerComponent, run by Angular behind `<ds-color-picker>`.
 * Colour field — a swatch + hex trigger button opening a Photoshop-style panel: saturation/brightness plane, hue slider, live preview + hex input, and preset swatches. The plane and hue gradients are pure CSS, so the open panel renders fully statically.
 */
export interface ColorPickerProps {
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
  /** Selected colour as a hex string, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Swatches shown in the panel — defaults to a built-in palette. */
  presets?: readonly string[];
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`, `ds-overlay-pane` and this component's own `ds-color-picker-panel`. The panel is portaled out of the host, so a class on the pane is the only way a consumer stylesheet reaches ONE instance of it. */
  panelClass?: string | readonly string[];
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the trigger button and panel. */
  ariaLabel?: string;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ColorPicker: React.ComponentType<ColorPickerProps>;
