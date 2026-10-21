import * as React from 'react';

/**
 * Segmented — the real SegmentedComponent, run by Angular behind `<ds-segmented>`.
 * Radio-like segmented control (`role="radiogroup"`) for switching between mutually exclusive views or modes — e.g. List / Map / Timeline. One segment is always the selection; for a standalone on/off control use ToggleButton instead.
 */
export interface SegmentedProps {
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
  /** Segments to render; each needs a `label` and `value`, optional `icon`/`disabled`. */
  options?: unknown;
  /** `value` of the selected segment. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name of the radiogroup. */
  ariaLabel?: string | null;
  /** Visible label above the track. */
  label?: string;
  /** Disables every segment. */
  disabled?: boolean;
  /** Segments share edges instead of floating in a padded track; only the outer ends round. Needs `--ds-segmented-segment-border` set, since the shared edge is the border. */
  joined?: boolean;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Segmented: React.ComponentType<SegmentedProps>;
