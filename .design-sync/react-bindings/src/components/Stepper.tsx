import * as React from 'react';
import { cx, host } from '../lib/util';
import { Icon } from '../lib/Icon';

/** Where the step caption sits relative to its node: stacked beneath it
 *  (`bottom`, full-width wizard) or beside it (`inline`, compact header row). */
export type StepperLabelPosition = 'bottom' | 'inline';

/** Layout axis of the stepper. */
export type StepperOrientation = 'horizontal' | 'vertical';

export type StepState = 'error' | 'completed' | 'current' | 'upcoming';

export interface StepperProps {
  /** Step labels, in order — one node is rendered per entry. */
  steps?: readonly string[];
  /** Zero-based index of the active step; earlier steps render as completed.
   *  Default 0. */
  current?: number;
  /** Where the step caption sits relative to its node. Default 'bottom'. */
  labelPosition?: StepperLabelPosition;
  /** Layout axis of the stepper. Default 'horizontal'. */
  orientation?: StepperOrientation;
  /** When true, each step node renders as a button and emits its index on activation. */
  clickable?: boolean;
  /** Zero-based indices of steps in an error state. Error wins over
   *  completed/current/upcoming. */
  errorSteps?: readonly number[];
  /** Fires with a step's index when it's activated (only when `clickable`). */
  onStepClicked?: (index: number) => void;
}

function stepState(index: number, current: number, errorSteps: readonly number[]): StepState {
  if (errorSteps.includes(index)) return 'error';
  if (index < current) return 'completed';
  if (index === current) return 'current';
  return 'upcoming';
}

function nodeClass(state: StepState): string {
  if (state === 'error') return 'node error';
  if (state === 'completed') return 'node done';
  if (state === 'current') return 'node active';
  return 'node';
}

/** Progress stepper — port of `ds-stepper`. States derive from `current` +
 *  `errorSteps` (completed < current < upcoming; error overrides). Completed
 *  nodes show a check, error nodes an error glyph, others their 1-based number. */
export function Stepper({
  steps = [],
  current = 0,
  labelPosition = 'bottom',
  orientation = 'horizontal',
  clickable = false,
  errorSteps = [],
  onStepClicked,
}: StepperProps) {
  const nodeContent = (state: StepState, i: number) =>
    state === 'completed' ? (
      <Icon name="check" size={14} />
    ) : state === 'error' ? (
      <Icon name="error" size={14} />
    ) : (
      <>{i + 1}</>
    );

  return host(
    'ds-stepper',
    {
      role: 'list',
      'aria-label': 'Progress',
      class:
        cx(
          labelPosition === 'inline' && 'labels-inline',
          orientation === 'vertical' && 'is-vertical',
        ) || undefined,
    },
    steps.map((label, i) => {
      const state = stepState(i, current, errorSteps);
      const last = i === steps.length - 1;
      const connectorDone = i < current && !errorSteps.includes(i);
      return (
        <span
          key={i}
          role="listitem"
          className={cx('step', i === current && 'is-current')}
          aria-current={i === current ? 'step' : undefined}
        >
          {clickable ? (
            <button
              type="button"
              aria-hidden="true"
              className={nodeClass(state)}
              onClick={() => onStepClicked?.(i)}
            >
              {nodeContent(state, i)}
            </button>
          ) : (
            <span aria-hidden="true" className={nodeClass(state)}>
              {nodeContent(state, i)}
            </span>
          )}
          <span aria-hidden="true" className="step-label">
            {label}
          </span>
          {!last && (
            <span aria-hidden="true" className={cx('connector', connectorDone && 'done')} />
          )}
          <span className="visually-hidden">
            Step {i + 1}: {label} ({state})
          </span>
        </span>
      );
    }),
  );
}
