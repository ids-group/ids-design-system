import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';

export type SelectSize = 'sm' | 'md' | 'lg';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: IconName;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
  disabled?: boolean;
}

export type SelectItem = SelectOption | SelectOptionGroup;

export function isSelectOptionGroup(item: SelectItem): item is SelectOptionGroup {
  return 'options' in item && Array.isArray((item as SelectOptionGroup).options);
}

interface FlatEntry {
  option: SelectOption;
  groupDisabled: boolean;
}

export interface SelectProps {
  /** Selected option's value. Controlled when `onValueChange` is provided;
   *  otherwise the component manages its own state seeded from this value. */
  value?: string;
  /** Emits the new value when an option is picked or the selection is cleared. */
  onValueChange?: (value: string) => void;
  /** Flat options or option groups rendered in the dropdown panel. */
  options?: SelectItem[];
  /** Shown in the trigger when nothing is selected. */
  placeholder?: string;
  /** Trigger height — sm/md/lg. */
  size?: SelectSize;
  /** Label shown above the trigger. */
  label?: string;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Prevents opening the dropdown while still allowing focus. */
  readOnly?: boolean;
  /** Applies error styling and marks the trigger `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the trigger. */
  hint?: string;
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  required?: boolean;
  /** Shows an "(optional)" marker next to the label (ignored when `required`). */
  optional?: boolean;
  /** Native `name` attribute forwarded to the trigger. */
  name?: string;
  /** Accessible name when no visible `label` is provided. */
  ariaLabel?: string;
  /** Shows an inline clear (×) button when a value is selected. */
  clearable?: boolean;
  /** Dropdown open state. Controlled when `onOpenChange` is provided;
   *  otherwise the component manages its own state seeded from this value.
   *  The open panel renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Emits the new open state when the trigger is toggled or an option closes the panel. */
  onOpenChange?: (open: boolean) => void;
}

/** Single-choice dropdown field — port of `ds-select`. The panel is a
 *  CDK-overlay popover in Angular; this binding renders it inline inside the
 *  host under the global `ds-dropdown-panel` skin (same markup the DS's own
 *  static-preview branch emits — the re-scoped CSS only reaches host
 *  descendants, so no portals). */
