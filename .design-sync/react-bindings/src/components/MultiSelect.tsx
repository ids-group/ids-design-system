import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';
import { Tag } from './Tag';

export interface MultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  /** Selected values. Controlled when `onValueChange` is provided; otherwise
   *  the component manages its own state seeded from this value. */
  value?: string[];
  /** Emits the new selection whenever an option, chip × or "Select all" toggles it. */
  onValueChange?: (value: string[]) => void;
  /** Options shown in the panel. */
  options?: readonly MultiSelectOption[];
  /** Placeholder shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Placeholder for the in-panel filter input. */
  searchPlaceholder?: string;
  /** Caps the number of chips shown before collapsing the rest into "+N more" — 0/null shows all. */
  maxVisibleChips?: number | null;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Applies error styling and marks the field `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Accessible name for the trigger — falls back to `placeholder`. */
  ariaLabel?: string;
  /** Shows a "Select all" row that toggles every filter-matching, enabled option. */
  selectAll?: boolean;
  /** Panel open state. Controlled when `onOpenChange` is provided; otherwise
   *  the component manages its own state seeded from this value.
   *  The open panel renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Emits the new open state when the trigger is toggled or the panel closes. */
  onOpenChange?: (open: boolean) => void;
}

/** Multi-choice dropdown — port of `ds-multi-select`. Selection shows as
 *  removable chips in the trigger; the panel has a filter input, optional
 *  "Select all" row and checkbox options. Angular portals the panel via CDK
 *  overlay; this binding renders it inline inside the host (the re-scoped CSS
 *  reaches host descendants — no portals). */
export function MultiSelect({
  value,
  onValueChange,
  options = [],
  placeholder = 'Select…',
  searchPlaceholder = 'Filter…',
  maxVisibleChips = null,
  disabled = false,
  invalid = false,
  hint = '',
  ariaLabel,
  selectAll = false,
  open,
  onOpenChange,
}: MultiSelectProps) {
  const [uid] = React.useState(() => nextControlId('ds-multi-select'));
  const listboxId = `${uid}-listbox`;
  const optionId = (index: number) => `${uid}-opt-${index}`;
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const [ownValue, setOwnValue] = React.useState<string[]>(value ?? []);
  const val = onValueChange ? (value ?? []) : ownValue;
  const setVal = (next: string[]) => {
    if (!onValueChange) setOwnValue(next);
    onValueChange?.(next);
  };

  const [ownOpen, setOwnOpen] = React.useState(open ?? false);
  const isOpen = onOpenChange ? (open ?? false) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const [filter, setFilter] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Selected options in source order, so chip order is stable.
  const selectedOptions = options.filter((o) => val.includes(o.value));
  const visibleChips =
    maxVisibleChips && maxVisibleChips > 0
      ? selectedOptions.slice(0, maxVisibleChips)
      : selectedOptions;
  const overflowCount =
    maxVisibleChips && maxVisibleChips > 0
      ? Math.max(0, selectedOptions.length - maxVisibleChips)
      : 0;

  const query = filter.trim().toLowerCase();
  const filteredOptions = query
    ? options.filter((o) => o.label.toLowerCase().includes(query))
    : options.slice();

  const activeDescendant = isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined;
  const resolvedAriaLabel = ariaLabel || placeholder;

  // Select-all reflects the currently filter-matching, enabled options.
  const enabledFiltered = filteredOptions.filter((o) => !o.disabled);
  const allFilteredSelected =
    enabledFiltered.length > 0 && enabledFiltered.every((o) => val.includes(o.value));
  const someFilteredSelected =
    enabledFiltered.some((o) => val.includes(o.value)) && !allFilteredSelected;

  const isSelected = (v: string) => val.includes(v);

  const toggleSelectAll = () => {
    const enabledValues = enabledFiltered.map((o) => o.value);
    if (allFilteredSelected) {
      const remove = new Set(enabledValues);
      setVal(val.filter((v) => !remove.has(v)));
    } else {
      const next = new Set(val);
      enabledValues.forEach((v) => next.add(v));
      setVal([...next]);
    }
  };

  const toggleValue = (option: MultiSelectOption) => {
    if (option.disabled) return;
    setVal(
      val.includes(option.value)
        ? val.filter((v) => v !== option.value)
        : [...val, option.value],
    );
  };

  const removeValue = (v: string) => {
    setVal(val.filter((entry) => entry !== v));
  };

  const openPanel = () => {
    if (disabled || isOpen) return;
    setOpen(true);
    setActiveIndex(filteredOptions.length ? 0 : -1);
    setTimeout(() => searchRef.current?.focus());
  };

  const close = () => {
    setOpen(false);
    setFilter('');
    setActiveIndex(-1);
  };

  const onTriggerClick = () => {
    if (disabled) return;
    if (isOpen) close();
    else openPanel();
  };

  const onTriggerKeydown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTriggerClick();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openPanel();
    }
  };

  const moveActive = (delta: number) => {
    const count = filteredOptions.length;
    if (!count) return;
    let next = activeIndex;
    let remaining = count;
    while (remaining-- > 0) {
      next = (next + delta + count) % count;
      if (!filteredOptions[next].disabled) {
        setActiveIndex(next);
        return;
      }
    }
  };

  const onSearchKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Enter': {
        event.preventDefault();
        const option = filteredOptions[activeIndex];
        if (option) toggleValue(option);
        break;
      }
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Backspace':
        if (!filter && selectedOptions.length) {
          removeValue(selectedOptions[selectedOptions.length - 1].value);
        }
        break;
      default:
        break;
    }
  };

  return host(
    'ds-multi-select',
    null,
    <div
      className={cx('field-trigger', isOpen && 'open', invalid && 'invalid', disabled && 'disabled')}
      aria-haspopup="listbox"
      role={isOpen ? 'group' : 'combobox'}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={hintId}
      aria-expanded={isOpen}
      aria-controls={listboxId}
      aria-label={resolvedAriaLabel}
      tabIndex={disabled ? -1 : 0}
      onClick={onTriggerClick}
      onKeyDown={onTriggerKeydown}
    >
      {selectedOptions.length === 0 ? (
        <span className="placeholder">{placeholder}</span>
      ) : (
        <>
          {visibleChips.map((option) => (
            <Tag
              key={option.value}
              variant="neutral"
              closable
              closeLabel={`Remove ${option.label}`}
              onClosed={() => removeValue(option.value)}
            >
              {option.label}
            </Tag>
          ))}
          {overflowCount > 0 && <span className="overflow">+{overflowCount} more</span>}
        </>
      )}
      <Icon className="chevron" name="chevronDown" size={18} />
    </div>,
    <FieldMessage text={hint} state={messageState} messageId={hintId} />,
    // Inline panel — Angular portals this into a CDK overlay pane; the panel's
    // own `.panel` class carries its skin, so in-flow rendering stays styled.
    isOpen && (
      <div className="panel">
        <div className="search-row">
          <Icon className="search-icon" name="search" size={16} />
          <input
            ref={searchRef}
            type="text"
            className="search-input"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="true"
            autoComplete="off"
            spellCheck={false}
            placeholder={searchPlaceholder}
            value={filter}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendant}
            onChange={(e) => {
              setFilter(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onSearchKeydown}
          />
        </div>

        {selectAll && filteredOptions.length > 0 && (
          <button
            type="button"
            className="select-all"
            role="checkbox"
            aria-checked={allFilteredSelected ? 'true' : someFilteredSelected ? 'mixed' : 'false'}
            onClick={toggleSelectAll}
          >
            <span
              className={cx(
                'checkbox',
                allFilteredSelected && 'checked',
                someFilteredSelected && 'indeterminate',
              )}
            >
              {allFilteredSelected ? (
                <Icon name="check" size={13} />
              ) : someFilteredSelected ? (
                <span className="dash" />
              ) : null}
            </span>
            <span className="select-all-label">Select all</span>
          </button>
        )}

        <ul className="options" role="listbox" aria-multiselectable="true" id={listboxId}>
          {filteredOptions.map((option, i) => (
            <li role="presentation" key={option.value}>
              <button
                type="button"
                role="option"
                className={cx('option', activeIndex === i && 'is-active')}
                id={optionId(i)}
                aria-selected={isSelected(option.value)}
                disabled={option.disabled}
                onClick={() => toggleValue(option)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className={cx('checkbox', isSelected(option.value) && 'checked')}>
                  {isSelected(option.value) && <Icon name="check" size={13} />}
                </span>
                <span className="option-label">{option.label}</span>
              </button>
            </li>
          ))}
          {filteredOptions.length === 0 && <li className="empty">No matches</li>}
        </ul>
      </div>
    ),
  );
}
