import * as React from 'react';

/**
 * Autocomplete — the real AutocompleteComponent, run by Angular behind `<ds-autocomplete>`.
 * Combobox that filters options as you type. Single-select shows the picked label beside the input; `multiple` shows removable tags. Flat `options` or grouped `optionGroups` (groups win when both are set). Sizes `sm`/`md`/`lg`; `width="content"` hugs the value instead of filling the container.
 */
export interface AutocompleteProps {
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
  /** Options, groups, or both mixed — rendered in the order given. */
  options?: unknown;
  /** Selected value, or an array of values when `multiple`. */
  value?: unknown;
  onValueChange?: (value: unknown) => void;
  /** Allows selecting more than one option, shown as removable tags. */
  multiple?: boolean;
  /** Draws the trailing chevron. Turn it off for a search field, where an arrow invites a click that would list everything instead of searching. */
  showChevron?: boolean;
  /** How the chips collapse when they outgrow one line. `"fit"` (the default) measures and shows as many as the trigger is wide, the rest behind "+N more". A NUMBER is a CEILING, not a promise: the row still measures, so you get at most that many and fewer when the trigger is narrow. `"all"` shows every chip and lets the trigger grow a line per selection. Unset (`null`) means "not deciding", as it does on every other input in the library — it resolves to `"fit"`. It does NOT mean "show all": that is `"all"`, which is the loudest of the three modes and has to be asked for. */
  maxVisibleChips?: number | 'fit' | 'all' | null;
  /** Trigger height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Trigger width — `fill` stretches to the container, `content` hugs the value. */
  width?: (('fill' | 'content'));
  /** What a settled single value does when it is wider than the trigger. Defaults to `ellipsis`; `wrap` lets the value break onto a second line and pushes the chevron down. Multi mode is unaffected — its chips have their own measured cap. */
  valueOverflow?: ('ellipsis' | 'wrap');
  /** Placeholder shown in the input when empty. */
  placeholder?: string;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Shows a "Create «text»" row when the typed text matches no option. */
  allowCreate?: boolean;
  /** Field label above the control — the same meaning it has on the other two pickers. */
  label?: string;
  /** How two values are decided to be the same one. The default is `===`, which is reference identity — so with object values a re-fetch that returns equal data as NEW objects loses the selection. Pass a comparator keyed on whatever identifies the value: `(a, b) => a?.id === b?.id`. */
  compareWith?: unknown;
  /** Native `name` attribute forwarded to the trigger. */
  name?: string | null;
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`, `ds-overlay-pane` and this component's own `ds-autocomplete-panel`. The panel is portaled out of the host, so a class on the pane is the only way a consumer stylesheet reaches ONE instance of it. */
  panelClass?: string | readonly string[];
  /** Prevents opening the panel while still allowing focus. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`: signal forms binds by NAME, so a `readonly()` rule reaches nothing without it. */
  readonlyBinding?: boolean;
  /** Shows a clear affordance once there is something to clear. */
  clearable?: boolean;
  /** Placeholder while the field is being typed in, when a value is already settled — `placeholder` is the empty-field caption and cannot be both. Empty (the default) keeps `placeholder` doing both jobs. */
  searchPlaceholder?: string;
  /** How the typed query narrows the list. The default matches a case-insensitive substring of `label`. Pass a predicate to match on anything else — a second field, ignoring diacritics, a fuzzy score. Pass `'none'` when the list arrives already filtered, which is what a server-side search needs: the query is reported through `filterChange` and every option given is rendered. */
  filterWith?: unknown;
  /** The query the user typed, on every change. The input for a server-side search; pair it with `filterWith="none"` so the list is not narrowed twice. */
  onFilterChange?: (value: string) => void;
  /** Options are still being fetched. The panel shows a spinner instead of the empty row — which would otherwise claim there are no matches — and the list reports `aria-busy`. */
  loading?: boolean;
  /** The panel opened. The moment to fetch options for a picker whose list is loaded on demand. */
  onOpened?: (value: void) => void;
  /** The panel closed, for any reason — a pick, Escape, an outside click, a scroll. */
  onClosed?: (value: void) => void;
  /** Scrolls the keyboard cursor's row into view. On by default: a list longer than the panel otherwise walks the cursor out of sight. Set `false` only if you are driving the scroll position yourself. */
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
