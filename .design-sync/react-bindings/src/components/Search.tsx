import * as React from 'react';
import { host } from '../lib/util';
import { Icon } from '../lib/Icon';

export interface SearchProps {
  /** Search text. Controlled when `onValueChange` is provided; otherwise the
   *  component manages its own state seeded from this value. */
  value?: string;
  /** Emits the new value on every keystroke (and on clear). */
  onValueChange?: (value: string) => void;
  /** Placeholder shown when empty. Default 'Search'. */
  placeholder?: string;
  /** Keyboard shortcut hint rendered in a trailing `<kbd>` badge (e.g. "⌘K"). */
  shortcut?: string;
  /** Shows the leading search icon. Default true. */
  showIcon?: boolean;
  /** Show an inline clear (×) button on the right when there's a value. */
  clearable?: boolean;
  /** Accessible name for the input (placeholder is not a reliable label). */
  ariaLabel?: string;
  /** Fires with the current value on Enter. */
  onSubmitted?: (value: string) => void;
}

/** Compact search box — port of `ds-search`. A borderless quick-filter field
 *  (toolbar/topbar style), lighter-weight than `Input type="search"`. */
export function Search({
  value,
  onValueChange,
  placeholder = 'Search',
  shortcut = '',
  showIcon = true,
  clearable = false,
  ariaLabel = '',
  onSubmitted,
}: SearchProps) {
  const [ownValue, setOwnValue] = React.useState(value ?? '');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const val = onValueChange ? (value ?? '') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const clear = () => {
    setVal('');
    // The × is removed once empty; return focus to the input so keyboard
    // users don't get dropped onto <body>.
    inputRef.current?.focus();
  };

  return host(
    'ds-search',
    null,
    <div className="search" onClick={() => inputRef.current?.focus()}>
      {showIcon && <Icon name="search" size={16} />}

      <input
        ref={inputRef}
        className="search-input"
        placeholder={placeholder}
        aria-label={ariaLabel || placeholder || undefined}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmitted?.(val);
        }}
      />

      {clearable && val && (
        <button type="button" className="search-clear" aria-label="Clear search" onClick={clear}>
          <Icon name="x" size={14} />
        </button>
      )}

      {shortcut && <kbd className="kbd">{shortcut}</kbd>}
    </div>,
  );
}
