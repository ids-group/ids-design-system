import * as React from 'react';

/**
 * Autocomplete — the real AutocompleteComponent, run by Angular behind `<ds-autocomplete>`.
 * Combobox that filters options as you type. Single-select shows the picked label beside the input; `multiple` shows removable tags. Flat `options` or grouped `optionGroups` (groups win when both are set). Sizes `sm`/`md`/`lg`; `width="content"` hugs the value instead of filling the container.
 */
export interface AutocompleteProps {
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
  /** Hides the control. Inline `display`: the `hidden` attribute loses to each control's `:host` display. */
  hidden?: boolean;
  /** Options, groups, or both mixed - rendered in the order given. */
  options?: unknown;
  /** Selected value, or an array of values when `multiple`. */
  value?: unknown;
  onValueChange?: (value: unknown) => void;
  /** Allows selecting more than one option, shown as removable tags. */
  multiple?: boolean;
  /** Draws the trailing chevron. Turn it off for a search field, where an arrow invites a click that lists everything. */
  showChevron?: boolean;
  /** Chip collapse: `"fit"` (default) shows as many as fit, the rest behind "+N more"; a number is a ceiling, not a promise; `"all"` shows every chip and grows the trigger a line per selection. */
  maxVisibleChips?: number | 'fit' | 'all' | null;
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Trigger width - `fill` stretches to the container, `content` hugs the value. */
  width?: (('fill' | 'content'));
  /** A settled single value wider than the trigger: `ellipsis` (default) or `wrap` onto a second line. Multi mode is unaffected. */
  valueOverflow?: ('ellipsis' | 'wrap');
  /** Placeholder when empty; falls back to `DS_INTL.picker.placeholder`. */
  placeholder?: string | null;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  success?: string;
  /** Shows a "Create «text»" row when the typed text matches no option. */
  allowCreate?: boolean;
  /** Field label above the control. */
  label?: string;
  /** Decides whether two values are the same one. Default `===` is reference identity, so object values re-fetched as new objects lose the selection; pass a keyed comparator such as `(a, b) => a?.id === b?.id`. */
  compareWith?: unknown;
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
  /** Placeholder while typing over a settled value; empty keeps `placeholder`. */
  searchPlaceholder?: string;
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
  /** Marks the field required: a `*` beside the label and `aria-required` on the input. */
  required?: boolean;
  /** Marks the field optional in words, for a form where most fields are required. */
  optional?: boolean;
  /** Accessible name for the input. */
  ariaLabel?: string | null;
  /** Fires with the typed text when the user picks the create-new option. */
  onCreate?: (value: string) => void;
  /** Content for the `[dsAutocompletePrefix]` slot. */
  prefix?: React.ReactNode;
  /** Content for the `[dsAutocompleteSuffix]` slot. */
  suffix?: React.ReactNode;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Autocomplete: React.ComponentType<AutocompleteProps>;
