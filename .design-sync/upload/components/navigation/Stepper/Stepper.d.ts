import * as React from 'react';

/**
 * Stepper — the real StepperComponent, run by Angular behind `<ds-stepper>`.
 * Progress stepper (`ds-stepper`) — numbered nodes joined by connectors, one per entry of `steps` (plain string labels). States derive entirely from `current` (zero-based) + `errorSteps`: earlier = completed (check icon), `current` = active (filled), later = upcoming (number); indices in `errorSteps` render the error glyph and win over everything.
 */
export interface StepperProps {
  /** Step labels in order; one node per entry. */
  steps?: readonly string[];
  /** Zero-based index of the active step; earlier steps render as completed. */
  current?: number;
  /** Where the step caption sits relative to its node. */
  labelPosition?: ('bottom' | 'inline');
  /** Layout axis of the stepper. */
  orientation?: ('horizontal' | 'vertical');
  /** Renders each step node as a button that emits its index. */
  clickable?: boolean;
  /** Zero-based indices of steps in an error state. Error wins over completed/current/upcoming. */
  errorSteps?: readonly number[];
  /** Fires with a step's index when activated; only when `clickable`. */
  onStepClicked?: (value: number) => void;
  /** Element content. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const Stepper: React.ComponentType<StepperProps>;
