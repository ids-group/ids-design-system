import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

/** Where the step caption sits relative to its node: stacked beneath it
 *  (`bottom`, full-width wizard) or beside it (`inline`, compact header row). */
export type StepperLabelPosition = 'bottom' | 'inline';

/** Layout axis of the stepper. */
export type StepperOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'ds-stepper',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'list',
    'aria-label': 'Progress',
    '[class.labels-inline]': "labelPosition() === 'inline'",
    '[class.is-vertical]': "orientation() === 'vertical'",
  },
})
export class StepperComponent {
  readonly steps = input<readonly string[]>([]);
  readonly current = input<number>(0);
  readonly labelPosition = input<StepperLabelPosition>('bottom');
  readonly orientation = input<StepperOrientation>('horizontal');
  /** When true, each step node renders as a button and emits its index on activation. */
  readonly clickable = input(false, { transform: booleanAttribute });
  /** Zero-based indices of steps in an error state. Error wins over completed/current/upcoming. */
  readonly errorSteps = input<readonly number[]>([]);

  readonly stepClick = output<number>();

  protected stepState(
    index: number,
  ): 'error' | 'completed' | 'current' | 'upcoming' {
    if (this.errorSteps().includes(index)) {
      return 'error';
    }
    const currentStep = this.current();
    if (index < currentStep) {
      return 'completed';
    }
    if (index === currentStep) {
      return 'current';
    }

    return 'upcoming';
  }

  protected nodeClass(index: number): string {
    const state = this.stepState(index);
    if (state === 'error') {
      return 'node error';
    }
    if (state === 'completed') {
      return 'node done';
    }
    if (state === 'current') {
      return 'node active';
    }

    return 'node';
  }

  protected connectorClass(index: number): string {
    return index < this.current() && !this.errorSteps().includes(index)
      ? 'connector done'
      : 'connector';
  }

  protected onStepClick(index: number): void {
    if (this.clickable()) {
      this.stepClick.emit(index);
    }
  }
}
