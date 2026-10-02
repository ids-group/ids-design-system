import * as React from 'react';

/**
 * Search — the real SearchComponent, run by Angular behind `<ds-x-search>`.
 * Compact quick-filter search box for toolbars and topbars — a leading search icon, borderless input, optional clear button and `<kbd>` shortcut badge. Lighter-weight than `Input type="search"` (no label/hint/validation anatomy).
 */
export interface SearchProps {
  /** Inline `display`, not the attribute: the host sets its own `display`, which beats the UA `[hidden]` rule. */
  hidden?: boolean;
  /** Search text, two-way bound. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Placeholder when empty; falls back to `DS_INTL.search.placeholder`. */
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
  /** Control height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Fires with the current value on Enter. */
  onSubmitted?: (value: string) => void;
  /** Milliseconds to hold each keystroke back before `value` updates; 0 (default) writes on every keystroke. Clearing bypasses the delay and Enter flushes; the displayed text is never delayed. */
  debounce?: number;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Search: React.ComponentType<SearchProps>;
