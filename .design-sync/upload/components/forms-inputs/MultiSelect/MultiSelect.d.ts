import * as React from 'react';

/**
 * MultiSelect — the real MultiSelectComponent, run by Angular behind `<ds-multi-select>`.
 * Multi-choice dropdown. Selected options show as removable chips in the trigger; the panel has a filter input, optional "Select all" row and checkbox options. Helper `hint` below, error via `invalid`.
 */
export interface MultiSelectProps {
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
  /** Selected values, two-way bound. */
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Options, groups, or both mixed — rendered in the order given. */
  options?: unknown;
  /** Placeholder shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the in-panel filter input. */
  searchPlaceholder?: string;
  /** Whether the panel carries a filter row. `true` always, `false` never, and a NUMBER is a threshold — the row appears once there are at least that many options. Unset falls back to `DS_CONFIG.picker.searchable`, then `true`. Hiding it moves the panel's keyboard model onto the trigger: the arrows, Enter, Escape and `aria-activedescendant` are the filter input's today. */
  searchable?: boolean | number | null;
  /** Native `name` attribute forwarded to the trigger. */
  name?: string | null;
  /** Extra classes for the portaled panel, beside `ds-dropdown-panel`, `ds-overlay-pane` and this component's own `ds-multi-select-panel`. The panel is portaled out of the host, so a class on the pane is the only way a consumer stylesheet reaches ONE instance of it. */
  panelClass?: string | readonly string[];
  /** Prevents opening the panel while still allowing focus. */
  readOnly?: boolean;
  /** The contract spelling of `readOnly`, a second input because signal forms binds by NAME — a `readonly()` rule was reaching nothing before this existed. */
  readonlyBinding?: boolean;
  /** Shows a clear affordance once there is something to clear. */
  clearable?: boolean;
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
  /** How the chips collapse when they outgrow one line. `"fit"` (the default) measures and shows as many as the trigger is wide, the rest behind "+N more". A NUMBER is a CEILING, not a promise: the row still measures, so you get at most that many and fewer when the trigger is narrow. `"all"` shows every chip and lets the trigger grow a line per selection. Unset (`null`) means "not deciding", as it does on every other input in the library — it resolves to `"fit"`. It does NOT mean "show all": that is `"all"`, which is the loudest of the three modes and has to be asked for. */
  maxVisibleChips?: number | 'fit' | 'all' | null;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Confirmation text, shown when there is no error or warning — and it paints the field's success border. A string like `warning`: the text IS the state. */
  success?: string;
  /** Accessible name for the trigger — falls back to `placeholder`. */
  ariaLabel?: string | null;
  /** Trigger width — `fill` stretches to the container and pins the panel to the trigger's width; `content` hugs the trigger's own content and takes that width as the panel's FLOOR, so a compact trigger does not force an unreadable panel. */
  width?: (('fill' | 'content'));
  /** Trigger height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** What the trigger shows. `count` is a caption plus a selected-count badge at intrinsic width; `labels` names the selection instead, cut to the width with the rest behind "+N". A projected `dsPickerTrigger` template WINS over this — the input is then not read at all. */
  triggerDisplay?: ('full' | 'count' | 'labels');
  /** Field label above the control — the same meaning it has on `ds-select`, and the caption a `count`/`labels` trigger uses when it needs one. */
  label?: string;
  /** Marks the field required: a `*` beside the label and `aria-required` on the trigger. */
  required?: boolean;
  /** Marks the field optional in words, for a form where most fields are required. */
  optional?: boolean;
  /** Where a "select all" row appears. `false` nowhere, `true` one row over the whole panel, `'group'` one row per group, `'both'` for either. Group rows need groups in `options` — with a flat list they have nothing to head. */
  selectAll?: boolean | 'group' | 'both';
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const MultiSelect: React.ComponentType<MultiSelectProps>;
