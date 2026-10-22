import * as React from 'react';

/**
 * MultiSelect — the real MultiSelectComponent, run by Angular behind `<ds-multi-select>`.
 * Multi-choice dropdown. Selected options show as removable chips in the trigger; the panel has a filter input, optional "Select all" row and checkbox options. Helper `hint` below, error via `invalid`.
 */
export interface MultiSelectProps {
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
  /** Selected values, two-way bound. */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Options, groups, or both mixed - rendered in the order given. */
  options?: unknown;
  /** Placeholder when nothing is selected; falls back to `DS_INTL.picker.placeholder`. */
  placeholder?: string | null;
  /** Placeholder for the filter input; falls back to `DS_INTL.picker.filterPlaceholder`. */
  searchPlaceholder?: string | null;
  /** Whether the panel has a filter row: `true` always, `false` never, a number is the option-count threshold. Falls back to `DS_CONFIG.picker.searchable`, then `true`. Hiding it moves the keyboard model onto the trigger. */
  searchable?: boolean | number | null;
  /** Native `name` attribute forwarded to the trigger. */
  name?: string | null;
  /** Extra classes for the portaled panel, the only way to style one instance of it. */
  panelClass?: string | readonly string[];
  /** Prevents opening the panel while still allowing focus. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonlyBinding?: boolean;
  /** Shows a clear affordance once there is something to clear. */
  clearable?: boolean;
  /** How the typed query narrows the list. Default: case-insensitive substring of `label`. `'none'` renders every option (server-side search). */
  filterWith?: unknown;
  /** The typed query, on every change; pair with `filterWith="none"` for server-side search. */
  onFilterChange?: (value: string) => void;
  /** Options are still being fetched and the list reports `aria-busy`: with no options it shows placeholder rows, with options it keeps them under an overlay until they are replaced. */
  loading?: boolean;
  /** The panel opened. */
  onOpened?: (value: void) => void;
  /** The panel closed, for any reason - a pick, Escape, an outside click, a scroll. */
  onClosed?: (value: void) => void;
  /** Scrolls the keyboard cursor's row into view. Set `false` only when driving the scroll position yourself. */
  scrollActiveIntoView?: boolean;
  /** Chip collapse: `"fit"` (default) shows as many as fit, the rest behind "+N more"; a number is a ceiling, not a promise; `"all"` shows every chip and grows the trigger a line per selection. */
  maxVisibleChips?: number | 'fit' | 'all' | null;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  success?: string;
  /** Accessible name for the trigger - falls back to `placeholder`. */
  ariaLabel?: string | null;
  /** Trigger width: `fill` stretches to the container and pins the panel to it; `content` hugs the trigger and uses its width as the panel's floor. */
  width?: (('fill' | 'content'));
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** What the trigger shows. `count` is a caption plus a count badge; `labels` names the selection, rest behind "+N". A projected `dsPickerTrigger` template wins and this input is not read. */
  triggerDisplay?: ('full' | 'count' | 'labels');
  /** Field label above the control, and the caption a `count`/`labels` trigger uses when it needs one. */
  label?: string;
  /** Marks the field required: a `*` beside the label and `aria-required` on the trigger. */
  required?: boolean;
  /** Marks the field optional in words, for a form where most fields are required. */
  optional?: boolean;
  /** Where a "select all" row appears: `false` nowhere, `true` one over the panel, `'group'` one per group, `'both'` either. Group rows need groups in `options`. */
  selectAll?: boolean | 'group' | 'both';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const MultiSelect: React.ComponentType<MultiSelectProps>;
