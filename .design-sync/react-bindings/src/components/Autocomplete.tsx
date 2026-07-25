import * as React from 'react';
import { cx, host, nextControlId } from '../lib/util';
import { Icon } from '../lib/Icon';
import { FieldMessage, type FieldMessageState } from '../lib/FieldMessage';
import { Tag } from './Tag';

export type AutocompleteSize = 'sm' | 'md' | 'lg';

/** `fill` stretches to the host container (default); `content` hugs chips/value + a min typing area. */
export type AutocompleteWidth = 'fill' | 'content';

export interface AutocompleteOption<T = unknown> {
  readonly value: T;
  readonly label: string;
}

export interface AutocompleteOptionGroup<T = unknown> {
  readonly label: string;
  readonly options: AutocompleteOption<T>[];
}

export interface AutocompleteProps<T = unknown> {
  /** Flat option list — ignored when `optionGroups` is set. */
  options?: readonly AutocompleteOption<T>[];
  /** Options grouped under labelled sections, rendered instead of `options`. */
  optionGroups?: AutocompleteOptionGroup<T>[];
  /** Selected value, or an array of values when `multiple`. Controlled when
   *  `onValueChange` is provided; otherwise the component manages its own
   *  state seeded from this value. */
  value?: T | readonly T[] | null;
  /** Emits the new value on pick/remove. */
  onValueChange?: (value: T | readonly T[] | null) => void;
  /** Allows selecting more than one option, shown as removable tags. */
  multiple?: boolean;
  /** Trigger height — sm/md/lg. */
  size?: AutocompleteSize;
  /** Trigger width — `fill` stretches to the container, `content` hugs the value. */
  width?: AutocompleteWidth;
  /** Placeholder shown in the input when empty. */
  placeholder?: string;
  /** Disables the trigger and blocks all interaction. */
  disabled?: boolean;
  /** Applies error styling and marks the field `aria-invalid`. */
  invalid?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Shows a "Create «text»" row when the typed text matches no option. */
  allowCreate?: boolean;
  /** Accessible name for the combobox input. */
  ariaLabel?: string;
  /** Fires with the typed text when the user picks the create-new option. */
  onCreate?: (text: string) => void;
  /** Typed filter text (binding-only prop — Angular keeps it internal). The
   *  list filters by it, so pass `query` + `open` to show a filtered panel
   *  statically. Controlled when `onQueryChange` is provided; otherwise the
   *  component manages its own state seeded from this value. */
  query?: string;
  /** Emits the new filter text on every keystroke. */
  onQueryChange?: (query: string) => void;
  /** Panel open state. Controlled when `onOpenChange` is provided; otherwise
   *  the component manages its own state seeded from this value.
   *  The open panel renders INLINE inside the host (no portal). */
  open?: boolean;
  /** Emits the new open state when the panel opens or closes. */
  onOpenChange?: (open: boolean) => void;
}

/** Combobox with type-ahead filtering — port of `ds-autocomplete`. Single or
 *  `multiple` (removable tags), flat or grouped options, optional
 *  "Create «text»" row. Angular portals the listbox via CDK overlay; this
 *  binding renders it inline inside the host (the re-scoped CSS reaches host
 *  descendants — no portals). */
