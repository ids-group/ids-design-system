import * as React from 'react';
import { cx, host } from '../lib/util';

export type NumberStepperSize = 'sm' | 'md' | 'lg';

export interface NumberStepperProps {
  /** Current numeric value. Controlled when `onValueChange` is provided;
   *  otherwise the component manages its own state seeded from this value. */
  value?: number;
  /** Emits the new value on increment/decrement or typed input. */
  onValueChange?: (value: number) => void;
  /** Lower bound — the decrement button and typed input clamp to it. */
  min?: number;
  /** Upper bound — the increment button and typed input clamp to it; unbounded when null. */
  max?: number | null;
  /** Amount added or subtracted per increment/decrement. */
  step?: number;
  /** Control height — sm/md/lg. */
  size?: NumberStepperSize;
  /** Disables the stepper and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the number input (the stepper has no visible label). */
  ariaLabel?: string;
}

/** Compact −/input/+ quantity control — port of `ds-number-stepper`. */
export function NumberStepper({
  value,
  onValueChange,
  min = 0,
  max = null,
  step = 1,
  size = 'md',
  disabled = false,
  ariaLabel,
}: NumberStepperProps) {
  const [ownValue, setOwnValue] = React.useState(value ?? 0);
  const val = onValueChange ? (value ?? 0) : ownValue;
  const setVal = (v: number) => {
    if (!onValueChange) setOwnValue(v);
    onValueChange?.(v);
  };

  const atMin = val <= min;
  const atMax = max != null && val >= max;

  const inc = () => {
    if (atMax || disabled) return;
    setVal(val + step);
  };
  const dec = () => {
    if (atMin || disabled) return;
    setVal(val - step);
  };
  const setRaw = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    const number = Number.isNaN(parsed) ? 0 : parsed;
    let clamped = Math.max(min, number);
    if (max != null) clamped = Math.min(max, clamped);
    setVal(clamped);
  };

  return host(
    'ds-number-stepper',
    null,
    <div className={cx('stepper', `size-${size}`, disabled && 'disabled')}>
      <button
        type="button"
        className="step minus"
        aria-label="Decrease"
        disabled={atMin || disabled}
        onClick={dec}
      >
        −
      </button>

      <input
        type="number"
        className="qty"
        min={min}
        max={max ?? undefined}
        value={val}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => setRaw(e.target.value)}
      />

      <button
        type="button"
        className="step plus"
        aria-label="Increase"
        disabled={atMax || disabled}
        onClick={inc}
      >
        +
      </button>
    </div>,
  );
}
