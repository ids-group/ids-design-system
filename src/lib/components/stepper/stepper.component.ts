import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

/** Where the step caption sits relative to its node: stacked beneath it
 *  (`bottom`, full-width wizard) or beside it (`inline`, compact header row). */
export type StepperLabelPosition = 'bottom' | 'inline';

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
  },
})
export class StepperComponent {
  readonly steps = input<readonly string[]>([]);
  readonly current = input<number>(0);
  readonly labelPosition = input<StepperLabelPosition>('bottom');

  protected stepState(i: number): 'completed' | 'current' | 'upcoming' {
    const currentStep = this.current();
    if (i < currentStep) {
      return 'completed';
    }
    if (i === currentStep) {
      return 'current';
    }

    return 'upcoming';
  }

  protected nodeClass(i: number): string {
    const currentStep = this.current();
    if (i < currentStep) {
      return 'node done';
    }
    if (i === currentStep) {
      return 'node active';
    }

    return 'node';
  }

  protected connectorClass(i: number): string {
    return i < this.current() ? 'connector done' : 'connector';
  }
}