export function Autocomplete<T = unknown>({
  options = [],
  optionGroups = [],
  value = null,
  onValueChange,
  multiple = false,
  size = 'md',
  width = 'fill',
  placeholder = 'Select…',
  disabled = false,
  invalid = false,
  hint = '',
  allowCreate = false,
  ariaLabel,
  onCreate,
  query,
  onQueryChange,
  open,
  onOpenChange,
}: AutocompleteProps<T>) {
  const [uid] = React.useState(() => nextControlId('ds-autocomplete'));
  const listboxId = `${uid}-listbox`;
  const optionId = (index: number) => `${uid}-opt-${index}`;
  const hintId = hint ? `${uid}-hint` : undefined;
  const messageState: FieldMessageState = invalid ? 'error' : 'default';

  const [ownValue, setOwnValue] = React.useState<T | readonly T[] | null>(value ?? null);
  const val = onValueChange ? (value ?? null) : ownValue;
  const setVal = (next: T | readonly T[] | null) => {
    if (!onValueChange) setOwnValue(next);
    onValueChange?.(next);
  };

  const [ownQuery, setOwnQuery] = React.useState(query ?? '');
  const q = onQueryChange ? (query ?? '') : ownQuery;
  const setQuery = (next: string) => {
    if (!onQueryChange) setOwnQuery(next);
    onQueryChange?.(next);
  };

  const [ownOpen, setOwnOpen] = React.useState(open ?? false);
  const isOpen = onOpenChange ? (open ?? false) : ownOpen;
  const setOpen = (next: boolean) => {
    if (!onOpenChange) setOwnOpen(next);
    onOpenChange?.(next);
  };

  const [activeIndex, setActiveIndex] = React.useState(-1);
  const filterRef = React.useRef<HTMLInputElement>(null);

  /** All options flattened from either optionGroups or options. */
  const allOptions: readonly AutocompleteOption<T>[] =
    optionGroups.length > 0 ? optionGroups.flatMap((g) => g.options) : options;

  const trimmedQuery = q.toLowerCase().trim();
  const filteredOptions = trimmedQuery
    ? allOptions.filter((o) => o.label.toLowerCase().includes(trimmedQuery))
    : allOptions;

  /** Filtered groups for grouped rendering — groups with no matches are hidden. */
  const filteredGroups: AutocompleteOptionGroup<T>[] =
    optionGroups.length === 0
      ? []
      : !trimmedQuery
        ? optionGroups
        : optionGroups
            .map((g) => ({
              ...g,
              options: g.options.filter((o) => o.label.toLowerCase().includes(trimmedQuery)),
            }))
            .filter((g) => g.options.length > 0);

  const showCreateRow =
    allowCreate &&
    !!q.trim() &&
    !allOptions.some((o) => o.label.toLowerCase() === q.trim().toLowerCase());

  /** Flat list of visible options used for keyboard navigation index. */
  const visibleOptions = filteredOptions;

  const selectedTags = multiple
    ? (() => {
        const selectedSet = new Set(((val as readonly T[] | null) ?? []) as T[]);
        return allOptions.filter((o) => selectedSet.has(o.value));
      })()
    : [];

  const displayLabel =
    !multiple && val !== null
      ? (allOptions.find((o) => o.value === (val as T))?.label ?? '')
      : '';

  const placeholderText = multiple || displayLabel ? '' : placeholder;

  const activeDescendant = isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined;

  const isSelected = (option: AutocompleteOption<T>): boolean => {
    if (multiple) {
      return (((val as readonly T[] | null) ?? []) as T[]).includes(option.value);
    }
    return val === option.value;
  };

  const flatIndexOf = (option: AutocompleteOption<T>): number =>
    visibleOptions.findIndex((o) => o === option);

  const openPanel = () => {
    if (disabled || isOpen) return;
    setOpen(true);
    setActiveIndex(visibleOptions.length ? 0 : -1);
  };

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const onTriggerClick = () => {
    if (disabled) return;
    filterRef.current?.focus();
    if (!isOpen) openPanel();
  };

  const togglePanel = (event: React.MouseEvent) => {
    if (disabled) return;
    event.stopPropagation();
    if (isOpen) {
      close();
    } else {
      filterRef.current?.focus();
      openPanel();
    }
  };

  const onPick = (option: AutocompleteOption<T>) => {
    if (multiple) {
      const current = ((val as readonly T[] | null) ?? []) as readonly T[];
      const next = current.includes(option.value)
        ? current.filter((existing) => existing !== option.value)
        : [...current, option.value];
      setVal(next);
    } else {
      setVal(option.value);
      close();
    }
  };

  const onCreateNew = () => {
    const text = q.trim();
    if (!text) return;
    onCreate?.(text);
    setQuery('');
    close();
  };

  const remove = (target: T) => {
    if (!multiple) return;
    const current = ((val as readonly T[] | null) ?? []) as readonly T[];
    setVal(current.filter((existing) => existing !== target));
  };

  const onKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    const visibleCount = visibleOptions.length;
    // Create row adds one extra navigable slot at the end.
    const totalSlots = visibleCount + (showCreateRow ? 1 : 0);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          openPanel();
          return;
        }
        setActiveIndex(totalSlots ? (activeIndex + 1) % totalSlots : -1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openPanel();
          return;
        }
        setActiveIndex(totalSlots ? (activeIndex - 1 + totalSlots) % totalSlots : -1);
        break;
      case 'Enter': {
        if (showCreateRow && activeIndex === visibleCount) {
          event.preventDefault();
          onCreateNew();
          break;
        }
        const opt = visibleOptions[activeIndex];
        if (opt) {
          event.preventDefault();
          onPick(opt);
        }
        break;
      }
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
      case 'Tab':
        // Close but let Tab move focus naturally (no preventDefault).
        if (isOpen) close();
        break;
      case 'Backspace':
        if (multiple && !q) {
          const last = selectedTags[selectedTags.length - 1];
          if (last) remove(last.value);
        }
        break;
      default:
        break;
    }
  };

  const renderOptionBody = (option: AutocompleteOption<T>) => (
    <>
      {multiple && (
        <span className={cx('check-box', isSelected(option) && 'checked')}>
          {isSelected(option) && <Icon name="check" size={13} />}
        </span>
      )}
      <span className="option-label">{option.label}</span>
      {!multiple && isSelected(option) && <Icon name="check" className="icon" size={14} />}
    </>
  );

  return host(
    'ds-autocomplete',
    { class: width === 'content' ? 'content-width' : undefined },
    <div
      className={cx(
        'autocomplete-trigger',
        isOpen && 'open',
        size === 'sm' && 'sm',
        size === 'lg' && 'lg',
        disabled && 'disabled',
        invalid && 'error',
      )}
      onClick={onTriggerClick}
    >
      {multiple
        ? selectedTags.map((selectedOption) => (
            <Tag
              key={String(selectedOption.value)}
              closable
              closeLabel={`Remove ${selectedOption.label}`}
              onClosed={() => remove(selectedOption.value)}
            >
              {selectedOption.label}
            </Tag>
          ))
        : displayLabel && <span className="autocomplete-value">{displayLabel}</span>}

      <input
        ref={filterRef}
        type="text"
        className="autocomplete-input"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeDescendant}
        aria-label={ariaLabel || placeholder}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={hintId}
        disabled={disabled}
        value={q}
        placeholder={placeholderText}
        onChange={(e) => {
          setQuery(e.target.value);
          setActiveIndex(0);
        }}
        onFocus={openPanel}
        onKeyDown={onKeydown}
      />

      {/* Angular binds (click) on the ds-icon host — clone the rendered host
          element to attach the same toggle handler (Icon has no onClick prop). */}
      {React.cloneElement(
        Icon({ name: 'chevronDown', className: 'autocomplete-chevron', size: 16 }) as React.ReactElement<Record<string, unknown>>,
        { onClick: togglePanel },
      )}
    </div>,
    <FieldMessage text={hint} state={messageState} messageId={hintId} />,
    // Inline panel — Angular portals this `<ul>` into a CDK overlay pane; the
    // `.autocomplete-list` class carries the full panel skin, so in-flow
    // rendering inside the host stays styled.
    isOpen && (
      <ul
        className="autocomplete-list"
        role="listbox"
        id={listboxId}
        aria-multiselectable={multiple ? 'true' : undefined}
      >
        {filteredGroups.length > 0
          ? filteredGroups.map((group, groupIdx) => (
              <li
                className="autocomplete-optgroup"
                role="group"
                aria-label={group.label}
                key={group.label}
              >
                <span className={cx('autocomplete-optgroup-label', groupIdx === 0 && 'is-first')}>
                  {group.label}
                </span>
                {group.options.map((option) => (
                  <div
                    key={String(option.value)}
                    role="option"
                    className={cx(
                      'option',
                      multiple && 'multi',
                      flatIndexOf(option) === activeIndex && 'is-active',
                    )}
                    id={optionId(flatIndexOf(option))}
                    aria-selected={isSelected(option)}
                    onClick={() => onPick(option)}
                    onMouseEnter={() => setActiveIndex(flatIndexOf(option))}
                  >
                    {renderOptionBody(option)}
                  </div>
                ))}
              </li>
            ))
          : filteredOptions.map((option, i) => (
              <li
                key={String(option.value)}
                role="option"
                className={cx('option', multiple && 'multi', i === activeIndex && 'is-active')}
                id={optionId(i)}
                aria-selected={isSelected(option)}
                onClick={() => onPick(option)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {renderOptionBody(option)}
              </li>
            ))}

        {filteredOptions.length === 0 && !showCreateRow && (
          <li className="empty t-s" role="status">
            No matches
          </li>
        )}

        {showCreateRow && (
          <li
            className={cx('option', 'create-row', activeIndex === visibleOptions.length && 'is-active')}
            role="option"
            id={optionId(visibleOptions.length)}
            aria-selected={false}
            onClick={onCreateNew}
            onMouseEnter={() => setActiveIndex(visibleOptions.length)}
          >
            <Icon name="plus" className="create-icon" size={16} />
            <span className="option-label">Create «{q.trim()}»</span>
          </li>
        )}
      </ul>
    ),
  );
}