export function Select({
  value,
  onValueChange,
  options = [],
  placeholder = '',
  size = 'md',
  label = '',
  disabled = false,
  readOnly = false,
  invalid = false,
  hint = '',
  required = false,
  optional = false,
  name,
  ariaLabel,
  clearable = false,
  open,
  onOpenChange,
}: SelectProps) {
  const [uid] = React.useState(() => nextControlId('ds-select'));
  const labelId = `${uid}-label`;
  const listboxId = `${uid}-listbox`;
  const hintId = hint ? `${uid}-hint` : undefined;

  const [ownValue, setOwnValue] = React.useState(value ?? '');
  const val = onValueChange ? (value ?? '') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const [ownOpen, setOwnOpen] = React.useState(open ?? false);
  const isOpen = onOpenChange ? (open ?? false) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  // Flattened list of selectable options paired with the parent-group disabled
  // state — keyboard nav and selection skip group headers, respect group disable.
  const flatOptions: FlatEntry[] = [];
  for (const item of options) {
    if (isSelectOptionGroup(item)) {
      for (const opt of item.options) flatOptions.push({ option: opt, groupDisabled: !!item.disabled });
    } else {
      flatOptions.push({ option: item, groupDisabled: false });
    }
  }

  const firstEnabledIndex = flatOptions.findIndex(
    (e) => !e.option.disabled && !e.groupDisabled,
  );
  const selectedIndex = flatOptions.findIndex((e) => e.option.value === val);
  const selectedOption = selectedIndex >= 0 ? flatOptions[selectedIndex].option : null;
  const hasValue = !!selectedOption;
  const displayLabel = selectedOption?.label ?? placeholder;

  // Angular seeds activeIndex on open (selected option, else first enabled).
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const optionId = (flatIndex: number) => `${uid}-opt-${flatIndex}`;
  const activeDescendant = isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined;
  const resolvedAriaLabel = label ? undefined : ariaLabel || placeholder || undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const flatIndexOf = (opt: SelectOption) =>
    flatOptions.findIndex((e) => e.option === opt);
  const isSelected = (opt: SelectOption) => opt.value === val;
  const isOptionDisabled = (opt: SelectOption, groupDisabled = false) =>
    !!opt.disabled || groupDisabled;

  const openPanel = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };
  const toggle = () => {
    if (disabled || readOnly) return;
    if (isOpen) close();
    else openPanel();
  };
  const pick = (opt: SelectOption, groupDisabled = false) => {
    if (isOptionDisabled(opt, groupDisabled)) return;
    setVal(opt.value);
    close();
  };
  const clearValue = (event: React.MouseEvent) => {
    event.stopPropagation();
    setVal('');
  };

  const moveActive = (delta: number) => {
    if (flatOptions.length === 0) return;
    let next = activeIndex;
    for (let attempts = 0; attempts < flatOptions.length; attempts++) {
      next = (next + delta + flatOptions.length) % flatOptions.length;
      const candidate = flatOptions[next];
      if (candidate && !candidate.option.disabled && !candidate.groupDisabled) {
        setActiveIndex(next);
        return;
      }
    }
  };
  const lastEnabledIndex = (() => {
    for (let i = flatOptions.length - 1; i >= 0; i--) {
      if (!flatOptions[i].option.disabled && !flatOptions[i].groupDisabled) return i;
    }
    return -1;
  })();

  const onTriggerKeydown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || readOnly) return;
    const key = event.key;
    if (!isOpen) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault();
        openPanel();
      }
      return;
    }
    if (key === 'Tab') {
      // Close but let Tab move focus naturally (no preventDefault).
      close();
      return;
    }
    if (key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
      return;
    }
    if (key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
      return;
    }
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const entry = flatOptions[activeIndex];
      if (entry) pick(entry.option, entry.groupDisabled);
      return;
    }
    if (key === 'Home') {
      event.preventDefault();
      setActiveIndex(firstEnabledIndex);
      return;
    }
    if (key === 'End') {
      event.preventDefault();
      setActiveIndex(lastEnabledIndex);
    }
  };

  const renderOption = (opt: SelectOption, groupDisabled?: boolean) => {
    const flatIndex = flatIndexOf(opt);
    const optDisabled = isOptionDisabled(opt, groupDisabled);
    return (
      <li role="presentation" key={opt.value}>
        <button
          type="button"
          role="option"
          tabIndex={-1}
          className={cx(
            'option',
            isSelected(opt) && 'is-selected',
            activeIndex === flatIndex && 'is-active',
            optDisabled && 'is-disabled',
          )}
          id={optionId(flatIndex)}
          aria-selected={isSelected(opt)}
          aria-disabled={optDisabled ? 'true' : undefined}
          disabled={optDisabled}
          onClick={() => pick(opt, groupDisabled)}
          onMouseEnter={() => setActiveIndex(flatIndex)}
        >
          {opt.icon && <Icon className="option-icon" name={opt.icon} size={16} />}
          <span className="option-label">{opt.label}</span>
          {isSelected(opt) && <Icon className="option-check" name="check" size={14} />}
        </button>
      </li>
    );
  };

  const triggerClasses = cx(
    'dropdown',
    size === 'sm' && 'sm',
    size === 'lg' && 'lg',
    disabled && 'disabled',
    readOnly && 'readonly',
    invalid && 'error',
    isOpen && 'open',
  );

  return host(
    'ds-select',
    null,
    label && (
      <span className="select-label" id={labelId}>
        {label}
        {required ? (
          <span className="req" aria-hidden="true">*</span>
        ) : optional ? (
          <span className="optional-marker" aria-hidden="true">(optional)</span>
        ) : null}
      </span>
    ),
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      className={triggerClasses}
      name={name}
      aria-expanded={isOpen}
      aria-controls={listboxId}
      aria-activedescendant={activeDescendant}
      aria-labelledby={label ? labelId : undefined}
      aria-label={resolvedAriaLabel}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={hintId}
      aria-required={required ? 'true' : undefined}
      disabled={disabled}
      onClick={toggle}
      onKeyDown={onTriggerKeydown}
    >
      {selectedOption?.icon && (
        <Icon className="trigger-icon" name={selectedOption.icon} size={16} />
      )}
      <span className={cx('trigger-text', !hasValue && 'is-placeholder')}>
        {displayLabel}
      </span>
      {clearable && hasValue && !disabled && !readOnly && (
        <span className="clear-btn" aria-hidden="true" onClick={clearValue}>
          <Icon name="x" size={14} />
        </span>
      )}
      <span className="chevron">
        <Icon name="chevronDown" size={14} />
      </span>
    </button>,
    <FieldMessage text={hint} state={messageState} messageId={hintId} />,
    // Inline panel — Angular portals this into a CDK overlay pane carrying the
    // global `ds-dropdown-panel` skin class; the DS's own static-preview branch
    // renders exactly this wrapper in flow instead.
    isOpen && (
      <div className="ds-dropdown-panel">
        <div className="dropdown-panel">
          <ul
            className="dropdown-list"
            role="listbox"
            id={listboxId}
            aria-labelledby={label ? labelId : undefined}
          >
            {options.map((item, groupIdx) =>
              isSelectOptionGroup(item) ? (
                <li className="optgroup" role="group" aria-label={item.label} key={item.label}>
                  <span className={cx('optgroup-label', groupIdx === 0 && 'is-first')}>
                    {item.label}
                  </span>
                  <ul className="optgroup-list" role="presentation">
                    {item.options.map((opt) => renderOption(opt, item.disabled))}
                  </ul>
                </li>
              ) : (
                renderOption(item)
              ),
            )}
          </ul>
        </div>
      </div>
    ),
  );
}
