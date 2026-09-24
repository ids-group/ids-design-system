import * as React from 'react';

/**
 * Search — the real SearchComponent, run by Angular behind `<ds-x-search>`.
 * Compact quick-filter search box for toolbars and topbars — a leading search icon, borderless input, optional clear button and `<kbd>` shortcut badge. Lighter-weight than `Input type="search"` (no label/hint/validation anatomy).
 */
export interface SearchProps {
  /** Hides the control, as every other DS control does. Inline `display`, not the attribute: the host sets its own, which the weaker UA rule would lose to. */
  hidden?: boolean;
  /** Search text, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Placeholder shown when empty. Unset falls back to `DS_INTL.search.placeholder`. */
  placeholder?: string | null;
  /** Keyboard shortcut hint rendered in a trailing `<kbd>` badge. */
  shortcut?: string;
  /** Shows the leading search icon. */
  showIcon?: boolean;
  /** Show an inline clear (×) button on the right when there's a value. */
  clearable?: boolean;
  /** Accessible name for the input (placeholder is not a reliable label). */
  ariaLabel?: string;
  /** Disables the input and the clear button. */
  disabled?: boolean;
  /** Control height. `md` (default) keeps the 36px search-row height; `sm` (32px) aligns search with dense toolbars beside `sm` inputs/buttons; `lg` is touch. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Fires with the current value on Enter. */
  onSubmitted?: (value: string) => void;
  /** Milliseconds to hold each keystroke back before `value` updates — 0 (default) writes on every keystroke, exactly as this control always has. Clearing the field BYPASSES the delay, which is the part a plain `debounceTime` gets wrong: emptying a search is a deliberate act, and making the user wait 200ms to see the full list back reads as a hang. Enter flushes for the same reason. What the input SHOWS is never delayed. */
  debounce?: number;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Search: React.ComponentType<SearchProps>;
