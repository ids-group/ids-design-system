import * as React from 'react';

/**
 * NumberStepper — the real NumberStepperComponent, run by Angular behind `<ds-number-stepper>`.
 * Compact quantity control: − button, number input, + button. Sizes `sm`/`md`/`lg` via `size`; the whole control greys out with `disabled`.
 */
export interface NumberStepperProps {
  /** Current numeric value, two-way bound. */
  value?: number;
  onValueChange?: (value: number) => void;
  /** Lower bound — the decrement button and typed input clamp to it. */
  min?: number;
  /** Upper bound — the increment button and typed input clamp to it; unbounded when null. */
  max?: number | null;
  /** Amount added or subtracted per increment/decrement. */
  step?: number;
  /** Control height — sm/md/lg. Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  size?: ('sm' | 'md' | 'lg') | null;
  /** Disables the stepper and blocks all interaction. */
  disabled?: boolean;
  /** Accessible name for the number input (the stepper has no visible label). */
  ariaLabel?: string | null;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const NumberStepper: React.ComponentType<NumberStepperProps>;
