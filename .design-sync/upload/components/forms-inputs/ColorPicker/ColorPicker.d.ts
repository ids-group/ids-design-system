import * as React from 'react';

/**
 * ColorPicker — the real ColorPickerComponent, run by Angular behind `<ds-color-picker>`.
 * Colour field — a swatch + hex trigger button opening a Photoshop-style panel: saturation/brightness plane, hue slider, live preview + hex input, and preset swatches. The plane and hue gradients are pure CSS, so the open panel renders fully statically.
 */
export interface ColorPickerProps {
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
  /** Selected colour as a hex string. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Swatches shown in the panel; defaults to a built-in palette. */
  presets?: readonly string[];
  /** Extra classes for the portaled panel, the only way a stylesheet reaches one instance of it. */
  panelClass?: string | readonly string[];
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the trigger button and panel. Unset falls back to `DS_INTL.colorPicker.label`. */
  ariaLabel?: string | null;
  /** Confirmation text, shown when there is no error or warning; also paints the success border. */
  success?: string;
  staticPreview?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ColorPicker: React.ComponentType<ColorPickerProps>;
