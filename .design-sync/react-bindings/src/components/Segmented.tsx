import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon, type IconName } from '../lib/Icon';

export interface SegmentedOption {
  label: string;
  value: string;
  icon?: IconName;
  disabled?: boolean;
}

export interface SegmentedProps {
  /** Segments to render — each needs a `label` and `value`, optional `icon`/`disabled`. */
  options?: readonly SegmentedOption[];
  /** Selected segment's `value`. Controlled when `onValueChange` is provided;
   *  otherwise the component manages its own state seeded from this value. */
  value?: string;
  /** Emits the newly selected segment's `value`. */
  onValueChange?: (value: string) => void;
  /** Accessible name for the segmented control (radiogroup role). */
  ariaLabel?: string;
}

/** Radio-like segment control for mutually exclusive views — port of
 *  `ds-segmented`. One-of-many value toggle (`role="radiogroup"`); for a
 *  standalone on/off control use ToggleButton. */
export function Segmented({
  options = [],
  value,
  onValueChange,
  ariaLabel,
}: SegmentedProps) {
  const [ownValue, setOwnValue] = React.useState(value ?? '');
  const val = onValueChange ? (value ?? '') : ownValue;
  const setVal = (v: string) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const buttonsRef = React.useRef<Array<HTMLButtonElement | null>>([]);

  // The single roving-tabindex entry point: the selected segment, or the first
  // enabled one when nothing is selected yet.
  const focusableValue = options.some((o) => o.value === val && !o.disabled)
    ? val
    : (options.find((o) => !o.disabled)?.value ?? null);

  const nextEnabled = (from: number, step: number): number => {
    const count = options.length;
    if (count === 0) return -1;
    let index = from;
    for (let i = 0; i < count; i++) {
      index = (index + step + count) % count;
      if (!options[index].disabled) return index;
    }
    return -1;
  };

  const onKeydown = (event: React.KeyboardEvent, index: number) => {
    let target = -1;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        target = nextEnabled(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        target = nextEnabled(index, -1);
        break;
      case 'Home':
        target = nextEnabled(-1, 1);
        break;
      case 'End':
        target = nextEnabled(options.length, -1);
        break;
      default:
        return;
    }
    if (target < 0) return;
    event.preventDefault();
    setVal(options[target].value);
    buttonsRef.current[target]?.focus();
  };

  return host(
    'ds-segmented',
    { role: 'radiogroup', 'aria-label': ariaLabel ?? undefined },
    options.map((option, i) => (
      <button
        key={option.value}
        ref={(el) => {
          buttonsRef.current[i] = el;
        }}
        type="button"
        role="radio"
        className={cx('segment', option.value === val && 'selected')}
        aria-checked={option.value === val}
        tabIndex={option.value === focusableValue ? 0 : -1}
        disabled={option.disabled}
        onClick={() => {
          if (!option.disabled) setVal(option.value);
        }}
        onKeyDown={(e) => onKeydown(e, i)}
      >
        {option.icon && <Icon name={option.icon} size={16} />}
        <span className="label">{option.label}</span>
      </button>
    )),
  );
}
